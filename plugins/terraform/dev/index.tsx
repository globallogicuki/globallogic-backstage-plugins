import { createDevApp } from '@backstage/dev-utils';
import { terraformPlugin, EntityTerraformContent } from '../src/plugin';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { mockEntity } from '../src/mocks/entity';

createDevApp()
  .registerPlugin(terraformPlugin)
  .addPage({
    element: (
      <div style={{ padding: '1rem' }}>
        <EntityProvider entity={mockEntity}>
          <EntityTerraformContent />
        </EntityProvider>
      </div>
    ),
    title: 'Entity Page',
    path: '/catalog/default/component/mock-component-entity/terraform',
  })
  .render();
