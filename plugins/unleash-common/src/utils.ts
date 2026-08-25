import type { FeatureFlag } from './types';
import type { TagFilter } from './annotations';

/**
 * Default number of environments to display in the UI
 */
export const DEFAULT_NUM_ENVS = 4;

/**
 * Check if an environment can be modified via the UI
 */
export function isEnvironmentEditable(
  env: string,
  editableEnvs: string[],
): boolean {
  return editableEnvs.length > 0 && editableEnvs.includes(env);
}

export function filterFlagsByTags(
  flags: FeatureFlag[],
  filters: TagFilter[],
): FeatureFlag[] {
  if (filters.length === 0) return flags;

  return flags.filter(flag => {
    if (!flag.tags || flag.tags.length === 0) return false;

    return filters.every(filter =>
      flag.tags!.some(
        tag => tag.value === filter.value && tag.type === filter.type,
      ),
    );
  });
}
