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
      {
        id: 'hasOwner',
        name: 'Check hasOwner',
        category: 'Uncategorised',
        failing: 2,
        total: 3,
      },
      {
        id: 'hasDocs',
        name: 'Check hasDocs',
        category: 'Uncategorised',
        failing: 1,
        total: 3,
      },
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

describe('aggregateInsights categories', () => {
  const categorised = (
    id: string,
    passed: boolean,
    category?: string,
  ): CheckResult =>
    ({
      check: {
        id,
        name: `Check ${id}`,
        ...(category ? { metadata: { category } } : {}),
      },
      facts: {},
      result: passed,
    } as unknown as CheckResult);

  const items = [component('api', 'team-a'), component('web', 'team-b')];

  /* api fails Security only; web fails both. Documentation is scored for both. */
  const bulk: BulkCheckResponse = [
    {
      entity: 'component:default/api',
      results: [
        categorised('scan', false, 'Security'),
        categorised('vulns', true, 'Security'),
        categorised('readme', true, 'Documentation'),
      ],
    },
    {
      entity: 'component:default/web',
      results: [
        categorised('scan', false, 'Security'),
        categorised('vulns', true, 'Security'),
        categorised('readme', false, 'Documentation'),
      ],
    },
  ];

  it('counts components per category, worst first', () => {
    const aggregate = aggregateInsights(items, bulk, isFailed);

    expect(aggregate.categorised).toBe(true);
    expect(aggregate.categories).toEqual([
      {
        name: 'Security',
        passing: 0,
        failing: 2,
        scored: 2,
        checkIds: ['scan', 'vulns'],
      },
      {
        name: 'Documentation',
        passing: 1,
        failing: 1,
        scored: 2,
        checkIds: ['readme'],
      },
    ]);
  });

  it('judges a category once per component, not once per check', () => {
    const aggregate = aggregateInsights(items, bulk, isFailed);

    // Security holds two checks but contributes one verdict per component, so
    // scored is the component count rather than the check count.
    const security = aggregate.categories.find(c => c.name === 'Security')!;
    expect(security.scored).toBe(2);
    expect(security.passing + security.failing).toBe(security.scored);
  });

  it('records which categories each failing component misses', () => {
    const aggregate = aggregateInsights(items, bulk, isFailed);

    expect(
      aggregate.entities.map(e => ({
        name: e.name,
        failedCategories: e.failedCategories,
      })),
    ).toEqual([
      // web is worst-first (2 failing checks), and misses both categories.
      { name: 'web', failedCategories: ['Security', 'Documentation'] },
      { name: 'api', failedCategories: ['Security'] },
    ]);
  });

  it('carries each check’s category onto the check summaries', () => {
    const aggregate = aggregateInsights(items, bulk, isFailed);

    expect(
      Object.fromEntries(aggregate.checks.map(c => [c.id, c.category])),
    ).toEqual({
      scan: 'Security',
      vulns: 'Security',
      readme: 'Documentation',
    });
  });

  it('keeps an uncategorised check visible alongside real categories', () => {
    const aggregate = aggregateInsights(
      items,
      [
        {
          entity: 'component:default/api',
          results: [
            categorised('scan', false, 'Security'),
            // No category on this one.
            categorised('stray', false),
          ],
        },
      ],
      isFailed,
    );

    // A mix still counts as categorised — the grouped views stay on.
    expect(aggregate.categorised).toBe(true);
    expect(
      aggregate.categories.map(c => ({ name: c.name, failing: c.failing })),
    ).toEqual([
      { name: 'Security', failing: 1 },
      { name: 'Uncategorised', failing: 1 },
    ]);
    expect(aggregate.entities[0].failedCategories).toEqual([
      'Security',
      'Uncategorised',
    ]);
  });

  it('reports an uncategorised catalog as such, in one bucket', () => {
    const aggregate = aggregateInsights(
      items,
      [
        {
          entity: 'component:default/api',
          results: [categorised('scan', false)],
        },
      ],
      isFailed,
    );

    expect(aggregate.categorised).toBe(false);
    expect(aggregate.categories.map(c => c.name)).toEqual(['Uncategorised']);
    expect(aggregate.entities[0].failedCategories).toEqual(['Uncategorised']);
  });

  it('excludes components with no results from category scoring', () => {
    const aggregate = aggregateInsights(
      items,
      [
        {
          entity: 'component:default/api',
          results: [categorised('scan', true, 'Security')],
        },
        { entity: 'component:default/web', results: [] },
      ],
      isFailed,
    );

    expect(aggregate.categories).toEqual([
      {
        name: 'Security',
        passing: 1,
        failing: 0,
        scored: 1,
        checkIds: ['scan'],
      },
    ]);
    expect(aggregate.unscored).toBe(1);
  });
});
