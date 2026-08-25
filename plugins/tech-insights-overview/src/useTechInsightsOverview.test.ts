import type { Entity } from '@backstage/catalog-model';
import type { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import {
  aggregateInsights,
  type BulkCheckResponse,
} from './useTechInsightsOverview';

const component = (name: string, owner?: string): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name, namespace: 'default' },
  spec: owner ? { owner } : {},
});

const result = (id: string, passed: boolean): CheckResult =>
  ({
    check: { id, name: `Check ${id}` },
    facts: {},
    result: passed,
  } as unknown as CheckResult);

// The plugin treats `result: false` as failed via the injected predicate.
const isFailed = (r: CheckResult) => (r as any).result === false;

describe('aggregateInsights', () => {
  it('aggregates failures by entity, check, and owner, worst first', () => {
    const items = [
      component('api', 'team-a'),
      component('web', 'team-b'),
      component('db', 'team-a'),
    ];
    const bulk: BulkCheckResponse = [
      {
        entity: 'component:default/api',
        results: [result('hasOwner', false), result('hasDocs', false)],
      },
      {
        entity: 'component:default/web',
        results: [result('hasOwner', false), result('hasDocs', true)],
      },
      {
        entity: 'component:default/db',
        results: [result('hasOwner', true), result('hasDocs', true)],
      },
    ];

    const aggregate = aggregateInsights(items, bulk, isFailed);

    expect(aggregate.scored).toBe(3);
    expect(aggregate.fullyPassing).toBe(1);
    expect(aggregate.unscored).toBe(0);

    expect(aggregate.entities.map(e => e.name)).toEqual(['api', 'web']);
    expect(aggregate.entities[0]).toMatchObject({
      name: 'api',
      failing: 2,
      total: 2,
      failedCheckIds: ['hasOwner', 'hasDocs'],
    });

    expect(aggregate.checks).toEqual([
      { id: 'hasOwner', name: 'Check hasOwner', failing: 2, total: 3 },
      { id: 'hasDocs', name: 'Check hasDocs', failing: 1, total: 3 },
    ]);

    expect(aggregate.owners).toEqual([
      {
        ownerRef: 'group:default/team-a',
        owner: 'team-a',
        ownerKind: 'group',
        failing: 2,
        components: 1,
      },
      {
        ownerRef: 'group:default/team-b',
        owner: 'team-b',
        ownerKind: 'group',
        failing: 1,
        components: 1,
      },
    ]);
  });

  it('counts components with no results as unscored, not passing', () => {
    const items = [component('api', 'team-a'), component('new', 'team-a')];
    const bulk: BulkCheckResponse = [
      { entity: 'component:default/api', results: [result('hasOwner', true)] },
      { entity: 'component:default/new', results: [] },
    ];

    const aggregate = aggregateInsights(items, bulk, isFailed);

    expect(aggregate.scored).toBe(1);
    expect(aggregate.fullyPassing).toBe(1);
    expect(aggregate.unscored).toBe(1);
  });

  it('keys owners by canonical ref so a group and user sharing a name stay separate', () => {
    const items = [
      component('api', 'group:default/platform'),
      component('web', 'user:default/platform'),
    ];
    const bulk: BulkCheckResponse = [
      {
        entity: 'component:default/api',
        results: [result('hasOwner', false)],
      },
      {
        entity: 'component:default/web',
        results: [result('hasOwner', false)],
      },
    ];

    const aggregate = aggregateInsights(items, bulk, isFailed);

    expect(aggregate.owners).toHaveLength(2);
    expect(aggregate.owners.map(o => o.ownerKind).sort()).toEqual([
      'group',
      'user',
    ]);
  });

  it('uses an unowned sentinel when spec.owner is missing', () => {
    const items = [component('api')];
    const bulk: BulkCheckResponse = [
      { entity: 'component:default/api', results: [result('hasOwner', false)] },
    ];

    const aggregate = aggregateInsights(items, bulk, isFailed);

    expect(aggregate.entities[0]).toMatchObject({
      ownerRef: 'unowned',
      owner: 'unowned',
      ownerKind: 'unknown',
    });
  });

  it('keeps an unparseable owner verbatim', () => {
    // An empty name makes parseEntityRef throw, exercising the fallback.
    const items = [component('api', 'group:default/')];
    const bulk: BulkCheckResponse = [
      { entity: 'component:default/api', results: [result('hasOwner', false)] },
    ];

    const aggregate = aggregateInsights(items, bulk, isFailed);

    expect(aggregate.entities[0].owner).toBe('group:default/');
    expect(aggregate.entities[0].ownerKind).toBe('unknown');
  });

  it('falls back to the ref when the entity is not in the catalog page', () => {
    const bulk: BulkCheckResponse = [
      {
        entity: 'component:default/ghost',
        results: [result('hasOwner', false)],
      },
    ];

    const aggregate = aggregateInsights([], bulk, isFailed);

    expect(aggregate.entities[0].name).toBe('component:default/ghost');
  });
});
