import { Entity } from '@backstage/catalog-model';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-service',
    title: 'Test Service',
    namespace: 'default',
    annotations: {
      'unleash.io/project-id': 'test-project',
      'unleash.io/environment': 'development',
    },
  },
  spec: {
    owner: 'team-test',
    type: 'service',
    lifecycle: 'production',
  },
};

export const mockEntityWithoutAnnotation: Entity = {
  ...mockEntity,
  metadata: {
    ...mockEntity.metadata,
    annotations: {},
  },
};
