import request from 'supertest';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { skillsMarketplacePlugin } from './plugin';

describe('skillsMarketplacePlugin', () => {
  it('serves the marketplace endpoint', async () => {
    const manifest = {
      name: 'my-marketplace',
      plugins: [
        { name: 'foo', source: './skills/foo', description: 'Foo skill' },
      ],
    };
    const { server } = await startTestBackend({
      features: [
        skillsMarketplacePlugin,
        mockServices.rootConfig.factory({
          data: {
            skillsMarketplace: {
              url: 'https://github.com/my-org/skills-marketplace/tree/main',
            },
          },
        }),
        mockServices.urlReader.mock({
          readUrl: async () =>
            ({
              buffer: async () => Buffer.from(JSON.stringify(manifest), 'utf8'),
            } as any),
        }).factory,
      ],
    });

    const response = await request(server).get(
      '/api/skills-marketplace/marketplace',
    );

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      marketplace: manifest,
      installUrl: 'git@github.com:my-org/skills-marketplace.git',
    });
  });
});
