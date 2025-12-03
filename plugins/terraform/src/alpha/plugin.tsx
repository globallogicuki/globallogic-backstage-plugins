import {
  FrontendPlugin,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { rootRouteRef } from '../routes';
import { terraformApi } from './api';
import { terraformContent } from './entityContent';
import {
  EntityTerraformCard,
  EntityTerraformLatestRunCard,
  EntityTerraformWorkspaceHealthAssessmentsCard,
} from './entityCards';

/**
 * @alpha
 */
const plugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'terraform',
  extensions: [
    terraformApi,
    terraformContent,
    EntityTerraformCard,
    EntityTerraformLatestRunCard,
    EntityTerraformWorkspaceHealthAssessmentsCard,
  ],
  routes: convertLegacyRouteRefs({ root: rootRouteRef }),
  info: {
    packageJson: () => import('../../package.json'),
  },
});

export default plugin;
