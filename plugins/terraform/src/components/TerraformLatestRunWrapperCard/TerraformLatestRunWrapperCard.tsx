import React from 'react';
import { Grid } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';

export const TerraformLatestRunWrapperCard = ({
  workspaces,
  children,
}: {
  workspaces: string[];
  children: JSX.Element;
}) => (
  <Grid container spacing={2} direction="column">
    <Grid item>
      <InfoCard
        title={`Latest Terraform run for ${
          workspaces.length > 1 ? 'workspaces' : workspaces[0]
        }`}
        subheader={workspaces.length > 1 ? workspaces.join(', ') : null}
      >
        {children}
      </InfoCard>
    </Grid>
  </Grid>
);
