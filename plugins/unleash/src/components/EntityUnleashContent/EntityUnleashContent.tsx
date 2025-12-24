import { useState } from 'react';
import { useAsync } from 'react-use';
import {
  Progress,
  ResponseErrorPanel,
  EmptyState,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Typography,
  makeStyles,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { Alert } from '@material-ui/lab';
import { unleashApiRef } from '../../api';
import { FlagDetailsModal } from '../FlagDetailsModal';
import {
  getUnleashProjectId,
  UNLEASH_PROJECT_ANNOTATION,
} from '@globallogicuki/backstage-plugin-unleash-common';
import { FlagToggle } from '../FlagToggle';

const useStyles = makeStyles(theme => ({
  flagName: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
  flagDescription: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  flagType: {
    marginRight: theme.spacing(1),
  },
}));

/**
 * Full entity tab content for managing feature flags
 */
export const EntityUnleashContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const unleashApi = useApi(unleashApiRef);
  const projectId = getUnleashProjectId(entity);
  const [selectedEnv, setSelectedEnv] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailsModal, setDetailsModal] = useState<{
    flagName: string;
    environment: string;
  } | null>(null);

  const { value, loading, error } = useAsync(async () => {
    if (!projectId) return null;
    const [flagsData, config] = await Promise.all([
      unleashApi.getFlags(projectId),
      unleashApi.getConfig(),
    ]);
    return { flagsData, config };
  }, [projectId, refreshKey]);

  if (!projectId) {
    return (
      <EmptyState
        missing="field"
        title="No Unleash project configured"
        description={`Add the ${UNLEASH_PROJECT_ANNOTATION} annotation to this entity to see feature flags.`}
      />
    );
  }

  if (loading) {
    return (
      <Content>
        <Progress />
      </Content>
    );
  }

  if (error) {
    return (
      <Content>
        <ResponseErrorPanel error={error} />
      </Content>
    );
  }

  const flags = value?.flagsData?.features ?? [];
  const editableEnvs = value?.config?.editableEnvs ?? [];

  // Helper to check if environment is editable
  const isEnvironmentEditable = (environment: string) => {
    return editableEnvs.length > 0 && editableEnvs.includes(environment);
  };

  if (!flags || !Array.isArray(flags)) {
    return (
      <Content>
        <EmptyState
          missing="data"
          title="No feature flags found"
          description={`No feature flags found for project "${projectId}".`}
        />
      </Content>
    );
  }

  // Get all unique environment names
  const allEnvs = new Set<string>();
  flags.forEach(flag => {
    if (flag.environments && Array.isArray(flag.environments)) {
      flag.environments.forEach(env => {
        if (env && env.name) {
          allEnvs.add(env.name);
        }
      });
    }
  });
  const environments = Array.from(allEnvs);

  // Set default environment if not set
  const currentEnv = selectedEnv || environments[0] || '';

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Content>
      <ContentHeader title="Feature Flags">
        <SupportButton>
          Manage feature flags for {entity.metadata.name}
        </SupportButton>
      </ContentHeader>

      {flags.length === 0 ? (
        <EmptyState
          missing="data"
          title="No feature flags found"
          description={`No feature flags found for project "${projectId}". Create some flags in Unleash first.`}
        />
      ) : (
        <>
          {environments.length > 0 && (
            <Card>
              <Tabs
                value={currentEnv}
                onChange={(_, newValue) => setSelectedEnv(newValue)}
                indicatorColor="primary"
                textColor="primary"
              >
                {environments.map(env => (
                  <Tab key={env} label={env} value={env} />
                ))}
              </Tabs>
            </Card>
          )}

          <Box mt={2}>
            <Card>
              <CardContent>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Flag</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Strategies</TableCell>
                      <TableCell align="center">Enabled</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {flags.map(flag => {
                      const envStatus = flag.environments?.find(
                        e => e?.name === currentEnv,
                      );

                      return (
                        <TableRow key={flag.name}>
                          <TableCell>
                            <Box>
                              <Typography className={classes.flagName}>
                                {flag.name}
                              </Typography>
                              {flag.description && (
                                <Typography
                                  variant="body2"
                                  className={classes.flagDescription}
                                >
                                  {flag.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={flag.type}
                              className={classes.flagType}
                            />
                          </TableCell>
                          <TableCell>
                            {flag.stale && (
                              <Chip
                                size="small"
                                label="Stale"
                                color="secondary"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              {(() => {
                                if (
                                  envStatus?.strategies?.length !== undefined
                                ) {
                                  return `${envStatus.strategies.length} strategies`;
                                }
                                if (envStatus?.hasStrategies) {
                                  return (
                                    <Chip
                                      size="small"
                                      label="Has strategies"
                                      color="primary"
                                      variant="outlined"
                                      onClick={() =>
                                        setDetailsModal({
                                          flagName: flag.name,
                                          environment: currentEnv,
                                        })
                                      }
                                      clickable
                                    />
                                  );
                                }
                                return (
                                  <Chip
                                    size="small"
                                    label="No strategies"
                                    variant="outlined"
                                  />
                                );
                              })()}
                              {(envStatus?.hasStrategies ||
                                (envStatus?.strategies?.length ?? 0) > 0) && (
                                <Tooltip title="View details">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setDetailsModal({
                                        flagName: flag.name,
                                        environment: currentEnv,
                                      })
                                    }
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            {envStatus && projectId && (
                              <FlagToggle
                                projectId={projectId}
                                flagName={flag.name}
                                environment={currentEnv}
                                enabled={envStatus.enabled}
                                readonly={!isEnvironmentEditable(currentEnv)}
                                onToggled={handleRefresh}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Box>

          {flags.some(f => f.stale) && (
            <Box mt={2}>
              <Alert severity="info">
                Some flags are marked as stale and may no longer be in use.
                Consider archiving them in Unleash.
              </Alert>
            </Box>
          )}
        </>
      )}

      {detailsModal && projectId && (
        <FlagDetailsModal
          projectId={projectId}
          flagName={detailsModal.flagName}
          environment={detailsModal.environment}
          readonly={!isEnvironmentEditable(detailsModal.environment)}
          open={!!detailsModal}
          onClose={() => setDetailsModal(null)}
        />
      )}
    </Content>
  );
};
