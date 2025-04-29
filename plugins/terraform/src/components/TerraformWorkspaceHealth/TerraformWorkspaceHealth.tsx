import { AssessmentResult } from '../../hooks/types.ts';
import TerraformDrift from '../TerraformDrift/TerraformDrift';
import TerraformValidationChecks from '../TerraformValidationChecks/TerraformValidationChecks';
import { Grid, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';


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
    <InfoCard
      title={data.workspaceName}
    >
      {showDrift && (
        <TerraformDrift {...data.driftMetrics} />
      )}

      {showValidationChecks && (
        <TerraformValidationChecks {...data.validationMetrics} />
      )}
    </InfoCard>
  );
};

export default TerraformWorkspaceHealth;
