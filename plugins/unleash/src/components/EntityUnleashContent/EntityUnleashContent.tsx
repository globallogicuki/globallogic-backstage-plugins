import { useState, useMemo } from 'react';
import { useAsync } from 'react-use';
import {
  Progress,
  ResponseErrorPanel,
  EmptyState,
  Content,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Box,
  Chip,
  Typography,
  makeStyles,
  Tooltip,
  IconButton,
} from '@material-ui/core';
import { Tabs, TabList, Tab } from '@backstage/ui';
import type { Key } from 'react-aria-components';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';
import { Alert } from '@material-ui/lab';
import { unleashApiRef } from '../../api';
import { FlagDetailsModal } from '../FlagDetailsModal';
import {
  getUnleashProjectId,
  getUnleashFilterTags,
  formatTagFilter,
  filterFlagsByTags,
  UNLEASH_PROJECT_ANNOTATION,
  FeatureFlag,
} from '@globallogicuki/backstage-plugin-unleash-common';
import { FlagToggle } from '../FlagToggle';

const useStyles = makeStyles(theme => ({
  tagChip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
}));

type FlagTableRow = FeatureFlag & {
  currentEnvEnabled: boolean;
  currentEnvStrategiesCount: number | null;
  currentEnvHasStrategies: boolean;
};

export const EntityUnleashContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const unleashApi = useApi(unleashApiRef);
  const projectId = getUnleashProjectId(entity);
  const defaultFilterTags = getUnleashFilterTags(entity);

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

  const allFlags = value?.flagsData?.features ?? [];
  const editableEnvs = value?.config?.editableEnvs ?? [];

  const filteredFlags = useMemo(() => {
    return filterFlagsByTags(allFlags, defaultFilterTags);
  }, [allFlags, defaultFilterTags]);

  const allEnvs = useMemo(() => {
    const envs = new Set<string>();
    allFlags.forEach(flag => {
      flag.environments?.forEach(env => {
        if (env?.name) envs.add(env.name);
      });
    });
    return Array.from(envs);
  }, [allFlags]);

  const currentEnv = selectedEnv || allEnvs[0] || '';

  const tableData: FlagTableRow[] = useMemo(() => {
    return filteredFlags.map(flag => {
      const envStatus = flag.environments?.find(e => e?.name === currentEnv);
      return {
        ...flag,
        currentEnvEnabled: envStatus?.enabled ?? false,
        currentEnvStrategiesCount: envStatus?.strategies?.length ?? null,
        currentEnvHasStrategies: envStatus?.hasStrategies ?? false,
      };
    });
  }, [filteredFlags, currentEnv]);

  const isEnvironmentEditable = (environment: string) => {
    return editableEnvs.length > 0 && editableEnvs.includes(environment);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const columns: TableColumn<FlagTableRow>[] = [
    {
      title: 'Flag',
      field: 'name',
      highlight: true,
      render: row => (
        <Box>
          <Typography variant="body2" style={{ fontWeight: 'bold' }}>
            {row.name}
          </Typography>
          {row.description && (
            <Typography variant="body2" color="textSecondary">
              {row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      title: 'Type',
      field: 'type',
      width: '100px',
      render: row => <Chip size="small" label={row.type} />,
    },
    {
      title: 'Stale',
      field: 'stale',
      width: '80px',
      align: 'center',
      render: row =>
        row.stale ? (
          <Tooltip title="This flag is marked as stale and may no longer be in use">
            <WarningIcon color="secondary" fontSize="small" />
          </Tooltip>
        ) : null,
    },
    {
      title: 'Strategies',
      sorting: false,
      render: row => {
        if (row.currentEnvStrategiesCount !== null) {
          return `${row.currentEnvStrategiesCount} strategies`;
        }
        if (row.currentEnvHasStrategies) {
          return (
            <Box display="flex" alignItems="center">
              <Chip
                size="small"
                label="Has strategies"
                color="primary"
                variant="outlined"
                onClick={() =>
                  setDetailsModal({
                    flagName: row.name,
                    environment: currentEnv,
                  })
                }
                clickable
              />
              <Tooltip title="View details">
                <IconButton
                  size="small"
                  onClick={() =>
                    setDetailsModal({
                      flagName: row.name,
                      environment: currentEnv,
                    })
                  }
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }
        return <Chip size="small" label="No strategies" variant="outlined" />;
      },
    },
    {
      title: 'Tags',
      field: 'tags',
      sorting: false,
      render: row =>
        row.tags && row.tags.length > 0 ? (
          <Box display="flex" flexWrap="wrap">
            {row.tags.map(tag => (
              <Chip
                key={`${tag.type}:${tag.value}`}
                size="small"
                label={formatTagFilter(tag)}
                variant="outlined"
                className={classes.tagChip}
              />
            ))}
          </Box>
        ) : null,
    },
    {
      title: 'Enabled',
      field: 'currentEnvEnabled',
      width: '80px',
      align: 'center',
      render: row =>
        projectId && (
          <FlagToggle
            projectId={projectId}
            flagName={row.name}
            environment={currentEnv}
            enabled={row.currentEnvEnabled}
            readonly={!isEnvironmentEditable(currentEnv)}
            onToggled={handleRefresh}
          />
        ),
    },
  ];

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

  if (!allFlags || !Array.isArray(allFlags) || allFlags.length === 0) {
    return (
      <Content>
        <EmptyState
          missing="data"
          title="No feature flags found"
          description={`No feature flags found for project "${projectId}". Create some flags in Unleash first.`}
        />
      </Content>
    );
  }

  return (
    <Content noPadding>
      {allEnvs.length > 0 && (
        <Box mb={2}>
          <Tabs
            selectedKey={currentEnv}
            onSelectionChange={(key: Key) => setSelectedEnv(key as string)}
          >
            <TabList aria-label="Environment tabs">
              {allEnvs.map(env => (
                <Tab key={env} id={env}>
                  {env}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </Box>
      )}

      <Table
        options={{
          search: true,
          paging: tableData.length > 10,
          pageSize: 10,
          pageSizeOptions: [10, 25, 50],
          padding: 'dense',
        }}
        columns={columns}
        data={tableData}
        emptyContent={
          <Box p={2} textAlign="center">
            <Typography color="textSecondary">
              No feature flags found
            </Typography>
          </Box>
        }
      />

      {filteredFlags.some(f => f.stale) && (
        <Box mt={2}>
          <Alert severity="info">
            Some flags are marked as stale and may no longer be in use. Consider
            archiving them in Unleash.
          </Alert>
        </Box>
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
