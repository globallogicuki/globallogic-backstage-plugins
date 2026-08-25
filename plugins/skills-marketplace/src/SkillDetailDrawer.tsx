import Chip from '@material-ui/core/Chip';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import {
  Progress,
  MarkdownContent,
  CopyTextButton,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { SkillListing, skillsMarketplaceApiRef } from './api';
import { useSkillsStyles } from './styles';

const InstallCommand = ({ command }: { command: string }) => {
  const classes = useSkillsStyles();
  return (
    <div className={classes.install}>
      <code className={classes.command}>{command}</code>
      <CopyTextButton text={command} tooltipText="Copied to clipboard" />
    </div>
  );
};

/** Skill detail drawer: metadata, install commands, and the skill's docs. */
export const SkillDetailDrawer = ({
  listing,
  showRepo,
  onClose,
}: {
  listing: SkillListing | null;
  /** Show the source repo — only useful with more than one marketplace. */
  showRepo?: boolean;
  onClose: () => void;
}) => {
  const classes = useSkillsStyles();
  const skillsMarketplaceApi = useApi(skillsMarketplaceApiRef);

  const skill = listing?.skill;

  const { value, loading, error } = useAsync(async () => {
    if (!listing) return undefined;
    return skillsMarketplaceApi.getSkillDoc(listing.skill.source, listing.repo);
  }, [listing?.repo, listing?.skill.source]);

  const marketplaceName = listing?.marketplaceName ?? '';
  const addCommand = `/plugin marketplace add ${listing?.installUrl ?? ''}`;
  const installCommand = skill
    ? `/plugin install ${skill.name}@${marketplaceName}`
    : '';

  return (
    <Drawer
      anchor="right"
      open={Boolean(listing)}
      onClose={onClose}
      classes={{ paper: classes.drawerPaper }}
    >
      {listing && skill && (
        <>
          <div className={classes.drawerHeader}>
            <div className={classes.drawerTitleBlock}>
              <Typography variant="h5" className={classes.drawerName}>
                {skill.name}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                className={classes.drawerDescription}
              >
                {skill.description}
              </Typography>
              <div className={classes.drawerMeta}>
                {showRepo && (
                  <Chip
                    label={listing.repo}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )}
                {skill.category && (
                  <Chip
                    label={skill.category}
                    size="small"
                    variant="outlined"
                  />
                )}
                {(skill.keywords ?? []).map(kw => (
                  <Chip key={kw} label={kw} size="small" />
                ))}
              </div>
            </div>
            <IconButton onClick={onClose} aria-label="Close" size="small">
              <CloseIcon />
            </IconButton>
          </div>

          <Divider />

          <div className={classes.drawerSection}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Install in Claude Code
            </Typography>
            <InstallCommand command={addCommand} />
            <InstallCommand command={installCommand} />
            <Typography
              variant="caption"
              color="textSecondary"
              component="p"
              className={classes.installHint}
            >
              Run the first command once to register the marketplace, then the
              second to install this skill. Skip the first if you've already
              added the <code>{marketplaceName}</code> marketplace.
            </Typography>
          </div>

          <Divider />

          <div className={classes.drawerBody}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Documentation
            </Typography>
            {loading && <Progress />}
            {error && <ResponseErrorPanel error={error} />}
            {!loading && !error && !value && (
              <Typography variant="body2" color="textSecondary">
                This skill does not provide a SKILL.md or README.md.
              </Typography>
            )}
            {value && <MarkdownContent content={value.body} dialect="gfm" />}
          </div>
        </>
      )}
    </Drawer>
  );
};
