import { useMemo, useState } from 'react';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import {
  Content,
  Progress,
  ResponseErrorPanel,
  WarningPanel,
} from '@backstage/core-components';
import { SkillListing, flattenSkills, skillsMarketplaceApiRef } from './api';
import { SkillCard } from './SkillCard';
import { SkillDetailDrawer } from './SkillDetailDrawer';
import { useSkillsStyles } from './styles';

const ALL = '__all__';

const matches = (listing: SkillListing, query: string): boolean => {
  if (!query) return true;
  const { skill } = listing;
  const haystack = [
    skill.name,
    skill.description,
    skill.category ?? '',
    listing.repo,
    ...(skill.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every(term => haystack.includes(term));
};

export const SkillsMarketplacePage = () => {
  const classes = useSkillsStyles();
  const skillsMarketplaceApi = useApi(skillsMarketplaceApiRef);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(ALL);
  const [repo, setRepo] = useState<string>(ALL);
  const [selected, setSelected] = useState<SkillListing | null>(null);

  const { value, loading, error } = useAsync(
    () => skillsMarketplaceApi.getMarketplace(),
    [skillsMarketplaceApi],
  );

  const marketplaces = value?.marketplaces;
  const failures = value?.errors ?? [];

  const listings = useMemo(
    () => flattenSkills(marketplaces ?? []),
    [marketplaces],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    listings.forEach(l => l.skill.category && set.add(l.skill.category));
    return Array.from(set).sort();
  }, [listings]);

  const repos = useMemo(
    () => (marketplaces ?? []).map(entry => entry.repo).sort(),
    [marketplaces],
  );

  const visible = useMemo(
    () =>
      listings
        .filter(l => repo === ALL || l.repo === repo)
        .filter(l => category === ALL || l.skill.category === category)
        .filter(l => matches(l, query))
        .sort(
          (a, b) =>
            a.skill.name.localeCompare(b.skill.name) ||
            a.repo.localeCompare(b.repo),
        ),
    [listings, repo, category, query],
  );

  return (
    /* No <Page>/<Header>: the app shell renders the PageBlueprint title. */
    <Content>
      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}

      {failures.length > 0 && (
        <Box mb={2}>
          <WarningPanel
            severity="warning"
            title={`${failures.length} marketplace${
              failures.length === 1 ? '' : 's'
            } could not be loaded`}
          >
            <ul className={classes.failureList}>
              {failures.map(failure => (
                <li key={failure.url}>
                  <strong>{failure.repo}</strong> — {failure.message}
                </li>
              ))}
            </ul>
          </WarningPanel>
        </Box>
      )}

      {marketplaces && (
        <>
          <Box className={classes.filters}>
            <TextField
              className={classes.search}
              variant="outlined"
              size="small"
              placeholder="Search skills by name, description, or keyword…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            {/* Repo filtering only earns its space with more than one repo. */}
            {repos.length > 1 && (
              <TextField
                className={classes.repoFilter}
                select
                variant="outlined"
                size="small"
                label="Repo"
                value={repo}
                onChange={e => setRepo(e.target.value)}
                inputProps={{ 'aria-label': 'Filter by repo' }}
              >
                <MenuItem value={ALL}>All repos</MenuItem>
                {repos.map(name => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {categories.length > 0 && (
              <div className={classes.categories}>
                <Chip
                  label="All"
                  size="small"
                  clickable
                  color={category === ALL ? 'primary' : 'default'}
                  onClick={() => setCategory(ALL)}
                />
                {categories.map(cat => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    clickable
                    color={category === cat ? 'primary' : 'default'}
                    onClick={() => setCategory(cat)}
                  />
                ))}
              </div>
            )}
            <Typography
              component="span"
              variant="body2"
              className={classes.resultCount}
            >
              {visible.length} of {listings.length}
            </Typography>
          </Box>

          {visible.length === 0 ? (
            <Typography variant="body2" className={classes.empty}>
              No skills match your search.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {visible.map(listing => (
                <Grid
                  item
                  key={`${listing.repo}/${listing.skill.name}`}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                >
                  <SkillCard
                    listing={listing}
                    showRepo={repos.length > 1}
                    onSelect={setSelected}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <SkillDetailDrawer
        listing={selected}
        showRepo={repos.length > 1}
        onClose={() => setSelected(null)}
      />
    </Content>
  );
};
