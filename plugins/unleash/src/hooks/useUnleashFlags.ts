import { useMemo } from 'react';
import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import {
  DEFAULT_NUM_ENVS,
  FeatureFlag,
} from '@globallogicuki/backstage-plugin-unleash-common';
import { unleashApiRef } from '../api';

export interface UseUnleashFlagsResult {
  /** All feature flags for the project */
  flags: FeatureFlag[];
  /** Environments that can be modified via the UI */
  editableEnvs: string[];
  /** Number of environments to display in the UI */
  numEnvs: number;
  /** Unique environment names across all flags */
  envNames: string[];
  loading: boolean;
  error?: Error;
}

/**
 * Fetch the feature flags and plugin configuration for an Unleash project.
 *
 * Pass a `refreshKey` and bump it to re-fetch the data.
 */
export const useUnleashFlags = (
  projectId?: string,
  refreshKey = 0,
): UseUnleashFlagsResult => {
  const unleashApi = useApi(unleashApiRef);

  const { value, loading, error } = useAsync(async () => {
    if (!projectId) return null;
    const [flagsData, config] = await Promise.all([
      unleashApi.getFlags(projectId),
      unleashApi.getConfig(),
    ]);
    return { flagsData, config };
  }, [projectId, refreshKey]);

  const flags = useMemo(
    () => value?.flagsData?.features ?? [],
    [value?.flagsData?.features],
  );
  const editableEnvs = useMemo(
    () => value?.config?.editableEnvs ?? [],
    [value?.config?.editableEnvs],
  );
  const numEnvs = value?.config?.numEnvs ?? DEFAULT_NUM_ENVS;

  const envNames = useMemo(() => {
    const envs = new Set<string>();
    flags.forEach(flag => {
      flag.environments?.forEach(env => {
        if (env?.name) envs.add(env.name);
      });
    });
    return Array.from(envs);
  }, [flags]);

  return { flags, editableEnvs, numEnvs, envNames, loading, error };
};
