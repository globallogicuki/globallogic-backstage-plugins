import {
  PageBlueprint,
  NavItemBlueprint,
} from '@backstage/frontend-plugin-api';
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
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('../components/UnleashPage').then(m =>
        compatWrapper(<m.UnleashPage />),
      ),
  },
});

export const unleashNavItem = NavItemBlueprint.make({
  name: 'nav-item',
  params: {
    routeRef: convertLegacyRouteRef(rootRouteRef),
    title: 'Feature Flags',
    icon: FlagIcon,
  },
});
