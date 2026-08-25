import {
  PageBlueprint,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import { z } from 'zod';
import { rootRouteRef } from './routes';

/**
 * Where the scorecard tab mounts under an entity page. The summary card's
 * footer links here, so the two are declared together.
 */
const SCORECARD_CONTENT_PATH = '/scorecard';

/**
 * Components only, matching the catalog-wide overview: logical groupings like
 * Systems have no source, image or docs of their own to satisfy a check.
 * Hosts widen or narrow this through the extension's `filter` config.
 */
const SCORECARD_ENTITY_FILTER = { kind: 'component' };

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
 * Overview card: the entity's score, a segmented meter, and only the checks
 * that are failing. Configure with
 * `entity-card:tech-insights-overview/scorecard: { config: { title, checkIds } }`.
 *
 * @alpha
 */
export const entityScorecardCard = EntityCardBlueprint.makeWithOverrides({
  name: 'scorecard',
  configSchema: {
    title: z.string().optional(),
    checkIds: z.array(z.string()).optional(),
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      filter: SCORECARD_ENTITY_FILTER,
      loader: () =>
        import('./scorecard').then(m => (
          <m.EntityScorecardSummaryCard
            title={config.title}
            checkIds={config.checkIds}
            contentPath={SCORECARD_CONTENT_PATH}
          />
        )),
    });
  },
});

/**
 * Entity page tab: every check with its description, failures first, each
 * with links to act on it. Configure with
 * `entity-content:tech-insights-overview/scorecard: { config: { title, description, checkIds } }`.
 *
 * @alpha
 */
export const entityScorecardContent = EntityContentBlueprint.makeWithOverrides({
  name: 'scorecard',
  configSchema: {
    description: z.string().optional(),
    checkIds: z.array(z.string()).optional(),
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      path: SCORECARD_CONTENT_PATH,
      title: 'Scorecard',
      filter: SCORECARD_ENTITY_FILTER,
      loader: () =>
        import('./scorecard').then(m => (
          <m.EntityScorecardContent
            title={config.title}
            description={config.description}
            checkIds={config.checkIds}
          />
        )),
    });
  },
});

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'tech-insights-overview',
  extensions: [
    techInsightsOverviewPage,
    entityScorecardCard,
    entityScorecardContent,
  ],
});
