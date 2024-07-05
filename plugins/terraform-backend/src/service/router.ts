import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import { createOpenApiRouter } from '../schema/openapi.generated';
import {
  findWorkspace,
  getRunsForWorkspace,
  getLatestRunForWorkspace,
} from '../lib';

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
    '/organizations/:orgName/workspaces/:workspaceName/latestRun',
    (request, response, next) => {
      const token = config.getString('integrations.terraform.token');
      const { orgName, workspaceName } = request.params;

      findWorkspace(token, orgName, workspaceName)
        .then(workspace => getLatestRunForWorkspace(token, workspace.id))
        .then(latestRun => response.json(latestRun))
        .catch(next);
    },
  );

  router.get(
    '/organizations/:orgName/workspaces/:workspaceName/runs',
    (request, response, next) => {
      const token = config.getString('integrations.terraform.token');
      const organization = request.params.orgName;
      const workspaceName = request.params.workspaceName;

      findWorkspace(token, organization, workspaceName)
        .then(workspace => getRunsForWorkspace(token, workspace.id))
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
