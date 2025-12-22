import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createRouter } from './router';

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
        catalog: catalogServiceRef,
      },
      async init({
        logger,
        httpAuth,
        httpRouter,
        config,
        permissions,
        catalog,
      }) {
        const unleashConfig = config.getOptionalConfig('unleash');

        if (!unleashConfig) {
          logger.warn(
            'Unleash configuration not found, plugin will not be enabled',
          );
          return;
        }

        const unleashUrl = unleashConfig.getString('url');
        const unleashToken = unleashConfig.getString('apiToken');
        const editableEnvs =
          unleashConfig.getOptionalStringArray('editableEnvs') ?? [];
        const numEnvs = unleashConfig.getOptionalNumber('numEnvs') ?? 4;
        const enablePermissions =
          unleashConfig.getOptionalBoolean('enablePermissions') ?? true;

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
            enablePermissions,
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
