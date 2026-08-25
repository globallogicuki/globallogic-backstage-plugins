import { useTheme } from '@material-ui/core';
import { TerraformMetricsCard } from '../TerraformMetricsCard';

interface Props {
  allChecksSucceeded?: boolean;
  checksErrored?: number;
  checksFailed?: number;
  checksUnknown?: number;
  checksPassed?: number;
  terraformValidationChecksUrl: string;
}

export const TerraformValidationChecks = ({
  allChecksSucceeded = false,
  checksErrored = 0,
  checksFailed = 0,
  checksUnknown = 0,
  checksPassed = 0,
  terraformValidationChecksUrl,
}: Props) => {
  const theme = useTheme();

  return (
    <TerraformMetricsCard
      title="Checks"
      isHealthy={allChecksSucceeded}
      deepLinkUrl={terraformValidationChecksUrl}
      noMetricsMessage="No checks found."
      metrics={[
        {
          id: 'errored',
          label: 'Errored',
          value: checksErrored,
          color: theme.palette.status.aborted,
        },
        {
          id: 'failed',
          label: 'Failed',
          value: checksFailed,
          color: theme.palette.status.error,
        },
        {
          id: 'unknown',
          label: 'Unknown',
          value: checksUnknown,
          color: theme.palette.status.warning,
        },
        {
          id: 'passed',
          label: 'Passed',
          value: checksPassed,
          color: theme.palette.status.ok,
        },
      ]}
    />
  );
};
