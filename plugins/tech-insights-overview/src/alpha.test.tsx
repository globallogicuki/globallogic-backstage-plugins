import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';
import plugin, { techInsightsOverviewPage } from './alpha';

// New-frontend-system render tests are heavy; give them headroom over the
// inner waitFor timeout so they don't flake against jest's 5s default.
jest.setTimeout(30000);

describe('alpha plugin', () => {
  it('exports the page extension', () => {
    expect(plugin.pluginId).toBe('tech-insights-overview');
  });

  it('renders the overview page', async () => {
    const catalogApi = {
      getEntities: jest.fn().mockResolvedValue({
        items: [
          {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: { name: 'api', namespace: 'default' },
            spec: { owner: 'team-a' },
          },
        ],
      }),
    } as any;
    const techInsightsApi = {
      runBulkChecks: jest.fn().mockResolvedValue([
        {
          entity: 'component:default/api',
          results: [
            { check: { id: 'hasOwner', name: 'Has owner' }, result: false },
          ],
        },
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
});
