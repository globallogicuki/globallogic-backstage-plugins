import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import type { GroupedResults } from './useEntityCheckResults';
import { useScorecardStyles } from './styles';

/**
 * The one number worth reading first, plus a segmented meter with failures
 * first so the eye lands on them rather than hunting. Reads "N of M", never
 * "N/M" — a bare fraction is ambiguous next to views that show failing/total.
 */
export const ScorecardHeadline = ({ grouped }: { grouped: GroupedResults }) => {
  const classes = useScorecardStyles();
  const total = grouped.results.length;
  const passing = grouped.passed.length;
  const noun = total === 1 ? 'check' : 'checks';
  const label = `${passing} of ${total} ${noun} passing`;

  return (
    <>
      <Box className={classes.headline}>
        <Typography component="div" className={classes.score}>
          {passing}
        </Typography>
        <Typography component="div" variant="body2" className={classes.subtle}>
          of {total} {noun} passing
        </Typography>
      </Box>
      <Tooltip title={label}>
        <Box className={classes.meter} role="img" aria-label={label}>
          {grouped.failed.map(r => (
            <span
              key={r.check.id}
              className={`${classes.segment} ${classes.segmentFailed}`}
            />
          ))}
          {grouped.passed.map(r => (
            <span key={r.check.id} className={classes.segment} />
          ))}
        </Box>
      </Tooltip>
    </>
  );
};
