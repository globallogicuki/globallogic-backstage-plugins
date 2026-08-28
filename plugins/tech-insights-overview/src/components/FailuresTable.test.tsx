import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { FailuresTable } from './FailuresTable';
import type { FailingEntity } from '../useTechInsightsOverview';

const entity = (
  name: string,
  tallies: Record<string, { passed: number; total: number }>,
  failedCategories: string[],
): FailingEntity => ({
  ref: `component:default/${name}`,
  name,
  ownerRef: 'group:default/team',
  owner: 'team',
  ownerKind: 'group',
  failing: 1,
  total: 4,
  checkIds: [],
  failedCheckIds: [],
  failedCheckNames: [],
  failedCategories,
  scoredCategories: Object.keys(tallies),
  categoryTallies: tallies,
});

const columns = [{ key: 'Docs', label: 'Docs' }];
const cellState = (e: FailingEntity, key: string) => {
  if (e.failedCategories.includes(key)) return 'failed' as const;
  if (e.scoredCategories.includes(key)) return 'passed' as const;
  return 'unscored' as const;
};

const dotColor = (label: string) =>
  screen.getByLabelText(label, { exact: false }).style.backgroundColor;

describe('FailuresTable category dots', () => {
  it('grades a near-miss differently from a total miss', async () => {
    await renderInTestApp(
      <FailuresTable
        entities={[
          entity('nearly', { Docs: { passed: 5, total: 6 } }, ['Docs']),
          entity('nowhere', { Docs: { passed: 0, total: 6 } }, ['Docs']),
        ]}
        columns={columns}
        cellState={cellState}
        cellRatio={(e, key) => e.categoryTallies[key] ?? null}
      />,
    );

    const nearly = dotColor('Docs: failed (5 of 6 checks passed)');
    const nowhere = dotColor('Docs: failed (0 of 6 checks passed)');
    expect(nearly).not.toBe('');
    expect(nearly).not.toBe(nowhere);
  });

  it('leaves a single-check cell on the flat pass/fail colour', async () => {
    await renderInTestApp(
      <FailuresTable
        entities={[entity('solo', { Docs: { passed: 0, total: 1 } }, ['Docs'])]}
        columns={columns}
        cellState={cellState}
        cellRatio={(e, key) => e.categoryTallies[key] ?? null}
      />,
    );

    expect(dotColor('Docs: failed (0 of 1 checks passed)')).toBe('');
  });
});
