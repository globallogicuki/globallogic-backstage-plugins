import { screen, waitFor } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SkillDetailDrawer } from './SkillDetailDrawer';
import {
  Skill,
  SkillListing,
  SkillsMarketplaceApi,
  skillsMarketplaceApiRef,
} from './api';

const skill: Skill = {
  name: 'deck-gl',
  source: './skills/deck-gl',
  description: 'Build PowerPoint decks',
  category: 'presentations',
  keywords: ['pptx', 'slides'],
};

const listing: SkillListing = {
  skill,
  repo: 'my-repo',
  marketplaceName: 'my-marketplace',
  installUrl: 'git@github.com:my-org/my-repo.git',
};

describe('SkillDetailDrawer', () => {
  const getSkillDoc = jest.fn();
  const mockApi = { getSkillDoc } as unknown as SkillsMarketplaceApi;

  const render = (
    selected: SkillListing | null,
    onClose = jest.fn(),
    showRepo = false,
  ) =>
    renderInTestApp(
      <TestApiProvider apis={[[skillsMarketplaceApiRef, mockApi]]}>
        <SkillDetailDrawer
          listing={selected}
          showRepo={showRepo}
          onClose={onClose}
        />
      </TestApiProvider>,
    );

  beforeEach(() => {
    getSkillDoc.mockReset();
  });

  it('renders nothing when no skill is selected', async () => {
    await render(null);

    expect(screen.queryByText('Install in Claude Code')).toBeNull();
  });

  it('renders skill details, install commands, and documentation', async () => {
    getSkillDoc.mockResolvedValue({
      frontmatter: { name: 'deck-gl' },
      body: 'Doc body text',
    });

    await render(listing);

    expect(screen.getByText('deck-gl')).toBeInTheDocument();
    expect(screen.getByText('Build PowerPoint decks')).toBeInTheDocument();
    expect(screen.getByText('presentations')).toBeInTheDocument();
    expect(
      screen.getByText(
        '/plugin marketplace add git@github.com:my-org/my-repo.git',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('/plugin install deck-gl@my-marketplace'),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Doc body text')).toBeInTheDocument();
    });
    expect(getSkillDoc).toHaveBeenCalledWith('./skills/deck-gl', 'my-repo');
  });

  it('shows an empty state when the skill has no docs', async () => {
    getSkillDoc.mockResolvedValue(undefined);

    await render(listing);

    await waitFor(() => {
      expect(
        screen.getByText(/does not provide a SKILL.md or README.md/),
      ).toBeInTheDocument();
    });
  });

  it('shows an error panel when the documentation fails to load', async () => {
    getSkillDoc.mockRejectedValue(new Error('boom'));

    await render(listing);

    await waitFor(() => {
      expect(screen.getAllByText(/boom/).length).toBeGreaterThan(0);
    });
  });

  it('shows the source repo when asked', async () => {
    getSkillDoc.mockResolvedValue(undefined);

    await render(listing, jest.fn(), true);

    expect(screen.getByText('my-repo')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    getSkillDoc.mockResolvedValue(undefined);
    const onClose = jest.fn();

    await render(listing, onClose);

    screen.getByLabelText('Close').click();

    expect(onClose).toHaveBeenCalled();
  });
});
