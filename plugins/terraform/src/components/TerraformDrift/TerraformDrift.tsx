import { PieChart } from '@mui/x-charts';
import { Grid, Typography } from '@material-ui/core';

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
    <Grid
      container
      spacing={2}
      direction="column"
      style={{
        padding: '15px',
        boxSizing: 'border-box',
        boxShadow:
          '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
      }}
    >
      <Grid item>
        <Grid container direction="row" spacing={1} alignItems="center">
          {drifted && (
            <Grid item>
              <span>⚠️</span>
            </Grid>
          )}
          <Grid item>
            <Typography variant="subtitle1">
              <b>Drift</b>
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          {/* <StackedBar data={barData} /> */}
          <PieChart
            skipAnimation
            height={150}
            width={150}
            series={[
              {
                arcLabel: item => `${item.value}`,
                arcLabelMinAngle: 35,
                arcLabelRadius: '60%',
                innerRadius: 40,
                data: barData,
              },
            ]}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TerraformDrift;
