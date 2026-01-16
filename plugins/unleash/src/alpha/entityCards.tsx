import { compatWrapper } from '@backstage/core-compat-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { isUnleashAvailable } from '@globallogicuki/backstage-plugin-unleash-common';

export const EntityUnleashCard = EntityCardBlueprint.make({
  name: 'EntityUnleashCard',
  params: {
    filter: isUnleashAvailable,
    loader: () =>
      import('../components/EntityUnleashCard').then(m =>
        compatWrapper(<m.EntityUnleashCard />),
      ),
  },
});
