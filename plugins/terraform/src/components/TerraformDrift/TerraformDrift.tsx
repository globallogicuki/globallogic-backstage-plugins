import { PieChart } from '@mui/x-charts';
import { Grid, Typography } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';


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
      title={`${
        drifted ? '⚠️' : ''
      } Drift`}
      variant='gridItem'
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
