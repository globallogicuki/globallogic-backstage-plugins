import express from 'express';
import Router from 'express-promise-router';
import { NotFoundError } from '@backstage/errors';
import { ScmIntegrations } from '@backstage/integration';
import {
  CacheService,
  LoggerService,
  RootConfigService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import { MarketplaceConfig, readMarketplaceConfigs } from '../lib/config';
import { deriveInstallUrl, resolveFileUrl } from '../lib/repo';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
  urlReader: UrlReaderService;
  cache: CacheService;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

// Repo-relative skill source as declared in the manifest, e.g.
// `./skills/deck-gl`. No absolute URLs, no parent traversal.
const SAFE_SOURCE = /^\.?\/?[A-Za-z0-9][A-Za-z0-9._/-]*$/;

// SAFE_SOURCE alone still admits `..` mid-path (`a/../b`), which URL
// resolution collapses into parent traversal — reject dot-only segments.
const isSafeSource = (source: string): boolean =>
  SAFE_SOURCE.test(source) &&
  source
    .replace(/^\.\//, '')
    .split('/')
    .every(segment => segment !== '..' && segment !== '.');

// Docs for a skill, in the order they are tried: plugins written as Claude Code
// skills carry a SKILL.md, while plainer ones only have a README.
const DOC_FILES = ['SKILL.md', 'README.md'];

const isNotFound = (error: unknown): boolean =>
  error instanceof NotFoundError ||
  (error instanceof Error && error.name === 'NotFoundError');

/** One marketplace that failed to load, reported alongside the ones that did. */
type MarketplaceFailure = {
  repo: string;
  url: string;
  message: string;
  status: number;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, urlReader, cache } = options;
  const integrations = ScmIntegrations.fromConfig(config);

  const readFile = async (treeUrl: string, path: string): Promise<string> => {
    const url = resolveFileUrl(integrations, treeUrl, path);
    const cached = await cache.get<string>(url);
    if (cached !== undefined) {
      return cached;
    }
    const response = await urlReader.readUrl(url);
    const content = (await response.buffer()).toString('utf8');
    await cache.set(url, content, { ttl: CACHE_TTL_MS });
    return content;
  };

  const loadMarketplace = async (marketplace: MarketplaceConfig) => {
    const { repo, url } = marketplace;
    const fail = (message: string, status: number): MarketplaceFailure => ({
      repo,
      url,
      message,
      status,
    });

    let raw;
    try {
      raw = await readFile(url, '.claude-plugin/marketplace.json');
    } catch (error) {
      if (isNotFound(error)) {
        return fail(`No .claude-plugin/marketplace.json found at ${url}.`, 404);
      }
      throw error;
    }
    let manifest;
    try {
      manifest = JSON.parse(raw);
    } catch {
      return fail(`Marketplace manifest at ${url} is not valid JSON.`, 502);
    }
    if (!Array.isArray(manifest.plugins)) {
      return fail(
        `Marketplace manifest at ${url} is missing a "plugins" array.`,
        502,
      );
    }
    return {
      repo,
      url,
      installUrl: deriveInstallUrl(url, marketplace.installUrlFormat),
      marketplace: manifest,
    };
  };

  const isFailure = (
    result: Awaited<ReturnType<typeof loadMarketplace>>,
  ): result is MarketplaceFailure => 'status' in result;

  const router = Router();
  router.use(express.json());

  router.get('/marketplace', async (_req, res) => {
    const configured = readMarketplaceConfigs(config);
    const results = await Promise.all(configured.map(loadMarketplace));
    const failures = results.filter(isFailure);
    const marketplaces = results.filter(result => !isFailure(result));

    for (const failure of failures) {
      logger.warn(
        `Skills Marketplace: skipping '${failure.repo}' — ${failure.message}`,
      );
    }

    if (marketplaces.length === 0) {
      // A single marketplace reports its own failure verbatim; with several,
      // no one status fits, so report them together.
      const [first] = failures;
      res.status(failures.length === 1 ? first.status : 502).json({
        error: {
          message:
            failures.length === 1
              ? first.message
              : `No configured marketplace could be loaded: ${failures
                  .map(failure => failure.message)
                  .join(' ')}`,
        },
      });
      return;
    }

    res.json({
      marketplaces,
      errors: failures.map(({ repo, url, message }) => ({
        repo,
        url,
        message,
      })),
    });
  });

  router.get('/skill-doc', async (req, res) => {
    const { source, repo } = req.query;
    if (typeof source !== 'string' || !isSafeSource(source)) {
      res.status(400).json({
        error: { message: 'Invalid "source" query parameter.' },
      });
      return;
    }
    if (repo !== undefined && typeof repo !== 'string') {
      res.status(400).json({
        error: { message: 'Invalid "repo" query parameter.' },
      });
      return;
    }

    const configured = readMarketplaceConfigs(config);
    // Without a repo the first configured marketplace is the only sensible
    // target — the common single-marketplace case.
    const marketplace = repo
      ? configured.find(candidate => candidate.repo === repo)
      : configured[0];
    if (!marketplace) {
      res.status(404).json({
        error: { message: `No configured marketplace named '${repo}'.` },
      });
      return;
    }

    for (const file of DOC_FILES) {
      try {
        const content = await readFile(marketplace.url, `${source}/${file}`);
        res.type('text/markdown').send(content);
        return;
      } catch (error) {
        if (!isNotFound(error)) {
          throw error;
        }
      }
    }
    res.status(404).json({
      error: {
        message: `No ${DOC_FILES.join(' or ')} found for ${source}.`,
      },
    });
  });

  router.use(
    (
      error: Error,
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (res.headersSent) {
        next(error);
        return;
      }
      logger.error(`Skills Marketplace request failed: ${error.message}`);
      res.status(500).json({ error: { message: error.message } });
    },
  );

  return router;
}
