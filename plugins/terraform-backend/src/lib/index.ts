import axios from 'axios';
import {
  ResponseRun,
  TerraformResponse,
  TerraformRun,
  TerraformWorkspace,
} from './types';
import { terraformRun2ResponseRun } from '../terraformRun2ResponseRun';

export const TF_BASE_URL = 'https://app.terraform.io/api/v2';

export const getRunsForWorkspace = async (
  token: string,
  workspaceId: string,
): Promise<ResponseRun[]> => {
  const res = await axios.get<TerraformResponse<TerraformRun[]>>(
    `${TF_BASE_URL}/workspaces/${workspaceId}/runs?include=created_by,plan`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.data.data.map<ResponseRun>(singleRun =>
    terraformRun2ResponseRun(singleRun, res.data.included),
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
