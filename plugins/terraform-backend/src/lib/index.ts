import axios from 'axios';
import { TerraformResponse, TerraformRun, TerraformWorkspace } from './types';
import { formatTerraformRun } from './formatTerraformRun';

export const TF_BASE_URL = 'https://app.terraform.io/api/v2';

export const getLatestRunForWorkspace = async (
  token: string,
  workspaceId: string,
) => {
  const res = await axios.get<TerraformResponse<TerraformRun[]>>(
    `${TF_BASE_URL}/workspaces/${workspaceId}/runs?include=created_by,plan&page%5Bnumber%5D=1&page%5Bsize%5D=1`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const latestRunData = res.data.data?.[0];
  return latestRunData
    ? formatTerraformRun(latestRunData, res.data.included)
    : undefined;
};

export const getRunsForWorkspace = async (
  token: string,
  workspaceId: string,
) => {
  const res = await axios.get<TerraformResponse<TerraformRun[]>>(
    `${TF_BASE_URL}/workspaces/${workspaceId}/runs?include=created_by,plan`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.data.data.map(singleRun =>
    formatTerraformRun(singleRun, res.data.included),
  );
};

export const findWorkspace = async (
  token: string,
  organization: string,
  workspaceName: string,
) => {
  const res = await axios.get<TerraformResponse<TerraformWorkspace[]>>(
    `${TF_BASE_URL}/organizations/${organization}/workspaces?search[wildcard-name]=${workspaceName}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const workspaces = res.data?.data;

  if (!workspaces.length) {
    throw new Error(`Workspace with name '${workspaceName}' not found.`);
  }

  return { id: workspaces[0].id };
};
