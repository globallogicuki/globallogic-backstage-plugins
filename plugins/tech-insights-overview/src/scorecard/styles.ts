import { makeStyles } from '@material-ui/core/styles';

/**
 * The small-caps label shared by the section headings and each row's state
 * word — one definition so the two cannot drift apart.
 *
 * The weight is a literal because MUI v4's theme defines only 400/500/700;
 * there is no token for 600. Colour is left to the caller: the headings are
 * always subtle, while a state word takes its colour from pass or fail.
 */
const smallCapsLabel = {
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
} as const;

/**
 * Layout-only styles for the per-entity scorecard — colors, fonts, and radii
 * come from the host theme. A passing check is deliberately silent (no
 * colour, a hollow marker); only failures take colour, and never colour
 * alone: every row also carries an explicit FAILED/PASSED word.
 */
export const useScorecardStyles = makeStyles(theme => {
  const border = `1px solid ${theme.palette.divider}`;
  /* success.main is tuned as a fill, not as small text — the darker/lighter
     variant per mode is what keeps the PASSED word legible, the same way the
     failed word already leans on error.light in dark mode. */
  const passedInk =
    theme.palette.type === 'light'
      ? theme.palette.success.dark
      : theme.palette.success.light;
  return {
    headline: {
      display: 'flex',
      alignItems: 'baseline',
      gap: theme.spacing(1),
    },
    score: {
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
    },
    subtle: { color: theme.palette.text.secondary },

    /* One segment per check — an honest count rather than a percentage, which
       would imply more precision than a handful of booleans carry. */
    meter: {
      display: 'flex',
      gap: 2,
      marginTop: theme.spacing(1.5),
    },
    segment: {
      height: 5,
      flex: 1,
      minWidth: 4,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.success.main,
    },
    segmentFailed: { backgroundColor: theme.palette.error.main },

    sectionLabel: {
      ...smallCapsLabel,
      marginTop: theme.spacing(2.5),
      color: theme.palette.text.secondary,
    },
    list: { marginTop: theme.spacing(1) },

    /* A category heading carries more weight than the Failing/Passing labels it
       replaces: it owns the checks beneath it, so it gets primary ink and a rule
       under it rather than sitting as a bare caption. */
    categoryHead: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: theme.spacing(1.5),
      flexWrap: 'wrap',
      marginTop: theme.spacing(2.5),
      paddingBottom: theme.spacing(0.75),
      borderBottom: border,
    },
    categoryName: {
      ...smallCapsLabel,
      color: theme.palette.text.primary,
    },
    categoryMeta: {
      display: 'flex',
      alignItems: 'baseline',
      gap: theme.spacing(1.5),
    },
    /* Right-aligned against the verdict so the counts line up down the card. */
    categoryCount: {
      flexShrink: 0,
      fontVariantNumeric: 'tabular-nums',
    },

    row: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: theme.spacing(1.5),
      padding: theme.spacing(1, 0),
      borderTop: border,
    },
    marker: {
      width: 8,
      height: 8,
      marginTop: 6,
      flexShrink: 0,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.error.main,
    },
    markerPassed: {
      backgroundColor: theme.palette.success.main,
      border: 'none',
    },
    body: { flex: 1, minWidth: 0 },
    description: {
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(0.25),
    },
    state: {
      ...smallCapsLabel,
      flexShrink: 0,
      marginTop: 3,
    },
    stateFailed: {
      /* error.main is tuned for a light surface; dark themes ship a lighter
         variant for text for exactly this reason. */
      color:
        theme.palette.type === 'light'
          ? theme.palette.error.main
          : theme.palette.error.light,
    },
    statePassed: { color: passedInk },

    links: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme.spacing(1.5),
      marginTop: theme.spacing(0.75),
      fontSize: '0.8rem',
    },

    empty: {
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(1),
    },
  };
});
