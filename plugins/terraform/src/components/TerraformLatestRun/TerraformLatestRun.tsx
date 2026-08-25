import { useEntity } from '@backstage/plugin-catalog-react';
import { CircularProgress } from '@material-ui/core';
import { ReactNode } from 'react';
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
  } = useLatestRun(organization!, workspaces!);

  let content: ReactNode;
  if (error) {
    content = <TerraformLatestRunError error={error} />;
  } else if (isLoading) {
    content = (
      <CircularProgress aria-describedby="Getting latest run" aria-busy />
    );
  } else if (!latestRun) {
    content = <TerraformNoRuns />;
  } else {
    content = <TerraformLatestRunContent run={latestRun} />;
  }

  return (
    <TerraformLatestRunWrapperCard workspaces={workspaces!}>
      {content}
    </TerraformLatestRunWrapperCard>
  );
};
