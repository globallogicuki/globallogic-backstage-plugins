/**
 * Unleash plugin - New Frontend System
 * @packageDocumentation
 */

import type { ExtensionDefinition } from '@backstage/frontend-plugin-api';
import {
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { PageBlueprint, ApiBlueprint } from '@backstage/frontend-plugin-api';
import { unleashApiRef, UnleashApiClient } from './api';

/**
 * Unleash API Extension for the new frontend system
 *
 * @alpha
 */
export const unleashApiExtension: ExtensionDefinition<any> = ApiBlueprint.make({
  params: defineParams => defineParams({
    api: unleashApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      fetchApi: fetchApiRef,
    },
    factory: ({ discoveryApi, fetchApi }) =>
      new UnleashApiClient(discoveryApi, fetchApi),
  }),
});

/**
 * Unleash standalone page extension for the new frontend system
 *
 * @alpha
 */
export const unleashPageExtension = PageBlueprint.make({
  params: {
    path: '/unleash',
    loader: async () => {
      const { UnleashPage } = await import('./components/UnleashPage');
      return <UnleashPage />;
    },
  },
});

/**
 * Unleash entity card extension for the new frontend system
 *
 * @alpha
 */
export const unleashEntityCardExtension: ExtensionDefinition<any> = EntityCardBlueprint.make({
  params: {
    filter: 'kind:component',
    loader: async () => {
      const { EntityUnleashCard } = await import('./components/EntityUnleashCard');
      return <EntityUnleashCard />;
    },
  },
});

/**
 * Unleash entity content extension (tab) for the new frontend system
 *
 * @alpha
 */
export const unleashEntityContentExtension: ExtensionDefinition<any> = EntityContentBlueprint.make({
  params: {
    path: '/unleash',
    title: 'Unleash',
    filter: 'kind:component',
    loader: async () => {
      const { EntityUnleashContent } = await import('./components/EntityUnleashContent');
      return <EntityUnleashContent />;
    },
  },
});

/**
 * All Unleash extensions for the new frontend system
 *
 * @alpha
 */
const extensions: ExtensionDefinition<any>[] = [
  unleashApiExtension,
  unleashPageExtension,
  unleashEntityCardExtension,
  unleashEntityContentExtension,
];

export default extensions;
