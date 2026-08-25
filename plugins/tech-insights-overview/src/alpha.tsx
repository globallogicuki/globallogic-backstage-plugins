import {
  PageBlueprint,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import { rootRouteRef } from './routes';

/**
 * @alpha
 */
export const techInsightsOverviewPage = PageBlueprint.make({
  name: 'page',
  params: {
    path: '/tech-insights-overview',
    title: 'Tech Insights Overview',
    icon: <EqualizerIcon />,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('./TechInsightsOverviewPage').then(m => (
        <m.TechInsightsOverviewPage />
      )),
  },
});

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'tech-insights-overview',
  extensions: [techInsightsOverviewPage],
});
