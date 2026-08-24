import { makeStyles } from '@material-ui/core/styles';

/**
 * Layout-only styles shared by the page, the cards and the drawer. Colors,
 * fonts, radii and elevation all come from the host app's theme so the plugin
 * looks native in any Backstage instance.
 */
export const useSkillsStyles = makeStyles(theme => ({
  /* ── Filters row above the card grid ── */
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  search: {
    flex: '1 1 260px',
    maxWidth: 480,
  },
  categories: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  resultCount: {
    marginLeft: 'auto',
    color: theme.palette.text.secondary,
  },
  empty: {
    padding: theme.spacing(4, 2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },

  /* ── Skill card ── */
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardActionArea: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
  cardName: {
    wordBreak: 'break-word',
  },
  cardDescription: {
    flex: 1,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
  },

  /* ── Detail drawer ── */
  drawerPaper: {
    width: 720,
    maxWidth: '100vw',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: theme.spacing(3, 3, 2, 3),
  },
  drawerTitleBlock: {
    minWidth: 0,
  },
  drawerName: {
    wordBreak: 'break-word',
  },
  drawerDescription: {
    marginTop: theme.spacing(0.5),
  },
  drawerMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1.5),
  },
  drawerSection: {
    padding: theme.spacing(2, 3),
  },
  sectionTitle: {
    marginBottom: theme.spacing(1),
  },
  install: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1, 1, 1, 2),
    marginBottom: theme.spacing(1),
  },
  command: {
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  installHint: {
    marginTop: theme.spacing(1),
  },
  drawerBody: {
    padding: theme.spacing(1, 3, 4, 3),
  },
}));
