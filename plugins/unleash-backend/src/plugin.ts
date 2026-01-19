import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createRouter } from './router';
import {  
  unleashFlagReadPermission,
  unleashFlagTogglePermission,
  unleashVariantManagePermission,
} from '@globallogicuki/backstage-plugin-unleash-common';

/**
 * Unleash backend plugin
 *
 * @public
 */
export const unleashPlugin = createBackendPlugin({
  pluginId: 'unleash',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
        permissions: coreServices.permissions,
        permissionsRegistry: coreServices.permissionsRegistry,
        catalog: catalogServiceRef,
      },
      async init({
        logger,
        httpAuth,
        httpRouter,
        config,
        permissions,
        permissionsRegistry,
        catalog,
      }) {
        const unleashConfig = config.getOptionalConfig('unleash');

        if (!unleashConfig) {
          logger.warn(
            'Unleash configuration not found, plugin will not be enabled',
          );
          return;
        }

        permissionsRegistry.addPermissions([  
          unleashFlagReadPermission,
          unleashFlagTogglePermission,
          unleashVariantManagePermission,
        ]);

        
        const unleashUrl = unleashConfig.getString('url');
        const unleashToken = unleashConfig.getString('apiToken');
        const editableEnvs =
          unleashConfig.getOptionalStringArray('editableEnvs') ?? [];
        const numEnvs = unleashConfig.getOptionalNumber('numEnvs') ?? 4;

        httpRouter.use(
          await createRouter({
            logger,
            unleashUrl,
            unleashToken,
            editableEnvs,
            numEnvs,
            httpAuth,
            permissions,
            catalog,
          }),
        );

        // Health endpoint doesn't require auth
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });

        logger.info(`Unleash plugin initialized with URL: ${unleashUrl}`);
      },
    });
  },
});
