import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@material-ui/core/Box';
import ButtonBase from '@material-ui/core/ButtonBase';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import type { CheckSummary } from '../useTechInsightsOverview';
import { meterColor, useOverviewStyles } from '../styles';

/**
 * One tile per check (or per category) in a single scrollable row, doubling as
 * the page's primary filter. The arrows in the header page the row; trackpads
 * and touch scroll it directly, so the scrollbar itself is hidden. Each tile's
 * meter is filled to its pass rate and coloured on a red-to-green ramp, so a
 * row of tiles can be read at a glance and near-misses are told apart from
 * standards nobody is meeting.
 *
 * `parent` turns the heading into a breadcrumb, for when this row is one level
 * of a drill-down rather than the whole story.
 */
export const CheckTiles = ({
  title,
  checks,
  selectedId,
  onSelect,
  parent,
}: {
  title: string;
  checks: CheckSummary[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** The level above this one — rendered as a clickable crumb before the title. */
  parent?: { label: string; onSelect: () => void };
}) => {
  const classes = useOverviewStyles();
  const scroller = useRef<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = useState({ back: false, forward: false });

  const updateArrows = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanScroll({
      back: el.scrollLeft > 0,
      forward: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [checks, updateArrows]);

  const page = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <Box>
      <Box className={classes.tilesHeader}>
        <Typography variant="h6">
          {parent && (
            <>
              <button
                type="button"
                className={classes.crumb}
                onClick={parent.onSelect}
              >
                {parent.label}
              </button>
              <span className={classes.crumbSeparator} aria-hidden>
                ›
              </span>
            </>
          )}
          {title}
        </Typography>
        <Box className={classes.tilesArrows}>
          <IconButton
            size="small"
            aria-label="Scroll checks back"
            disabled={!canScroll.back}
            onClick={() => page(-1)}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Scroll checks forward"
            disabled={!canScroll.forward}
            onClick={() => page(1)}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* A plain div rather than Box: the scroller needs a real DOM ref, and
          MUI v4's Box does not reliably forward one. */}
      <div
        className={classes.tilesScroller}
        ref={scroller}
        onScroll={updateArrows}
        role="group"
        aria-label={title}
      >
        {checks.map(check => {
          const passing = check.total - check.failing;
          const pct = check.total
            ? Math.round((passing / check.total) * 100)
            : 100;
          const selected = selectedId === check.id;
          const fill = meterColor(check.failing, check.total);

          return (
            <ButtonBase
              key={check.id}
              focusRipple
              aria-pressed={selected}
              className={`${classes.tile} ${
                selected ? classes.tileSelected : ''
              }`}
              onClick={() => onSelect(selected ? null : check.id)}
            >
              <Typography component="div" variant="subtitle2">
                <strong>{check.name}</strong>
              </Typography>

              <Box display="flex" alignItems="baseline" style={{ gap: 6 }}>
                <Typography component="span" className={classes.tilePct}>
                  {pct}%
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  className={classes.subtle}
                >
                  passing
                </Typography>
              </Box>

              <Box
                className={classes.meter}
                role="img"
                aria-label={`${passing} of ${check.total} components passing`}
              >
                <Box
                  className={classes.meterFill}
                  style={{
                    width: `${pct}%`,
                    ...(fill ? { backgroundColor: fill } : {}),
                  }}
                />
              </Box>

              <Typography
                component="span"
                variant="caption"
                className={classes.tabular}
              >
                {check.failing} of {check.total} failing
              </Typography>
            </ButtonBase>
          );
        })}
      </div>
    </Box>
  );
};
