import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { terraformContent } from './entityContent';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TerraformApi, terraformApiRef } from '../api';
import { mockEntity, mockRuns } from '../mocks';

const getRunsMock = jest.fn().mockReturnValue(mockRuns);

describe('entityContent extension', () => {
  const mockTerraformApi = {
    getRuns: getRunsMock,
  } as unknown as TerraformApi;

  it('should render terraformContent', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[terraformApiRef, mockTerraformApi]]}>
        <EntityProvider entity={mockEntity}>
          {createExtensionTester(terraformContent).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('Runs for 2 workspaces')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
