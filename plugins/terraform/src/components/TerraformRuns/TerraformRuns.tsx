import React, { useEffect } from 'react';
import { Grid, IconButton, Typography } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { ResponseErrorPanel } from '@backstage/core-components';
import { DenseTable } from '../DenseTable';
import { useRuns } from '../../hooks';

interface Props {
  organization: string;
  workspaceNames: string[];
  hideDescription?: boolean;
}

export const TerraformRuns = ({
  organization,
  workspaceNames,
  hideDescription = false,
}: Props) => {
  const hasMultipleWorkspaces = workspaceNames.length > 1;
  const { data, error, isLoading, refetch } = useRuns(
    organization,
    workspaceNames,
  );

  const tableTitle = `Runs for ${
    hasMultipleWorkspaces
      ? `${workspaceNames.length} workspaces`
      : workspaceNames[0]
  }`;

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (hideDescription) {
    return (
      <DenseTable
        data={data || []}
        isLoading={isLoading}
        title={tableTitle}
        hasMultipleWorkspaces={hasMultipleWorkspaces}
      />
    );
  }

  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <Grid
          container
          direction="row"
          spacing={0}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h5">Terraform</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={refetch} aria-label="Refresh">
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant="body2">
            This contains some useful information for the terraform workspace
            {hasMultipleWorkspaces ? 's' : ''} "{workspaceNames.join(', ')}
            ".
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <DenseTable
          data={data || []}
          isLoading={isLoading}
          title={tableTitle}
          hasMultipleWorkspaces={hasMultipleWorkspaces}
        />
      </Grid>
    </Grid>
  );
};
