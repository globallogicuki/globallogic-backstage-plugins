import { Entity } from '@backstage/catalog-model';
import { isGithubActionsAvailable } from '@backstage/plugin-github-actions';

export const TERRAFORM_WORKSPACE_ORGANIZATION = 'terraform/organization';
export const TERRAFORM_WORKSPACE_ANNOTATION = 'terraform/workspace';

export const isTerraformAvailable = (entity: Entity) => {
  const annotations = entity.metadata.annotations;

  return !!(
    annotations?.[TERRAFORM_WORKSPACE_ANNOTATION] &&
    annotations?.[TERRAFORM_WORKSPACE_ORGANIZATION]
  );
};

export const isEitherTerraformOrGitubActionsAvailable = (
  entity: Entity,
): boolean => isGithubActionsAvailable(entity) || isTerraformAvailable(entity);
