import {
  AuditorService,
  AuditorServiceEvent,
  BackstageCredentials,
  BackstageUserPrincipal,
  HttpAuthService,
  LoggerService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { InputError, NotAllowedError, NotFoundError } from '@backstage/errors';
import {
  AuthorizeResult,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import {
  DEFAULT_NUM_ENVS,
  isEnvironmentEditable,
  UNLEASH_PROJECT_ANNOTATION,
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
  auditor: AuditorService;
  unleashUrl: string;
  unleashToken: string;
  editableEnvs: string[];
  numEnvs?: number;
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
  catalog: CatalogService;
}

/**
 * Map an upstream Unleash API error (a plain Error with a `statusCode`
 * property, see lib/unleash.ts) to a typed \@backstage/errors error so the
 * default error middleware responds with the right status and the standard
 * `{ error: { name, message } }` body.
 */
function toBackstageError(error: any, forbiddenMessage?: string): Error {
  const statusCode = error?.statusCode;
  const message = error?.message || 'Unknown error';

  if (statusCode === 403 || message.includes('Forbidden')) {
    return new NotAllowedError(forbiddenMessage ?? message);
  }
  if (statusCode === 404) {
    return new NotFoundError(message);
  }
  if (statusCode === 400) {
    return new InputError(message);
  }
  return error instanceof Error ? error : new Error(message);
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const {
    logger,
    auditor,
    unleashUrl,
    unleashToken,
    editableEnvs,
    numEnvs = DEFAULT_NUM_ENVS,
    httpAuth,
    permissions,
    catalog,
  } = options;
  const router = Router();
  router.use(express.json());

  const unleashClientOptions = {
    baseUrl: unleashUrl,
    token: unleashToken,
    logger,
  };

  // Helper to check permissions against the components linked to a project
  const checkPermission = async (
    credentials: BackstageCredentials,
    projectId: string,
    permission: ResourcePermission<string>,
  ): Promise<{ result: AuthorizeResult }> => {
    const { items } = await catalog.getEntities(
      {
        filter: {
          [`metadata.annotations.${UNLEASH_PROJECT_ANNOTATION}`]: projectId,
        },
        fields: ['kind', 'metadata.namespace', 'metadata.name'],
      },
      { credentials },
    );

    if (items.length === 0) {
      // No component linked to this project ID, so deny permission.
      logger.debug(
        `Permission denied: No component found with ${UNLEASH_PROJECT_ANNOTATION} annotation matching '${projectId}'`,
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
    const decisions = await permissions.authorize(authRequests, {
      credentials,
    });

    // If any of the checks result in ALLOW, then grant access.
    if (decisions.some(d => d.result === AuthorizeResult.ALLOW)) {
      logger.debug(
        `Permission granted for '${permission.name}' on project '${projectId}'`,
      );
      return { result: AuthorizeResult.ALLOW };
    }

    // Otherwise, deny.
    logger.debug(
      `Permission denied for '${permission.name}' on project '${projectId}'. User does not have permission on any linked components.`,
    );
    return { result: AuthorizeResult.DENY };
  };

  // Helper to create an audit event for a mutating operation. Returns the
  // audit event (call success()/fail() on it) and the resolved userEntityRef
  // for log enrichment.
  const createAuditEvent = async (
    req: express.Request,
    credentials: BackstageCredentials<BackstageUserPrincipal>,
    eventId: string,
    meta: Record<string, string>,
  ): Promise<{ auditEvent: AuditorServiceEvent; userEntityRef: string }> => {
    const userEntityRef = credentials.principal.userEntityRef || 'unknown';

    const auditEvent = await auditor.createEvent({
      eventId,
      severityLevel: 'medium',
      request: req,
      meta: { ...meta, userEntityRef },
    });

    return { auditEvent, userEntityRef };
  };

  // Helper to mark the audit event as failed and rethrow the upstream error
  // as a typed error for the default error middleware.
  const failAuditAndThrow = async (
    auditEvent: AuditorServiceEvent,
    error: any,
    forbiddenMessage: string,
  ): Promise<never> => {
    await auditEvent.fail({ error });
    throw toBackstageError(error, forbiddenMessage);
  };

  // Get configuration (including editable environments and numEnvs)
  router.get('/config', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });
    return res.json({ editableEnvs, numEnvs });
  });

  // Get all projects summary
  // No permission check needed - returns all projects (filtering happens client-side)
  router.get('/projects', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });
    try {
      const data = await getAllProjects(unleashClientOptions);
      return res.json(data);
    } catch (error) {
      throw toBackstageError(error);
    }
  });

  // Get all environments summary
  // No permission check needed - returns all environments
  router.get('/environments', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });
    try {
      const data = await getAllEnvironments(unleashClientOptions);
      return res.json(data);
    } catch (error) {
      throw toBackstageError(error);
    }
  });

  // List flags for a project
  router.get('/projects/:projectId/features', async (req, res) => {
    const { projectId } = req.params;
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const decision = await checkPermission(
      credentials,
      projectId,
      unleashFlagReadPermission,
    );

    if (decision.result !== AuthorizeResult.ALLOW) {
      throw new NotAllowedError('Permission denied');
    }

    try {
      const data = await getProjectFeatures(unleashClientOptions, projectId);
      return res.json(data);
    } catch (error) {
      throw toBackstageError(error);
    }
  });

  // Get single flag details with variants
  router.get('/projects/:projectId/features/:featureName', async (req, res) => {
    const { projectId, featureName } = req.params;
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const decision = await checkPermission(
      credentials,
      projectId,
      unleashFlagReadPermission,
    );

    if (decision.result !== AuthorizeResult.ALLOW) {
      throw new NotAllowedError('Permission denied');
    }

    try {
      const data = await getFeatureFlag(
        unleashClientOptions,
        projectId,
        featureName,
      );
      return res.json(data);
    } catch (error) {
      throw toBackstageError(error);
    }
  });

  // Toggle flag in environment
  router.post(
    '/projects/:projectId/features/:featureName/environments/:environment/:action',
    async (req, res) => {
      const { projectId, featureName, environment, action } = req.params;

      if (action !== 'on' && action !== 'off') {
        throw new InputError('Action must be "on" or "off"');
      }

      if (!isEnvironmentEditable(environment, editableEnvs)) {
        throw new NotAllowedError(
          `Environment '${environment}' is not editable. Editable environments: ${
            editableEnvs.join(', ') || 'none'
          }`,
        );
      }

      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      const decision = await checkPermission(
        credentials,
        projectId,
        unleashFlagTogglePermission,
      );

      if (decision.result !== AuthorizeResult.ALLOW) {
        throw new NotAllowedError('Permission denied for toggle action');
      }

      const { auditEvent, userEntityRef } = await createAuditEvent(
        req,
        credentials,
        'flag-toggle',
        { featureName, action, environment, projectId },
      );

      try {
        await toggleFeatureFlag(
          unleashClientOptions,
          projectId,
          featureName,
          environment,
          action as 'on' | 'off',
        );
      } catch (error) {
        return failAuditAndThrow(
          auditEvent,
          error,
          'Permission denied. You may not have access to modify this flag in Unleash.',
        );
      }

      await auditEvent.success();

      logger.info(
        `User ${userEntityRef} toggled flag ${featureName} ${action} in ${environment} (project: ${projectId})`,
      );
      return res.json({ success: true });
    },
  );

  // Update variants
  router.put(
    '/projects/:projectId/features/:featureName/variants',
    async (req, res) => {
      // Variants are global, not environment-specific
      // Only allow if at least one environment is editable
      if (editableEnvs.length === 0) {
        throw new NotAllowedError(
          'No environments are editable. Configure editableEnvs to enable variant editing.',
        );
      }

      const { projectId, featureName } = req.params;
      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      const decision = await checkPermission(
        credentials,
        projectId,
        unleashVariantManagePermission,
      );

      if (decision.result !== AuthorizeResult.ALLOW) {
        throw new NotAllowedError('Permission denied for variant management');
      }

      const { auditEvent, userEntityRef } = await createAuditEvent(
        req,
        credentials,
        'variant-update',
        { featureName, projectId },
      );

      let data;
      try {
        data = await updateFeatureVariants(
          unleashClientOptions,
          projectId,
          featureName,
          req.body,
        );
      } catch (error) {
        return failAuditAndThrow(
          auditEvent,
          error,
          'Permission denied. You may not have access to modify variants in Unleash.',
        );
      }

      await auditEvent.success();

      logger.info(
        `User ${userEntityRef} updated variants for flag ${featureName} (project: ${projectId})`,
      );
      return res.json(data);
    },
  );

  // Get flag metrics
  router.get(
    '/projects/:projectId/features/:featureName/metrics',
    async (req, res) => {
      const { projectId, featureName } = req.params;
      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      const decision = await checkPermission(
        credentials,
        projectId,
        unleashFlagReadPermission,
      );

      if (decision.result !== AuthorizeResult.ALLOW) {
        throw new NotAllowedError('Permission denied');
      }

      try {
        const data = await getFeatureMetrics(
          unleashClientOptions,
          projectId,
          featureName,
        );
        return res.json(data);
      } catch (error) {
        throw toBackstageError(error);
      }
    },
  );

  // Update strategy
  router.put(
    '/projects/:projectId/features/:featureName/environments/:environment/strategies/:strategyId',
    async (req, res) => {
      const { projectId, featureName, environment, strategyId } = req.params;

      if (!isEnvironmentEditable(environment, editableEnvs)) {
        throw new NotAllowedError(
          `Environment '${environment}' is not editable. Editable environments: ${
            editableEnvs.join(', ') || 'none'
          }`,
        );
      }

      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      const decision = await checkPermission(
        credentials,
        projectId,
        unleashVariantManagePermission,
      );

      if (decision.result !== AuthorizeResult.ALLOW) {
        throw new NotAllowedError('Permission denied for strategy management');
      }

      const { auditEvent, userEntityRef } = await createAuditEvent(
        req,
        credentials,
        'strategy-update',
        { featureName, strategyId, environment, projectId },
      );

      let data;
      try {
        data = await updateStrategy(
          unleashClientOptions,
          projectId,
          featureName,
          environment,
          strategyId,
          req.body,
        );
      } catch (error) {
        return failAuditAndThrow(
          auditEvent,
          error,
          'Permission denied. You may not have access to modify strategies in Unleash.',
        );
      }

      await auditEvent.success();

      logger.info(
        `User ${userEntityRef} updated strategy ${strategyId} for flag ${featureName} in ${environment} (project: ${projectId})`,
      );
      return res.json(data);
    },
  );

  // Health check
  router.get('/health', (_, res) => {
    return res.json({ status: 'ok' });
  });

  return router;
}
