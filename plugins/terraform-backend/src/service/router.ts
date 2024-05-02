import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import { createOpenApiRouter } from '../schema/openapi.generated';
import { findWorkspace, getRunsForWorkspace } from '../lib';

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
    '/organizations/:orgName/workspaces/:workspaceName/runs',
    (request, response, next) => {
      const token = config.getString('integrations.terraform.token');
      const organization = request.params.orgName;
      const workspaceName = request.params.workspaceName;

      findWorkspace(token, organization, workspaceName)
        .then(workspace => getRunsForWorkspace(token, workspace.id))
        .then(runs => {
          response.json(
            runs.map(singleRun => ({
              id: singleRun.id,
              message: singleRun.message,
              status: singleRun.status,
              createdAt: singleRun.createdAt,
              confirmedBy: singleRun.confirmedBy,
              plan: singleRun.plan,
            })),
          );
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
