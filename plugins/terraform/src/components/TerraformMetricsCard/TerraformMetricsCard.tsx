import { PieChart, pieArcLabelClasses } from '@mui/x-charts';
import { InfoCard } from '@backstage/core-components';
import { IconButton, useTheme } from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Warning from '@material-ui/icons/Warning';
import { TerraformNoMetrics } from '../TerraformNoMetrics';

export interface TerraformMetric {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface TerraformMetricsCardProps {
  title: string;
  isHealthy: boolean;
  metrics: TerraformMetric[];
  deepLinkUrl: string;
  noMetricsMessage: string;
}

/**
 * Internal card used to render a pie chart of workspace metrics (drift,
 * validation checks) with a healthy/unhealthy indicator and a deep link to
 * Terraform.
 */
export const TerraformMetricsCard = ({
  title,
  isHealthy,
  metrics,
  deepLinkUrl,
  noMetricsMessage,
}: TerraformMetricsCardProps) => {
  const theme = useTheme();

  const metricsExist = metrics.some(metric => metric.value > 0);

  return (
    <InfoCard
      title={title}
      titleTypographyProps={{ variant: 'subtitle1' }}
      variant="gridItem"
      action={
        <IconButton disabled>
          {metricsExist && isHealthy ? (
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
        link: deepLinkUrl,
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
              data: metrics,
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
        <TerraformNoMetrics message={noMetricsMessage} />
      )}
    </InfoCard>
  );
};
