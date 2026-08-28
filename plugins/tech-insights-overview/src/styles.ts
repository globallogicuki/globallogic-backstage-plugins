import { makeStyles } from '@material-ui/core/styles';

/**
 * Meter colour as a continuous ramp from red at 0% passing to green at 100%,
 * through amber in the middle — so a category at 90% reads visibly healthier
 * than one at 30%, rather than both landing in the same "critical" bucket.
 *
 * ponytail: hand-rolled hsl interpolation rather than a colour library. Hue
 * 0→120 with fixed saturation/lightness is close enough at meter size; reach
 * for a perceptual space (oklch) only if the mid-range reads muddy.
 *
 * Nothing scored is not a pass: that stays neutral, and the tile's own "n of m
 * failing" line is what carries the state to anyone who cannot read the hue.
 */
export const meterColor = (failing: number, total: number): string | null => {
  if (total === 0) return null;
  const passRate = (total - failing) / total;
  return `hsl(${Math.round(passRate * 120)}, 62%, 45%)`;
};

/** Layout-only styles — colors, fonts, and radii come from the host theme. */
export const useOverviewStyles = makeStyles(theme => {
  const border = `1px solid ${theme.palette.divider}`;
  return {
    panel: {
      backgroundColor: theme.palette.background.paper,
      border,
      borderRadius: theme.shape.borderRadius,
    },
    panelHead: {
      padding: theme.spacing(1.75, 2),
      borderBottom: border,
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: theme.spacing(1.5),
      flexWrap: 'wrap',
    },
    tableHeadCell: {
      color: theme.palette.text.secondary,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    subtle: { color: theme.palette.text.secondary },
    tabular: { fontVariantNumeric: 'tabular-nums' },

    /* Top row: the fully-passing stat and the check tiles as peer sections,
       separated by a vertical divider. */
    topRow: {
      display: 'flex',
      alignItems: 'stretch',
      gap: theme.spacing(3),
      [theme.breakpoints.down('sm')]: { flexDirection: 'column' },
    },
    topRowTiles: {
      flex: '1 1 0',
      minWidth: 0,
    },
    summary: {
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1),
    },
    /* Sized and styled like a check tile so the row reads as one family. */
    summaryCard: {
      flex: '1 1 auto',
      minWidth: 200,
      padding: theme.spacing(1.75),
      backgroundColor: theme.palette.background.paper,
      border,
      borderRadius: theme.shape.borderRadius,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: theme.spacing(1),
    },
    heroFigure: {
      display: 'flex',
      alignItems: 'baseline',
      gap: theme.spacing(1),
    },
    heroNumber: {
      fontWeight: 600,
      fontSize: '2.75rem',
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
    },

    /* Check tiles: one row, scrolled by the arrows in the header */
    tilesHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing(1.5),
      marginBottom: theme.spacing(1),
    },
    tilesArrows: {
      display: 'flex',
      gap: theme.spacing(1),
    },
    /* Breadcrumb back to the level above, inside the tile row's heading. A real
       button because it is an in-page action, styled down to inherit the
       heading's type so the crumb reads as part of the title. */
    crumb: {
      font: 'inherit',
      color: theme.palette.text.secondary,
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      textDecoration: 'underline',
      '&:hover': { color: theme.palette.text.primary },
    },
    crumbSeparator: {
      color: theme.palette.text.secondary,
      margin: theme.spacing(0, 0.75),
    },
    tilesScroller: {
      display: 'flex',
      gap: theme.spacing(1.5),
      overflowX: 'auto',
      /* The arrows are the affordance; a scrollbar under a card row reads as
         clutter. Trackpads and touch still scroll it directly. */
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    },
    tile: {
      flex: '0 0 220px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      gap: theme.spacing(1),
      textAlign: 'left',
      padding: theme.spacing(1.75),
      backgroundColor: theme.palette.background.paper,
      border,
      borderRadius: theme.shape.borderRadius,
      '&:hover': { borderColor: theme.palette.text.secondary },
    },
    tileSelected: {
      borderColor: theme.palette.primary.main,
      boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.action.selected,
      '&:hover': { borderColor: theme.palette.primary.main },
    },
    tilePct: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
    },

    /* Meter: neutral track; the fill is the pass rate, hued by meterColor. */
    meter: {
      height: 6,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: theme.palette.divider,
      borderRadius: theme.shape.borderRadius,
    },
    meterFill: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      backgroundColor:
        theme.palette.type === 'light'
          ? theme.palette.grey[400]
          : theme.palette.grey[700],
    },

    /* Filters */
    filters: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing(2),
      padding: theme.spacing(2, 2, 1.5),
      borderBottom: border,
    },
    filter: { minWidth: 170 },
    resultCount: {
      marginLeft: 'auto',
      color: theme.palette.text.secondary,
    },

    /* Table */
    tableScroll: { overflowX: 'auto' },
    table: { minWidth: 680 },
    /* Matrix: the standard's name is in the header, so a cell is one mark. Rows
       stay a single line however many checks a component has. */
    /* With many standards the matrix scrolls sideways, so the identity column
       is pinned — a row of marks means nothing once its name has scrolled off.
       It inherits the row's background rather than setting its own, so hover and
       any row tint run behind the component name instead of stopping at it. */
    stickyCell: {
      position: 'sticky',
      left: 0,
      zIndex: 1,
      backgroundColor: 'inherit',
    },
    /* A sticky cell can only inherit an opaque colour if the row has one, and it
       must be opaque or the scrolled marks show through underneath. */
    matrixHeadRow: { backgroundColor: theme.palette.background.paper },
    matrixRow: {
      backgroundColor: theme.palette.background.paper,
      '&:hover': { backgroundColor: theme.palette.action.hover },
    },
    matrixHeadCell: {
      /* Narrow enough that a handful of standards fit without pushing the
         component name off screen; the panel scrolls horizontally past that. */
      maxWidth: 92,
      whiteSpace: 'normal',
      lineHeight: 1.2,
      verticalAlign: 'bottom',
    },
    matrixHeadOn: { color: theme.palette.text.primary },
    mark: {
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: theme.shape.borderRadius,
    },
    markFailed: { backgroundColor: theme.palette.error.main },
    /* Red against green reads faster in a grid than red against blank: an empty
       cell is ambiguous between "met" and "nothing ran", and the dash below is
       what carries that difference. Marks, not ticks — and every cell still
       names its state in a tooltip and an accessible label, so the grid does not
       rely on telling the two hues apart. */
    markPassed: { backgroundColor: theme.palette.success.main },
    /* A dash, never a mark: no facts yet must not read as a pass. */
    markUnscored: {
      color: theme.palette.text.disabled,
      fontVariantNumeric: 'tabular-nums',
    },

    ownerCell: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      minWidth: 0,
    },
    ownerIcon: {
      fontSize: 14,
      flex: '0 0 auto',
      color: theme.palette.text.secondary,
    },
    ownerName: {
      fontSize: '0.8rem',
      color: theme.palette.text.secondary,
    },
    empty: {
      padding: theme.spacing(4, 2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    sectionGap: { marginTop: theme.spacing(3) },
  };
});
