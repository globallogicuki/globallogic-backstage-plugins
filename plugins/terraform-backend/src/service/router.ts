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
import { AssessmentResult } from '../schema/openapi/generated/models';

export const DEFAULT_TF_BASE_URL = 'https://app.terraform.io';

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
  const baseUrl =
    config.getOptionalString('integrations.terraform.baseUrl') ??
    DEFAULT_TF_BASE_URL;

  router.get(
    '/organizations/:orgName/workspaces/:workspaceNames/latestRun',
    (request, response, next) => {
      const organization = request.params.orgName;
      const workspaces = request.params.workspaceNames.split(',');

      getLatestRunForWorkspaces(baseUrl, token, organization, workspaces)
        .then(latestRun => response.json(latestRun))
        .catch(next);
    },
  );

  router.get(
    '/organizations/:orgName/workspaces/:workspaceNames/runs',
    (request, response, next) => {
      const organization = request.params.orgName;
      const workspaces = request.params.workspaceNames.split(',');

      listOrgRuns({ token, baseUrl, organization, workspaces })
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
      })
        .then(assessments => {
          if (assessments !== null) {
            response.json(assessments);
          } else {
            const emptyResults: AssessmentResult[] = [];
            response.json(emptyResults);
          }
        })
        .catch(next);
    },
  );

  router.use(MiddlewareFactory.create(options).error());
  return router;
}
