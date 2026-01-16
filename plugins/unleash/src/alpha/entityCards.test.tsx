import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { EntityUnleashCard } from './entityCards';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { UnleashApi, unleashApiRef } from '../api';
import { mockEntity, mockFeatureFlagsList } from '../mocks';

describe('entityCards extension', () => {
  const mockUnleashApi = {
    getFlags: jest.fn().mockResolvedValue(mockFeatureFlagsList),
    getConfig: jest.fn().mockResolvedValue({ editableEnvs: [], numEnvs: 4 }),
  } as unknown as UnleashApi;

  describe('EntityUnleashCard', () => {
    it('should render EntityUnleashCard', async () => {
      renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            {createExtensionTester(EntityUnleashCard).reactElement()}
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(
        () => {
          expect(screen.getByText('Feature Flags')).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });
  });
});
