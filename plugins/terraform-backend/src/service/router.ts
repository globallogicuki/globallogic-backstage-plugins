import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { findWorkspace, getRunsForWorkspace } from '../lib';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  router.get('/runs/:organization/:workspace', (request, response, next) => {
    const token = config.getString('integrations.terraform.token');
    const organization = request.params.organization;
    const workspaceName = request.params.workspace;

    findWorkspace(token, organization, workspaceName)
      .then(workspace => getRunsForWorkspace(token, workspace.id))
      .then(runs => {
        response.json(runs);
      })
      .catch(next);
  });

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });
  router.use(errorHandler());
  return router;
}
