import React, { useEffect } from 'react';
import { Grid, IconButton, Typography } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { ResponseErrorPanel } from '@backstage/core-components';
import { DenseTable } from '../DenseTable';
import { useRuns } from '../../hooks';

interface Props {
  organization: string;
  workspaceName: string;
  hideDescription?: boolean;
}

export const TerraformRuns = ({
  organization,
  workspaceName,
  hideDescription = false,
}: Props) => {
  const { data, error, isLoading, refetch } = useRuns(
    organization,
    workspaceName,
  );

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
        title={`Runs for ${workspaceName}`}
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
            This contains some useful information around the terraform workspace
            "{workspaceName}".
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <DenseTable
          data={data || []}
          isLoading={isLoading}
          title={`Runs for ${workspaceName}`}
        />
      </Grid>
    </Grid>
  );
};
