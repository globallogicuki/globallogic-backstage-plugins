import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import terraformPlugin from '@globallogicuki/backstage-plugin-terraform/alpha';
import unleashPlugin from '@globallogicuki/backstage-plugin-unleash/alpha';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';

export default createApp({
  features: [
    catalogPlugin,
    terraformPlugin,
    unleashPlugin,
    navModule,
    homeModule,
  ],
});
