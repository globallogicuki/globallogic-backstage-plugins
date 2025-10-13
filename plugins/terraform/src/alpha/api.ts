import {
  ApiBlueprint,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { TerraformApiClient, terraformApiRef } from '../api';

export const terraformApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: terraformApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new TerraformApiClient({ discoveryApi, fetchApi }),
    }),
});
