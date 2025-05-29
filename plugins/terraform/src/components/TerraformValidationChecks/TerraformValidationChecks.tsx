import { PieChart } from '@mui/x-charts';
import { Content, InfoCard } from '@backstage/core-components';
import WarningIcon from '@material-ui/icons/Warning';
import { IconButton, useTheme } from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';

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

  const checksExist = checksFailed > 0 || checksUnknown > 0 || checksPassed > 0;

  return (
    <InfoCard
      title="Checks"
      titleTypographyProps={{ variant: 'subtitle1' }}
      variant="gridItem"
      action={
        checksExist && allChecksSucceeded ? (
          <IconButton disabled>
            <CheckCircle data-testid="success-icon" />
          </IconButton>
        ) : (
          <IconButton disabled>
            <WarningIcon data-testid="warning-icon" />
          </IconButton>
        )
      }
      deepLink={{
        title: 'View in Terraform',
        link: terraformValidationChecksUrl,
      }}
    >
      {checksExist && (
        <PieChart
          skipAnimation
          height={100}
          series={[
            {
              arcLabel: item => `${item.value}`,
              arcLabelMinAngle: 35,
              arcLabelRadius: '70%',
              innerRadius: 20,
              data: barData,
            },
          ]}
        />
      )}

      {!checksExist && (
        <div style={{ height: 100 }}>
          <Content noPadding>No checks found.</Content>
        </div>
      )}
    </InfoCard>
  );
};

export default TerraformValidationChecks;
