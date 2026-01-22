import { Entity } from '@backstage/catalog-model';
import {
  parseTagFilter,
  formatTagFilter,
  getUnleashFilterTags,
  getUnleashProjectId,
  getUnleashEnvironment,
  isUnleashAvailable,
  UNLEASH_PROJECT_ANNOTATION,
  UNLEASH_ENVIRONMENT_ANNOTATION,
  UNLEASH_FILTER_TAGS_ANNOTATION,
} from './annotations';

describe('parseTagFilter', () => {
  it('parses type:value format', () => {
    expect(parseTagFilter('component:service-alpha')).toEqual({
      type: 'component',
      value: 'service-alpha',
    });
  });

  it('parses value with multiple colons (splits on first colon only)', () => {
    expect(parseTagFilter('component:service:with:colons')).toEqual({
      type: 'component',
      value: 'service:with:colons',
    });
  });

  it('defaults to simple type when no colon present', () => {
    expect(parseTagFilter('my-tag')).toEqual({
      type: 'simple',
      value: 'my-tag',
    });
  });

  it('handles empty value after colon', () => {
    expect(parseTagFilter('component:')).toEqual({
      type: 'component',
      value: '',
    });
  });

  it('handles colon at start', () => {
    expect(parseTagFilter(':value')).toEqual({
      type: '',
      value: 'value',
    });
  });
});

describe('formatTagFilter', () => {
  it('formats simple type as just the value', () => {
    expect(formatTagFilter({ type: 'simple', value: 'my-tag' })).toBe('my-tag');
  });

  it('formats non-simple type as type:value', () => {
    expect(formatTagFilter({ type: 'component', value: 'service-alpha' })).toBe(
      'component:service-alpha',
    );
  });

  it('round-trips with parseTagFilter for typed tags', () => {
    const original = 'component:service-alpha';
    const parsed = parseTagFilter(original);
    expect(formatTagFilter(parsed)).toBe(original);
  });

  it('round-trips with parseTagFilter for simple tags', () => {
    const original = 'my-tag';
    const parsed = parseTagFilter(original);
    expect(formatTagFilter(parsed)).toBe(original);
  });
});

describe('getUnleashFilterTags', () => {
  const createEntity = (annotations: Record<string, string>): Entity => ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'test',
      annotations,
    },
  });

  it('returns empty array when annotation is not present', () => {
    const entity = createEntity({});
    expect(getUnleashFilterTags(entity)).toEqual([]);
  });

  it('parses comma-separated tag strings', () => {
    const entity = createEntity({
      [UNLEASH_FILTER_TAGS_ANNOTATION]: 'component:service-a, team:platform',
    });
    expect(getUnleashFilterTags(entity)).toEqual([
      { type: 'component', value: 'service-a' },
      { type: 'team', value: 'platform' },
    ]);
  });

  it('handles single tag without comma', () => {
    const entity = createEntity({
      [UNLEASH_FILTER_TAGS_ANNOTATION]: 'component:service-a',
    });
    expect(getUnleashFilterTags(entity)).toEqual([
      { type: 'component', value: 'service-a' },
    ]);
  });

  it('handles mixed simple and typed tags', () => {
    const entity = createEntity({
      [UNLEASH_FILTER_TAGS_ANNOTATION]: 'component:service-a, simple-tag',
    });
    expect(getUnleashFilterTags(entity)).toEqual([
      { type: 'component', value: 'service-a' },
      { type: 'simple', value: 'simple-tag' },
    ]);
  });

  it('trims whitespace around tags', () => {
    const entity = createEntity({
      [UNLEASH_FILTER_TAGS_ANNOTATION]:
        '  component:service-a  ,  team:platform  ',
    });
    expect(getUnleashFilterTags(entity)).toEqual([
      { type: 'component', value: 'service-a' },
      { type: 'team', value: 'platform' },
    ]);
  });

  it('filters out empty tags from trailing commas', () => {
    const entity = createEntity({
      [UNLEASH_FILTER_TAGS_ANNOTATION]: 'component:service-a,',
    });
    expect(getUnleashFilterTags(entity)).toEqual([
      { type: 'component', value: 'service-a' },
    ]);
  });

  it('returns empty array for whitespace-only annotation', () => {
    const entity = createEntity({
      [UNLEASH_FILTER_TAGS_ANNOTATION]: '   ',
    });
    expect(getUnleashFilterTags(entity)).toEqual([]);
  });
});

describe('isUnleashAvailable', () => {
  const createEntity = (annotations: Record<string, string>): Entity => ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'test',
      annotations,
    },
  });

  it('returns true when project annotation is present', () => {
    const entity = createEntity({
      [UNLEASH_PROJECT_ANNOTATION]: 'my-project',
    });
    expect(isUnleashAvailable(entity)).toBe(true);
  });

  it('returns false when project annotation is missing', () => {
    const entity = createEntity({});
    expect(isUnleashAvailable(entity)).toBe(false);
  });

  it('returns false when project annotation is empty string', () => {
    const entity = createEntity({
      [UNLEASH_PROJECT_ANNOTATION]: '',
    });
    expect(isUnleashAvailable(entity)).toBe(false);
  });
});

describe('getUnleashProjectId', () => {
  const createEntity = (annotations: Record<string, string>): Entity => ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'test',
      annotations,
    },
  });

  it('returns project ID when annotation is present', () => {
    const entity = createEntity({
      [UNLEASH_PROJECT_ANNOTATION]: 'my-project',
    });
    expect(getUnleashProjectId(entity)).toBe('my-project');
  });

  it('returns undefined when annotation is missing', () => {
    const entity = createEntity({});
    expect(getUnleashProjectId(entity)).toBeUndefined();
  });
});

describe('getUnleashEnvironment', () => {
  const createEntity = (annotations: Record<string, string>): Entity => ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'test',
      annotations,
    },
  });

  it('returns environment when annotation is present', () => {
    const entity = createEntity({
      [UNLEASH_ENVIRONMENT_ANNOTATION]: 'production',
    });
    expect(getUnleashEnvironment(entity)).toBe('production');
  });

  it('returns undefined when annotation is missing', () => {
    const entity = createEntity({});
    expect(getUnleashEnvironment(entity)).toBeUndefined();
  });
});
