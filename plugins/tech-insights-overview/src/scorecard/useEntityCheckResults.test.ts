import type { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import { groupCheckResults, linksFor } from './useEntityCheckResults';

const result = (
  id: string,
  passed: boolean,
  extra: Partial<CheckResult['check']> = {},
): CheckResult =>
  ({
    check: { id, name: `Check ${id}`, ...extra },
    facts: {},
    result: passed,
  } as unknown as CheckResult);

const isFailed = (r: CheckResult) => (r as any).result === false;

describe('groupCheckResults', () => {
  it('splits results into failed and passed, keeping backend order', () => {
    const grouped = groupCheckResults(
      [
        result('b', true),
        result('a', false),
        result('d', false),
        result('c', true),
      ],
      isFailed,
    );

    expect(grouped.results.map(r => r.check.id)).toEqual(['b', 'a', 'd', 'c']);
    expect(grouped.failed.map(r => r.check.id)).toEqual(['a', 'd']);
    expect(grouped.passed.map(r => r.check.id)).toEqual(['b', 'c']);
  });

  it('applies the client-side filter before grouping', () => {
    const grouped = groupCheckResults(
      [result('keep', false), result('drop', false)],
      isFailed,
      check => check.id === 'keep',
    );

    expect(grouped.results).toHaveLength(1);
    expect(grouped.failed.map(r => r.check.id)).toEqual(['keep']);
  });

  it('handles no results', () => {
    expect(groupCheckResults([], isFailed)).toEqual({
      results: [],
      failed: [],
      passed: [],
      categories: [],
      categorised: false,
    });
  });
});

describe('groupCheckResults categories', () => {
  const categorised = (id: string, passed: boolean, category?: string) =>
    result(id, passed, category ? { metadata: { category } } : {});

  it('groups checks by category and gives each a single all-or-nothing verdict', () => {
    const grouped = groupCheckResults(
      [
        categorised('scan', true, 'Security'),
        categorised('vulns', false, 'Security'),
        categorised('readme', true, 'Documentation'),
      ],
      isFailed,
    );

    expect(grouped.categorised).toBe(true);
    expect(
      grouped.categories.map(c => ({
        name: c.name,
        passing: c.passing,
        checks: c.results.length,
        failed: c.failed.length,
      })),
    ).toEqual([
      // Failing category first, whatever order the backend returned.
      { name: 'Security', passing: false, checks: 2, failed: 1 },
      { name: 'Documentation', passing: true, checks: 1, failed: 0 },
    ]);
  });

  it('passes a category only when every check in it passes', () => {
    const grouped = groupCheckResults(
      [categorised('a', true, 'Security'), categorised('b', true, 'Security')],
      isFailed,
    );

    expect(grouped.categories).toHaveLength(1);
    expect(grouped.categories[0].passing) /* all pass */
      .toBe(true);
  });

  it('keeps the backend order of checks within a category, failures separated', () => {
    const grouped = groupCheckResults(
      [
        categorised('first', false, 'Security'),
        categorised('second', true, 'Security'),
        categorised('third', false, 'Security'),
      ],
      isFailed,
    );

    expect(grouped.categories[0].failed.map(r => r.check.id)).toEqual([
      'first',
      'third',
    ]);
    expect(grouped.categories[0].passed.map(r => r.check.id)).toEqual([
      'second',
    ]);
  });

  it('buckets uncategorised checks without claiming the set is categorised', () => {
    const grouped = groupCheckResults(
      [categorised('a', false), categorised('b', true)],
      isFailed,
    );

    expect(grouped.categorised).toBe(false);
    expect(grouped.categories.map(c => c.name)).toEqual(['Uncategorised']);
  });

  it('reports a mix as categorised, keeping the uncategorised bucket alongside', () => {
    const grouped = groupCheckResults(
      [categorised('a', true, 'Security'), categorised('b', true)],
      isFailed,
    );

    expect(grouped.categorised).toBe(true);
    expect(grouped.categories.map(c => c.name)).toEqual([
      'Security',
      'Uncategorised',
    ]);
  });

  it('applies the check filter before categorising', () => {
    const grouped = groupCheckResults(
      [
        categorised('keep', false, 'Security'),
        categorised('drop', false, 'Documentation'),
      ],
      isFailed,
      check => check.id === 'keep',
    );

    expect(grouped.categories.map(c => c.name)).toEqual(['Security']);
  });
});

describe('linksFor', () => {
  const entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'api' },
  };

  it('uses the api when it can derive entity links, deduplicated by url', () => {
    const api = {
      getLinksForEntity: jest.fn().mockReturnValue([
        { title: 'Docs', url: 'https://docs' },
        { title: 'Docs again', url: 'https://docs' },
        { title: 'Repo', url: 'https://repo' },
      ]),
    } as any;
    const r = result('x', false);

    expect(linksFor(api, r, entity)).toEqual([
      { title: 'Docs', url: 'https://docs' },
      { title: 'Repo', url: 'https://repo' },
    ]);
    expect(api.getLinksForEntity).toHaveBeenCalledWith(r, entity, {
      includeStaticLinks: true,
    });
  });

  it('falls back to the check’s static links on an older api', () => {
    const r = result('x', false, {
      links: [{ title: 'How to fix', url: 'https://fix' }],
    });

    expect(linksFor({} as any, r, entity)).toEqual([
      { title: 'How to fix', url: 'https://fix' },
    ]);
    expect(linksFor({} as any, result('y', false), entity)).toEqual([]);
  });
});
