import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { Link } from '@backstage/core-components';
import type { FailingEntity } from '../useTechInsightsOverview';
import { entityHref } from '../links';
import { entitySeverity, useOverviewStyles } from '../styles';
import { OwnerGlyph } from './OwnerGlyph';

/**
 * Components with at least one failing check, worst first. The count reads
 * "N of M", not "N/M" — a bare fraction is ambiguous when other views show
 * passing/total in the same shape.
 */
export const FailuresTable = ({
  entities,
  selectedCheckId,
}: {
  entities: FailingEntity[];
  selectedCheckId: string | null;
}) => {
  const classes = useOverviewStyles();

  if (entities.length === 0) {
    return (
      <Typography variant="body2" className={classes.empty}>
        No components match these filters.
      </Typography>
    );
  }

  return (
    <Box className={classes.tableScroll}>
      <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.tableHeadCell}>Component</TableCell>
            <TableCell className={classes.tableHeadCell}>Owner</TableCell>
            <TableCell className={classes.tableHeadCell}>
              Failing checks
            </TableCell>
            <TableCell className={classes.tableHeadCell} align="right">
              Failing
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entities.map(entity => {
            const severity = entitySeverity(entity.failing);
            const stripeClass = {
              critical: classes.stripeCritical,
              warning: classes.stripeWarning,
              none: '',
            }[severity];

            return (
              <TableRow key={entity.ref}>
                <TableCell>
                  <Box className={classes.componentCell}>
                    <span className={`${classes.stripe} ${stripeClass}`} />
                    <Link to={entityHref(entity.ref)}>{entity.name}</Link>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box className={classes.ownerCell}>
                    <OwnerGlyph kind={entity.ownerKind} />
                    <Typography component="span" className={classes.ownerName}>
                      {entity.owner}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box className={classes.chips}>
                    {entity.failedCheckNames.map((name, i) => (
                      <Chip
                        key={entity.failedCheckIds[i]}
                        label={name}
                        size="small"
                        color={
                          selectedCheckId === entity.failedCheckIds[i]
                            ? 'primary'
                            : 'default'
                        }
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right" className={classes.tabular}>
                  {entity.failing} of {entity.total}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};
