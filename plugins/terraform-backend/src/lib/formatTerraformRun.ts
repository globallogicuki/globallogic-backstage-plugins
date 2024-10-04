import { TerraformRun, TerraformEntity } from './types';

const findEntityById = (entities: TerraformEntity[], id: string) =>
  entities.find(e => e.id === id);

const getPlanDetails = (entities: TerraformEntity[], planId?: string) => {
  if (!planId) return null;

  const entity = findEntityById(entities, planId);

  if (!entity || entity.type !== 'plans') return null;

  return { logs: entity.attributes['log-read-url'] };
};

const getUserDetails = (entities: TerraformEntity[], userId?: string) => {
  if (!userId) return null;

  const entity = findEntityById(entities, userId);

  if (!entity || entity.type !== 'users') return null;

  return {
    name: entity.attributes.username,
    avatar: entity.attributes['avatar-url'],
  };
};

const getWorkspaceDetails = (entities: TerraformEntity[], userId?: string) => {
  if (!userId) return null;

  const entity = findEntityById(entities, userId);

  if (!entity || entity.type !== 'workspaces') return null;

  return {
    name: entity.attributes.name,
  };
};

export const formatTerraformRun = (
  terraformRun: TerraformRun,
  included: TerraformEntity[],
) => ({
  id: terraformRun.id,
  message: terraformRun.attributes.message,
  status: terraformRun.attributes.status,
  createdAt: terraformRun.attributes['created-at'],
  confirmedBy: getUserDetails(
    included,
    terraformRun.relationships['confirmed-by']?.data.id,
  ),
  plan: getPlanDetails(included, terraformRun.relationships.plan?.data.id),
  workspace: getWorkspaceDetails(
    included,
    terraformRun.relationships.workspace?.data.id,
  ),
});
