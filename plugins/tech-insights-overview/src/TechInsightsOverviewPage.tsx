import { useMemo, useState } from 'react';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import {
  Content,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import {
  compareOwnersWorstFirst,
  useTechInsightsOverview,
  type OwnerSummary,
} from './useTechInsightsOverview';
import { useOverviewStyles } from './styles';
import { SummaryBand } from './components/SummaryBand';
import { CheckTiles } from './components/CheckTiles';
import { FailuresTable } from './components/FailuresTable';
import { OwnerBars } from './components/OwnerBars';
import { OwnerGlyph } from './components/OwnerGlyph';

/* The owner filter compares against canonical refs (`group:default/platform`), which
   always contain a colon — so this bare sentinel cannot collide with a real owner. */
const ALL = 'all';

export const TechInsightsOverviewPage = () => {
  const classes = useOverviewStyles();
  const { loading, error, aggregate } = useTechInsightsOverview();

  const [selectedCheck, setSelectedCheck] = useState<string | null>(null);
  const [ownerRef, setOwnerRef] = useState<string>(ALL);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    if (!aggregate) return [];
    const q = query.trim().toLowerCase();
    return aggregate.entities.filter(entity => {
      if (q && !entity.name.toLowerCase().includes(q)) return false;
      if (ownerRef !== ALL && entity.ownerRef !== ownerRef) return false;
      if (selectedCheck && !entity.failedCheckIds.includes(selectedCheck)) {
        return false;
      }
      return true;
    });
  }, [aggregate, query, ownerRef, selectedCheck]);

  /* Bars follow the check filter but not the owner filter — an owner comparison that
     hid every other owner would answer a question nobody asked. The selected owner is
     highlighted instead. Scoped to a check, a bar counts failing components (each
     component can fail the selected check once), so the unit is passed along and the
     failing-checks budget does not apply. */
  const ownerBars = useMemo<OwnerSummary[]>(() => {
    if (!aggregate) return [];
    if (!selectedCheck) return aggregate.owners;
    const tally = new Map<string, OwnerSummary>();
    for (const entity of aggregate.entities) {
      if (!entity.failedCheckIds.includes(selectedCheck)) continue;
      const current = tally.get(entity.ownerRef) ?? {
        ownerRef: entity.ownerRef,
        owner: entity.owner,
        ownerKind: entity.ownerKind,
        failing: 0,
        components: 0,
      };
      current.failing += 1;
      current.components += 1;
      tally.set(entity.ownerRef, current);
    }
    return [...tally.values()].sort(compareOwnersWorstFirst);
  }, [aggregate, selectedCheck]);

  const selectedCheckName = aggregate?.checks.find(
    c => c.id === selectedCheck,
  )?.name;

  /* The caption under the owner bars must describe the bars it sits under: scoped to a
     check, that is the components failing it, not every failing component. */
  const ownerBarsComponentCount = selectedCheck
    ? ownerBars.reduce((sum, o) => sum + o.components, 0)
    : aggregate?.entities.length ?? 0;

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
              {aggregate.checks.length === 0 ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Weakest standards
                  </Typography>
                  <Typography variant="body2" className={classes.subtle}>
                    No checks are configured.
                  </Typography>
                </>
              ) : (
                <CheckTiles
                  title="Weakest standards"
                  checks={aggregate.checks}
                  selectedId={selectedCheck}
                  onSelect={setSelectedCheck}
                />
              )}
            </Box>
          </Box>

          <Grid container spacing={3} className={classes.sectionGap}>
            <Grid item xs={12} lg={8}>
              <Box className={classes.panel}>
                <Box className={classes.panelHead}>
                  <Box>
                    <Typography variant="subtitle1">
                      <strong>Components with failures</strong>
                    </Typography>
                    <Typography variant="caption" className={classes.subtle}>
                      How many of each component's checks are failing
                    </Typography>
                  </Box>
                  {selectedCheckName && (
                    <Typography variant="caption" className={classes.subtle}>
                      scoped to {selectedCheckName.toLowerCase()}
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
                    {aggregate.checks
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

                <FailuresTable
                  entities={visible}
                  selectedCheckId={selectedCheck}
                />
              </Box>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Box className={classes.panel}>
                <Box className={classes.panelHead}>
                  <Box>
                    <Typography variant="subtitle1">
                      <strong>Failing by owner</strong>
                    </Typography>
                    <Typography variant="caption" className={classes.subtle}>
                      From spec.owner, across {ownerBarsComponentCount}{' '}
                      component{ownerBarsComponentCount === 1 ? '' : 's'}
                      {selectedCheckName
                        ? ` failing ${selectedCheckName.toLowerCase()}`
                        : ''}
                    </Typography>
                  </Box>
                </Box>
                <OwnerBars
                  owners={ownerBars}
                  highlight={ownerRef === ALL ? null : ownerRef}
                  unit={selectedCheck ? 'components' : 'checks'}
                />
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Content>
  );
};
