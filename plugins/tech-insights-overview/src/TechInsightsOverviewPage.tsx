import { useMemo, useState } from 'react';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import {
  Content,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import {
  useTechInsightsOverview,
  type Aggregate,
  type CategorySummary,
  type CheckSummary,
  type FailingEntity,
} from './useTechInsightsOverview';
import { useOverviewStyles } from './styles';
import { SummaryBand } from './components/SummaryBand';
import { CheckTiles } from './components/CheckTiles';
import {
  FailuresTable,
  type CellState,
  type MatrixColumn,
} from './components/FailuresTable';
import { OwnerGlyph } from './components/OwnerGlyph';

/**
 * A matrix cell for a category column: failed beats passed, and a category with
 * no result for this component is neither.
 */
const categoryCellState = (entity: FailingEntity, key: string): CellState => {
  if (entity.failedCategories.includes(key)) return 'failed';
  if (entity.scoredCategories.includes(key)) return 'passed';
  return 'unscored';
};

/** How many of a category's checks this component passes, for the cell's hue. */
const categoryCellRatio = (entity: FailingEntity, key: string) =>
  entity.categoryTallies[key] ?? null;

/** The same, for a check column. */
const checkCellState = (entity: FailingEntity, key: string): CellState => {
  if (entity.failedCheckIds.includes(key)) return 'failed';
  if (entity.checkIds.includes(key)) return 'passed';
  return 'unscored';
};

/* The owner filter compares against canonical refs (`group:default/platform`), which
   always contain a colon — so this bare sentinel cannot collide with a real owner. */
const ALL = 'all';

/**
 * A category rendered through the check tile, so the two rows read as one
 * family. The unit differs — a category tile counts components meeting the
 * whole category, a check tile counts components passing one check — and the
 * tile's own caption says "of N failing" either way, so the shape carries over
 * without lying. Keyed by name because a category has no id of its own.
 */
const asTile = (category: CategorySummary): CheckSummary => ({
  id: category.name,
  name: category.name,
  category: category.name,
  failing: category.failing,
  total: category.scored,
});

/** The crumb label for the top of the drill-down. */
const CATEGORIES_TITLE = 'Weakest categories';

/**
 * The one tile row, at whichever level of the drill-down you are on.
 *
 * Categories and their checks are two levels of the same question, so they share
 * one row rather than stacking two: with a dozen checks across a handful of
 * categories, showing both at once is more tiles than anyone reads. Picking a
 * category replaces the row with that category's checks and leaves a crumb back.
 *
 * No category is ever shown as selected at the top level — selecting one moves
 * you down a level instead, which the breadcrumb then makes visible.
 */
const TileRow = ({
  aggregate,
  selectedCategory,
  selectedCheck,
  checksInScope,
  onSelectCategory,
  onSelectCheck,
}: {
  aggregate: Aggregate;
  selectedCategory: string | null;
  selectedCheck: string | null;
  checksInScope: CheckSummary[];
  onSelectCategory: (name: string | null) => void;
  onSelectCheck: (id: string | null) => void;
}) => {
  const classes = useOverviewStyles();

  if (aggregate.checks.length === 0) {
    return (
      <>
        <Typography variant="h6" gutterBottom>
          Weakest standards
        </Typography>
        <Typography variant="body2" className={classes.subtle}>
          No checks are configured.
        </Typography>
      </>
    );
  }

  if (!aggregate.categorised) {
    return (
      <CheckTiles
        title="Weakest standards"
        checks={aggregate.checks}
        selectedId={selectedCheck}
        onSelect={onSelectCheck}
      />
    );
  }

  if (selectedCategory) {
    return (
      <CheckTiles
        title={selectedCategory}
        checks={checksInScope}
        selectedId={selectedCheck}
        onSelect={onSelectCheck}
        parent={{
          label: CATEGORIES_TITLE,
          onSelect: () => onSelectCategory(null),
        }}
      />
    );
  }

  return (
    <CheckTiles
      title={CATEGORIES_TITLE}
      checks={aggregate.categories.map(asTile)}
      selectedId={null}
      onSelect={onSelectCategory}
    />
  );
};

export const TechInsightsOverviewPage = () => {
  const classes = useOverviewStyles();
  const { loading, error, aggregate } = useTechInsightsOverview();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null);
  const [ownerRef, setOwnerRef] = useState<string>(ALL);
  const [query, setQuery] = useState('');

  /* Choosing a category clears the check: a check from another category would
     scope the table to something the selected category cannot contain, leaving a
     table that reads as empty for no visible reason. */
  const chooseCategory = (name: string | null) => {
    setSelectedCategory(name);
    setSelectedCheck(null);
  };

  /* Check tiles and the check filter follow the selected category, so the only
     checks on offer are ones that can actually narrow the table further. */
  const checksInScope = useMemo<CheckSummary[]>(() => {
    if (!aggregate) return [];
    if (!selectedCategory) return aggregate.checks;
    return aggregate.checks.filter(c => c.category === selectedCategory);
  }, [aggregate, selectedCategory]);

  /* The matrix columns follow the drill level: the categories you are choosing
     between, or — once inside one — the checks that make it up. Both are bounded
     sets, which is the whole reason the standards are columns and not chips. */
  const showCategoryColumns = Boolean(
    aggregate?.categorised && !selectedCategory,
  );
  const columns = useMemo<MatrixColumn[]>(() => {
    if (!aggregate) return [];
    if (showCategoryColumns) {
      return aggregate.categories.map(c => ({ key: c.name, label: c.name }));
    }
    return checksInScope.map(c => ({ key: c.id, label: c.name }));
  }, [aggregate, showCategoryColumns, checksInScope]);

  const visible = useMemo(() => {
    if (!aggregate) return [];
    const q = query.trim().toLowerCase();
    return aggregate.entities.filter(entity => {
      if (q && !entity.name.toLowerCase().includes(q)) return false;
      if (ownerRef !== ALL && entity.ownerRef !== ownerRef) return false;
      if (
        selectedCategory &&
        !entity.failedCategories.includes(selectedCategory)
      ) {
        return false;
      }
      if (selectedCheck && !entity.failedCheckIds.includes(selectedCheck)) {
        return false;
      }
      return true;
    });
  }, [aggregate, query, ownerRef, selectedCategory, selectedCheck]);

  const selectedCheckName = aggregate?.checks.find(
    c => c.id === selectedCheck,
  )?.name;
  /* The narrower of the two scopes is the one worth naming. */
  const scopeLabel = selectedCheckName ?? selectedCategory ?? undefined;

  return (
    /* No <Page>/<Header>: the app shell renders the PageBlueprint title. */
    <Content>
      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}

      {aggregate && aggregate.scored === 0 && (
        <Typography variant="body2" className={classes.subtle}>
          No checks have run yet.
        </Typography>
      )}

      {aggregate && aggregate.scored > 0 && (
        <>
          <Box className={classes.topRow}>
            <SummaryBand
              fullyPassing={aggregate.fullyPassing}
              scored={aggregate.scored}
              unscored={aggregate.unscored}
            />
            <Divider orientation="vertical" flexItem />
            <Box className={classes.topRowTiles}>
              <TileRow
                aggregate={aggregate}
                selectedCategory={selectedCategory}
                selectedCheck={selectedCheck}
                checksInScope={checksInScope}
                onSelectCategory={chooseCategory}
                onSelectCheck={setSelectedCheck}
              />
            </Box>
          </Box>

          <Box className={classes.sectionGap}>
            <Box className={classes.panel}>
              <Box className={classes.panelHead}>
                <Box>
                  <Typography variant="subtitle1">
                    <strong>Components with failures</strong>
                  </Typography>
                  <Typography variant="caption" className={classes.subtle}>
                    Which standards each component is missing
                  </Typography>
                </Box>
                {scopeLabel && (
                  <Typography variant="caption" className={classes.subtle}>
                    scoped to {scopeLabel.toLowerCase()}
                  </Typography>
                )}
              </Box>

              <Box className={classes.filters}>
                <TextField
                  className={classes.filter}
                  label="Name contains"
                  variant="outlined"
                  size="small"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {/* No category select: the tile row is the category control,
                      and it is always on screen. A second way to set the same
                      state is one more thing to read on an already busy page. */}
                <TextField
                  className={classes.filter}
                  select
                  label="Owner"
                  variant="outlined"
                  size="small"
                  value={ownerRef}
                  onChange={e => setOwnerRef(e.target.value)}
                >
                  <MenuItem value={ALL}>Any owner</MenuItem>
                  {aggregate.owners.map(o => (
                    <MenuItem key={o.ownerRef} value={o.ownerRef}>
                      <Box className={classes.ownerCell}>
                        <OwnerGlyph kind={o.ownerKind} />
                        {o.owner}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  className={classes.filter}
                  select
                  label="Failing check"
                  variant="outlined"
                  size="small"
                  value={selectedCheck ?? ALL}
                  onChange={e =>
                    setSelectedCheck(
                      e.target.value === ALL ? null : e.target.value,
                    )
                  }
                >
                  <MenuItem value={ALL}>Any check</MenuItem>
                  {/* Only checks that actually fail somewhere — offering a filter
                          that can only return nothing is a dead end. The one exception
                          is the currently selected check: a fully-passing tile can be
                          clicked, and the Select must be able to show that value
                          rather than render blank. */}
                  {checksInScope
                    .filter(c => c.failing > 0 || c.id === selectedCheck)
                    .map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                </TextField>
                <Typography component="span" className={classes.resultCount}>
                  {visible.length} of {aggregate.entities.length}
                </Typography>
              </Box>

              {/* A matrix, not a list: the standards name themselves in the
                    header so each cell is a single mark, and a row stays one
                    line whether it fails two checks or twenty. */}
              <FailuresTable
                entities={visible}
                columns={columns}
                cellState={
                  showCategoryColumns ? categoryCellState : checkCellState
                }
                /* Only category cells stand for more than one check; a check
                   column's dot has nothing to grade. */
                cellRatio={showCategoryColumns ? categoryCellRatio : undefined}
                highlightedColumn={showCategoryColumns ? null : selectedCheck}
              />
            </Box>
          </Box>
        </>
      )}
    </Content>
  );
};
