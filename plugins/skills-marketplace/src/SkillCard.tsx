import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import { SkillListing } from './api';
import { useSkillsStyles } from './styles';

/** One skill as a card; clicking it opens the detail drawer. */
export const SkillCard = ({
  listing,
  showRepo,
  onSelect,
}: {
  listing: SkillListing;
  /** Show the source repo — only useful with more than one marketplace. */
  showRepo?: boolean;
  onSelect: (listing: SkillListing) => void;
}) => {
  const classes = useSkillsStyles();
  const { skill } = listing;
  const keywords = skill.keywords ?? [];

  return (
    <Card className={classes.card}>
      <CardActionArea
        className={classes.cardActionArea}
        onClick={() => onSelect(listing)}
        data-testid={`skill-card-${skill.name}`}
      >
        <CardContent className={classes.cardContent}>
          <div className={classes.cardHeader}>
            <Typography variant="h6" className={classes.cardName}>
              {skill.name}
            </Typography>
            {skill.category && (
              <Chip label={skill.category} size="small" variant="outlined" />
            )}
          </div>
          <Typography
            variant="body2"
            color="textSecondary"
            component="div"
            className={classes.cardDescription}
          >
            {skill.description}
          </Typography>
          {keywords.length > 0 && (
            <div className={classes.chips}>
              {keywords.slice(0, 5).map(kw => (
                <Chip key={kw} label={kw} size="small" />
              ))}
            </div>
          )}
          {showRepo && (
            <Typography
              variant="caption"
              color="textSecondary"
              component="div"
              className={classes.cardRepo}
            >
              {listing.repo}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
