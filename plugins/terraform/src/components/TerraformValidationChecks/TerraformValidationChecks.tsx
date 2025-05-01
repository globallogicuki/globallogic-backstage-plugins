import { PieChart } from '@mui/x-charts';
import { InfoCard } from '@backstage/core-components';
import WarningIcon from '@material-ui/icons/Warning';
import { IconButton, useTheme } from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';

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
  const theme = useTheme();
  const barData = [
    {
      id: 'failed',
      label: 'Failed',
      value: checksFailed,
      color: theme.palette.error.light,
    },
    {
      id: 'unknown',
      label: 'Unknown',
      value: checksUnknown,
      color: theme.palette.warning.light,
    },
    {
      id: 'passed',
      label: 'Passed',
      value: checksPassed,
      color: theme.palette.success.light,
    },
  ];

  return (
    <InfoCard
      title="Checks"
      titleTypographyProps={{ variant: 'subtitle1' }}
      variant="gridItem"
      action={
        !allChecksSucceeded ? (
          <IconButton disabled>
            <WarningIcon data-testid="warning-icon" />
          </IconButton>
        ) : (
          <IconButton disabled>
            <CheckCircle data-testid="success-icon" />
          </IconButton>
        )
      }
    >
      <PieChart
        skipAnimation
        height={100}
        series={[
          {
            arcLabel: item => `${item.value}`,
            arcLabelMinAngle: 35,
            arcLabelRadius: '60%',
            innerRadius: 20,
            data: barData,
          },
        ]}
      />
    </InfoCard>
  );
};

export default TerraformValidationChecks;
