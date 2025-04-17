import React from 'react';
import StackedBar from '../StackedBar/StackedBar';
import { Grid, Typography } from '@material-ui/core';

export interface TerraformDriftProps {
  drifted: boolean;
  resourcesDrifted: number;
  resourcesUndrifted: number;
}

export const TerraformDrift = ({
  drifted,
  resourcesDrifted,
  resourcesUndrifted,
}: TerraformDriftProps) => {
  const barData = [
    {
      id: 'drifted',
      name: 'Drifted',
      value: resourcesDrifted,
      color: '#EFC7CC',
      textColor: '#C00005',
    },
    {
      id: 'undrifted',
      name: 'Undrifted',
      value: resourcesUndrifted,
      color: '#C6E9C9',
      textColor: '#008A22',
    },
  ];

  return (
    <Grid
      container
      spacing={2}
      direction="column"
      style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}
    >
      <Grid item>
        <Grid container direction="row" spacing={1} alignItems="center">
          {drifted && (
            <Grid item>
              <span>⚠️</span>
            </Grid>
          )}
          <Grid item>
            <Typography variant="subtitle1">Drift</Typography>
          </Grid>
          <Grid item style={{ width: '100%' }}>
            <div style={{ overflow: 'hidden', borderRadius: '4px' }}>
              <StackedBar data={barData} />
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TerraformDrift;
