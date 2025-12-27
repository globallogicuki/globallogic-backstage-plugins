import { useState } from 'react';
import { useAsync } from 'react-use';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  makeStyles,
  IconButton,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import { Progress } from '@backstage/core-components';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { unleashApiRef } from '../../api';
import { StrategyEditor } from '../StrategyEditor';
import type { Strategy } from '@globallogicuki/backstage-plugin-unleash-common';

const useStyles = makeStyles(theme => ({
  section: {
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  strategyCard: {
    marginBottom: theme.spacing(1),
  },
  codeBlock: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    overflowX: 'auto',
  },
}));

interface FlagDetailsModalProps {
  projectId: string;
  flagName: string;
  environment?: string;
  readonly?: boolean;
  open: boolean;
  onClose: () => void;
}

export const FlagDetailsModal = ({
  projectId,
  flagName,
  environment,
  readonly = false,
  open,
  onClose,
}: FlagDetailsModalProps) => {
  const classes = useStyles();
  const unleashApi = useApi(unleashApiRef);
  const alertApi = useApi(alertApiRef);
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);
  const [editedStrategy, setEditedStrategy] = useState<Strategy | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { value: flag, loading } = useAsync(async () => {
    if (!open) return null;
    return unleashApi.getFlag(projectId, flagName);
  }, [projectId, flagName, open, refreshKey]);

  const envData = flag?.environments?.find(e => e.name === environment);

  const handleEditStrategy = (strategy: Strategy) => {
    setEditingStrategy(strategy.id);
    setEditedStrategy(strategy);
  };

  const handleCancelEdit = () => {
    setEditingStrategy(null);
    setEditedStrategy(null);
  };

  const handleSaveStrategy = async (strategyId: string) => {
    if (!environment || !editedStrategy) return;

    try {
      setSaving(true);
      await unleashApi.updateStrategy(
        projectId,
        flagName,
        environment,
        strategyId,
        editedStrategy,
      );
      alertApi.post({
        message: 'Strategy updated successfully',
        severity: 'success',
      });
      setEditingStrategy(null);
      setEditedStrategy(null);
      setRefreshKey(k => k + 1);
    } catch (e: any) {
      alertApi.post({
        message: `Failed to update strategy: ${e.message}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {flagName}
        {environment && ` - ${environment}`}
      </DialogTitle>
      <DialogContent dividers>
        {(() => {
          if (loading) {
            return <Progress />;
          }
          if (!flag) {
            return <Typography>Failed to load flag details</Typography>;
          }
          return (
            <Box>
              {/* Flag metadata */}
              <Box className={classes.section}>
                <Typography className={classes.sectionTitle}>
                  Details
                </Typography>
                <Box>
                  <Chip label={flag.type} className={classes.chip} />
                  {flag.stale && (
                    <Chip
                      label="Stale"
                      color="secondary"
                      className={classes.chip}
                    />
                  )}
                </Box>
                {flag.description && (
                  <Typography variant="body2" style={{ marginTop: 8 }}>
                    {flag.description}
                  </Typography>
                )}
              </Box>

              {/* Environment-specific data */}
              {envData && (
                <Box className={classes.section}>
                  <Typography className={classes.sectionTitle}>
                    Environment: {environment}
                  </Typography>
                  <Box>
                    <Chip
                      label={envData.enabled ? 'Enabled' : 'Disabled'}
                      color={envData.enabled ? 'primary' : 'default'}
                      className={classes.chip}
                    />
                  </Box>

                  {/* Strategies */}
                  {envData.strategies && envData.strategies.length > 0 && (
                    <Box style={{ marginTop: 16 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Strategies ({envData.strategies.length})
                      </Typography>
                      {envData.strategies.map((strategy, idx) => {
                        const isEditing = editingStrategy === strategy.id;
                        return (
                          <Accordion key={strategy.id || idx}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                width="100%"
                              >
                                <Typography>{strategy.name}</Typography>
                                {!isEditing && environment && !readonly && (
                                  <IconButton
                                    size="small"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleEditStrategy(strategy);
                                    }}
                                    title="Edit strategy"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box width="100%">
                                {isEditing && editedStrategy ? (
                                  <>
                                    <StrategyEditor
                                      strategy={editedStrategy}
                                      onChange={setEditedStrategy}
                                    />
                                    <Box
                                      display="flex"
                                      style={{ gap: 8, marginTop: 16 }}
                                    >
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        onClick={() =>
                                          handleSaveStrategy(strategy.id)
                                        }
                                        disabled={saving}
                                      >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        startIcon={<CancelIcon />}
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                      >
                                        Cancel
                                      </Button>
                                    </Box>
                                  </>
                                ) : (
                                  <>
                                    {strategy.parameters &&
                                      Object.keys(strategy.parameters).length >
                                        0 && (
                                        <Box mb={2}>
                                          <Typography variant="subtitle2">
                                            Parameters:
                                          </Typography>
                                          <pre className={classes.codeBlock}>
                                            {JSON.stringify(
                                              strategy.parameters,
                                              null,
                                              2,
                                            )}
                                          </pre>
                                        </Box>
                                      )}

                                    {strategy.constraints &&
                                      strategy.constraints.length > 0 && (
                                        <Box mb={2}>
                                          <Typography variant="subtitle2">
                                            Constraints:
                                          </Typography>
                                          <Table size="small">
                                            <TableHead>
                                              <TableRow>
                                                <TableCell>Context</TableCell>
                                                <TableCell>Operator</TableCell>
                                                <TableCell>Values</TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {strategy.constraints.map(
                                                (constraint, cidx) => (
                                                  <TableRow key={cidx}>
                                                    <TableCell>
                                                      {constraint.contextName}
                                                    </TableCell>
                                                    <TableCell>
                                                      {constraint.operator}
                                                    </TableCell>
                                                    <TableCell>
                                                      {constraint.values?.join(
                                                        ', ',
                                                      ) ||
                                                        constraint.value ||
                                                        '-'}
                                                    </TableCell>
                                                  </TableRow>
                                                ),
                                              )}
                                            </TableBody>
                                          </Table>
                                        </Box>
                                      )}

                                    {strategy.segments &&
                                      strategy.segments.length > 0 && (
                                        <Box mb={2}>
                                          <Typography variant="subtitle2">
                                            Segments:{' '}
                                            {strategy.segments.join(', ')}
                                          </Typography>
                                        </Box>
                                      )}

                                    {strategy.variants &&
                                      strategy.variants.length > 0 && (
                                        <Box>
                                          <Typography
                                            variant="subtitle2"
                                            gutterBottom
                                          >
                                            Variants ({strategy.variants.length}
                                            )
                                          </Typography>
                                          <Table size="small">
                                            <TableHead>
                                              <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Weight</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Payload</TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {strategy.variants.map(
                                                (variant, vidx) => (
                                                  <TableRow key={vidx}>
                                                    <TableCell>
                                                      {variant.name}
                                                    </TableCell>
                                                    <TableCell>
                                                      {variant.weight / 10}%
                                                    </TableCell>
                                                    <TableCell>
                                                      {variant.weightType}
                                                    </TableCell>
                                                    <TableCell>
                                                      {variant.payload ? (
                                                        <Box>
                                                          <Chip
                                                            size="small"
                                                            label={
                                                              variant.payload
                                                                .type
                                                            }
                                                            style={{
                                                              marginRight: 4,
                                                            }}
                                                          />
                                                          <code>
                                                            {
                                                              variant.payload
                                                                .value
                                                            }
                                                          </code>
                                                        </Box>
                                                      ) : (
                                                        '-'
                                                      )}
                                                    </TableCell>
                                                  </TableRow>
                                                ),
                                              )}
                                            </TableBody>
                                          </Table>
                                        </Box>
                                      )}
                                  </>
                                )}
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </Box>
                  )}

                  {envData.hasStrategies && !envData.strategies && (
                    <Typography variant="body2" color="textSecondary">
                      This environment has strategies configured.
                    </Typography>
                  )}
                </Box>
              )}

              {/* Variants */}
              {flag.variants && flag.variants.length > 0 && (
                <Box className={classes.section}>
                  <Typography className={classes.sectionTitle}>
                    Variants ({flag.variants.length})
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Weight</TableCell>
                        <TableCell>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {flag.variants.map((variant, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{variant.name}</TableCell>
                          <TableCell>{variant.weight}%</TableCell>
                          <TableCell>{variant.weightType}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {/* All environments status */}
              {!environment && flag.environments && (
                <Box className={classes.section}>
                  <Typography className={classes.sectionTitle}>
                    All Environments
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Environment</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Strategies</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {flag.environments.map(env => (
                        <TableRow key={env.name}>
                          <TableCell>{env.name}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={env.enabled ? 'Enabled' : 'Disabled'}
                              color={env.enabled ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {env.strategies?.length || env.hasStrategies
                              ? env.strategies?.length || '✓'
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          );
        })()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
