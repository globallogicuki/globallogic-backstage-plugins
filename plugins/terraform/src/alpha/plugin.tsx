import {
  FrontendPlugin,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { PageBlueprint } from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
// import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from '../routes';
import { terraformApi } from './api';

// /**
//  * @alpha
//  */
// const EntityTerraformCard = EntityCardBlueprint.make({
//   name: 'EntityTerraformCard',
//   params: {
//     filter: 'kind:component',
//     loader: async () =>
//       import('../components/Terraform').then(m =>
//         compatWrapper(<m.Terraform isCard />),
//       ),
//   },
// });

// /**
//  * @alpha
//  */
// const EntityTerraformLatestRunCard = EntityCardBlueprint.make({
//   name: 'EntityTerraformLatestRunCard',
//   params: {
//     filter: 'kind:component',
//     loader: async () =>
//       import('../components/TerraformLatestRun').then(m =>
//         compatWrapper(<m.TerraformLatestRun />),
//       ),
//   },
// });

// /**
//  * @alpha
//  */
// const EntityTerraformWorkspaceHealthAssessmentsCard = EntityCardBlueprint.make({
//   name: 'EntityTerraformWorkspaceHealthAssessmentsCard',
//   params: {
//     filter: 'kind:component',
//     loader: async () =>
//       import('../components/TerraformWorkspaceHealthAssessments').then(m =>
//         compatWrapper(<m.TerraformWorkspaceHealthAssessments />),
//       ),
//   },
// });

const terraformPage = PageBlueprint.make({
  params: {
    path: '/terraform',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('../components/Terraform').then(m =>
        compatWrapper(<m.Terraform isCard={false} />),
      ),
  },
});

/**
 * @alpha
 */
const plugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'terraform',
  extensions: [
    terraformApi,
    terraformPage,
    // EntityTerraformCard,
    // EntityTerraformLatestRunCard,
    // EntityTerraformWorkspaceHealthAssessmentsCard,
  ],
  routes: convertLegacyRouteRefs({ root: rootRouteRef }),
});

export default plugin;
