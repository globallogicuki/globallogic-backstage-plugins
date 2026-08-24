import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import { Skill } from './api';
import { useSkillsStyles } from './styles';

/**
 * One skill as a standard themed card. Clicking it opens the detail drawer.
 */
export const SkillCard = ({
  skill,
  onSelect,
}: {
  skill: Skill;
  onSelect: (skill: Skill) => void;
}) => {
  const classes = useSkillsStyles();
  const keywords = skill.keywords ?? [];

  return (
    <Card className={classes.card}>
      <CardActionArea
        className={classes.cardActionArea}
        onClick={() => onSelect(skill)}
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
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
