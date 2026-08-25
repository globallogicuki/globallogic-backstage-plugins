import { screen, waitFor } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { SkillDetailDrawer } from './SkillDetailDrawer';
import { Skill, SkillsMarketplaceApi, skillsMarketplaceApiRef } from './api';

const skill: Skill = {
  name: 'deck-gl',
  source: './skills/deck-gl',
  description: 'Build PowerPoint decks',
  category: 'presentations',
  keywords: ['pptx', 'slides'],
};

describe('SkillDetailDrawer', () => {
  const getSkillDoc = jest.fn();
  const mockApi = { getSkillDoc } as unknown as SkillsMarketplaceApi;

  const render = (selected: Skill | null, onClose = jest.fn()) =>
    renderInTestApp(
      <TestApiProvider apis={[[skillsMarketplaceApiRef, mockApi]]}>
        <SkillDetailDrawer
          skill={selected}
          marketplaceName="my-marketplace"
          installUrl="git@github.com:my-org/my-repo.git"
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

    await render(skill);

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
    expect(getSkillDoc).toHaveBeenCalledWith('./skills/deck-gl');
  });

  it('shows an empty state when the skill has no SKILL.md', async () => {
    getSkillDoc.mockResolvedValue(undefined);

    await render(skill);

    await waitFor(() => {
      expect(
        screen.getByText(/does not provide SKILL.md documentation/),
      ).toBeInTheDocument();
    });
  });

  it('shows an error panel when the documentation fails to load', async () => {
    getSkillDoc.mockRejectedValue(new Error('boom'));

    await render(skill);

    await waitFor(() => {
      expect(screen.getAllByText(/boom/).length).toBeGreaterThan(0);
    });
  });

  it('calls onClose when the close button is clicked', async () => {
    getSkillDoc.mockResolvedValue(undefined);
    const onClose = jest.fn();

    await render(skill, onClose);

    screen.getByLabelText('Close').click();

    expect(onClose).toHaveBeenCalled();
  });
});
