import { useMemo, useState } from 'react';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
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
} from '@backstage/core-components';
import { Skill, skillsMarketplaceApiRef } from './api';
import { SkillCard } from './SkillCard';
import { SkillDetailDrawer } from './SkillDetailDrawer';
import { useSkillsStyles } from './styles';

const ALL = '__all__';

const matches = (skill: Skill, query: string): boolean => {
  if (!query) return true;
  const haystack = [
    skill.name,
    skill.description,
    skill.category ?? '',
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
  const [selected, setSelected] = useState<Skill | null>(null);

  const { value, loading, error } = useAsync(
    () => skillsMarketplaceApi.getMarketplace(),
    [skillsMarketplaceApi],
  );

  const marketplace = value?.marketplace;

  const categories = useMemo(() => {
    const set = new Set<string>();
    marketplace?.plugins.forEach(p => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [marketplace]);

  const visible = useMemo(() => {
    const plugins = marketplace?.plugins ?? [];
    return plugins
      .filter(p => category === ALL || p.category === category)
      .filter(p => matches(p, query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [marketplace, category, query]);

  const total = marketplace?.plugins.length ?? 0;

  return (
    /* No <Page>/<Header>: in the new frontend system the app shell renders the
       page title from the `title` on the PageBlueprint in alpha.tsx. */
    <Content>
      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}

      {marketplace && (
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
              {visible.length} of {total}
            </Typography>
          </Box>

          {visible.length === 0 ? (
            <Typography variant="body2" className={classes.empty}>
              No skills match your search.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {visible.map(skill => (
                <Grid item key={skill.name} xs={12} sm={6} md={4} lg={3}>
                  <SkillCard skill={skill} onSelect={setSelected} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {value && (
        <SkillDetailDrawer
          skill={selected}
          marketplaceName={value.marketplace.name}
          installUrl={value.installUrl}
          onClose={() => setSelected(null)}
        />
      )}
    </Content>
  );
};
