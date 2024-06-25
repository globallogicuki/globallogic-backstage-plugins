import { Entity } from '@backstage/catalog-model';

export const TERRAFORM_WORKSPACE_ORGANIZATION = 'terraform/organization';
export const TERRAFORM_WORKSPACE_ANNOTATION = 'terraform/workspace';

export const isTerraformAvailable = (entity: Entity) => {
  const annotations = entity.metadata.annotations;

  return !!(
    annotations?.[TERRAFORM_WORKSPACE_ANNOTATION] &&
    annotations?.[TERRAFORM_WORKSPACE_ORGANIZATION]
  );
};
