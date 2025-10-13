import { PieChart, pieArcLabelClasses } from '@mui/x-charts';
import { InfoCard } from '@backstage/core-components';
import { IconButton, useTheme } from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Warning from '@material-ui/icons/Warning';
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
      color: theme.palette.status.error,
    },
    {
      id: 'undrifted',
      label: 'Undrifted',
      value: resourcesUndrifted,
      color: theme.palette.status.ok,
    },
  ];

  const metricsExist = resourcesDrifted > 0 || resourcesUndrifted > 0;

  return (
    <InfoCard
      title="Drift"
      titleTypographyProps={{ variant: 'subtitle1' }}
      variant="gridItem"
      action={
        <IconButton disabled>
          {metricsExist && !drifted ? (
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
        link: terraformDriftUrl,
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
        <TerraformNoMetrics message="No drift metrics found." />
      )}
    </InfoCard>
  );
};
