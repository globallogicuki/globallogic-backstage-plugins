import { ExtensionDefinition } from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from '../routes';
import { isTerraformAvailable } from '../annotations';

export const terraformContent: ExtensionDefinition =
  EntityContentBlueprint.make({
    name: 'terraform',
    params: {
      path: '/terraform',
      title: 'Terraform',
      routeRef: convertLegacyRouteRef(rootRouteRef),
      filter: isTerraformAvailable,
      loader: () =>
        import('../components/Terraform').then(m =>
          compatWrapper(<m.Terraform isCard={false} />),
        ),
    },
  });
