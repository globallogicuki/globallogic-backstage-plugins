import { TerraformRun, TerraformEntity } from './types';

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
});
