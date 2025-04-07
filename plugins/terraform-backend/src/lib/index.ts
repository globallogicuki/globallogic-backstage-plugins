import axios from 'axios';
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

  return (
    settled
      .map(p => {
        if (p.status === 'rejected') {
          return null;
        }

        return p.value;
      })
      // Need to cast as TS can't figure out .filter removes null values
      .filter(e => !!e) as unknown as TerraformEntity[]
  );
};

type ListOrgRunsArgs = {
  baseUrl: string;
  token: string;
  organization: string;
  workspaces: string[];
  latestOnly?: boolean;
};

type ListOrgWorkspacesArgs = {
  baseUrl: string;
  token: string;
  organization: string;
  workspaces: string[];
};

export const listOrgRuns = async ({
  baseUrl,
  token,
  organization,
  workspaces,
  latestOnly,
}: ListOrgRunsArgs) => {
  const url = new URL(
    `/api/v2/organizations/${organization}/runs?filter[workspace_names]=${workspaces.join(
      ',',
    )}${latestOnly ? '&page[number]=1&page[size]=1' : ''}`,
    baseUrl,
  );

  const res = await axios.get<TerraformResponse<TerraformRun[]>>(
    url.toString(),
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
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
    latestOnly: true,
  });

  return latestRun[0];
};

const fetchHealthAssessmentForWorkspace = async (
  baseUrl: string,
  token: string,
  workspace: TerraformWorkspace,
) => {
  const currentAssessmentResultLink =
    workspace?.relationships?.['current-assessment-result']?.links?.related;

  if (!currentAssessmentResultLink) return null;

  const assessmentResultUrl = new URL(currentAssessmentResultLink, baseUrl);
  console.debug(
    `Retrieving health assessment for workspace '${
      workspace.attributes.name
    }', url: ${assessmentResultUrl.toString()}`,
  );
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

export const getAssessmentResultsForWorkspaces = async ({
  baseUrl,
  token,
  organization,
  workspaces,
}: ListOrgWorkspacesArgs) => {
  const getWorkspacesUrl = new URL(
    `/api/v2/organizations/${organization}/workspaces`,
    baseUrl,
  );

  const allWorkspacesForOrg = await axios.get<
    TerraformResponse<TerraformWorkspace[]>
  >(getWorkspacesUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const terraformWorkspaces: TerraformWorkspace[] = [];
  workspaces.forEach(w => {
    console.debug(`Looking for workspace: '${w}'`);

    const found = allWorkspacesForOrg.data.data.find(
      f => f.attributes.name.toLowerCase() === w.toString().toLowerCase(),
    );
    if (found !== undefined) {
      console.debug(`Found TerraformWorkspace for '${w}'`);
      terraformWorkspaces.push(found);
    }
  });

  const actions = terraformWorkspaces.map(w =>
    fetchHealthAssessmentForWorkspace(baseUrl, token, w),
  );
  const results = await Promise.all(actions);

  return results;
};
