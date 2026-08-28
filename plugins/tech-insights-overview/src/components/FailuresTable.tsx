import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { Link } from '@backstage/core-components';
import type { FailingEntity } from '../useTechInsightsOverview';
import { entityHref } from '../links';
import { meterColor, useOverviewStyles } from '../styles';
import { OwnerGlyph } from './OwnerGlyph';

/** One column of the matrix — a category, or a check within one. */
export type MatrixColumn = { key: string; label: string };

export type CellState = 'failed' | 'passed' | 'unscored';

const CELL_WORDS: Record<CellState, string> = {
  failed: 'failed',
  passed: 'passed',
  unscored: 'no result yet',
};

/**
 * Components with at least one failing check, worst first, as a scorecard
 * matrix: one column per standard, one mark per cell.
 *
 * The names live in the header, not the cells. Listing each failing check as a
 * chip inside the row does not survive contact with a real catalog — twenty
 * failing checks is twenty chips in one cell, rows of wildly different heights,
 * and nothing you can compare by running your eye down a column. A mark per
 * cell keeps every row one line high however many checks there are, and the
 * count column carries the magnitude.
 *
 * Columns come from the caller because they follow the page's drill level:
 * categories at the top, one category's checks once you are inside it. Both are
 * small, bounded sets — unlike "every check in the catalog", which is what made
 * the chips unscalable in the first place.
 *
 * Cells are never colour alone: each carries a tooltip and an accessible name
 * spelling out the standard and its state, and `unscored` renders as a dash
 * rather than a mark so "no facts yet" cannot read as a pass.
 *
 * A category cell also reports how many of its checks passed, and `cellRatio`
 * hues the dot on the same red-to-green ramp the tiles use — one check missing
 * out of six should not look identical to all six missing. Without a ratio the
 * dot falls back to flat pass/fail, which is all a single check can say.
 */
export const FailuresTable = ({
  entities,
  columns,
  cellState,
  cellRatio,
  highlightedColumn = null,
}: {
  entities: FailingEntity[];
  columns: MatrixColumn[];
  cellState: (entity: FailingEntity, key: string) => CellState;
  /**
   * How many of this cell's checks passed, when the cell stands for more than
   * one. Returning null keeps the flat pass/fail colouring.
   */
  cellRatio?: (
    entity: FailingEntity,
    key: string,
  ) => { passed: number; total: number } | null;
  /** Column to emphasise — the one the page is scoped to, if any. */
  highlightedColumn?: string | null;
}) => {
  const classes = useOverviewStyles();

  if (entities.length === 0) {
    return (
      <Typography variant="body2" className={classes.empty}>
        No components match these filters.
      </Typography>
    );
  }

  return (
    <Box className={classes.tableScroll}>
      <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow className={classes.matrixHeadRow}>
            <TableCell
              className={`${classes.tableHeadCell} ${classes.stickyCell}`}
            >
              Component
            </TableCell>
            <TableCell className={classes.tableHeadCell}>Owner</TableCell>
            {columns.map(column => (
              <TableCell
                key={column.key}
                align="center"
                className={`${classes.tableHeadCell} ${
                  classes.matrixHeadCell
                } ${
                  highlightedColumn === column.key ? classes.matrixHeadOn : ''
                }`}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {entities.map(entity => (
            <TableRow key={entity.ref} className={classes.matrixRow}>
              <TableCell className={classes.stickyCell}>
                <Link to={entityHref(entity.ref)}>{entity.name}</Link>
              </TableCell>
              <TableCell>
                <Box className={classes.ownerCell}>
                  <OwnerGlyph kind={entity.ownerKind} />
                  <Typography component="span" className={classes.ownerName}>
                    {entity.owner}
                  </Typography>
                </Box>
              </TableCell>
              {columns.map(column => {
                const state = cellState(entity, column.key);
                const ratio = cellRatio?.(entity, column.key) ?? null;
                /* Only worth grading when the cell covers several checks —
                   a lone check has nothing between passed and failed. */
                const graded =
                  state !== 'unscored' && ratio && ratio.total > 1
                    ? meterColor(ratio.total - ratio.passed, ratio.total)
                    : null;
                const label = ratio
                  ? `${column.label}: ${CELL_WORDS[state]} (${ratio.passed} of ${ratio.total} checks passed)`
                  : `${column.label}: ${CELL_WORDS[state]}`;
                return (
                  <TableCell key={column.key} align="center">
                    <Tooltip title={label}>
                      {state === 'unscored' ? (
                        <span
                          className={classes.markUnscored}
                          role="img"
                          aria-label={label}
                        >
                          –
                        </span>
                      ) : (
                        <span
                          className={`${classes.mark} ${
                            state === 'failed'
                              ? classes.markFailed
                              : classes.markPassed
                          }`}
                          style={
                            graded ? { backgroundColor: graded } : undefined
                          }
                          role="img"
                          aria-label={label}
                        />
                      )}
                    </Tooltip>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
