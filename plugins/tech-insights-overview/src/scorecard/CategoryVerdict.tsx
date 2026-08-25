import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import type { CategoryGroup } from './useEntityCheckResults';
import { useScorecardStyles } from './styles';

/**
 * A category's single verdict, in two weights.
 *
 * `heading` sits above the category's checks on the full tab; `row` is a
 * standalone line on the summary card, where the checks themselves are not
 * shown. Both carry the same three facts — name, how many of its checks pass,
 * and the verdict — so the card and the tab cannot disagree.
 *
 * The verdict is never colour alone: it is spelled out as PASSED or FAILED, and
 * the row variant also carries a marker.
 */
export const CategoryVerdict = ({
  category,
  variant,
}: {
  category: CategoryGroup;
  variant: 'heading' | 'row';
}) => {
  const classes = useScorecardStyles();
  const { name, passing, results, passed } = category;
  const count = `${passed.length} of ${results.length}`;
  const verdictClass = `${classes.state} ${
    passing ? classes.statePassed : classes.stateFailed
  }`;

  if (variant === 'row') {
    return (
      <Box className={classes.row} data-testid={`category-${name}`}>
        <span
          className={`${classes.marker} ${passing ? classes.markerPassed : ''}`}
          aria-hidden
        />
        <Box className={classes.body}>
          <Typography variant="body2" component="div">
            {name}
          </Typography>
        </Box>
        <Typography
          component="span"
          variant="caption"
          className={`${classes.subtle} ${classes.categoryCount}`}
        >
          {count}
        </Typography>
        <Typography component="span" className={verdictClass}>
          {passing ? 'Passed' : 'Failed'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.categoryHead} data-testid={`category-${name}`}>
      <Typography component="div" className={classes.categoryName}>
        {name}
      </Typography>
      <Box className={classes.categoryMeta}>
        <Typography
          component="span"
          variant="caption"
          className={classes.subtle}
        >
          {count} passing
        </Typography>
        <Typography component="span" className={verdictClass}>
          {passing ? 'Passed' : 'Failed'}
        </Typography>
      </Box>
    </Box>
  );
};
