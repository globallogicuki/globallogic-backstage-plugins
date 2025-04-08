import React from 'react';
import StackedBar from '../StackedBar/StackedBar.tsx';
import { Grid, Typography } from '@material-ui/core';

interface Props {
  allChecksSucceeded: boolean;
  checksFailed: number;
  checksUnknown: number;
  checksPassed: number;
}

export const TerraformValidationChecks = ({
  allChecksSucceeded,
  checksFailed,
  checksUnknown,
  checksPassed,
}: Props) => {
  const barData = [
    {
      id: 'failed',
      name: 'Failed',
      value: checksFailed,
      color: '#EFC7CC',
      textColor: '#C00005',
    },
    {
      id: 'unknown',
      name: 'Unknown',
      value: checksUnknown,
      color: '#1060FF',
      textColor: '#1060FF',
    },
    {
      id: 'passed',
      name: 'Passed',
      value: checksPassed,
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
          {!allChecksSucceeded && (
            <Grid item>
              <span>⚠️</span>
            </Grid>
          )}
          <Grid item>
            <Typography variant="subtitle1">Checks</Typography>
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

export default TerraformValidationChecks;
