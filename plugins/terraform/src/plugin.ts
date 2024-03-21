/* eslint-disable new-cap */
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
      import('./components/Terraform').then(
        m => () => m.Terraform({ isCard: false }),
      ),
    mountPoint: rootRouteRef,
  }),
);

export const EntityTerraformCard = terraformPlugin.provide(
  createComponentExtension({
    name: 'EntityTerraformCard',
    component: {
      lazy: () =>
        import('./components/Terraform').then(
          m => () => m.Terraform({ isCard: true }),
        ),
    },
  }),
);
