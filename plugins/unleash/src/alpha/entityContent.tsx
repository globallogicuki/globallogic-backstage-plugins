import { ExtensionDefinition } from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from '../routes';
import { isUnleashAvailable } from '@globallogicuki/backstage-plugin-unleash-common';

export const unleashContent: ExtensionDefinition = EntityContentBlueprint.make({
  name: 'unleash',
  params: {
    path: '/unleash',
    title: 'Feature Flags',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    filter: isUnleashAvailable,
    loader: () =>
      import('../components/EntityUnleashContent').then(m =>
        compatWrapper(<m.EntityUnleashContent />),
      ),
  },
});
