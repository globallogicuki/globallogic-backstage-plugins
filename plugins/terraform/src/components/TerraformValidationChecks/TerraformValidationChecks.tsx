import StackedBar from '../StackedBar/StackedBar.tsx';
import { Grid, Typography } from '@material-ui/core';

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
  const barData = [
    {
      id: 'failed',
      name: 'Failed',
      value: checksFailed,
      color: '#EFC7CC',
      textColor: '#C00005',
    },
    {
      id: 'unknown',
      name: 'Unknown',
      value: checksUnknown,
      color: '#BFD4FF',
      textColor: '#1060FF',
    },
    {
      id: 'passed',
      name: 'Passed',
      value: checksPassed,
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
          {!allChecksSucceeded && (
            <Grid item>
              <span>⚠️</span>
            </Grid>
          )}
          <Grid item>
            <Typography variant="subtitle1">Checks</Typography>
          </Grid>
          <Grid item style={{ width: '100%' }}>
            <div style={{ overflow: 'hidden', borderRadius: '4px' }}>
              <StackedBar data={barData} />
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TerraformValidationChecks;
