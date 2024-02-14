import axios from 'axios';
import {
  TerraformEntity,
  TerraformResponse,
  TerraformRun,
  TerraformWorkspace,
} from './types';

const TF_BASE_URL = 'https://app.terraform.io/api/v2';

const findEntityById = (entities: TerraformEntity[], id: string) =>
  entities.find(e => e.id === id);

const getPlanDetails = (plans: TerraformEntity[], planId?: string) => {
  if (!planId) return null;

  const plan = findEntityById(plans, planId);

  if (!plan) return null;

  return { logs: plan.attributes['log-read-url'] };
};

const getUserDetails = (users: TerraformEntity[], userId?: string) => {
  if (!userId) return null;

  const user = findEntityById(users, userId);

  if (!user) return null;

  return {
    name: user.attributes.username,
    avatar: user.attributes['avatar-url'],
  };
};

export const getRunsForWorkspace = async (
  token: string,
  workspaceId: string,
) => {
  const res = await axios.get<TerraformResponse<TerraformRun[]>>(
    `${TF_BASE_URL}/workspaces/${workspaceId}/runs?include=created_by,plan`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.data.data.map(r => ({
    id: r.id,
    message: r.attributes.message,
    status: r.attributes.status,
    createdAt: r.attributes['created-at'],
    confirmedBy: getUserDetails(
      res.data.included,
      r.relationships['confirmed-by']?.data.id,
    ),
    plan: getPlanDetails(res.data.included, r.relationships.plan?.data.id),
  }));
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
