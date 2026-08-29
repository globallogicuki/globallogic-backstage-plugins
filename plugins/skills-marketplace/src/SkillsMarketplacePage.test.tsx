import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SkillsMarketplacePage } from './SkillsMarketplacePage';
import {
  MarketplaceResponse,
  SkillsMarketplaceApi,
  skillsMarketplaceApiRef,
} from './api';

const response: MarketplaceResponse = {
  marketplaces: [
    {
      repo: 'my-repo',
      url: 'https://github.com/my-org/my-repo/tree/main',
      installUrl: 'git@github.com:my-org/my-repo.git',
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
    },
  ],
};

/** The same skills, plus a second marketplace repo. */
const multiResponse: MarketplaceResponse = {
  marketplaces: [
    ...response.marketplaces,
    {
      repo: 'team-skills',
      url: 'https://gitlab.com/my-group/team-skills/-/tree/main',
      installUrl: 'git@gitlab.com:my-group/team-skills.git',
      marketplace: {
        name: 'team-marketplace',
        plugins: [
          {
            name: 'release-notes',
            source: './skills/release-notes',
            description: 'Draft release notes',
            category: 'workflow',
          },
        ],
      },
    },
  ],
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

  /** Pick a value from the marketplace filter select. */
  const selectRepo = (name: string) => {
    fireEvent.mouseDown(screen.getByLabelText('Filter by marketplace'));
    fireEvent.click(within(screen.getByRole('listbox')).getByText(name));
  };

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

  it('hides the marketplace filter with a single marketplace', async () => {
    getMarketplace.mockResolvedValue(response);

    await render();
    await waitFor(() => {
      expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    });

    expect(screen.queryByLabelText('Filter by marketplace')).toBeNull();
  });

  it('lists skills from every marketplace', async () => {
    getMarketplace.mockResolvedValue(multiResponse);

    await render();

    await waitFor(() => {
      expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    });
    expect(screen.getByTestId('skill-card-release-notes')).toBeInTheDocument();
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
    // Each card is labelled with its source repo.
    expect(screen.getByText('team-skills')).toBeInTheDocument();
  });

  it('filters skills by marketplace', async () => {
    getMarketplace.mockResolvedValue(multiResponse);

    await render();
    await waitFor(() => {
      expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    });

    selectRepo('team-skills');

    expect(screen.getByTestId('skill-card-release-notes')).toBeInTheDocument();
    expect(screen.queryByTestId('skill-card-deck-gl')).toBeNull();
    expect(screen.getByText('1 of 3')).toBeInTheDocument();

    selectRepo('All marketplaces');

    expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
  });

  it('combines the marketplace filter with the search query', async () => {
    getMarketplace.mockResolvedValue(multiResponse);

    await render();
    await waitFor(() => {
      expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    });

    selectRepo('my-repo');
    fireEvent.change(screen.getByPlaceholderText(/Search skills/), {
      target: { value: 'jira' },
    });

    expect(screen.getByTestId('skill-card-jira-workflow')).toBeInTheDocument();
    expect(screen.queryByTestId('skill-card-deck-gl')).toBeNull();
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('searches on the repo name too', async () => {
    getMarketplace.mockResolvedValue(multiResponse);

    await render();
    await waitFor(() => {
      expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Search skills/), {
      target: { value: 'team-skills' },
    });

    expect(screen.getByTestId('skill-card-release-notes')).toBeInTheDocument();
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('opens the drawer with the install command of the skill’s own repo', async () => {
    getMarketplace.mockResolvedValue(multiResponse);

    await render();
    await waitFor(() => {
      expect(
        screen.getByTestId('skill-card-release-notes'),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('skill-card-release-notes'));

    await waitFor(() => {
      expect(screen.getByText('Install in Claude Code')).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        '/plugin marketplace add git@gitlab.com:my-group/team-skills.git',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('/plugin install release-notes@team-marketplace'),
    ).toBeInTheDocument();
    expect(getSkillDoc).toHaveBeenCalledWith(
      './skills/release-notes',
      'team-skills',
    );
  });

  it('warns about marketplaces that failed to load', async () => {
    getMarketplace.mockResolvedValue({
      ...response,
      errors: [
        {
          repo: 'broken-repo',
          url: 'https://github.com/my-org/broken-repo/tree/main',
          message: 'No .claude-plugin/marketplace.json found.',
        },
      ],
    });

    await render();

    await waitFor(() => {
      expect(
        screen.getByText(/1 marketplace could not be loaded/),
      ).toBeInTheDocument();
    });
    // The marketplaces that did load are still shown.
    expect(screen.getByTestId('skill-card-deck-gl')).toBeInTheDocument();
  });
});
