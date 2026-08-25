import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';
import { TechInsightsOverviewPage } from './TechInsightsOverviewPage';

const entities = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'api', namespace: 'default' },
    spec: { owner: 'team-a' },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'web', namespace: 'default' },
    spec: { owner: 'team-b' },
  },
];

const check = (id: string, name: string, failed: boolean) => ({
  check: { id, name },
  result: !failed,
});

const bulk = [
  {
    entity: 'component:default/api',
    results: [
      check('hasOwner', 'Has owner', true),
      check('hasDocs', 'Has docs', false),
    ],
  },
  {
    entity: 'component:default/web',
    results: [
      check('hasOwner', 'Has owner', false),
      check('hasDocs', 'Has docs', false),
    ],
  },
];

describe('TechInsightsOverviewPage', () => {
  const getEntities = jest.fn();
  const runBulkChecks = jest.fn();
  const catalogApi = { getEntities } as any;
  const techInsightsApi = {
    runBulkChecks,
    isCheckResultFailed: (r: any) => r.result === false,
  } as any;

  const render = () =>
    renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApi],
          [techInsightsApiRef, techInsightsApi],
        ]}
      >
        <TechInsightsOverviewPage />
      </TestApiProvider>,
    );

  beforeEach(() => {
    getEntities.mockReset();
    runBulkChecks.mockReset();
    getEntities.mockResolvedValue({ items: entities });
    runBulkChecks.mockResolvedValue(bulk);
  });

  it('renders the summary, check tiles, and failures table', async () => {
    await render();

    await waitFor(() => {
      expect(screen.getByText('Fully passing')).toBeInTheDocument();
    });
    // web fully passes both checks; api fails hasOwner.
    expect(screen.getByText('of 2 components')).toBeInTheDocument();
    expect(screen.getByText('Weakest standards')).toBeInTheDocument();
    // The check appears as both a tile and a failing-check chip on the row.
    expect(screen.getAllByText('Has owner').length).toBeGreaterThan(0);
    expect(screen.getByText('api')).toBeInTheDocument();
    // The owner appears in both the table row and the owner filter.
    expect(screen.getAllByText('team-a').length).toBeGreaterThan(0);
  });

  it('filters the table by name', async () => {
    // Make both components fail so the table has two rows.
    runBulkChecks.mockResolvedValue([
      {
        entity: 'component:default/api',
        results: [check('hasOwner', 'Has owner', true)],
      },
      {
        entity: 'component:default/web',
        results: [check('hasOwner', 'Has owner', true)],
      },
    ]);

    await render();
    await waitFor(() => {
      expect(screen.getByText('api')).toBeInTheDocument();
    });
    expect(screen.getByText('web')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'api' },
    });

    expect(screen.getByText('api')).toBeInTheDocument();
    expect(screen.queryByText('web')).toBeNull();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('scopes the table to a check when its tile is clicked', async () => {
    await render();
    await waitFor(() => {
      expect(screen.getByText('api')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Has owner/ }));

    await waitFor(() => {
      expect(screen.getByText(/scoped to has owner/)).toBeInTheDocument();
    });
  });

  it('shows an empty state when no checks have run', async () => {
    runBulkChecks.mockResolvedValue([
      { entity: 'component:default/api', results: [] },
      { entity: 'component:default/web', results: [] },
    ]);

    await render();

    await waitFor(() => {
      expect(screen.getByText('No checks have run yet.')).toBeInTheDocument();
    });
  });

  it('shows an error panel when loading fails', async () => {
    getEntities.mockRejectedValue(new Error('catalog down'));

    await render();

    await waitFor(() => {
      expect(screen.getAllByText(/catalog down/).length).toBeGreaterThan(0);
    });
  });

  describe('categories', () => {
    const categorised = (
      id: string,
      name: string,
      failed: boolean,
      category: string,
    ) => ({
      check: { id, name, metadata: { category } },
      result: !failed,
    });

    /* Security fails for both components, Documentation only for web. */
    beforeEach(() => {
      runBulkChecks.mockResolvedValue([
        {
          entity: 'component:default/api',
          results: [
            categorised('scan', 'Has image scan', true, 'Security'),
            categorised('readme', 'Has readme', false, 'Documentation'),
          ],
        },
        {
          entity: 'component:default/web',
          results: [
            categorised('scan', 'Has image scan', true, 'Security'),
            categorised('readme', 'Has readme', true, 'Documentation'),
          ],
        },
      ]);
    });

    it('starts at the category level only — one tile row, not two', async () => {
      await render();

      await waitFor(() => {
        expect(screen.getByText('Weakest categories')).toBeInTheDocument();
      });
      const tiles = screen.getByRole('group', { name: 'Weakest categories' });
      // Security fails 2 components, Documentation 1, so Security leads.
      expect(
        within(tiles)
          .getAllByRole('button')
          .map(b => b.textContent),
      ).toEqual([
        expect.stringContaining('Security'),
        expect.stringContaining('Documentation'),
      ]);
      // The per-check tiles live one level down, not in a second row. (Check
      // names still appear as chips in the table — it is the tile row that must
      // be alone.)
      expect(screen.queryByText('Weakest standards')).toBeNull();
      expect(screen.getAllByRole('group')).toHaveLength(1);
    });

    it('makes the categories the matrix columns, one mark per cell', async () => {
      await render();

      await waitFor(() => {
        expect(screen.getByText('api')).toBeInTheDocument();
      });

      // Standards are named once, in the header — not repeated per row.
      const headers = screen
        .getAllByRole('columnheader')
        .map(h => h.textContent);
      expect(headers).toEqual([
        'Component',
        'Owner',
        'Security',
        'Documentation',
      ]);

      // Both fail Security; api meets Documentation and web does not.
      expect(
        screen.getAllByRole('img', { name: 'Security: failed' }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole('img', { name: 'Documentation: passed' }),
      ).toHaveLength(1);
      expect(
        screen.getAllByRole('img', { name: 'Documentation: failed' }),
      ).toHaveLength(1);

      // The tile row is the only category control.
      expect(screen.queryByText('Any category')).toBeNull();
    });

    it('drills into a category: its checks replace the row, table scopes to it', async () => {
      await render();

      await waitFor(() => {
        expect(screen.getByText('api')).toBeInTheDocument();
      });
      expect(screen.getByText('web')).toBeInTheDocument();

      const tiles = screen.getByRole('group', { name: 'Weakest categories' });
      fireEvent.click(
        within(tiles).getByRole('button', { name: /Documentation/ }),
      );

      await waitFor(() => {
        expect(screen.queryByText('api')).toBeNull();
      });
      expect(screen.getByText('web')).toBeInTheDocument();
      expect(screen.getByText('1 of 2')).toBeInTheDocument();
      expect(screen.getByText(/scoped to documentation/)).toBeInTheDocument();

      // The row is now that category's checks, under a breadcrumb.
      const drilled = screen.getByRole('group', { name: 'Documentation' });
      expect(
        within(drilled)
          .getAllByRole('button')
          .map(b => b.textContent),
      ).toEqual([expect.stringContaining('Has readme')]);
      expect(
        screen.getByRole('button', { name: 'Weakest categories' }),
      ).toBeInTheDocument();
      // Columns follow the drill level: that category's checks, not categories.
      expect(
        screen.getAllByRole('columnheader').map(h => h.textContent),
      ).toEqual(['Component', 'Owner', 'Has readme']);
    });

    it('returns to the categories via the breadcrumb', async () => {
      await render();

      await waitFor(() => {
        expect(screen.getByText('Weakest categories')).toBeInTheDocument();
      });
      const tiles = screen.getByRole('group', { name: 'Weakest categories' });
      fireEvent.click(
        within(tiles).getByRole('button', { name: /Documentation/ }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole('group', { name: 'Documentation' }),
        ).toBeInTheDocument();
      });
      fireEvent.click(
        screen.getByRole('button', { name: 'Weakest categories' }),
      );

      await waitFor(() => {
        expect(screen.getByText('api')).toBeInTheDocument();
      });
      expect(screen.getByText('web')).toBeInTheDocument();
      expect(
        screen.getByRole('group', { name: 'Weakest categories' }),
      ).toBeInTheDocument();
      // Back to category columns.
      expect(
        screen.getAllByRole('columnheader').map(h => h.textContent),
      ).toEqual(['Component', 'Owner', 'Security', 'Documentation']);
    });

    it('gives an uncategorised check its own column rather than hiding it', async () => {
      runBulkChecks.mockResolvedValue([
        {
          entity: 'component:default/api',
          results: [
            categorised('scan', 'Has image scan', true, 'Security'),
            // Same shape, but with no metadata.category at all.
            { check: { id: 'stray', name: 'Has stray' }, result: false },
          ],
        },
      ]);

      await render();

      await waitFor(() => {
        expect(screen.getByText('Weakest categories')).toBeInTheDocument();
      });
      expect(
        screen.getAllByRole('columnheader').map(h => h.textContent),
      ).toEqual(['Component', 'Owner', 'Security', 'Uncategorised']);
      // And it is drillable like any other category.
      const tiles = screen.getByRole('group', { name: 'Weakest categories' });
      fireEvent.click(
        within(tiles).getByRole('button', { name: /Uncategorised/ }),
      );
      await waitFor(() => {
        expect(
          screen.getAllByRole('columnheader').map(h => h.textContent),
        ).toEqual(['Component', 'Owner', 'Has stray']);
      });
    });

    it('keeps the flat layout when no check declares a category', async () => {
      runBulkChecks.mockResolvedValue(bulk);

      await render();

      await waitFor(() => {
        expect(screen.getByText('Weakest standards')).toBeInTheDocument();
      });
      expect(screen.queryByText('Weakest categories')).toBeNull();
      expect(screen.queryByText('Any category')).toBeNull();
      // Columns are the checks themselves when there is nothing to group by.
      expect(
        screen.getAllByRole('columnheader').map(h => h.textContent),
      ).toEqual(['Component', 'Owner', 'Has owner', 'Has docs']);
    });
  });
});
