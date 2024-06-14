import React from 'react';
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

interface Props {
  isCard?: boolean;
}

export const Terraform = ({ isCard = false }: Props) => {
  const { entity } = useEntity();
  const organization =
    entity.metadata.annotations?.[TERRAFORM_WORKSPACE_ORGANIZATION];
  const workspaceName =
    entity.metadata.annotations?.[TERRAFORM_WORKSPACE_ANNOTATION];

  if (isTerraformAvailable(entity)) {
    return (
      <TerraformRuns
        organization={organization!}
        workspaceName={workspaceName!}
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
