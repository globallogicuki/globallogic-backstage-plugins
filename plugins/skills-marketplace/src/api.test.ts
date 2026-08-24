import { SkillsMarketplaceClient, parseFrontmatter } from './api';

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
        marketplace: { name: 'my-marketplace', plugins: [] },
        installUrl: 'git@github.com:my-org/my-repo.git',
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
