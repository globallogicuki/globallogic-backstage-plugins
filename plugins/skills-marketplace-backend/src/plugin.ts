import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * skillsMarketplacePlugin backend plugin
 *
 * @public
 */
export const skillsMarketplacePlugin = createBackendPlugin({
  pluginId: 'skills-marketplace',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        urlReader: coreServices.urlReader,
        cache: coreServices.cache,
      },
      async init({ httpRouter, logger, config, urlReader, cache }) {
        httpRouter.use(
          await createRouter({
            logger,
            config,
            urlReader,
            cache,
          }),
        );
      },
    });
  },
});
