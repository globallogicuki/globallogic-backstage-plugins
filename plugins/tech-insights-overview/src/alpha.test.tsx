import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { catalogApiRef, EntityProvider } from '@backstage/plugin-catalog-react';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';
import plugin, {
  entityScorecardCard,
  entityScorecardContent,
  techInsightsOverviewPage,
} from './alpha';

// New-frontend-system render tests are heavy; give them headroom over the
// inner waitFor timeout so they don't flake against jest's 5s default.
jest.setTimeout(30000);

const entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'api', namespace: 'default' },
  spec: { owner: 'team-a' },
};

const failingOwner = {
  check: { id: 'hasOwner', name: 'Has owner', description: 'Has spec.owner' },
  result: false,
  facts: {},
};

describe('alpha plugin', () => {
  it('exports the page extension', () => {
    expect(plugin.pluginId).toBe('tech-insights-overview');
  });

  it('renders the overview page', async () => {
    const catalogApi = {
      getEntities: jest.fn().mockResolvedValue({ items: [entity] }),
    } as any;
    const techInsightsApi = {
      runBulkChecks: jest
        .fn()
        .mockResolvedValue([
          { entity: 'component:default/api', results: [failingOwner] },
        ]),
      isCheckResultFailed: (r: any) => r.result === false,
    } as any;

    renderInTestApp(
      <TestApiProvider
        apis={[
          [catalogApiRef, catalogApi],
          [techInsightsApiRef, techInsightsApi],
        ]}
      >
        {createExtensionTester(techInsightsOverviewPage).reactElement()}
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('Fully passing')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  describe('entity scorecard extensions', () => {
    const techInsightsApi = {
      runChecks: jest.fn().mockResolvedValue([failingOwner]),
      getLinksForEntity: jest.fn().mockReturnValue([]),
      isCheckResultFailed: (r: any) => r.result === false,
    } as any;

    it('renders the summary card with a link to the tab', async () => {
      renderInTestApp(
        <TestApiProvider apis={[[techInsightsApiRef, techInsightsApi]]}>
          <EntityProvider entity={entity}>
            {createExtensionTester(entityScorecardCard).reactElement()}
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(
        () => {
          expect(screen.getByText('of 1 check passing')).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
      expect(screen.getByText('Scorecard')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /All checks/ })).toHaveAttribute(
        'href',
        '/catalog/default/component/api/scorecard',
      );
    });

    it('renders the scorecard tab', async () => {
      renderInTestApp(
        <TestApiProvider apis={[[techInsightsApiRef, techInsightsApi]]}>
          <EntityProvider entity={entity}>
            {createExtensionTester(entityScorecardContent).reactElement()}
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(
        () => {
          expect(screen.getByText('Failing · 1')).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
      expect(screen.getByText('Has spec.owner')).toBeInTheDocument();
    });
  });
});
