import { PieChart, pieArcLabelClasses } from '@mui/x-charts';
import { InfoCard } from '@backstage/core-components';
import { IconButton, useTheme } from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Warning from '@material-ui/icons/Warning';
import { TerraformNoMetrics } from '../TerraformNoMetrics';

interface Props {
  allChecksSucceeded: boolean;
  checksFailed: number;
  checksUnknown: number;
  checksPassed: number;
  terraformValidationChecksUrl: string;
}

export const TerraformValidationChecks = ({
  allChecksSucceeded,
  checksFailed,
  checksUnknown,
  checksPassed,
  terraformValidationChecksUrl = '',
}: Props) => {
  const theme = useTheme();
  const barData = [
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
  ];

  const metricsExist =
    checksFailed > 0 || checksUnknown > 0 || checksPassed > 0;

  return (
    <InfoCard
      title="Checks"
      titleTypographyProps={{ variant: 'subtitle1' }}
      variant="gridItem"
      action={
        <IconButton disabled>
          {metricsExist && allChecksSucceeded ? (
            <CheckCircle
              style={{ color: theme.palette.status.ok }}
              data-testid="success-icon"
            />
          ) : (
            <Warning
              style={{ color: theme.palette.status.error }}
              data-testid="warning-icon"
            />
          )}
        </IconButton>
      }
      deepLink={{
        title: 'View in Terraform',
        link: terraformValidationChecksUrl,
      }}
    >
      {metricsExist ? (
        <PieChart
          skipAnimation
          height={100}
          series={[
            {
              arcLabel: 'value',
              arcLabelMinAngle: 35,
              arcLabelRadius: '70%',
              innerRadius: 20,
              paddingAngle: 1,
              data: barData,
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fontWeight: theme.typography.fontWeightBold,
              fill: theme.palette.text.primary,
            },
          }}
        />
      ) : (
        <TerraformNoMetrics message="No checks found." />
      )}
    </InfoCard>
  );
};
