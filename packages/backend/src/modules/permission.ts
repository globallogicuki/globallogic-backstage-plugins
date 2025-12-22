import { createBackendModule } from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { CustomPermissionPolicy } from '../plugins/permission';

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'custom-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        console.log('[Permission Module] Registering custom permission policy');
        policy.setPolicy(new CustomPermissionPolicy());
        console.log('[Permission Module] Custom permission policy registered');
      },
    });
  },
});
