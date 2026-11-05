import { useState } from 'react';
import { renderInTestApp } from '@backstage/test-utils';
import { fireEvent, screen, within } from '@testing-library/react';
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

describe('FailuresTable pagination', () => {
  const many = (count: number, prefix = 'svc') =>
    Array.from({ length: count }, (_, i) =>
      entity(
        `${prefix}-${String(i + 1).padStart(3, '0')}`,
        { Docs: { passed: 0, total: 1 } },
        ['Docs'],
      ),
    );
  const sixty = many(60);

  /* Body rows only — the header row is in the thead. */
  const bodyRows = () =>
    within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row');

  const renderTable = (entities: FailingEntity[]) =>
    renderInTestApp(
      <FailuresTable
        entities={entities}
        columns={columns}
        cellState={cellState}
      />,
    );

  it('shows 25 rows per page by default', async () => {
    await renderTable(sixty);

    expect(bodyRows()).toHaveLength(25);
    expect(screen.getByText('svc-001')).toBeInTheDocument();
    expect(screen.queryByText('svc-026')).toBeNull();
    expect(screen.getByText('1-25 of 60')).toBeInTheDocument();
  });

  it('pages forward and back', async () => {
    await renderTable(sixty);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('svc-026')).toBeInTheDocument();
    expect(screen.queryByText('svc-001')).toBeNull();
    expect(screen.getByText('26-50 of 60')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(screen.getByText('26-50 of 60')).toBeInTheDocument();
  });

  it('offers 25, 50, 75 and 100 rows per page, and resets to page one', async () => {
    await renderTable(many(120));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    fireEvent.mouseDown(screen.getByRole('button', { name: /Rows per page/ }));
    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options.map(o => o.textContent)).toEqual(['25', '50', '75', '100']);

    fireEvent.click(screen.getByRole('option', { name: '100' }));
    expect(bodyRows()).toHaveLength(100);
    expect(screen.getByText('1-100 of 120')).toBeInTheDocument();
  });

  it('returns to the first page when the rows change', async () => {
    const Harness = () => {
      const [rows, setRows] = useState(sixty);
      return (
        <>
          <button onClick={() => setRows(many(30, 'other'))}>narrow</button>
          <FailuresTable
            entities={rows}
            columns={columns}
            cellState={cellState}
          />
        </>
      );
    };
    await renderInTestApp(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('51-60 of 60')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'narrow' }));
    expect(screen.getByText('1-25 of 30')).toBeInTheDocument();
    expect(screen.getByText('other-001')).toBeInTheDocument();
  });
});
