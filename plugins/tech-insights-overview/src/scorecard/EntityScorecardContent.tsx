import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import type { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import type { Entity } from '@backstage/catalog-model';
import type { TechInsightsApi } from '@backstage-community/plugin-tech-insights-react';
import {
  linksFor,
  useEntityCheckResults,
  type CheckFilter,
  type GroupedResults,
} from './useEntityCheckResults';
import { ScorecardHeadline } from './ScorecardHeadline';
import { CategoryVerdict } from './CategoryVerdict';
import { CheckRow } from './CheckRow';
import { useScorecardStyles } from './styles';

export type EntityScorecardContentProps = {
  title?: string;
  /** Shown under the title — say who the standard applies to. */
  description?: string;
  /** Only run these checks. Omit to run every check configured for the entity. */
  checkIds?: string[];
  /** Client-side predicate applied after the checks have run. */
  filter?: CheckFilter;
};

type RowContext = { api: TechInsightsApi; entity: Entity };

/** Failing rows carry their links; a passing row has nothing to act on. */
const failingRows = (results: CheckResult[], { api, entity }: RowContext) =>
  results.map(result => (
    <CheckRow
      key={result.check.id}
      result={result}
      failed
      showDescription
      links={linksFor(api, result, entity)}
    />
  ));

const passingRows = (results: CheckResult[]) =>
  results.map(result => (
    <CheckRow
      key={result.check.id}
      result={result}
      failed={false}
      showDescription
    />
  ));

/** Checks under their category, each category carrying its single verdict. */
const CategorisedChecks = ({
  grouped,
  context,
}: {
  grouped: GroupedResults;
  context: RowContext;
}) => (
  <>
    {grouped.categories.map(category => (
      <Box key={category.name}>
        <CategoryVerdict category={category} variant="heading" />
        {/* Failures first within the category, same as the flat view. */}
        {failingRows(category.failed, context)}
        {passingRows(category.passed)}
      </Box>
    ))}
  </>
);

/** The fallback when no check declares a category. */
const FlatChecks = ({
  grouped,
  context,
}: {
  grouped: GroupedResults;
  context: RowContext;
}) => {
  const classes = useScorecardStyles();
  return (
    <>
      {grouped.failed.length > 0 && (
        <>
          <Typography component="div" className={classes.sectionLabel}>
            Failing · {grouped.failed.length}
          </Typography>
          <Box>{failingRows(grouped.failed, context)}</Box>
        </>
      )}
      {grouped.passed.length > 0 && (
        <>
          <Typography component="div" className={classes.sectionLabel}>
            Passing · {grouped.passed.length}
          </Typography>
          <Box>{passingRows(grouped.passed)}</Box>
        </>
      )}
    </>
  );
};

/**
 * Entity page tab: the full scorecard. Same language as the summary card, but
 * every check is listed with its description — failures first, each with the
 * links to act on it.
 *
 * When checks declare `metadata.category`, they sit under their category with
 * that category's single verdict above them; otherwise they fall back to a flat
 * failing/passing split.
 */
export const EntityScorecardContent = ({
  title = 'Scorecard',
  description,
  checkIds,
  filter,
}: EntityScorecardContentProps) => {
  const classes = useScorecardStyles();
  const { loading, error, grouped, entity, api } = useEntityCheckResults({
    checkIds,
    filter,
  });

  return (
    <InfoCard title={title} subheader={description}>
      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}

      {grouped && grouped.results.length === 0 && (
        <Typography variant="body2" component="div" className={classes.empty}>
          No checks have run for this entity yet. Facts are collected on a
          schedule, so a newly registered entity can take a few minutes to
          appear.
        </Typography>
      )}

      {grouped && grouped.results.length > 0 && (
        <>
          <ScorecardHeadline grouped={grouped} />
          {grouped.categorised ? (
            <CategorisedChecks grouped={grouped} context={{ api, entity }} />
          ) : (
            <FlatChecks grouped={grouped} context={{ api, entity }} />
          )}
        </>
      )}
    </InfoCard>
  );
};
