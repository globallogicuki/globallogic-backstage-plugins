import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/frontend-plugin-api';

/** A single skill entry as declared in `.claude-plugin/marketplace.json`. */
export type Skill = {
  name: string;
  /** Path within the repo, e.g. `./skills/deck-gl`. */
  source: string;
  description: string;
  category?: string;
  keywords?: string[];
};

/** The parsed `.claude-plugin/marketplace.json` manifest. */
export type Marketplace = {
  name: string;
  owner?: { name?: string; email?: string };
  description?: string;
  plugins: Skill[];
};

/** One marketplace repo: its manifest plus metadata derived by the backend. */
export type MarketplaceEntry = {
  /** Repo name, e.g. `skills-marketplace` — the id used to filter skills. */
  repo: string;
  /** Web URL of the repo tree the manifest was read from. */
  url: string;
  /** Git URL of the marketplace repo shown in the install command. */
  installUrl: string;
  marketplace: Marketplace;
};

/** A configured marketplace the backend could not load. */
export type MarketplaceError = {
  repo: string;
  url: string;
  message: string;
};

/** Every configured marketplace, plus any that failed to load. */
export type MarketplaceResponse = {
  marketplaces: MarketplaceEntry[];
  errors?: MarketplaceError[];
};

/** A skill paired with the marketplace it was declared in. */
export type SkillListing = {
  skill: Skill;
  /** Repo name of the marketplace this skill came from. */
  repo: string;
  /** Manifest `name` of that marketplace, used in the install command. */
  marketplaceName: string;
  /** Git URL of that marketplace repo, used in the install command. */
  installUrl: string;
};

/** Flatten every marketplace's plugins into one list tagged by source repo. */
export function flattenSkills(
  marketplaces: MarketplaceEntry[],
): SkillListing[] {
  return marketplaces.flatMap(entry =>
    entry.marketplace.plugins.map(skill => ({
      skill,
      repo: entry.repo,
      marketplaceName: entry.marketplace.name,
      installUrl: entry.installUrl,
    })),
  );
}

/**
 * A skill's docs — its `SKILL.md`, or its `README.md` where it has no
 * `SKILL.md` — split into frontmatter fields and the markdown body.
 */
export type SkillDoc = {
  /** Raw key/value pairs from the YAML frontmatter block (values kept as strings). */
  frontmatter: Record<string, string>;
  /** Markdown body with the frontmatter block removed. */
  body: string;
};

export interface SkillsMarketplaceApi {
  getMarketplace(): Promise<MarketplaceResponse>;
  /**
   * Fetch a skill's docs (`SKILL.md`, else `README.md`) from the given repo;
   * undefined when it has neither. Without a repo the first configured
   * marketplace is used.
   */
  getSkillDoc(source: string, repo?: string): Promise<SkillDoc | undefined>;
}

export const skillsMarketplaceApiRef = createApiRef<SkillsMarketplaceApi>({
  id: 'plugin.skills-marketplace.service',
});

export class SkillsMarketplaceClient implements SkillsMarketplaceApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getMarketplace(): Promise<MarketplaceResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('skills-marketplace');
    const response = await this.fetchApi.fetch(`${baseUrl}/marketplace`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(await this.errorMessage(response));
    }
    return (await response.json()) as MarketplaceResponse;
  }

  async getSkillDoc(
    source: string,
    repo?: string,
  ): Promise<SkillDoc | undefined> {
    const baseUrl = await this.discoveryApi.getBaseUrl('skills-marketplace');
    const query = new URLSearchParams({ source });
    if (repo) {
      query.set('repo', repo);
    }
    const response = await this.fetchApi.fetch(
      `${baseUrl}/skill-doc?${query}`,
      { credentials: 'include' },
    );
    if (response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      throw new Error(await this.errorMessage(response));
    }
    return parseFrontmatter(await response.text());
  }

  private async errorMessage(response: Response): Promise<string> {
    try {
      const data = await response.json();
      if (data.error?.message) {
        return data.error.message;
      }
    } catch {
      // fall through to the generic message
    }
    return `Skills Marketplace request failed (${response.status} ${response.statusText}).`;
  }
}

/**
 * Split a doc into flat `key: value` frontmatter and markdown body. A README
 * with no frontmatter block comes back as body only.
 * Not a general YAML parser — nested structures are kept as raw strings.
 */
export function parseFrontmatter(raw: string): SkillDoc {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }
  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s?(.*)$/.exec(line);
    if (kv) {
      frontmatter[kv[1]] = kv[2].trim();
    }
  }
  const body = raw.slice(match[0].length).replace(/^(?:[ \t]*\r?\n)+/, '');
  return { frontmatter, body };
}
