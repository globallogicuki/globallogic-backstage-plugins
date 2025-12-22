import { FeatureFlag } from '@internal/backstage-plugin-unleash-common';

export const mockFeatureFlag: FeatureFlag = {
  name: 'test-flag',
  description: 'A test feature flag',
  type: 'release',
  stale: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  project: 'test-project',
  environments: [
    {
      name: 'development',
      enabled: true,
      strategies: [
        {
          id: 'strategy-1',
          name: 'default',
          parameters: {},
        },
      ],
    },
    {
      name: 'production',
      enabled: false,
      strategies: [],
    },
  ],
};

export const mockFeatureFlagsList = {
  features: [
    mockFeatureFlag,
    {
      ...mockFeatureFlag,
      name: 'another-flag',
      description: 'Another test flag',
      type: 'experiment' as const,
      stale: true,
    },
  ],
};
