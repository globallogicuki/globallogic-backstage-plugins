import { AssessmentResult } from '../../hooks/types.ts';
import TerraformDrift from '../TerraformDrift/TerraformDrift';
import TerraformValidationChecks from '../TerraformValidationChecks/TerraformValidationChecks';
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
      titleTypographyProps={{ variant: 'h6' }}
    >
      {showDrift && <TerraformDrift {...data.driftMetrics} />}

      {showValidationChecks && (
        <TerraformValidationChecks {...data.validationMetrics} />
      )}
    </InfoCard>
  );
};

export default TerraformWorkspaceHealth;
