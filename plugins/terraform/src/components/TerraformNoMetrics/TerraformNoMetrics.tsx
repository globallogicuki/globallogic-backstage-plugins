import { Grid, Typography } from '@material-ui/core';

interface Props {
  message?: string;
}

export const TerraformNoMetrics = ({
  message = 'No metrics found for this workspace.',
}: Props) => (
  <Grid
    container
    direction="column"
    spacing={2}
    alignItems="center"
    alignContent="center"
    style={{ paddingTop: '1rem' }}
  >
    <Grid
      item
      style={{ height: 100, alignContent: 'center', alignItems: 'center' }}
    >
      <Typography variant="body2">{message}</Typography>
    </Grid>
  </Grid>
);
