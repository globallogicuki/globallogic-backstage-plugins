import { mockServices } from '@backstage/backend-test-utils';
import { readMarketplaceConfigs } from './config';

const GITHUB = 'https://github.com/my-org/skills-marketplace/tree/main';
const GITLAB = 'https://gitlab.com/my-group/team-skills/-/tree/main';

const read = (data: object) =>
  readMarketplaceConfigs(mockServices.rootConfig({ data }));

describe('readMarketplaceConfigs', () => {
  it('reads a single-entry list', () => {
    expect(
      read({ skillsMarketplace: { marketplaces: [{ url: GITHUB }] } }),
    ).toEqual([
      { repo: 'skills-marketplace', url: GITHUB, installUrlFormat: 'ssh' },
    ]);
  });

  it('keeps every entry, in configured order', () => {
    expect(
      read({
        skillsMarketplace: { marketplaces: [{ url: GITLAB }, { url: GITHUB }] },
      }),
    ).toEqual([
      { repo: 'team-skills', url: GITLAB, installUrlFormat: 'ssh' },
      { repo: 'skills-marketplace', url: GITHUB, installUrlFormat: 'ssh' },
    ]);
  });

  it('takes installUrlFormat per entry, defaulting to ssh', () => {
    const marketplaces = read({
      skillsMarketplace: {
        marketplaces: [
          { url: GITHUB, installUrlFormat: 'https' },
          { url: GITLAB },
        ],
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

  it('points top-level url or installUrlFormat at the list', () => {
    expect(() => read({ skillsMarketplace: { url: GITHUB } })).toThrow(
      /have moved into the skillsMarketplace.marketplaces list/,
    );
    expect(() =>
      read({ skillsMarketplace: { installUrlFormat: 'https' } }),
    ).toThrow(/have moved into the skillsMarketplace.marketplaces list/);
  });

  it('throws on an unsupported installUrlFormat', () => {
    expect(() =>
      read({
        skillsMarketplace: {
          marketplaces: [{ url: GITHUB, installUrlFormat: 'ftp' }],
        },
      }),
    ).toThrow(/invalid installUrlFormat/);
  });

  it('throws when a url is missing', () => {
    expect(() =>
      read({
        skillsMarketplace: { marketplaces: [{ installUrlFormat: 'ssh' }] },
      }),
    ).toThrow(/url/);
  });

  it('throws when two marketplaces share a repo name', () => {
    expect(() =>
      read({
        skillsMarketplace: {
          marketplaces: [
            { url: GITHUB },
            {
              url: 'https://gitlab.com/other-group/skills-marketplace/-/tree/main',
            },
          ],
        },
      }),
    ).toThrow(/named 'skills-marketplace'/);
  });
});
