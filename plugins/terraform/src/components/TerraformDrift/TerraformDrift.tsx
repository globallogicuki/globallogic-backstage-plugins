import { useTheme } from '@material-ui/core';
import { TerraformMetricsCard } from '../TerraformMetricsCard';

export interface TerraformDriftProps {
  drifted?: boolean;
  resourcesDrifted?: number;
  resourcesUndrifted?: number;
  terraformDriftUrl: string;
}

export const TerraformDrift = ({
  drifted = false,
  resourcesDrifted = 0,
  resourcesUndrifted = 0,
  terraformDriftUrl,
}: TerraformDriftProps) => {
  const theme = useTheme();

  return (
    <TerraformMetricsCard
      title="Drift"
      isHealthy={!drifted}
      deepLinkUrl={terraformDriftUrl}
      noMetricsMessage="No drift metrics found."
      metrics={[
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
      ]}
    />
  );
};
