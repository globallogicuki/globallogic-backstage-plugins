import axios from 'axios';
import { LoggerService } from '@backstage/backend-plugin-api';
import {
  TerraformAssessmentResult,
  TerraformEntity,
  TerraformPlan,
  TerraformResponse,
  TerraformRun,
  TerraformUser,
  TerraformWorkspace,
} from './types';
import { formatTerraformRun } from './formatTerraformRun';
import { formatTerraformAssessmentResult } from './formatTerraformAssessmentResult';
import { AssessmentResult } from '../schema/openapi/generated/models';

const fetchRelatedEntity = async <EntityType>(
  baseUrl: string,
  token: string,
  url?: string | null,
) => {
  if (!url) return null;

  const res = await axios.get<TerraformResponse<EntityType>>(
    new URL(url, baseUrl).toString(),
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.data.data;
};

// Need to do in series as will hit Terraform API rate limits
const listRelatedEntities = async (
  baseUrl: string,
  token: string,
  runs: TerraformRun[],
): Promise<TerraformEntity[]> => {
  let settled: PromiseSettledResult<TerraformEntity | null>[] = [];

  for (const run of runs) {
    // workspace doesn't contain links.related every time
    const workspaceUrl =
      run.relationships.workspace?.links?.related ??
      (run.relationships.workspace?.data?.id
        ? `/api/v2/workspaces/${run.relationships.workspace.data.id}`
        : null);
    const userUrl = run.relationships['confirmed-by']?.links?.related;
    const planUrl = run.relationships.plan?.links?.related;

    settled = [
      ...settled,
      ...(await Promise.allSettled([
        fetchRelatedEntity<TerraformWorkspace>(baseUrl, token, workspaceUrl),
        fetchRelatedEntity<TerraformUser>(baseUrl, token, userUrl),
        fetchRelatedEntity<TerraformPlan>(baseUrl, token, planUrl),
      ])),
    ];
  }

  return settled
    .map(p => (p.status === 'rejected' ? null : p.value))
    .filter((e): e is TerraformEntity => !!e);
};

type ListOrgRunsArgs = {
  baseUrl: string;
  token: string;
  organization: string;
  workspaces: string[];
  pageSize?: number;
};

export const listOrgRuns = async ({
  baseUrl,
  token,
  organization,
  workspaces,
  pageSize = 20,
}: ListOrgRunsArgs) => {
  const query = new URLSearchParams({
    'filter[workspace_names]': workspaces.join(','),
    'page[number]': '1',
    'page[size]': String(pageSize),
  });
  const url = `${baseUrl}/organizations/${encodeURIComponent(
    organization,
  )}/runs?${query}`;

  const res = await axios.get<TerraformResponse<TerraformRun[]>>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const relatedEntities = await listRelatedEntities(
    baseUrl,
    token,
    res.data.data,
  );

  return res.data.data.map(run => formatTerraformRun(run, relatedEntities));
};

export const getLatestRunForWorkspaces = async (
  baseUrl: string,
  token: string,
  organization: string,
  workspaces: string[],
) => {
  const latestRun = await listOrgRuns({
    baseUrl,
    token,
    organization,
    workspaces,
    pageSize: 1,
  });

  return latestRun[0] ?? null;
};

const fetchHealthAssessmentForWorkspace = async (
  baseUrl: string,
  token: string,
  workspace: TerraformWorkspace,
): Promise<AssessmentResult | null> => {
  const currentAssessmentResultLink =
    workspace?.relationships?.['current-assessment-result']?.links?.related;

  if (!currentAssessmentResultLink) return null;

  const assessmentResultUrl = new URL(currentAssessmentResultLink, baseUrl);
  const terraformAssessmentResult = await axios.get<
    TerraformResponse<TerraformAssessmentResult>
  >(assessmentResultUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  return formatTerraformAssessmentResult(
    terraformAssessmentResult.data.data,
    workspace,
  );
};

const fetchWorkspace = async (
  baseUrl: string,
  token: string,
  organization: string,
  workspaceName: string,
): Promise<TerraformWorkspace> => {
  const url = `${baseUrl}/organizations/${encodeURIComponent(
    organization,
  )}/workspaces/${encodeURIComponent(workspaceName)}`;

  const res = await axios.get<TerraformResponse<TerraformWorkspace>>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.data;
};

type ListOrgWorkspacesArgs = {
  baseUrl: string;
  token: string;
  organization: string;
  workspaces: string[];
  logger?: LoggerService;
};

export const getAssessmentResultsForWorkspaces = async ({
  baseUrl,
  token,
  organization,
  workspaces,
  logger,
}: ListOrgWorkspacesArgs): Promise<AssessmentResult[]> => {
  // Look each annotated workspace up individually rather than listing the
  // organization's workspaces, which is paginated and would silently miss
  // workspaces beyond the first page.
  const settled = await Promise.allSettled(
    workspaces.map(workspace =>
      fetchWorkspace(baseUrl, token, organization, workspace),
    ),
  );

  const terraformWorkspaces: TerraformWorkspace[] = [];
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      terraformWorkspaces.push(result.value);
    } else {
      logger?.warn(
        `Skipping workspace "${workspaces[index]}" as it could not be fetched: ${result.reason}`,
      );
    }
  });

  const results = await Promise.all(
    terraformWorkspaces.map(w =>
      fetchHealthAssessmentForWorkspace(baseUrl, token, w),
    ),
  );

  return results.filter((r): r is AssessmentResult => !!r);
};
