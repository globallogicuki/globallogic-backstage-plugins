import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { entityHref } from '../links';
import {
  useEntityCheckResults,
  type CheckFilter,
} from './useEntityCheckResults';
import { ScorecardHeadline } from './ScorecardHeadline';
import { CategoryVerdict } from './CategoryVerdict';
import { CheckRow } from './CheckRow';
import { useScorecardStyles } from './styles';

export type EntityScorecardSummaryCardProps = {
  title?: string;
  /** Only run these checks. Omit to run every check configured for the entity. */
  checkIds?: string[];
  /** Client-side predicate applied after the checks have run. */
  filter?: CheckFilter;
  /**
   * Path of the scorecard tab under the entity page (e.g. `/scorecard`). When
   * set, the card's footer links there. Whether the host mounts that tab is a
   * layout decision this card cannot see, so the link is opt-in.
   */
  contentPath?: string;
};

/**
 * Overview card: the summary view. The score, a segmented meter, and then
 * either one verdict per category — the whole point of grouping checks — or,
 * when no check declares a category, the checks that are failing. Either way a
 * passing check needs no row of its own when the count above already says how
 * many there are.
 */
export const EntityScorecardSummaryCard = ({
  title = 'Scorecard',
  checkIds,
  filter,
  contentPath,
}: EntityScorecardSummaryCardProps) => {
  const classes = useScorecardStyles();
  const { loading, error, grouped, entity } = useEntityCheckResults({
    checkIds,
    filter,
  });

  const deepLink = contentPath
    ? {
        title: 'All checks',
        link: `${entityHref(stringifyEntityRef(entity))}/${contentPath.replace(
          /^\/+/,
          '',
        )}`,
      }
    : undefined;

  return (
    <InfoCard title={title} deepLink={deepLink}>
      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}

      {grouped && grouped.results.length === 0 && (
        <Typography variant="body2" component="div" className={classes.empty}>
          No checks have run for this entity yet.
        </Typography>
      )}

      {grouped && grouped.results.length > 0 && (
        <>
          <ScorecardHeadline grouped={grouped} />
          {grouped.categorised && (
            <Box className={classes.list}>
              {grouped.categories.map(category => (
                <CategoryVerdict
                  key={category.name}
                  category={category}
                  variant="row"
                />
              ))}
            </Box>
          )}
          {!grouped.categorised && grouped.failed.length > 0 && (
            <Box className={classes.list}>
              {grouped.failed.map(result => (
                <CheckRow key={result.check.id} result={result} failed />
              ))}
            </Box>
          )}
          {!grouped.categorised && grouped.failed.length === 0 && (
            <Typography
              variant="body2"
              component="div"
              className={classes.empty}
            >
              Everything passing.
            </Typography>
          )}
        </>
      )}
    </InfoCard>
  );
};
