import { StatusWarning } from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';
import React from 'react';

export const TerraformNoRuns = () => (
  <Grid
    container
    direction="row"
    spacing={2}
    justifyContent="space-between"
    alignItems="center"
  >
    <Grid item>
      <StatusWarning>Warning!</StatusWarning>
    </Grid>
    <Grid item>
      <Typography variant="body1">No runs for this workspace!</Typography>
    </Grid>
  </Grid>
);
