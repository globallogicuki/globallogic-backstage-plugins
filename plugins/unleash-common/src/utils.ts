import type { FeatureFlag } from './types';
import type { TagFilter } from './annotations';

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
