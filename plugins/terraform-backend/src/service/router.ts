import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import { createOpenApiRouter } from '../schema/openapi.generated';
import { getLatestRunForWorkspaces, listOrgRuns } from '../lib';

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

  router.get(
    '/organizations/:orgName/workspaces/:workspaceNames/latestRun',
    (request, response, next) => {
      const token = config.getString('integrations.terraform.token');
      const organization = request.params.orgName;
      const workspaces = request.params.workspaceNames.split(',');

      getLatestRunForWorkspaces(token, organization, workspaces)
        .then(latestRun => response.json(latestRun))
        .catch(next);
    },
  );

  router.get(
    '/organizations/:orgName/workspaces/:workspaceNames/runs',
    (request, response, next) => {
      const token = config.getString('integrations.terraform.token');
      const organization = request.params.orgName;
      const workspaces = request.params.workspaceNames.split(',');

      listOrgRuns({ token, organization, workspaces })
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

  router.use(errorHandler());
  return router;
}
