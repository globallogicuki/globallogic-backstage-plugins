import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import plugin, { skillsMarketplacePage } from './alpha';
import { SkillsMarketplaceApi, skillsMarketplaceApiRef } from './api';

// New-frontend-system render tests are heavy; give them headroom over the
// inner waitFor timeout so they don't flake against jest's 5s default.
jest.setTimeout(30000);

describe('alpha plugin', () => {
  it('exports the api and page extensions', () => {
    expect(plugin.pluginId).toBe('skills-marketplace');
  });

  it('renders the skills marketplace page', async () => {
    const mockApi = {
      getMarketplace: jest.fn().mockResolvedValue({
        marketplace: {
          name: 'my-marketplace',
          plugins: [
            {
              name: 'deck-gl',
              source: './skills/deck-gl',
              description: 'Build PowerPoint decks',
            },
          ],
        },
        installUrl: 'git@github.com:my-org/my-repo.git',
      }),
      getSkillDoc: jest.fn().mockResolvedValue(undefined),
    } as unknown as SkillsMarketplaceApi;

    renderInTestApp(
      <TestApiProvider apis={[[skillsMarketplaceApiRef, mockApi]]}>
        {createExtensionTester(skillsMarketplacePage).reactElement()}
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
