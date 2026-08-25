import { mockServices } from '@backstage/backend-test-utils';
import { readMarketplaceConfigs } from './config';

const GITHUB = 'https://github.com/my-org/skills-marketplace/tree/main';
const GITLAB = 'https://gitlab.com/my-group/team-skills/-/tree/main';

const read = (data: object) =>
  readMarketplaceConfigs(mockServices.rootConfig({ data }));

describe('readMarketplaceConfigs', () => {
  it('reads a single url', () => {
    expect(read({ skillsMarketplace: { url: GITHUB } })).toEqual([
      { repo: 'skills-marketplace', url: GITHUB, installUrlFormat: 'ssh' },
    ]);
  });

  it('reads a marketplaces list on its own', () => {
    expect(
      read({
        skillsMarketplace: { marketplaces: [{ url: GITHUB }, { url: GITLAB }] },
      }),
    ).toEqual([
      { repo: 'skills-marketplace', url: GITHUB, installUrlFormat: 'ssh' },
      { repo: 'team-skills', url: GITLAB, installUrlFormat: 'ssh' },
    ]);
  });

  it('puts the single url first, then the list', () => {
    const marketplaces = read({
      skillsMarketplace: { url: GITHUB, marketplaces: [{ url: GITLAB }] },
    });

    expect(marketplaces.map(m => m.repo)).toEqual([
      'skills-marketplace',
      'team-skills',
    ]);
  });

  it('inherits the top-level installUrlFormat, per-entry overrides win', () => {
    const marketplaces = read({
      skillsMarketplace: {
        url: GITHUB,
        installUrlFormat: 'https',
        marketplaces: [{ url: GITLAB, installUrlFormat: 'ssh' }],
      },
    });

    expect(marketplaces.map(m => m.installUrlFormat)).toEqual(['https', 'ssh']);
  });

  it('throws when nothing is configured', () => {
    expect(() => read({})).toThrow(/not configured/);
    expect(() => read({ skillsMarketplace: { marketplaces: [] } })).toThrow(
      /not configured/,
    );
  });

  it('throws on an unsupported installUrlFormat', () => {
    expect(() =>
      read({ skillsMarketplace: { url: GITHUB, installUrlFormat: 'ftp' } }),
    ).toThrow(/invalid installUrlFormat/);
    expect(() =>
      read({
        skillsMarketplace: {
          marketplaces: [{ url: GITHUB, installUrlFormat: 'ftp' }],
        },
      }),
    ).toThrow(/invalid installUrlFormat/);
  });

  it('throws when two marketplaces share a repo name', () => {
    expect(() =>
      read({
        skillsMarketplace: {
          url: GITHUB,
          marketplaces: [
            {
              url: 'https://gitlab.com/other-group/skills-marketplace/-/tree/main',
            },
          ],
        },
      }),
    ).toThrow(/named 'skills-marketplace'/);
  });
});
