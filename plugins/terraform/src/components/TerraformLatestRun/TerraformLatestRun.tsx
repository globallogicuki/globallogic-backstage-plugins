import { useEntity } from '@backstage/plugin-catalog-react';
import { CircularProgress } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useLatestRun } from '../../hooks';
import { Run } from '../../hooks/types';
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

  const { organization, workspace } = getAnnotations(entity);

  const { data, isLoading, error, refetch } = useLatestRun(
    organization!,
    workspace!,
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <TerraformLatestRunWrapperCard workspace={workspace!}>
        <TerraformLatestRunError error={error} />
      </TerraformLatestRunWrapperCard>
    );
  }

  if (isLoading) {
    return (
      <TerraformLatestRunWrapperCard workspace={workspace!}>
        <CircularProgress aria-describedby="Getting latest run" aria-busy />
      </TerraformLatestRunWrapperCard>
    );
  }

  const latestRun: Run | undefined = data;

  if (!latestRun) {
    return (
      <TerraformLatestRunWrapperCard workspace={workspace!}>
        <TerraformNoRuns />
      </TerraformLatestRunWrapperCard>
    );
  }

  return (
    <TerraformLatestRunWrapperCard workspace={workspace!}>
      <TerraformLatestRunContent run={latestRun} />
    </TerraformLatestRunWrapperCard>
  );
};
