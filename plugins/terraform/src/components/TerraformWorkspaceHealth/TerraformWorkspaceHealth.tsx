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
      style={{
        padding: '10px',
        boxSizing: 'border-box',
        boxShadow:
          '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
      }}
    >
      <Grid item>
        <Grid
          container
          direction="row"
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
