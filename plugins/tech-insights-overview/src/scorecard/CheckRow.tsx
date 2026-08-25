import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { Link } from '@backstage/core-components';
import type {
  CheckLink,
  CheckResult,
} from '@backstage-community/plugin-tech-insights-common';
import { useScorecardStyles } from './styles';

/**
 * One check. Status is never colour alone: a failing row has a filled marker,
 * the check name and an explicit FAILED word, so it survives greyscale,
 * colour-blindness and forced-colours mode. A passing row is quiet.
 *
 * Links are optional because the overview card is a summary and shows none;
 * the full tab shows them on failing rows.
 */
export const CheckRow = ({
  result,
  failed,
  showDescription = false,
  links = [],
}: {
  result: CheckResult;
  failed: boolean;
  showDescription?: boolean;
  links?: CheckLink[];
}) => {
  const classes = useScorecardStyles();
  const { check } = result;

  return (
    <Box className={classes.row} data-testid={`check-${check.id}`}>
      <span
        className={`${classes.marker} ${failed ? '' : classes.markerPassed}`}
        aria-hidden
      />
      <Box className={classes.body}>
        <Typography variant="body2" component="div">
          {check.name}
        </Typography>
        {showDescription && check.description && (
          <Typography
            variant="caption"
            component="div"
            className={classes.description}
          >
            {check.description}
          </Typography>
        )}
        {links.length > 0 && (
          <Box className={classes.links}>
            {links.map(link => (
              <Link key={link.url} to={link.url}>
                {link.title}
              </Link>
            ))}
          </Box>
        )}
      </Box>
      <Typography
        component="span"
        className={`${classes.state} ${
          failed ? classes.stateFailed : classes.statePassed
        }`}
      >
        {failed ? 'Failed' : 'Passed'}
      </Typography>
    </Box>
  );
};
