import { fireEvent, screen, waitFor } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SkillsMarketplacePage } from './SkillsMarketplacePage';
import {
  MarketplaceResponse,
  SkillsMarketplaceApi,
  skillsMarketplaceApiRef,
} from './api';

const response: MarketplaceResponse = {
  marketplace: {
    name: 'my-marketplace',
    plugins: [
      {
        name: 'deck-gl',
        source: './skills/deck-gl',
        description: 'Build PowerPoint decks',
        category: 'presentations',
        keywords: ['pptx'],
      },
      {
        name: 'jira-workflow',
        source: './skills/jira-workflow',
        description: 'Work Jira tickets',
        category: 'workflow',
        keywords: ['jira'],
      },
    ],
  },
  installUrl: 'git@github.com:my-org/my-repo.git',
};

describe('SkillsMarketplacePage', () => {
  const getMarketplace = jest.fn();
  const getSkillDoc = jest.fn();
  const mockApi = {
    getMarketplace,
    getSkillDoc,
  } as unknown as SkillsMarketplaceApi;

  const render = () =>
    renderInTestApp(
      <TestApiProvider apis={[[skillsMarketplaceApiRef, mockApi]]}>
        <SkillsMarketplacePage />
      </TestApiProvider>,
    );

  beforeEach(() => {
    getMarketplace.mockReset();
    getSkillDoc.mockReset();
    getSkillDoc.mockResolvedValue(undefined);
  });

  it('shows a progress indicator while loading', async () => {
    getMarketplace.mockReturnValue(new Promise(() => {}));

    await render();

    // Progress renders after a short built-in delay.
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('shows an error panel when the marketplace fails to load', async () => {
    getMarketplace.mockRejectedValue(new Error('not configured'));

    await render();

    await waitFor(() => {
      expect(screen.getAllByText(/not configured/).length).toBeGreaterThan(0);
    });
  });

  it('renders a card per skill with the result count', async () => {
    getMarketplace.mockResolvedValue(response);

    await render();

    await waitFor(() => {
      expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    });
    expect(screen.getByTestId('skill-card-jira-workflow')).toBeInTheDocument();
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
  });

  it('filters skills by search query', async () => {
    getMarketplace.mockResolvedValue(response);

    await render();
    await waitFor(() => {
      expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Search skills/), {
      target: { value: 'jira' },
    });

    expect(screen.queryByTestId('skill-card-deck-gl')).toBeNull();
    expect(screen.getByTestId('skill-card-jira-workflow')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('filters skills by category chip', async () => {
    getMarketplace.mockResolvedValue(response);

    await render();
    await waitFor(() => {
      expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    });

    // The filter chips are clickable (role button); the card chips are not.
    fireEvent.click(screen.getByRole('button', { name: 'presentations' }));

    expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    expect(screen.queryByTestId('skill-card-jira-workflow')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'All' }));

    expect(screen.getByTestId('skill-card-jira-workflow')).toBeInTheDocument();
  });

  it('shows an empty message when nothing matches', async () => {
    getMarketplace.mockResolvedValue(response);

    await render();
    await waitFor(() => {
      expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Search skills/), {
      target: { value: 'nomatch' },
    });

    expect(
      screen.getByText('No skills match your search.'),
    ).toBeInTheDocument();
  });

  it('opens the detail drawer when a card is clicked', async () => {
    getMarketplace.mockResolvedValue(response);

    await render();
    await waitFor(() => {
      expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('skill-card-deck-gl'));

    await waitFor(() => {
      expect(screen.getByText('Install in Claude Code')).toBeInTheDocument();
    });
    expect(
      screen.getByText('/plugin install deck-gl@my-marketplace'),
    ).toBeInTheDocument();
  });
});
