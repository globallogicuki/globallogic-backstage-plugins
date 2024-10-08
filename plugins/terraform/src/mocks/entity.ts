import { Entity } from '@backstage/catalog-model';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'mock-component-entity',
    title: 'Mock Component Entity',
    namespace: 'default',
    annotations: {
      'terraform/organization': 'gluk',
      'terraform/workspaces': 'terraform-cloud-gluk-project-config,workspace-2',
    },
    spec: {
      owner: 'guest',
      type: 'service',
      lifecycle: 'production',
    },
  },
};
