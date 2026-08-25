import {
  createPlugin,
  createRoutableExtension,
  createComponentExtension,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { TerraformApiClient, terraformApiRef } from './api';

export const terraformPlugin = createPlugin({
  id: 'terraform',
  apis: [
    createApiFactory({
      api: terraformApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new TerraformApiClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const EntityTerraformContent = terraformPlugin.provide(
  createRoutableExtension({
    name: 'EntityTerraformContent',
    component: () =>
      import('./components/Terraform').then(m => {
        const TerraformContent = () => <m.Terraform isCard={false} />;
        return TerraformContent;
      }),
    mountPoint: rootRouteRef,
  }),
);

export const EntityTerraformCard = terraformPlugin.provide(
  createComponentExtension({
    name: 'EntityTerraformCard',
    component: {
      lazy: () =>
        import('./components/Terraform').then(m => {
          const TerraformCard = () => <m.Terraform isCard />;
          return TerraformCard;
        }),
    },
  }),
);

export const EntityTerraformLatestRunCard = terraformPlugin.provide(
  createComponentExtension({
    name: 'EntityTerraformLatestRunCard',
    component: {
      lazy: () =>
        import('./components/TerraformLatestRun').then(
          m => m.TerraformLatestRun,
        ),
    },
  }),
);

export const EntityTerraformWorkspaceHealthAssessmentsCard =
  terraformPlugin.provide(
    createComponentExtension({
      name: 'EntityTerraformWorkspaceHealthAssessmentsCard',
      component: {
        lazy: () =>
          import('./components/TerraformWorkspaceHealthAssessments').then(
            m => m.TerraformWorkspaceHealthAssessments,
          ),
      },
    }),
  );
