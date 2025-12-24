import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { CustomPermissionPolicy } from '../plugins/permission';

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'custom-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint, logger: coreServices.logger },
      async init({ policy, logger }) {
        logger.info('Registering custom permission policy');
        policy.setPolicy(new CustomPermissionPolicy(logger));
        logger.info('Custom permission policy registered');
      },
    });
  },
});
