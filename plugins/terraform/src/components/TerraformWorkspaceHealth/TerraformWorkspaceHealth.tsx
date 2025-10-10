import { AssessmentResult } from '../../hooks/types.ts';
import {
  createDriftUrl,
  createValidationChecksUrl,
} from '../../utils/index.ts';
import { TerraformDrift } from '../TerraformDrift';
import { TerraformValidationChecks } from '../TerraformValidationChecks';
import { InfoCard } from '@backstage/core-components';

interface Props {
  data: AssessmentResult;
  showDrift?: boolean;
  showValidationChecks?: boolean;
  terraformBaseUrl?: string;
  organizationName: string;
}

export const TerraformWorkspaceHealth = ({
  data,
  showDrift = true,
  showValidationChecks = true,
  terraformBaseUrl,
  organizationName,
}: Props) => {
  const validationChecksUrl = createValidationChecksUrl(
    terraformBaseUrl,
    organizationName,
    data.workspaceName!,
  );
  const driftUrl = createDriftUrl(
    terraformBaseUrl,
    organizationName,
    data.workspaceName!,
  );

  return (
    <InfoCard
      title={data.workspaceName}
      titleTypographyProps={{ variant: 'h6' }}
    >
      {showDrift && (
        <TerraformDrift terraformDriftUrl={driftUrl} {...data.driftMetrics} />
      )}

      {showValidationChecks && (
        <TerraformValidationChecks
          terraformValidationChecksUrl={validationChecksUrl}
          {...data.validationMetrics}
        />
      )}
    </InfoCard>
  );
};
