import { PageBlueprint } from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import FlagIcon from '@material-ui/icons/Flag';
import { rootRouteRef } from '../routes';

export const unleashPage = PageBlueprint.make({
  name: 'page',
  params: {
    path: '/unleash',
    title: 'Feature Flags',
    icon: <FlagIcon />,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('../components/UnleashPage').then(m =>
        compatWrapper(<m.UnleashPage />),
      ),
  },
});
