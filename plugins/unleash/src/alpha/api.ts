import {
  ApiBlueprint,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { UnleashApiClient, unleashApiRef } from '../api';

export const unleashApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: unleashApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new UnleashApiClient(discoveryApi, fetchApi),
    }),
});
