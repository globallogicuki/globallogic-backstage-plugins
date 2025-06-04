import { PieChart } from '@mui/x-charts';
import { InfoCard } from '@backstage/core-components';
import WarningIcon from '@material-ui/icons/Warning';
import { IconButton, useTheme } from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';
import { TerraformNoMetrics } from '../TerraformNoMetrics';

export interface TerraformDriftProps {
  drifted: boolean;
  resourcesDrifted: number;
  resourcesUndrifted: number;
  terraformDriftUrl: string;
}

export const TerraformDrift = ({
  drifted,
  resourcesDrifted,
  resourcesUndrifted,
  terraformDriftUrl,
}: TerraformDriftProps) => {
  const theme = useTheme();

  const barData = [
    {
      id: 'drifted',
      label: 'Drifted',
      value: resourcesDrifted,
      color: theme.palette.error.light,
      textColor: '#C00005',
    },
    {
      id: 'undrifted',
      label: 'Undrifted',
      value: resourcesUndrifted,
      color: theme.palette.success.light,
      textColor: '#008A22',
    },
  ];

  const metricsExist = resourcesDrifted > 0 || resourcesUndrifted > 0;

  return (
    <InfoCard
      title="Drift"
      titleTypographyProps={{ variant: 'subtitle1' }}
      variant="gridItem"
      action={
        metricsExist && !drifted ? (
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
        link: terraformDriftUrl,
      }}
    >
      {metricsExist && (
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

      {!metricsExist && (
        <TerraformNoMetrics message="No drift metrics found." />
      )}
    </InfoCard>
  );
};

export default TerraformDrift;
