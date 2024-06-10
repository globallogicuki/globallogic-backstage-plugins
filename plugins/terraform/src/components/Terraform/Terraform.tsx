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
import { TerraformLatestRun } from '../TerraformLatestRun';

interface Props {
  isCard?: boolean;
  showLatestRun?: boolean;
}

export const Terraform = ({ isCard = false, showLatestRun = false }: Props) => {
  const { entity } = useEntity();
  const organization =
    entity.metadata.annotations?.[TERRAFORM_WORKSPACE_ORGANIZATION];
  const workspaceName =
    entity.metadata.annotations?.[TERRAFORM_WORKSPACE_ANNOTATION];

  if (isTerraformAvailable(entity)) {
    console.log("entity:", entity);

    if (showLatestRun) return (
      <TerraformLatestRun
        organization={organization!}
        workspaceName={workspaceName!}
      />

    );
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
