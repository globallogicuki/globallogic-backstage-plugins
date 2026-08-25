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
import {
  InstallUrlFormat,
  deriveInstallUrl,
  resolveFileUrl,
} from '../lib/repo';

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

const isNotFound = (error: unknown): boolean =>
  error instanceof NotFoundError ||
  (error instanceof Error && error.name === 'NotFoundError');

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

  const getTreeUrl = (): string => {
    const treeUrl = config.getOptionalString('skillsMarketplace.url');
    if (!treeUrl) {
      throw new Error(
        'Skills Marketplace is not configured: set skillsMarketplace.url in ' +
          'app-config.yaml to the web URL of the repo tree that hosts your ' +
          'Claude Code marketplace, e.g. ' +
          'https://github.com/my-org/skills-marketplace/tree/main',
      );
    }
    return treeUrl;
  };

  const getInstallUrlFormat = (): InstallUrlFormat => {
    const format =
      config.getOptionalString('skillsMarketplace.installUrlFormat') ?? 'ssh';
    if (format !== 'ssh' && format !== 'https') {
      throw new Error(
        `Skills Marketplace: invalid installUrlFormat '${format}'. ` +
          `Supported values: ssh, https.`,
      );
    }
    return format;
  };

  const router = Router();
  router.use(express.json());

  router.get('/marketplace', async (_req, res) => {
    const treeUrl = getTreeUrl();
    let raw;
    try {
      raw = await readFile(treeUrl, '.claude-plugin/marketplace.json');
    } catch (error) {
      if (isNotFound(error)) {
        res.status(404).json({
          error: {
            message: `No .claude-plugin/marketplace.json found at ${treeUrl}.`,
          },
        });
        return;
      }
      throw error;
    }
    let marketplace;
    try {
      marketplace = JSON.parse(raw);
    } catch {
      res.status(502).json({
        error: { message: 'Marketplace manifest is not valid JSON.' },
      });
      return;
    }
    if (!Array.isArray(marketplace.plugins)) {
      res.status(502).json({
        error: {
          message: 'Marketplace manifest is missing a "plugins" array.',
        },
      });
      return;
    }
    res.json({
      marketplace,
      installUrl: deriveInstallUrl(treeUrl, getInstallUrlFormat()),
    });
  });

  router.get('/skill-doc', async (req, res) => {
    const source = req.query.source;
    if (typeof source !== 'string' || !isSafeSource(source)) {
      res.status(400).json({
        error: { message: 'Invalid "source" query parameter.' },
      });
      return;
    }
    const treeUrl = getTreeUrl();
    try {
      const content = await readFile(treeUrl, `${source}/SKILL.md`);
      res.type('text/markdown').send(content);
    } catch (error) {
      if (isNotFound(error)) {
        res.status(404).json({
          error: { message: `No SKILL.md found for ${source}.` },
        });
        return;
      }
      throw error;
    }
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
