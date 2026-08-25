import PeopleOutlined from '@material-ui/icons/PeopleOutlined';
import PersonOutlined from '@material-ui/icons/PersonOutlined';
import { useOverviewStyles } from '../styles';

/**
 * A bare monochrome glyph saying whether an owner is a team or a person — the
 * design system's icon style (marks stand directly on the surface, no well).
 *
 * `titleAccess` gives the glyph an accessible name, so the distinction never
 * rests on shape alone. An unparseable owner (e.g. a bare email address) gets
 * no glyph rather than a wrong one.
 */
export const OwnerGlyph = ({
  kind,
}: {
  kind: 'group' | 'user' | 'unknown';
}) => {
  const classes = useOverviewStyles();
  if (kind === 'user') {
    return <PersonOutlined className={classes.ownerIcon} titleAccess="user" />;
  }
  if (kind === 'group') {
    return <PeopleOutlined className={classes.ownerIcon} titleAccess="group" />;
  }
  return null;
};
