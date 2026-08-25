import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { SkillCard } from './SkillCard';
import { Skill, SkillListing } from './api';

const skill: Skill = {
  name: 'deck-gl',
  source: './skills/deck-gl',
  description: 'Build PowerPoint decks',
  category: 'presentations',
  keywords: ['pptx', 'slides', 'deck', 'template', 'brand', 'extra'],
};

const listing: SkillListing = {
  skill,
  repo: 'skills-marketplace',
  marketplaceName: 'my-marketplace',
  installUrl: 'git@github.com:my-org/skills-marketplace.git',
};

describe('SkillCard', () => {
  it('renders name, description, category and at most five keywords', async () => {
    await renderInTestApp(<SkillCard listing={listing} onSelect={jest.fn()} />);

    expect(screen.getByText('deck-gl')).toBeInTheDocument();
    expect(screen.getByText('Build PowerPoint decks')).toBeInTheDocument();
    expect(screen.getByText('presentations')).toBeInTheDocument();
    expect(screen.getByText('pptx')).toBeInTheDocument();
    expect(screen.getByText('brand')).toBeInTheDocument();
    expect(screen.queryByText('extra')).toBeNull();
  });

  it('omits category and keyword chips when absent', async () => {
    await renderInTestApp(
      <SkillCard
        listing={{
          ...listing,
          skill: { name: 'plain', source: './plain', description: 'No tags' },
        }}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText('plain')).toBeInTheDocument();
    expect(screen.queryByText('presentations')).toBeNull();
  });

  it('shows the source repo only when asked', async () => {
    const { unmount } = await renderInTestApp(
      <SkillCard listing={listing} onSelect={jest.fn()} />,
    );

    expect(screen.queryByText('skills-marketplace')).toBeNull();
    unmount();

    await renderInTestApp(
      <SkillCard listing={listing} showRepo onSelect={jest.fn()} />,
    );

    expect(screen.getByText('skills-marketplace')).toBeInTheDocument();
  });

  it('calls onSelect with the listing when clicked', async () => {
    const onSelect = jest.fn();
    await renderInTestApp(<SkillCard listing={listing} onSelect={onSelect} />);

    screen.getByTestId('skill-card-deck-gl').click();

    expect(onSelect).toHaveBeenCalledWith(listing);
  });
});
