import { Avatar, Chip, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { Run } from '../../hooks/types';
import { formatTimeToWords } from '../../utils';
import { getColor } from '../DenseTable/utils';

export const TerraformLatestRunContent = ({ run }: { run: Run }) => {

  const userName = run.confirmedBy?.name ?? 'Unknown';

  return (
    <>
      <Grid container direction='row' spacing={2} justifyContent='space-between' alignItems='center'>
        <Grid item>
          <Typography variant='body1'>
            {run.message}
          </Typography>
        </Grid>
        <Grid item>
          <Chip
            label={run.status}
            style={{ backgroundColor: getColor(run.status) }}
            size="small"
            variant="default"
          />
        </Grid>
      </Grid>

      <Grid container direction='row' spacing={2} justifyContent='space-between' alignItems='center'>
        <Grid item>
          <Grid container direction='row' alignItems='center'>
            <Grid item>
              <Avatar
                alt={userName}
                src={run.confirmedBy?.avatar}
              />
            </Grid>

            <Grid item>
              <Typography variant='body1'>
                {userName}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant='body1'>
            triggered a run {formatTimeToWords(run.createdAt, { strict: true })}
          </Typography>
        </Grid>
      </Grid>
    </>

  );

};

