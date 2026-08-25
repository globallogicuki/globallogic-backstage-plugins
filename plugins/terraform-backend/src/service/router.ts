import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import {
  getLatestRunForWorkspaces,
  listOrgRuns,
  getAssessmentResultsForWorkspaces,
} from '../lib';
import { createOpenApiRouter } from '../schema/openapi/generated';

export const DEFAULT_TF_BASE_URL = 'https://app.terraform.io';

/**
 * Derives the Terraform API root from the configured base URL.
 *
 * The configured `integrations.terraform.baseUrl` is the web origin of the
 * Terraform instance (e.g. `https://tfe.enterprise.com`), so the API root is
 * derived by appending `/api/v2`. For backwards compatibility, a configured
 * value already ending in `/api/v2` is used as-is.
 */
export const getApiBaseUrl = (baseUrl: string): string => {
  const trimmed = baseUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api/v2') ? trimmed : `${trimmed}/api/v2`;
};

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = await createOpenApiRouter();
  router.use(express.json());

  const token = config.getString('integrations.terraform.token');
  const baseUrl = getApiBaseUrl(
    config.getOptionalString('integrations.terraform.baseUrl') ??
      DEFAULT_TF_BASE_URL,
  );
  const pageSize = config.getOptionalNumber('integrations.terraform.pageSize');

  router.get(
    '/organizations/:orgName/workspaces/:workspaceNames/latestRun',
    (request, response, next) => {
      const organization = request.params.orgName;
      const workspaces = request.params.workspaceNames.split(',');

      getLatestRunForWorkspaces(baseUrl, token, organization, workspaces)
        .then(latestRun => response.json(latestRun ?? null))
        .catch(next);
    },
  );

  router.get(
    '/organizations/:orgName/workspaces/:workspaceNames/runs',
    (request, response, next) => {
      const organization = request.params.orgName;
      const workspaces = request.params.workspaceNames.split(',');

      listOrgRuns({ token, baseUrl, organization, workspaces, pageSize })
        .then(runs => {
          response.json(runs);
        })
        .catch(next);
    },
  );

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get(
    '/organizations/:orgName/workspaces/:workspaceNames/assessment-results',
    (request, response, next) => {
      const organization = request.params.orgName;
      const workspaces = request.params.workspaceNames.split(',');

      getAssessmentResultsForWorkspaces({
        token,
        baseUrl,
        organization,
        workspaces,
        logger,
      })
        .then(assessments => {
          response.json(assessments);
        })
        .catch(next);
    },
  );

  router.use(MiddlewareFactory.create(options).error());
  return router;
}
