import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { TerraformRuns } from '../TerraformRuns';
import {
  isTerraformAvailable,
  TERRAFORM_WORKSPACE_ANNOTATION,
  TERRAFORM_WORKSPACE_ORGANIZATION,
} from '../../annotations';
import { getAnnotations } from '../../utils';

interface Props {
  isCard?: boolean;
}

export const Terraform = ({ isCard = false }: Props) => {
  const { entity } = useEntity();
  const { organization, workspaces } = getAnnotations(entity);

  if (isTerraformAvailable(entity)) {
    return (
      <TerraformRuns
        organization={organization!}
        workspaceNames={workspaces!}
        hideDescription={isCard}
      />
    );
  }

  return (
    <MissingAnnotationEmptyState
      annotation={[
        TERRAFORM_WORKSPACE_ANNOTATION,
        TERRAFORM_WORKSPACE_ORGANIZATION,
      ]}
    />
  );
};
