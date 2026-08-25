import { deriveInstallUrl, deriveRepoName } from './repo';

describe('deriveInstallUrl', () => {
  it.each([
    [
      'https://github.com/my-org/skills-marketplace/tree/main',
      'git@github.com:my-org/skills-marketplace.git',
    ],
    [
      'https://gitlab.com/my-group/sub-group/skills-marketplace/-/tree/main',
      'git@gitlab.com:my-group/sub-group/skills-marketplace.git',
    ],
    [
      'https://bitbucket.org/my-workspace/skills-marketplace/src/main',
      'git@bitbucket.org:my-workspace/skills-marketplace.git',
    ],
    [
      'https://github.com/my-org/skills-marketplace',
      'git@github.com:my-org/skills-marketplace.git',
    ],
  ])('derives the SSH install URL from %s', (treeUrl, expected) => {
    expect(deriveInstallUrl(treeUrl)).toBe(expected);
  });

  it.each([
    [
      'https://github.com/my-org/skills-marketplace/tree/main',
      'https://github.com/my-org/skills-marketplace.git',
    ],
    [
      'https://bitbucket.org/my-workspace/skills-marketplace/src/main',
      'https://bitbucket.org/my-workspace/skills-marketplace.git',
    ],
  ])('derives the https install URL from %s', (treeUrl, expected) => {
    expect(deriveInstallUrl(treeUrl, 'https')).toBe(expected);
  });

  it('throws when the URL has no repo path', () => {
    expect(() => deriveInstallUrl('https://github.com/only-org')).toThrow(
      /Cannot derive a repo path/,
    );
  });
});

describe('deriveRepoName', () => {
  it.each([
    [
      'https://github.com/my-org/skills-marketplace/tree/main',
      'skills-marketplace',
    ],
    [
      'https://gitlab.com/my-group/sub-group/team-skills/-/tree/main',
      'team-skills',
    ],
    ['https://bitbucket.org/my-workspace/skills/src/main', 'skills'],
    ['https://github.com/my-org/skills-marketplace', 'skills-marketplace'],
  ])('derives the repo name from %s', (treeUrl, expected) => {
    expect(deriveRepoName(treeUrl)).toBe(expected);
  });

  it('throws when the URL has no repo path', () => {
    expect(() => deriveRepoName('https://github.com/only-org')).toThrow(
      /Cannot derive a repo path/,
    );
  });
});
