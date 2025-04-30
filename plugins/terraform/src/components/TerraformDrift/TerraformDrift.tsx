import { PieChart } from '@mui/x-charts';
import { InfoCard } from '@backstage/core-components';
import WarningIcon from '@material-ui/icons/Warning';
import { IconButton } from '@material-ui/core';

export interface TerraformDriftProps {
  drifted: boolean;
  resourcesDrifted: number;
  resourcesUndrifted: number;
}

export const TerraformDrift = ({
  drifted,
  resourcesDrifted,
  resourcesUndrifted,
}: TerraformDriftProps) => {
  const barData = [
    {
      id: 'drifted',
      label: 'Drifted',
      value: resourcesDrifted,
      color: '#EFC7CC',
      textColor: '#C00005',
    },
    {
      id: 'undrifted',
      label: 'Undrifted',
      value: resourcesUndrifted,
      color: '#C6E9C9',
      textColor: '#008A22',
    },
  ];

  return (
    <InfoCard
      title="Drift"
      variant="gridItem"
      action={
        drifted ? (
          <IconButton disabled>
            <WarningIcon data-testid="warning-icon" />
          </IconButton>
        ) : (
          ''
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

export default TerraformDrift;
