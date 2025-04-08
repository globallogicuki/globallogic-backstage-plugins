import React from 'react';
import { AssessmentResult } from '../../hooks/types.ts';
import TerraformDrift from '../TerraformDrift/TerraformDrift';
import TerraformValidationChecks from '../TerraformValidationChecks/TerraformValidationChecks';
import { Grid, Typography } from '@material-ui/core';

interface Props {
  data: AssessmentResult;
  showDrift?: boolean;
  showValidationChecks?: boolean;
}

export const TerraformWorkspaceHealth = ({
  data,
  showDrift = true,
  showValidationChecks = true,
}: Props) => {
  return (
    <Grid
      container
      spacing={4}
      direction="column"
      style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}
    >
      <Grid item>
        <Grid
          container
          direction="row"
          spacing={10}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h6">{data.workspaceName}</Typography>
          </Grid>
        </Grid>
      </Grid>

      {showDrift && (
        <Grid item spacing={2}>
          <TerraformDrift {...data.driftMetrics} />
        </Grid>
      )}

      {showValidationChecks && (
        <Grid item spacing={2}>
          <TerraformValidationChecks {...data.validationMetrics} />
        </Grid>
      )}
    </Grid>
  );
};

export default TerraformWorkspaceHealth;
