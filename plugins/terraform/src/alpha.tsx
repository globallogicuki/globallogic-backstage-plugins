import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { PageBlueprint } from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from './routes';
import { terraformApi } from './api';

const EntityTerraformCard = EntityCardBlueprint.make({
  name: 'EntityTerraformCard',
  params: {
    loader: async () =>
      import('./components/Terraform').then(m =>
        compatWrapper(<m.Terraform isCard />),
      ),
  },
});

const EntityTerraformLatestRunCard = EntityCardBlueprint.make({
  name: 'EntityTerraformLatestRunCard',
  params: {
    loader: async () =>
      import('./components/TerraformLatestRun').then(m =>
        compatWrapper(<m.TerraformLatestRun />),
      ),
  },
});

const EntityTerraformWorkspaceHealthAssessmentsCard = EntityCardBlueprint.make({
  name: 'EntityTerraformWorkspaceHealthAssessmentsCard',
  params: {
    loader: async () =>
      import('./components/TerraformWorkspaceHealthAssessments').then(m =>
        compatWrapper(<m.TerraformWorkspaceHealthAssessments />),
      ),
  },
});

const terraformPage = PageBlueprint.make({
  params: {
    path: '/terraform',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('./components/Terraform').then(m =>
        compatWrapper(<m.Terraform isCard={false} />),
      ),
  },
});

export default createFrontendPlugin({
  pluginId: 'terraform',
  extensions: [
    terraformApi,
    terraformPage,
    EntityTerraformCard,
    EntityTerraformLatestRunCard,
    EntityTerraformWorkspaceHealthAssessmentsCard,
  ],
  routes: convertLegacyRouteRefs({ root: rootRouteRef }),
});
