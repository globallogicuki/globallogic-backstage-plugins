import { fireEvent, screen, waitFor } from '@testing-library/react';
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
    expect(screen.getByText('Failing by owner')).toBeInTheDocument();
    // The owner appears in both the table row and the owner bars.
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
});
