// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';
import { createDevApp, EntityGridItem } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { unleashPlugin, UnleashPage, EntityUnleashCard } from '../src/plugin';
import { mockEntity } from '../src/mocks/entity';

const EntityCardTestPage = () => (
  <EntityProvider entity={mockEntity}>
    <EntityGridItem entity={mockEntity}>
      <EntityUnleashCard />
    </EntityGridItem>
  </EntityProvider>
);

createDevApp()
  .registerPlugin(unleashPlugin)
  .addPage({
    element: <UnleashPage />,
    title: 'Root Page',
    path: '/unleash',
  })
  .addPage({
    element: <EntityCardTestPage />,
    title: 'Entity Card',
    path: '/unleash/card',
  })
  .render();
