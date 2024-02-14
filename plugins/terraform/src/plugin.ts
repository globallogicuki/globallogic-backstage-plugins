/* eslint-disable new-cap */
import {
  createPlugin,
  createRoutableExtension,
  createComponentExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const terraformPlugin = createPlugin({
  id: 'terraform',
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
