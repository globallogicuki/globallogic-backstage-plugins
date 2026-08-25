import { makeStyles } from '@material-ui/core/styles';

/**
 * How red a check or a component is allowed to look. A quarter of the catalog
 * failing a check is a standard nobody is meeting; anything else failing is a
 * warning; zero stays neutral.
 */
const CRITICAL_FAILURE_RATE = 0.25;
/** A component failing this many checks reads as critical, not warning. */
const CRITICAL_FAILING_CHECKS = 3;
/** An owner over this many failing checks gets a red bar. */
export const OWNER_BUDGET = 5;

export type Severity = 'none' | 'warning' | 'critical';

export const checkSeverity = (failing: number, total: number): Severity => {
  if (failing === 0 || total === 0) return 'none';
  return failing / total >= CRITICAL_FAILURE_RATE ? 'critical' : 'warning';
};

export const entitySeverity = (failing: number): Severity => {
  if (failing === 0) return 'none';
  return failing >= CRITICAL_FAILING_CHECKS ? 'critical' : 'warning';
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

    /* Meter: neutral track, colored only when it matters */
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
    meterWarning: { backgroundColor: theme.palette.warning.main },
    meterCritical: { backgroundColor: theme.palette.error.main },

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
    componentCell: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    stripe: {
      width: 3,
      height: 22,
      flex: '0 0 3px',
      backgroundColor: theme.palette.divider,
    },
    stripeWarning: { backgroundColor: theme.palette.warning.main },
    stripeCritical: { backgroundColor: theme.palette.error.main },
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
    chips: { display: 'flex', flexWrap: 'wrap', gap: 4 },

    /* Owner bars: one owner per row — bars answer "who's worst" by length
       comparison down a single column, so they never flow into columns. */
    bars: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      padding: theme.spacing(1.5, 2),
    },
    barRow: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 10.5rem) minmax(0, 1fr) 2.5rem',
      alignItems: 'center',
      gap: theme.spacing(1.25),
    },
    barLabel: {
      fontSize: '0.8rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    barTrack: { height: 14, position: 'relative' },
    barFill: {
      height: 14,
      borderRadius: '0 4px 4px 0',
      minWidth: 2,
      backgroundColor:
        theme.palette.type === 'light'
          ? theme.palette.grey[400]
          : theme.palette.grey[700],
    },
    barFillBreach: { backgroundColor: theme.palette.error.main },
    barValue: {
      textAlign: 'right',
      fontSize: '0.8rem',
      fontVariantNumeric: 'tabular-nums',
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
