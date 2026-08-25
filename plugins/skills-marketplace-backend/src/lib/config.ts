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
  'Skills Marketplace is not configured: set skillsMarketplace.url (or a ' +
  'skillsMarketplace.marketplaces list) in app-config.yaml to the web URL of ' +
  'the repo tree that hosts your Claude Code marketplace, e.g. ' +
  'https://github.com/my-org/skills-marketplace/tree/main';

const readInstallUrlFormat = (
  raw: string | undefined,
  fallback: InstallUrlFormat,
): InstallUrlFormat => {
  if (raw === undefined) {
    return fallback;
  }
  if (raw !== 'ssh' && raw !== 'https') {
    throw new Error(
      `Skills Marketplace: invalid installUrlFormat '${raw}'. ` +
        `Supported values: ssh, https.`,
    );
  }
  return raw;
};

const toMarketplace = (
  url: string,
  installUrlFormat: InstallUrlFormat,
): MarketplaceConfig => ({
  repo: deriveRepoName(url),
  url,
  installUrlFormat,
});

/**
 * Resolve the configured marketplaces: the single `skillsMarketplace.url` and
 * every entry of the optional `skillsMarketplace.marketplaces` list, in that
 * order. Each entry inherits the top-level `installUrlFormat` unless it sets
 * its own.
 */
export function readMarketplaceConfigs(
  config: RootConfigService,
): MarketplaceConfig[] {
  const defaultFormat = readInstallUrlFormat(
    config.getOptionalString('skillsMarketplace.installUrlFormat'),
    'ssh',
  );

  const marketplaces: MarketplaceConfig[] = [];
  const url = config.getOptionalString('skillsMarketplace.url');
  if (url) {
    marketplaces.push(toMarketplace(url, defaultFormat));
  }
  const entries =
    config.getOptionalConfigArray('skillsMarketplace.marketplaces') ?? [];
  for (const entry of entries) {
    marketplaces.push(
      toMarketplace(
        entry.getString('url'),
        readInstallUrlFormat(
          entry.getOptionalString('installUrlFormat'),
          defaultFormat,
        ),
      ),
    );
  }

  if (marketplaces.length === 0) {
    throw new Error(NOT_CONFIGURED);
  }

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
