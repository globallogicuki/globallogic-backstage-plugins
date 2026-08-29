import { RootConfigService } from '@backstage/backend-plugin-api';
import { InstallUrlFormat, deriveRepoName } from './repo';

/** One resolved marketplace repo to read skills from. */
export type MarketplaceConfig = {
  /** Repo name, e.g. `skills-marketplace` — the id used to filter skills. */
  repo: string;
  /** Web URL of the repo tree at the branch to read. */
  url: string;
  installUrlFormat: InstallUrlFormat;
};

const NOT_CONFIGURED =
  'Skills Marketplace is not configured: set a skillsMarketplace.marketplaces ' +
  'list in app-config.yaml, each entry giving the web URL of a repo tree that ' +
  'hosts a Claude Code marketplace, e.g. ' +
  'https://github.com/my-org/skills-marketplace/tree/main';

// `url` and `installUrlFormat` used to sit at the top level. Say so rather
// than reporting an otherwise puzzling "not configured".
const MOVED_TO_LIST =
  'Skills Marketplace: skillsMarketplace.url and ' +
  'skillsMarketplace.installUrlFormat have moved into the ' +
  'skillsMarketplace.marketplaces list — give each repo its own entry, e.g. ' +
  'marketplaces: [{ url: ..., installUrlFormat: ssh }].';

const readInstallUrlFormat = (raw: string | undefined): InstallUrlFormat => {
  if (raw === undefined) {
    return 'ssh';
  }
  if (raw !== 'ssh' && raw !== 'https') {
    throw new Error(
      `Skills Marketplace: invalid installUrlFormat '${raw}'. ` +
        `Supported values: ssh, https.`,
    );
  }
  return raw;
};

/**
 * Resolve every entry of the `skillsMarketplace.marketplaces` list, in the
 * order they are configured.
 */
export function readMarketplaceConfigs(
  config: RootConfigService,
): MarketplaceConfig[] {
  const entries =
    config.getOptionalConfigArray('skillsMarketplace.marketplaces') ?? [];

  if (entries.length === 0) {
    throw new Error(
      config.getOptionalString('skillsMarketplace.url') ||
      config.getOptionalString('skillsMarketplace.installUrlFormat')
        ? MOVED_TO_LIST
        : NOT_CONFIGURED,
    );
  }

  const marketplaces = entries.map(entry => {
    const url = entry.getString('url');
    return {
      repo: deriveRepoName(url),
      url,
      installUrlFormat: readInstallUrlFormat(
        entry.getOptionalString('installUrlFormat'),
      ),
    };
  });

  // The repo name identifies a marketplace in the API and the UI filter, so
  // two repos with the same name would be indistinguishable.
  const duplicate = marketplaces.find(
    (m, index) =>
      marketplaces.findIndex(other => other.repo === m.repo) < index,
  );
  if (duplicate) {
    throw new Error(
      `Skills Marketplace: more than one configured marketplace is named ` +
        `'${duplicate.repo}'. Repo names must be unique.`,
    );
  }

  return marketplaces;
}
