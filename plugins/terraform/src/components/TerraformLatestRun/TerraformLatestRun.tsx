import React, { useEffect } from 'react';
import { Grid, IconButton, Typography } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { ResponseErrorPanel } from '@backstage/core-components';
import { TerraformLatestRunCard } from '../TerraformLatestRunCard';
import { useRuns } from '../../hooks';
import { Run } from '../../hooks/types';

interface Props {
  organization: string;
  workspaceName: string;
}

export const TerraformLatestRun = ({
  organization,
  workspaceName,
}: Props) => {
  const { data, isLoading, error, refetch } = useRuns(
    organization,
    workspaceName,
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const latestRun: Run | undefined = data ? data[0] : undefined

  if (!latestRun) {
    return (
      <TerraformLatestRunCard run={latestRun} isLoading={isLoading} workspace={workspaceName} />
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
            This contains some useful information around the terraform workspace
            "{workspaceName}".
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <TerraformLatestRunCard run={latestRun} isLoading={isLoading} workspace={workspaceName} />
        {/* <DenseTable
          data={data || []}
          isLoading={isLoading}
          title={`Latest run for ${workspaceName}`}
        /> */}
      </Grid>
    </Grid>
  );
};
