import { useState } from 'react';
import { useAsync } from 'react-use';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
  StatusOK,
  StatusAborted,
  Link,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Box,
  Tooltip,
  makeStyles,
} from '@material-ui/core';
import { unleashApiRef } from '../../api';
import {
  getUnleashProjectId,
  UNLEASH_PROJECT_ANNOTATION,
} from '@internal/backstage-plugin-unleash-common';
import { MissingAnnotationEmptyState } from '@backstage/plugin-catalog-react';
import { FlagDetailsModal } from '../FlagDetailsModal';

const useStyles = makeStyles(theme => ({
  flagName: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

/**
 * Entity card component showing feature flag summary
 */
export const EntityUnleashCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const unleashApi = useApi(unleashApiRef);
  const projectId = getUnleashProjectId(entity);
  const [detailsModal, setDetailsModal] = useState<string | null>(null);

  const { value, loading, error } = useAsync(async () => {
    if (!projectId) return null;
    const [flagsData, config] = await Promise.all([
      unleashApi.getFlags(projectId),
      unleashApi.getConfig(),
    ]);
    return { flagsData, config };
  }, [projectId]);

  if (!projectId) {
    return (
      <MissingAnnotationEmptyState annotation={UNLEASH_PROJECT_ANNOTATION} />
    );
  }

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  const flags = value?.flagsData?.features ?? [];
  const numEnvs = value?.config?.numEnvs ?? 4;
  const enabledCount = flags.filter(f =>
    f.environments.some(e => e.enabled),
  ).length;

  // Get environment names based on numEnvs config
  const allEnvs = new Set<string>();
  flags.forEach(flag => {
    flag.environments.forEach(env => allEnvs.add(env.name));
  });
  const displayEnvs = Array.from(allEnvs).slice(0, numEnvs);

  return (
    <InfoCard
      title="Feature Flags"
      subheader={`${enabledCount} of ${flags.length} flags enabled`}
      deepLink={{ title: 'View all flags', link: 'feature-flags' }}
    >
      {flags.length === 0 ? (
        <Box p={2}>No feature flags found for this project</Box>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Flag</TableCell>
                {displayEnvs.map(env => (
                  <TableCell key={env}>
                    {env.length > 3 ? (
                      <Tooltip title={env}>
                        <span>{env.substring(0, 3)}...</span>
                      </Tooltip>
                    ) : (
                      env
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {flags.slice(0, 5).map(flag => (
                <TableRow key={flag.name}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <span
                        className={classes.flagName}
                        onClick={() => setDetailsModal(flag.name)}
                      >
                        {flag.name}
                      </span>
                      {flag.stale && (
                        <Chip
                          size="small"
                          label="stale"
                          color="secondary"
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  {displayEnvs.map(env => {
                    const envStatus = flag.environments.find(
                      e => e.name === env,
                    );
                    return (
                      <TableCell key={env}>
                        {envStatus?.enabled ? <StatusOK /> : <StatusAborted />}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {flags.length > 5 && (
            <Box mt={1} ml={2}>
              <Link to="feature-flags">+{flags.length - 5} more flags</Link>
            </Box>
          )}
        </>
      )}

      {detailsModal && projectId && (
        <FlagDetailsModal
          projectId={projectId}
          flagName={detailsModal}
          open={!!detailsModal}
          onClose={() => setDetailsModal(null)}
        />
      )}
    </InfoCard>
  );
};
