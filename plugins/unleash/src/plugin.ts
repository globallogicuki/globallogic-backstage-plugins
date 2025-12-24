import {
  createPlugin,
  createRoutableExtension,
  createComponentExtension,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { unleashApiRef, UnleashApiClient } from './api';
import { rootRouteRef } from './routes';

export const unleashPlugin = createPlugin({
  id: 'unleash',
  apis: [
    createApiFactory({
      api: unleashApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new UnleashApiClient(discoveryApi, fetchApi),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * Entity overview card showing feature flag summary
 */
export const EntityUnleashCard = unleashPlugin.provide(
  createComponentExtension({
    name: 'EntityUnleashCard',
    component: {
      lazy: () =>
        import('./components/EntityUnleashCard').then(m => m.EntityUnleashCard),
    },
  }),
);

/**
 * Full entity tab content for managing feature flags
 */
export const EntityUnleashContent = unleashPlugin.provide(
  createRoutableExtension({
    name: 'EntityUnleashContent',
    component: () =>
      import('./components/EntityUnleashContent').then(
        m => m.EntityUnleashContent,
      ),
    mountPoint: rootRouteRef,
  }),
);

/**
 * Standalone page for feature flag management
 */
export const UnleashPage = unleashPlugin.provide(
  createRoutableExtension({
    name: 'UnleashPage',
    component: () =>
      import('./components/UnleashPage').then(m => m.UnleashPage),
    mountPoint: rootRouteRef,
  }),
);
