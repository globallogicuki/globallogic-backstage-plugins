import express from 'express';
import request from 'supertest';
import { NotFoundError } from '@backstage/errors';
import { mockServices } from '@backstage/backend-test-utils';
import { createRouter } from './router';

const TREE_URL = 'https://bitbucket.org/my-workspace/skills-marketplace/src/main';

const manifest = {
  name: 'my-marketplace',
  plugins: [
    { name: 'foo', source: './skills/foo', description: 'Foo skill' },
  ],
};

describe('createRouter', () => {
  const readUrl = jest.fn();
  let app: express.Express;

  const buildApp = async (configData: object = {
    skillsMarketplace: { url: TREE_URL },
  }) => {
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
        marketplace: manifest,
        installUrl: 'git@bitbucket.org:my-workspace/skills-marketplace.git',
      });
      expect(readUrl).toHaveBeenCalledWith(
        `${TREE_URL}/.claude-plugin/marketplace.json`,
      );
    });

    it('derives an https install URL when configured', async () => {
      app = await buildApp({
        skillsMarketplace: { url: TREE_URL, installUrlFormat: 'https' },
      });
      readUrl.mockResolvedValue(readUrlResponse(JSON.stringify(manifest)));

      const response = await request(app).get('/marketplace');

      expect(response.status).toEqual(200);
      expect(response.body.installUrl).toEqual(
        'https://bitbucket.org/my-workspace/skills-marketplace.git',
      );
    });

    it('rejects an unsupported installUrlFormat', async () => {
      app = await buildApp({
        skillsMarketplace: { url: TREE_URL, installUrlFormat: 'ftp' },
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

    it('returns 404 when the skill has no SKILL.md', async () => {
      readUrl.mockRejectedValue(new NotFoundError('nope'));

      const response = await request(app)
        .get('/skill-doc')
        .query({ source: './skills/foo' });

      expect(response.status).toEqual(404);
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
  });
});
