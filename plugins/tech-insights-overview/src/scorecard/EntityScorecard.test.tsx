import { screen, waitFor, within } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';
import type { Entity } from '@backstage/catalog-model';
import { EntityScorecardSummaryCard } from './EntityScorecardSummaryCard';
import { EntityScorecardContent } from './EntityScorecardContent';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'api', namespace: 'default' },
  spec: { type: 'service', owner: 'team-a' },
};

const check = (
  id: string,
  name: string,
  passed: boolean,
  description?: string,
) => ({
  check: { id, name, description, type: 'json-rules-engine', factIds: [] },
  result: passed,
  facts: {},
});

const results = [
  check('hasOwner', 'Has owner', true, 'Declares spec.owner'),
  check('hasDocs', 'Has docs', false, 'Has a TechDocs annotation'),
  check('hasTags', 'Has tags', true, 'Declares metadata.tags'),
];

describe('entity scorecard', () => {
  const runChecks = jest.fn();
  const getLinksForEntity = jest.fn();
  const techInsightsApi = {
    runChecks,
    getLinksForEntity,
    isCheckResultFailed: (r: any) => r.result === false,
  } as any;

  const render = (ui: JSX.Element) =>
    renderInTestApp(
      <TestApiProvider apis={[[techInsightsApiRef, techInsightsApi]]}>
        <EntityProvider entity={entity}>{ui}</EntityProvider>
      </TestApiProvider>,
    );

  beforeEach(() => {
    runChecks.mockReset();
    getLinksForEntity.mockReset();
    runChecks.mockResolvedValue(results);
    getLinksForEntity.mockReturnValue([]);
  });

  describe('EntityScorecardSummaryCard', () => {
    it('shows the score and only the failing checks', async () => {
      await render(<EntityScorecardSummaryCard />);

      await waitFor(() => {
        expect(screen.getByText('of 3 checks passing')).toBeInTheDocument();
      });
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(
        screen.getByRole('img', { name: '2 of 3 checks passing' }),
      ).toBeInTheDocument();

      expect(screen.getByText('Has docs')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.queryByText('Has owner')).toBeNull();
      expect(screen.queryByText('Has tags')).toBeNull();
      // The summary never shows descriptions.
      expect(screen.queryByText('Has a TechDocs annotation')).toBeNull();

      expect(runChecks).toHaveBeenCalledWith(
        { kind: 'Component', namespace: 'default', name: 'api' },
        undefined,
      );
    });

    it('says so when everything passes', async () => {
      runChecks.mockResolvedValue([check('hasOwner', 'Has owner', true)]);

      await render(<EntityScorecardSummaryCard />);

      await waitFor(() => {
        expect(screen.getByText('Everything passing.')).toBeInTheDocument();
      });
      expect(screen.getByText('of 1 check passing')).toBeInTheDocument();
    });

    it('links to the scorecard tab when given a content path', async () => {
      await render(<EntityScorecardSummaryCard contentPath="/scorecard" />);

      const link = await screen.findByRole('link', { name: /All checks/ });
      expect(link).toHaveAttribute(
        'href',
        '/catalog/default/component/api/scorecard',
      );
    });

    it('has no footer link without a content path', async () => {
      await render(<EntityScorecardSummaryCard />);

      await waitFor(() => {
        expect(screen.getByText('of 3 checks passing')).toBeInTheDocument();
      });
      expect(screen.queryByRole('link', { name: /All checks/ })).toBeNull();
    });

    it('passes checkIds to the backend and honours the title', async () => {
      await render(
        <EntityScorecardSummaryCard
          title="Catalog hygiene"
          checkIds={['hasOwner', 'hasDocs']}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Catalog hygiene')).toBeInTheDocument();
      });
      expect(runChecks).toHaveBeenCalledWith(
        { kind: 'Component', namespace: 'default', name: 'api' },
        ['hasOwner', 'hasDocs'],
      );
    });

    it('shows an empty state when no checks have run', async () => {
      runChecks.mockResolvedValue([]);

      await render(<EntityScorecardSummaryCard />);

      await waitFor(() => {
        expect(
          screen.getByText('No checks have run for this entity yet.'),
        ).toBeInTheDocument();
      });
    });

    it('shows an error panel when the checks fail to run', async () => {
      runChecks.mockRejectedValue(new Error('tech insights down'));

      await render(<EntityScorecardSummaryCard />);

      await waitFor(() => {
        expect(
          screen.getAllByText(/tech insights down/).length,
        ).toBeGreaterThan(0);
      });
    });
  });

  describe('EntityScorecardContent', () => {
    it('lists every check with its description, failures first', async () => {
      await render(
        <EntityScorecardContent description="Applies to services we build." />,
      );

      await waitFor(() => {
        expect(screen.getByText('of 3 checks passing')).toBeInTheDocument();
      });
      expect(
        screen.getByText('Applies to services we build.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Failing · 1')).toBeInTheDocument();
      expect(screen.getByText('Passing · 2')).toBeInTheDocument();

      const rows = screen.getAllByTestId(/^check-/);
      expect(rows.map(r => r.getAttribute('data-testid'))).toEqual([
        'check-hasDocs',
        'check-hasOwner',
        'check-hasTags',
      ]);
      expect(screen.getByText('Has a TechDocs annotation')).toBeInTheDocument();
      expect(screen.getByText('Declares spec.owner')).toBeInTheDocument();
      expect(screen.getAllByText('Passed')).toHaveLength(2);
      expect(screen.getAllByText('Failed')).toHaveLength(1);
    });

    it('shows links for failing checks only', async () => {
      getLinksForEntity.mockImplementation((result: any) =>
        result.check.id === 'hasDocs'
          ? [{ title: 'How to add docs', url: 'https://example.com/docs' }]
          : [],
      );

      await render(<EntityScorecardContent />);

      const failing = await screen.findByTestId('check-hasDocs');
      expect(
        // External links get ", Opens in a new window" appended to their name.
        within(failing).getByRole('link', { name: /How to add docs/ }),
      ).toHaveAttribute('href', 'https://example.com/docs');

      const passing = screen.getByTestId('check-hasOwner');
      expect(within(passing).queryByRole('link')).toBeNull();
      // Links are only looked up for failing checks.
      expect(getLinksForEntity).toHaveBeenCalledTimes(1);
      expect(getLinksForEntity).toHaveBeenCalledWith(
        expect.objectContaining({
          check: expect.objectContaining({ id: 'hasDocs' }),
        }),
        entity,
        { includeStaticLinks: true },
      );
    });

    it('applies a client-side filter', async () => {
      await render(<EntityScorecardContent filter={c => c.id !== 'hasTags'} />);

      await waitFor(() => {
        expect(screen.getByText('of 2 checks passing')).toBeInTheDocument();
      });
      expect(screen.queryByText('Has tags')).toBeNull();
    });

    it('explains the empty state', async () => {
      runChecks.mockResolvedValue([]);

      await render(<EntityScorecardContent />);

      await waitFor(() => {
        expect(
          screen.getByText(/No checks have run for this entity yet\./),
        ).toBeInTheDocument();
      });
    });
  });

  describe('categories', () => {
    const categorised = (
      id: string,
      name: string,
      passed: boolean,
      category: string,
    ) => ({
      check: {
        id,
        name,
        description: `${name} description`,
        type: 'json-rules-engine',
        factIds: [],
        metadata: { category },
      },
      result: passed,
      facts: {},
    });

    /* Security fails (one of its two checks), Documentation passes. */
    const withCategories = [
      categorised('scan', 'Has image scan', false, 'Security'),
      categorised('vulns', 'No critical vulns', true, 'Security'),
      categorised('readme', 'Has readme', true, 'Documentation'),
    ];

    beforeEach(() => {
      runChecks.mockResolvedValue(withCategories);
    });

    it('groups the tab by category with a verdict per category', async () => {
      await render(<EntityScorecardContent />);

      await waitFor(() => {
        expect(screen.getByText('of 3 checks passing')).toBeInTheDocument();
      });

      // Failing category first, each with its own verdict and count.
      const headings = screen.getAllByTestId(/^category-/);
      expect(headings.map(h => h.getAttribute('data-testid'))).toEqual([
        'category-Security',
        'category-Documentation',
      ]);
      expect(within(headings[0]).getByText('Failed')).toBeInTheDocument();
      expect(
        within(headings[0]).getByText('1 of 2 passing'),
      ).toBeInTheDocument();
      expect(within(headings[1]).getByText('Passed')).toBeInTheDocument();
      expect(
        within(headings[1]).getByText('1 of 1 passing'),
      ).toBeInTheDocument();

      // The flat Failing/Passing labels are replaced, not shown alongside.
      expect(screen.queryByText(/^Failing · /)).toBeNull();
      expect(screen.queryByText(/^Passing · /)).toBeNull();
    });

    it('orders checks within a category, failures first', async () => {
      await render(<EntityScorecardContent />);

      await waitFor(() => {
        expect(screen.getByTestId('check-scan')).toBeInTheDocument();
      });
      const rows = screen.getAllByTestId(/^check-/);
      expect(rows.map(r => r.getAttribute('data-testid'))).toEqual([
        'check-scan',
        'check-vulns',
        'check-readme',
      ]);
    });

    it('shows one verdict row per category on the summary card', async () => {
      await render(<EntityScorecardSummaryCard />);

      await waitFor(() => {
        expect(screen.getByTestId('category-Security')).toBeInTheDocument();
      });

      const security = screen.getByTestId('category-Security');
      expect(within(security).getByText('Security')).toBeInTheDocument();
      expect(within(security).getByText('1 of 2')).toBeInTheDocument();
      expect(within(security).getByText('Failed')).toBeInTheDocument();

      const docs = screen.getByTestId('category-Documentation');
      expect(within(docs).getByText('Passed')).toBeInTheDocument();

      // The card lists categories instead of individual failing checks.
      expect(screen.queryByText('Has image scan')).toBeNull();
    });

    it('falls back to the flat split when nothing is categorised', async () => {
      runChecks.mockResolvedValue(results);

      await render(<EntityScorecardContent />);

      await waitFor(() => {
        expect(screen.getByText('Failing · 1')).toBeInTheDocument();
      });
      expect(screen.queryByTestId(/^category-/)).toBeNull();
    });
  });
});
