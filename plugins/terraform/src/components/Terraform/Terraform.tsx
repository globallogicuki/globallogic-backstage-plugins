import React from 'react';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { TerraformRuns } from '../TerraformRuns';
import {
  isTerraformAvailable,
  TERRAFORM_WORKSPACE_ANNOTATION,
} from '../../annotations';
import { getAnnotations } from '../../utils';

interface Props {
  isCard?: boolean;
}

export const Terraform = ({ isCard = false }: Props) => {
  const { entity } = useEntity();
  const { organization, workspace } = getAnnotations(entity);

  if (isTerraformAvailable(entity)) {
    return (
      <TerraformRuns
        organization={organization!}
        workspaceName={workspace!}
        hideDescription={isCard}
      />
    );
  }

  return (
    <MissingAnnotationEmptyState
      annotation={[TERRAFORM_WORKSPACE_ANNOTATION]}
    />
  );
};
