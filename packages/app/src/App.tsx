import { createApp } from '@backstage/frontend-defaults';
// Provides the tech-insights API used by the tech-insights-overview page.
import techInsightsPlugin from '@backstage-community/plugin-tech-insights/alpha';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import techInsightsOverviewPlugin from '@globallogicuki/backstage-plugin-tech-insights-overview/alpha';
import skillsMarketplacePlugin from '@globallogicuki/backstage-plugin-skills-marketplace/alpha';
import terraformPlugin from '@globallogicuki/backstage-plugin-terraform/alpha';
import unleashPlugin from '@globallogicuki/backstage-plugin-unleash/alpha';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';

export default createApp({
  features: [
    catalogPlugin,
    techInsightsOverviewPlugin,
    skillsMarketplacePlugin,
    techInsightsPlugin,
    terraformPlugin,
    unleashPlugin,
    navModule,
    homeModule,
  ],
});
