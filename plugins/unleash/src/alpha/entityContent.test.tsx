import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { unleashContent } from './entityContent';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { UnleashApi, unleashApiRef } from '../api';
import { mockEntity, mockFeatureFlagsList } from '../mocks';

describe('entityContent extension', () => {
  const mockUnleashApi = {
    getFlags: jest.fn().mockResolvedValue(mockFeatureFlagsList),
    getConfig: jest.fn().mockResolvedValue({ editableEnvs: [], numEnvs: 4 }),
  } as unknown as UnleashApi;

  it('should render unleashContent', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          {createExtensionTester(unleashContent).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
