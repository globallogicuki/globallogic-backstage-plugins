import { mockFeatureFlag } from '@globallogicuki/backstage-plugin-unleash-common';

export {
  mockFeatureFlag,
  mockFeatureFlagsList,
} from '@globallogicuki/backstage-plugin-unleash-common';

export const mockFeatureFlagsWithTags = {
  features: [
    {
      ...mockFeatureFlag,
      name: 'shared-flag',
      tags: [
        { type: 'component', value: 'service-a' },
        { type: 'component', value: 'service-b' },
      ],
    },
    {
      ...mockFeatureFlag,
      name: 'service-a-only',
      tags: [{ type: 'component', value: 'service-a' }],
    },
    {
      ...mockFeatureFlag,
      name: 'service-b-only',
      tags: [{ type: 'component', value: 'service-b' }],
    },
    {
      ...mockFeatureFlag,
      name: 'no-tags-flag',
      tags: [],
    },
  ],
};
