import type { FeatureFlag } from './types';
import type { TagFilter } from './annotations';
import {
  DEFAULT_NUM_ENVS,
  filterFlagsByTags,
  isEnvironmentEditable,
} from './utils';

const createFlag = (
  name: string,
  tags?: Array<{ type: string; value: string }>,
  description?: string,
): FeatureFlag => ({
  name,
  description,
  type: 'release',
  stale: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  environments: [],
  tags,
});

describe('filterFlagsByTags', () => {
  const flagWithComponentA = createFlag('flag-a', [
    { type: 'component', value: 'service-a' },
  ]);
  const flagWithComponentB = createFlag('flag-b', [
    { type: 'component', value: 'service-b' },
  ]);
  const flagWithMultipleTags = createFlag('flag-multi', [
    { type: 'component', value: 'service-a' },
    { type: 'team', value: 'platform' },
  ]);
  const flagWithNoTags = createFlag('flag-no-tags');
  const flagWithEmptyTags = createFlag('flag-empty-tags', []);

  const allFlags = [
    flagWithComponentA,
    flagWithComponentB,
    flagWithMultipleTags,
    flagWithNoTags,
    flagWithEmptyTags,
  ];

  it('returns all flags when no filters provided', () => {
    expect(filterFlagsByTags(allFlags, [])).toEqual(allFlags);
  });

  it('filters flags by single tag', () => {
    const filters: TagFilter[] = [{ type: 'component', value: 'service-a' }];
    const result = filterFlagsByTags(allFlags, filters);
    expect(result).toHaveLength(2);
    expect(result.map(f => f.name)).toEqual(['flag-a', 'flag-multi']);
  });

  it('filters flags requiring ALL tags (AND logic)', () => {
    const filters: TagFilter[] = [
      { type: 'component', value: 'service-a' },
      { type: 'team', value: 'platform' },
    ];
    const result = filterFlagsByTags(allFlags, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('flag-multi');
  });

  it('excludes flags with no tags', () => {
    const filters: TagFilter[] = [{ type: 'component', value: 'service-a' }];
    const result = filterFlagsByTags(allFlags, filters);
    expect(result.find(f => f.name === 'flag-no-tags')).toBeUndefined();
    expect(result.find(f => f.name === 'flag-empty-tags')).toBeUndefined();
  });

  it('returns empty array when no flags match', () => {
    const filters: TagFilter[] = [{ type: 'component', value: 'nonexistent' }];
    expect(filterFlagsByTags(allFlags, filters)).toEqual([]);
  });

  it('matches exact type and value', () => {
    const filters: TagFilter[] = [{ type: 'component', value: 'service' }];
    expect(filterFlagsByTags(allFlags, filters)).toEqual([]);
  });

  it('handles empty flags array', () => {
    const filters: TagFilter[] = [{ type: 'component', value: 'service-a' }];
    expect(filterFlagsByTags([], filters)).toEqual([]);
  });
});

describe('isEnvironmentEditable', () => {
  it('returns true when the environment is in the editable list', () => {
    expect(
      isEnvironmentEditable('development', ['development', 'staging']),
    ).toBe(true);
  });

  it('returns false when the environment is not in the editable list', () => {
    expect(
      isEnvironmentEditable('production', ['development', 'staging']),
    ).toBe(false);
  });

  it('returns false when no environments are editable', () => {
    expect(isEnvironmentEditable('development', [])).toBe(false);
  });
});

describe('DEFAULT_NUM_ENVS', () => {
  it('is 4', () => {
    expect(DEFAULT_NUM_ENVS).toBe(4);
  });
});
