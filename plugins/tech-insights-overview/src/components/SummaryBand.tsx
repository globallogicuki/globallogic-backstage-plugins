import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { useOverviewStyles } from '../styles';

/**
 * The one number worth reading first, as a peer section beside the check
 * tiles. Components with no check results yet are excluded from scoring
 * rather than counted as passing, and mentioned only when there are any.
 */
export const SummaryBand = ({
  fullyPassing,
  scored,
  unscored,
}: {
  fullyPassing: number;
  scored: number;
  unscored: number;
}) => {
  const classes = useOverviewStyles();

  return (
    <Box className={classes.summary}>
      <Typography variant="h6">Fully passing</Typography>
      <Box className={classes.summaryCard}>
        <Box className={classes.heroFigure}>
          <Typography component="div" className={classes.heroNumber}>
            {fullyPassing}
          </Typography>
          <Typography
            component="div"
            variant="body2"
            className={classes.subtle}
          >
            of {scored} components
          </Typography>
        </Box>
        {unscored > 0 && (
          <Typography
            variant="caption"
            component="div"
            className={classes.subtle}
          >
            {unscored} more component{unscored === 1 ? ' has' : 's have'} no
            check results yet and {unscored === 1 ? 'is' : 'are'} not counted.
          </Typography>
        )}
      </Box>
    </Box>
  );
};
