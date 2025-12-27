import {
  HttpAuthService,
  LoggerService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import {
  AuthorizeResult,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import {
  unleashFlagReadPermission,
  unleashFlagTogglePermission,
  unleashVariantManagePermission,
} from '@globallogicuki/backstage-plugin-unleash-common';
import express from 'express';
import Router from 'express-promise-router';
import {
  getProjectFeatures,
  getFeatureFlag,
  toggleFeatureFlag,
  updateFeatureVariants,
  getFeatureMetrics,
  updateStrategy,
  getAllProjects,
  getAllEnvironments,
} from './lib';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { CatalogService } from '@backstage/plugin-catalog-node';

export interface RouterOptions {
  logger: LoggerService;
  unleashUrl: string;
  unleashToken: string;
  editableEnvs: string[];
  numEnvs?: number;
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
  catalog: CatalogService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const {
    logger,
    unleashUrl,
    unleashToken,
    editableEnvs,
    numEnvs = 4,
    httpAuth,
    permissions,
    catalog,
  } = options;
  const router = Router();
  router.use(express.json());

  // Log ALL requests to unleash backend
  router.use((req, _res, next) => {
    logger.info(`[Unleash Router] ${req.method} ${req.path}`);
    next();
  });

  const unleashClientOptions = {
    baseUrl: unleashUrl,
    token: unleashToken,
    logger,
  };

  // Helper to check permissions against a component
  const checkPermission = async (
    req: express.Request,
    permission: ResourcePermission<string>,
  ): Promise<{ result: AuthorizeResult }> => {
    const { projectId } = req.params;
    logger.warn(
      `[checkPermission] Starting: ${permission.name} for project ${projectId}`,
    );
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    logger.warn(
      `[checkPermission] User: ${
        credentials.principal.userEntityRef || 'unknown'
      }`,
    );

    const { items } = await catalog.getEntities(
      {
        filter: {
          'metadata.annotations.unleash.io/project-id': projectId,
        },
        fields: ['kind', 'metadata.namespace', 'metadata.name'],
      },
      { credentials },
    );

    if (items.length === 0) {
      // No component linked to this project ID, so deny permission.
      logger.warn(
        `Permission denied: No component found with unleash.io/project-id annotation matching '${projectId}'`,
      );
      return { result: AuthorizeResult.DENY };
    }

    logger.debug(
      `Found ${
        items.length
      } component(s) linked to project '${projectId}': ${items
        .map(e => stringifyEntityRef(e))
        .join(', ')}`,
    );

    // Check for permission against all found entities.
    const authRequests = items.map(entity => ({
      permission,
      resourceRef: stringifyEntityRef(entity),
    }));
    logger.warn(
      `[checkPermission] Authorizing against ${items.length} entities`,
    );
    const decisions = await permissions.authorize(authRequests, {
      credentials,
    });
    logger.warn(
      `[checkPermission] Decisions: ${decisions.map(d => d.result).join(', ')}`,
    );

    // If any of the checks result in ALLOW, then grant access.
    if (decisions.some(d => d.result === AuthorizeResult.ALLOW)) {
      logger.debug(
        `Permission granted for '${permission.name}' on project '${projectId}'`,
      );
      return { result: AuthorizeResult.ALLOW };
    }

    // Otherwise, deny.
    logger.warn(
      `Permission denied for '${permission.name}' on project '${projectId}'. User does not have permission on any linked components.`,
    );
    return { result: AuthorizeResult.DENY };
  };

  // Helper to check if an environment is editable
  const isEnvironmentEditable = (environment: string): boolean => {
    return editableEnvs.length > 0 && editableEnvs.includes(environment);
  };

  // Get configuration (including editable environments and numEnvs)
  router.get('/config', async (_req, res) => {
    return res.json({ editableEnvs, numEnvs });
  });

  // Get all projects summary
  // No permission check needed - returns all projects (filtering happens client-side)
  router.get('/projects', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });
    const data = await getAllProjects(unleashClientOptions);
    return res.json(data);
  });

  // Get all environments summary
  // No permission check needed - returns all environments
  router.get('/environments', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });
    const data = await getAllEnvironments(unleashClientOptions);
    return res.json(data);
  });

  // List flags for a project
  router.get('/projects/:projectId/features', async (req, res) => {
    const decision = await checkPermission(req, unleashFlagReadPermission);

    if (decision.result !== AuthorizeResult.ALLOW) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { projectId } = req.params;
    const data = await getProjectFeatures(unleashClientOptions, projectId);
    return res.json(data);
  });

  // Get single flag details with variants
  router.get('/projects/:projectId/features/:featureName', async (req, res) => {
    const decision = await checkPermission(req, unleashFlagReadPermission);

    if (decision.result !== AuthorizeResult.ALLOW) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { projectId, featureName } = req.params;
    const data = await getFeatureFlag(
      unleashClientOptions,
      projectId,
      featureName,
    );
    return res.json(data);
  });

  // Toggle flag in environment
  router.post(
    '/projects/:projectId/features/:featureName/environments/:environment/:action',
    async (req, res) => {
      const { projectId, featureName, environment, action } = req.params;
      logger.warn(
        `[TOGGLE] Endpoint hit: ${featureName} -> ${action} in ${environment}`,
      );

      if (action !== 'on' && action !== 'off') {
        throw new InputError('Action must be "on" or "off"');
      }

      if (!isEnvironmentEditable(environment)) {
        return res.status(403).json({
          error: `Environment '${environment}' is not editable. Editable environments: ${
            editableEnvs.join(', ') || 'none'
          }`,
        });
      }

      logger.warn('[TOGGLE] About to check permission');
      const decision = await checkPermission(req, unleashFlagTogglePermission);
      logger.warn(`[TOGGLE] Permission decision: ${decision.result}`);

      if (decision.result !== AuthorizeResult.ALLOW) {
        logger.warn('[TOGGLE] DENYING - permission check failed');
        return res
          .status(403)
          .json({ error: 'Permission denied for toggle action' });
      }

      logger.warn('[TOGGLE] ALLOWING - permission check passed');

      try {
        await toggleFeatureFlag(
          unleashClientOptions,
          projectId,
          featureName,
          environment,
          action as 'on' | 'off',
        );

        logger.info(
          `User toggled flag ${featureName} ${action} in ${environment} (project: ${projectId})`,
        );
        return res.json({ success: true });
      } catch (error: any) {
        // Pass through the status code from Unleash API if available
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Unknown error';

        // Return proper status code based on error type
        if (statusCode === 403 || message.includes('Forbidden')) {
          return res.status(403).json({
            error:
              'Permission denied. You may not have access to modify this flag in Unleash.',
          });
        }

        return res.status(statusCode).json({
          error: message,
        });
      }
    },
  );

  // Update variants
  router.put(
    '/projects/:projectId/features/:featureName/variants',
    async (req, res) => {
      // Variants are global, not environment-specific
      // Only allow if at least one environment is editable
      if (editableEnvs.length === 0) {
        return res.status(403).json({
          error:
            'No environments are editable. Configure editableEnvs to enable variant editing.',
        });
      }

      const decision = await checkPermission(
        req,
        unleashVariantManagePermission,
      );

      if (decision.result !== AuthorizeResult.ALLOW) {
        return res
          .status(403)
          .json({ error: 'Permission denied for variant management' });
      }

      const { projectId, featureName } = req.params;

      try {
        const data = await updateFeatureVariants(
          unleashClientOptions,
          projectId,
          featureName,
          req.body,
        );

        logger.info(
          `User updated variants for flag ${featureName} (project: ${projectId})`,
        );
        return res.json(data);
      } catch (error: any) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Unknown error';

        if (statusCode === 403 || message.includes('Forbidden')) {
          return res.status(403).json({
            error:
              'Permission denied. You may not have access to modify variants in Unleash.',
          });
        }

        return res.status(statusCode).json({
          error: message,
        });
      }
    },
  );

  // Get flag metrics
  router.get(
    '/projects/:projectId/features/:featureName/metrics',
    async (req, res) => {
      const decision = await checkPermission(req, unleashFlagReadPermission);

      if (decision.result !== AuthorizeResult.ALLOW) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      const { projectId, featureName } = req.params;
      const data = await getFeatureMetrics(
        unleashClientOptions,
        projectId,
        featureName,
      );
      return res.json(data);
    },
  );

  // Update strategy
  router.put(
    '/projects/:projectId/features/:featureName/environments/:environment/strategies/:strategyId',
    async (req, res) => {
      const { projectId, featureName, environment, strategyId } = req.params;

      if (!isEnvironmentEditable(environment)) {
        return res.status(403).json({
          error: `Environment '${environment}' is not editable. Editable environments: ${
            editableEnvs.join(', ') || 'none'
          }`,
        });
      }

      const decision = await checkPermission(
        req,
        unleashVariantManagePermission,
      );

      if (decision.result !== AuthorizeResult.ALLOW) {
        return res
          .status(403)
          .json({ error: 'Permission denied for strategy management' });
      }
      try {
        const data = await updateStrategy(
          unleashClientOptions,
          projectId,
          featureName,
          environment,
          strategyId,
          req.body,
        );

        logger.info(
          `User updated strategy ${strategyId} for flag ${featureName} in ${environment} (project: ${projectId})`,
        );
        return res.json(data);
      } catch (error: any) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Unknown error';

        if (statusCode === 403 || message.includes('Forbidden')) {
          return res.status(403).json({
            error:
              'Permission denied. You may not have access to modify strategies in Unleash.',
          });
        }

        return res.status(statusCode).json({
          error: message,
        });
      }
    },
  );

  // Health check
  router.get('/health', (_, res) => {
    return res.json({ status: 'ok' });
  });

  return router;
}
