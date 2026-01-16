import {
  FrontendPlugin,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { rootRouteRef } from '../routes';
import { unleashApi } from './api';
import { unleashContent } from './entityContent';
import { EntityUnleashCard } from './entityCards';
import { unleashPage, unleashNavItem } from './page';

const plugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'unleash',
  extensions: [
    unleashApi,
    unleashPage,
    unleashNavItem,
    EntityUnleashCard,
    unleashContent,
  ],
  routes: convertLegacyRouteRefs({ root: rootRouteRef }),
  info: {
    packageJson: () => import('../../package.json'),
  },
});

export default plugin;
