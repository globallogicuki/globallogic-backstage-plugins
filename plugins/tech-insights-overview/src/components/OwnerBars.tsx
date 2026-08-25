import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import type { OwnerSummary } from '../useTechInsightsOverview';
import { OWNER_BUDGET, useOverviewStyles } from '../styles';
import { OwnerGlyph } from './OwnerGlyph';

/** What a bar's number is counting. The budget is defined on failing checks, so it
 *  only applies when that is what the bars measure. */
export type OwnerBarsUnit = 'checks' | 'components';

/**
 * Failing checks (or, scoped to one check, failing components) per owner — the
 * accountability axis the per-check view lacks.
 *
 * A single series, so one hue and no legend: the heading names what the bars are. Red
 * only above the failing-checks budget, and never when the unit is components — a
 * budget of checks applied to a count of components inverted the red/grey signal
 * against what the on-screen legend claimed.
 */
export const OwnerBars = ({
  owners,
  highlight,
  unit,
}: {
  owners: OwnerSummary[];
  /** ownerRef to emphasise, or null for no emphasis. */
  highlight: string | null;
  unit: OwnerBarsUnit;
}) => {
  const classes = useOverviewStyles();

  if (owners.length === 0) {
    return (
      <Typography variant="body2" className={classes.empty}>
        Nothing failing.
      </Typography>
    );
  }

  const max = Math.max(1, ...owners.map(o => o.failing));

  return (
    <Box className={classes.bars}>
      {owners.map(owner => {
        const breached = unit === 'checks' && owner.failing > OWNER_BUDGET;
        const dimmed = highlight !== null && highlight !== owner.ownerRef;
        /* The tooltip keeps the kind in words — the glyph carries it visually. */
        const described =
          owner.ownerKind === 'user' ? `${owner.owner} (user)` : owner.owner;
        const noun = unit === 'checks' ? 'failing check' : 'failing component';
        return (
          <Box
            key={owner.ownerRef}
            className={classes.barRow}
            style={dimmed ? { opacity: 0.4 } : undefined}
            title={`${described}: ${owner.failing} ${noun}${
              owner.failing === 1 ? '' : 's'
            } across ${owner.components} component${
              owner.components === 1 ? '' : 's'
            }`}
          >
            <Box className={classes.ownerCell}>
              <OwnerGlyph kind={owner.ownerKind} />
              <Typography component="span" className={classes.barLabel}>
                {owner.owner}
              </Typography>
            </Box>
            <Box className={classes.barTrack}>
              <Box
                className={`${classes.barFill} ${
                  breached ? classes.barFillBreach : ''
                }`}
                style={{ width: `${(owner.failing / max) * 100}%` }}
              />
            </Box>
            <Typography component="span" className={classes.barValue}>
              {owner.failing}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
