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

/** The marketplace manifest plus repo metadata derived by the backend. */
export type MarketplaceResponse = {
  marketplace: Marketplace;
  /** Git URL of the marketplace repo shown in the install command. */
  installUrl: string;
};

/** A skill's `SKILL.md` split into frontmatter fields and the markdown body. */
export type SkillDoc = {
  /** Raw key/value pairs from the YAML frontmatter block (values kept as strings). */
  frontmatter: Record<string, string>;
  /** Markdown body with the frontmatter block removed. */
  body: string;
};

export interface SkillsMarketplaceApi {
  getMarketplace(): Promise<MarketplaceResponse>;
  /** Fetch a skill's SKILL.md; undefined when the skill has none. */
  getSkillDoc(source: string): Promise<SkillDoc | undefined>;
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

  async getSkillDoc(source: string): Promise<SkillDoc | undefined> {
    const baseUrl = await this.discoveryApi.getBaseUrl('skills-marketplace');
    const response = await this.fetchApi.fetch(
      `${baseUrl}/skill-doc?source=${encodeURIComponent(source)}`,
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
 * Split a SKILL.md into flat `key: value` frontmatter and markdown body.
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
