import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { UnleashPermissionPolicy } from './permissionPolicy';

export const unleashPermissionPolicyModule = createBackendModule({
  pluginId: 'permission',
  moduleId: 'unleash-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint, logger: coreServices.logger },
      async init({ policy, logger }) {
        logger.info('Registering Unleash permission policy');
        policy.setPolicy(new UnleashPermissionPolicy(logger));
        logger.info('Unleash permission policy registered');
      },
    });
  },
});
