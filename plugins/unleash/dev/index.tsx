import { createDevApp } from '@backstage/dev-utils';
import { unleashPlugin, UnleashPage } from '../src/plugin';

createDevApp()
  .registerPlugin(unleashPlugin)
  .addPage({
    element: <UnleashPage />,
    title: 'Root Page',
    path: '/unleash',
  })
  .render();
