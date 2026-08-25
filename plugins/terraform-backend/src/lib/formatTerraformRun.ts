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

// VCS-triggered runs have no confirmed-by user; attribute them to the commit
// sender from the configuration version's ingress attributes.
const getVcsSenderDetails = (
  entities: TerraformEntity[],
  configurationVersionId?: string,
) => {
  if (!configurationVersionId) return null;

  const configurationVersion = findEntityById(entities, configurationVersionId);
  if (
    !configurationVersion ||
    configurationVersion.type !== 'configuration-versions'
  ) {
    return null;
  }

  const ingressId =
    configurationVersion.relationships?.['ingress-attributes']?.data?.id;
  if (!ingressId) return null;

  const ingress = findEntityById(entities, ingressId);
  if (!ingress || ingress.type !== 'ingress-attributes') return null;
  if (!ingress.attributes['sender-username']) return null;

  return {
    name: ingress.attributes['sender-username'],
    avatar: ingress.attributes['sender-avatar-url'],
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
  confirmedBy:
    getUserDetails(
      included,
      terraformRun.relationships['confirmed-by']?.data.id,
    ) ??
    getVcsSenderDetails(
      included,
      terraformRun.relationships['configuration-version']?.data.id,
    ),
  plan: getPlanDetails(included, terraformRun.relationships.plan?.data.id),
  workspace: getWorkspaceDetails(
    included,
    terraformRun.relationships.workspace?.data.id,
  ),
});
