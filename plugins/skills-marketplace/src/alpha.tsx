import {
  ApiBlueprint,
  PageBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import StorefrontIcon from '@material-ui/icons/Storefront';
import { SkillsMarketplaceClient, skillsMarketplaceApiRef } from './api';
import { rootRouteRef } from './routes';

/**
 * @alpha
 */
const skillsMarketplaceApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: skillsMarketplaceApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new SkillsMarketplaceClient({ discoveryApi, fetchApi }),
    }),
});

/**
 * @alpha
 */
const skillsMarketplacePage = PageBlueprint.make({
  name: 'page',
  params: {
    path: '/skills',
    title: 'Skill Marketplace',
    icon: <StorefrontIcon />,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('./SkillsMarketplacePage').then(m => <m.SkillsMarketplacePage />),
  },
});

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'skills-marketplace',
  extensions: [skillsMarketplaceApi, skillsMarketplacePage],
});
