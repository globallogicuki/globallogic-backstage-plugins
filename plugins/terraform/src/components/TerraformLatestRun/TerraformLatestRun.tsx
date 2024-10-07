import { useEntity } from '@backstage/plugin-catalog-react';
import { CircularProgress } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useLatestRun } from '../../hooks';
import { TerraformLatestRunContent } from '../TerraformLatestRunContent';
import { TerraformLatestRunError } from '../TerraformLatestRunError';
import { TerraformNoRuns } from '../TerraformNoRuns';
import { TerraformLatestRunWrapperCard } from '../TerraformLatestRunWrapperCard';
import { getAnnotations } from '../../utils';

/**
 * React component to display the latest Terraform run for a specific organization and workspace.
 * Fetches and displays the latest run information, handles loading, errors, and no runs scenarios.
 *
 * NB: This component should only invoked after assuring Terraform is availabe and the Entity is valid.
 */
export const TerraformLatestRun = () => {
  const { entity } = useEntity();

  const { organization, workspaces } = getAnnotations(entity);

  const {
    data: latestRun,
    isLoading,
    error,
    refetch,
  } = useLatestRun(organization!, workspaces!);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <TerraformLatestRunWrapperCard workspaces={workspaces!}>
        <TerraformLatestRunError error={error} />
      </TerraformLatestRunWrapperCard>
    );
  }

  if (isLoading) {
    return (
      <TerraformLatestRunWrapperCard workspaces={workspaces!}>
        <CircularProgress aria-describedby="Getting latest run" aria-busy />
      </TerraformLatestRunWrapperCard>
    );
  }

  if (!latestRun) {
    return (
      <TerraformLatestRunWrapperCard workspaces={workspaces!}>
        <TerraformNoRuns />
      </TerraformLatestRunWrapperCard>
    );
  }

  return (
    <TerraformLatestRunWrapperCard workspaces={workspaces!}>
      <TerraformLatestRunContent run={latestRun} />
    </TerraformLatestRunWrapperCard>
  );
};
