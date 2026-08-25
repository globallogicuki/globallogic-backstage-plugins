import {
  MarketplaceEntry,
  SkillsMarketplaceClient,
  flattenSkills,
  parseFrontmatter,
} from './api';

const mockClient = (response: Partial<Response>) => {
  const fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    ...response,
  });
  const client = new SkillsMarketplaceClient({
    discoveryApi: {
      getBaseUrl: async () => 'http://backend/api/skills-marketplace',
    },
    fetchApi: { fetch } as any,
  });
  return { client, fetch };
};

describe('SkillsMarketplaceClient', () => {
  describe('getMarketplace', () => {
    it('fetches the marketplace from the backend', async () => {
      const payload = {
        marketplaces: [
          {
            repo: 'my-repo',
            url: 'https://github.com/my-org/my-repo/tree/main',
            installUrl: 'git@github.com:my-org/my-repo.git',
            marketplace: { name: 'my-marketplace', plugins: [] },
          },
        ],
        errors: [],
      };
      const { client, fetch } = mockClient({ json: async () => payload });

      await expect(client.getMarketplace()).resolves.toEqual(payload);
      expect(fetch).toHaveBeenCalledWith(
        'http://backend/api/skills-marketplace/marketplace',
        expect.anything(),
      );
    });

    it('throws the backend error message on failure', async () => {
      const { client } = mockClient({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'not configured' } }),
      });

      await expect(client.getMarketplace()).rejects.toThrow('not configured');
    });
  });

  describe('getSkillDoc', () => {
    it('fetches and parses a SKILL.md', async () => {
      const { client, fetch } = mockClient({
        text: async () => '---\nname: foo\n---\n\n# Foo',
      });

      await expect(client.getSkillDoc('./skills/foo')).resolves.toEqual({
        frontmatter: { name: 'foo' },
        body: '# Foo',
      });
      expect(fetch).toHaveBeenCalledWith(
        'http://backend/api/skills-marketplace/skill-doc?source=.%2Fskills%2Ffoo',
        expect.anything(),
      );
    });

    it('passes the repo through when given', async () => {
      const { client, fetch } = mockClient({ text: async () => 'body' });

      await client.getSkillDoc('./skills/foo', 'team-skills');

      expect(fetch).toHaveBeenCalledWith(
        'http://backend/api/skills-marketplace/skill-doc?source=.%2Fskills%2Ffoo&repo=team-skills',
        expect.anything(),
      );
    });

    it('returns undefined when the skill has no SKILL.md', async () => {
      const { client } = mockClient({ ok: false, status: 404 });

      await expect(client.getSkillDoc('./skills/foo')).resolves.toBeUndefined();
    });
  });
});

describe('parseFrontmatter', () => {
  it('splits frontmatter from the body', () => {
    const raw = [
      '---',
      'name: jira-workflow',
      'description: Work a Jira ticket',
      '---',
      '',
      '# Heading',
      'Body text.',
    ].join('\n');

    const { frontmatter, body } = parseFrontmatter(raw);

    expect(frontmatter).toEqual({
      name: 'jira-workflow',
      description: 'Work a Jira ticket',
    });
    expect(body).toBe('# Heading\nBody text.');
  });

  it('keeps colons that appear within a value', () => {
    const raw = [
      '---',
      'description: Use when ("pick up GTM-1234"): covers PRs',
      'allowed-tools: mcp__foo__bar, Bash(git:*), Bash(curl:*)',
      '---',
      'body',
    ].join('\n');

    const { frontmatter } = parseFrontmatter(raw);

    expect(frontmatter.description).toBe(
      'Use when ("pick up GTM-1234"): covers PRs',
    );
    expect(frontmatter['allowed-tools']).toBe(
      'mcp__foo__bar, Bash(git:*), Bash(curl:*)',
    );
  });

  it('returns the whole document as the body when there is no frontmatter', () => {
    const raw = '# Just a heading\nNo frontmatter here.';
    const { frontmatter, body } = parseFrontmatter(raw);

    expect(frontmatter).toEqual({});
    expect(body).toBe(raw);
  });

  it('handles CRLF line endings', () => {
    const raw = '---\r\nname: x\r\n---\r\nbody line';
    const { frontmatter, body } = parseFrontmatter(raw);

    expect(frontmatter).toEqual({ name: 'x' });
    expect(body).toBe('body line');
  });
});

describe('flattenSkills', () => {
  const entry = (
    repo: string,
    name: string,
    skillNames: string[],
  ): MarketplaceEntry => ({
    repo,
    url: `https://github.com/my-org/${repo}/tree/main`,
    installUrl: `git@github.com:my-org/${repo}.git`,
    marketplace: {
      name,
      plugins: skillNames.map(skill => ({
        name: skill,
        source: `./skills/${skill}`,
        description: `${skill} skill`,
      })),
    },
  });

  it('tags every skill with the marketplace it came from', () => {
    const listings = flattenSkills([
      entry('repo-a', 'marketplace-a', ['foo', 'bar']),
      entry('repo-b', 'marketplace-b', ['baz']),
    ]);

    expect(
      listings.map(l => [
        l.skill.name,
        l.repo,
        l.marketplaceName,
        l.installUrl,
      ]),
    ).toEqual([
      ['foo', 'repo-a', 'marketplace-a', 'git@github.com:my-org/repo-a.git'],
      ['bar', 'repo-a', 'marketplace-a', 'git@github.com:my-org/repo-a.git'],
      ['baz', 'repo-b', 'marketplace-b', 'git@github.com:my-org/repo-b.git'],
    ]);
  });

  it('keeps same-named skills from different repos apart', () => {
    const listings = flattenSkills([
      entry('repo-a', 'marketplace-a', ['foo']),
      entry('repo-b', 'marketplace-b', ['foo']),
    ]);

    expect(listings).toHaveLength(2);
    expect(listings.map(l => l.repo)).toEqual(['repo-a', 'repo-b']);
  });

  it('returns nothing for no marketplaces', () => {
    expect(flattenSkills([])).toEqual([]);
  });
});
