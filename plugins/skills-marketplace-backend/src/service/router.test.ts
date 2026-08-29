import express from 'express';
import request from 'supertest';
import { NotFoundError } from '@backstage/errors';
import { mockServices } from '@backstage/backend-test-utils';
import { createRouter } from './router';

const TREE_URL =
  'https://bitbucket.org/my-workspace/skills-marketplace/src/main';
const OTHER_TREE_URL = 'https://github.com/my-org/team-skills/tree/main';

const manifest = {
  name: 'my-marketplace',
  plugins: [{ name: 'foo', source: './skills/foo', description: 'Foo skill' }],
};

const otherManifest = {
  name: 'team-marketplace',
  plugins: [{ name: 'bar', source: './skills/bar', description: 'Bar skill' }],
};

describe('createRouter', () => {
  const readUrl = jest.fn();
  let app: express.Express;

  const buildApp = async (
    configData: object = {
      skillsMarketplace: { marketplaces: [{ url: TREE_URL }] },
    },
  ) => {
    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config: mockServices.rootConfig({ data: configData }),
      urlReader: { readUrl } as any,
      cache: mockServices.cache.mock({
        get: async () => undefined,
        set: async () => {},
      }),
    });
    const instance = express();
    instance.use(router);
    return instance;
  };

  const readUrlResponse = (content: string) => ({
    buffer: async () => Buffer.from(content, 'utf8'),
  });

  /** Serve each tree URL its own content; anything else is a 404. */
  const serve = (contentByTreeUrl: Record<string, string | Error>) =>
    readUrl.mockImplementation(async (url: string) => {
      const match = Object.entries(contentByTreeUrl).find(([treeUrl]) =>
        url.startsWith(treeUrl),
      );
      if (!match) {
        throw new NotFoundError(url);
      }
      if (match[1] instanceof Error) {
        throw match[1];
      }
      return readUrlResponse(match[1]);
    });

  beforeEach(async () => {
    readUrl.mockReset();
    app = await buildApp();
  });

  describe('GET /marketplace', () => {
    it('returns the manifest and derived SSH install URL', async () => {
      readUrl.mockResolvedValue(readUrlResponse(JSON.stringify(manifest)));

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        marketplaces: [
          {
            repo: 'skills-marketplace',
            url: TREE_URL,
            installUrl: 'git@bitbucket.org:my-workspace/skills-marketplace.git',
            marketplace: manifest,
          },
        ],
        errors: [],
      });
      expect(readUrl).toHaveBeenCalledWith(
        `${TREE_URL}/.claude-plugin/marketplace.json`,
      );
    });

    it('returns every configured marketplace', async () => {
      app = await buildApp({
        skillsMarketplace: {
          marketplaces: [
            { url: TREE_URL },
            { url: OTHER_TREE_URL, installUrlFormat: 'https' },
          ],
        },
      });
      serve({
        [TREE_URL]: JSON.stringify(manifest),
        [OTHER_TREE_URL]: JSON.stringify(otherManifest),
      });

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(200);
      expect(response.body.marketplaces).toEqual([
        {
          repo: 'skills-marketplace',
          url: TREE_URL,
          installUrl: 'git@bitbucket.org:my-workspace/skills-marketplace.git',
          marketplace: manifest,
        },
        {
          repo: 'team-skills',
          url: OTHER_TREE_URL,
          installUrl: 'https://github.com/my-org/team-skills.git',
          marketplace: otherManifest,
        },
      ]);
      expect(response.body.errors).toEqual([]);
    });

    it('reports a failed marketplace alongside the ones that loaded', async () => {
      app = await buildApp({
        skillsMarketplace: {
          marketplaces: [{ url: TREE_URL }, { url: OTHER_TREE_URL }],
        },
      });
      serve({ [TREE_URL]: JSON.stringify(manifest) });

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(200);
      expect(response.body.marketplaces).toHaveLength(1);
      expect(response.body.errors).toEqual([
        {
          repo: 'team-skills',
          url: OTHER_TREE_URL,
          message: expect.stringMatching(/No .*marketplace.json/),
        },
      ]);
    });

    it('returns 502 when no configured marketplace loads', async () => {
      app = await buildApp({
        skillsMarketplace: {
          marketplaces: [{ url: TREE_URL }, { url: OTHER_TREE_URL }],
        },
      });
      readUrl.mockRejectedValue(new NotFoundError('nope'));

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(502);
      expect(response.body.error.message).toMatch(
        /No configured marketplace could be loaded/,
      );
    });

    it('derives an https install URL when configured', async () => {
      app = await buildApp({
        skillsMarketplace: {
          marketplaces: [{ url: TREE_URL, installUrlFormat: 'https' }],
        },
      });
      readUrl.mockResolvedValue(readUrlResponse(JSON.stringify(manifest)));

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(200);
      expect(response.body.marketplaces[0].installUrl).toEqual(
        'https://bitbucket.org/my-workspace/skills-marketplace.git',
      );
    });

    it('rejects an unsupported installUrlFormat', async () => {
      app = await buildApp({
        skillsMarketplace: {
          marketplaces: [{ url: TREE_URL, installUrlFormat: 'ftp' }],
        },
      });
      readUrl.mockResolvedValue(readUrlResponse(JSON.stringify(manifest)));

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(500);
      expect(response.body.error.message).toMatch(/invalid installUrlFormat/);
    });

    it('returns 404 when the manifest does not exist', async () => {
      readUrl.mockRejectedValue(new NotFoundError('nope'));

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(404);
      expect(response.body.error.message).toMatch(/No .*marketplace.json/);
    });

    it('returns 502 when the manifest is not valid JSON', async () => {
      readUrl.mockResolvedValue(readUrlResponse('not json {'));

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(502);
      expect(response.body.error.message).toMatch(/not valid JSON/);
    });

    it('returns 502 when the manifest has no plugins array', async () => {
      readUrl.mockResolvedValue(readUrlResponse(JSON.stringify({ name: 'x' })));

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(502);
      expect(response.body.error.message).toMatch(/plugins/);
    });

    it('returns 500 with guidance when unconfigured', async () => {
      app = await buildApp({});

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(500);
      expect(response.body.error.message).toMatch(
        /Skills Marketplace is not configured/,
      );
    });
  });

  describe('GET /skill-doc', () => {
    it('returns the SKILL.md content', async () => {
      readUrl.mockResolvedValue(readUrlResponse('---\nname: foo\n---\nBody'));

      const response = await request(app)
        .get('/skill-doc')
        .query({ source: './skills/foo' });

      expect(response.status).toEqual(200);
      expect(response.text).toEqual('---\nname: foo\n---\nBody');
      expect(readUrl).toHaveBeenCalledWith(`${TREE_URL}/skills/foo/SKILL.md`);
    });

    it('reads from the marketplace named by repo', async () => {
      app = await buildApp({
        skillsMarketplace: {
          marketplaces: [{ url: TREE_URL }, { url: OTHER_TREE_URL }],
        },
      });
      readUrl.mockResolvedValue(readUrlResponse('Bar docs'));

      const response = await request(app)
        .get('/skill-doc')
        .query({ source: './skills/bar', repo: 'team-skills' });

      expect(response.status).toEqual(200);
      expect(readUrl).toHaveBeenCalledWith(
        `${OTHER_TREE_URL}/skills/bar/SKILL.md`,
      );
    });

    it('returns 404 for an unknown repo', async () => {
      const response = await request(app)
        .get('/skill-doc')
        .query({ source: './skills/foo', repo: 'nope' });

      expect(response.status).toEqual(404);
      expect(response.body.error.message).toMatch(/No configured marketplace/);
      expect(readUrl).not.toHaveBeenCalled();
    });

    it('falls back to README.md when there is no SKILL.md', async () => {
      readUrl.mockImplementation(async (url: string) => {
        if (url.endsWith('/SKILL.md')) {
          throw new NotFoundError(url);
        }
        return readUrlResponse('# Readme docs');
      });

      const response = await request(app)
        .get('/skill-doc')
        .query({ source: './skills/foo' });

      expect(response.status).toEqual(200);
      expect(response.text).toEqual('# Readme docs');
      expect(readUrl).toHaveBeenCalledWith(`${TREE_URL}/skills/foo/README.md`);
    });

    it('prefers SKILL.md over README.md', async () => {
      readUrl.mockResolvedValue(readUrlResponse('Skill docs'));

      const response = await request(app)
        .get('/skill-doc')
        .query({ source: './skills/foo' });

      expect(response.text).toEqual('Skill docs');
      expect(readUrl).toHaveBeenCalledTimes(1);
      expect(readUrl).toHaveBeenCalledWith(`${TREE_URL}/skills/foo/SKILL.md`);
    });

    it('returns 404 when the skill has neither doc file', async () => {
      readUrl.mockRejectedValue(new NotFoundError('nope'));

      const response = await request(app)
        .get('/skill-doc')
        .query({ source: './skills/foo' });

      expect(response.status).toEqual(404);
      expect(response.body.error.message).toMatch(
        /No SKILL.md or README.md found/,
      );
    });

    it('rejects a missing or traversal source', async () => {
      const missing = await request(app).get('/skill-doc');
      expect(missing.status).toEqual(400);

      const traversal = await request(app)
        .get('/skill-doc')
        .query({ source: '../secrets' });
      expect(traversal.status).toEqual(400);

      const absolute = await request(app)
        .get('/skill-doc')
        .query({ source: 'https://evil.example/x' });
      expect(absolute.status).toEqual(400);
      expect(readUrl).not.toHaveBeenCalled();
    });

    it('rejects embedded parent-traversal segments', async () => {
      for (const source of [
        'skills/../../../secrets',
        './skills/../../other-repo/src/main/secret',
        'a/../../../../other-org/other-repo/blob/main/secret',
        'skills/./../foo',
      ]) {
        const response = await request(app).get('/skill-doc').query({ source });
        expect(response.status).toEqual(400);
      }
      expect(readUrl).not.toHaveBeenCalled();
    });
  });
});
