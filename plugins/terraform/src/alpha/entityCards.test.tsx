import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import {
  EntityTerraformCard,
  EntityTerraformLatestRunCard,
  EntityTerraformWorkspaceHealthAssessmentsCard,
} from './entityCards';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TerraformApi, terraformApiRef } from '../api';
import { mockEntity, mockRuns } from '../mocks';

describe('entityCards extension', () => {
  const mockTerraformApi = {
    getRuns: jest.fn().mockReturnValue(mockRuns),
    getLatestRun: jest.fn().mockReturnValue(mockRuns[0]),
    getAssessmentResultsForWorkspaces: jest.fn().mockReturnValue([]),
  } as unknown as TerraformApi;

  describe('EntityTerraformCard', () => {
    it('should render EntityTerraformCard', async () => {
      renderInTestApp(
        <TestApiProvider apis={[[terraformApiRef, mockTerraformApi]]}>
          <EntityProvider entity={mockEntity}>
            {createExtensionTester(EntityTerraformCard).reactElement()}
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

    it('should render EntityTerraformLatestRunCard', async () => {
      renderInTestApp(
        <TestApiProvider apis={[[terraformApiRef, mockTerraformApi]]}>
          <EntityProvider entity={mockEntity}>
            {createExtensionTester(EntityTerraformLatestRunCard).reactElement()}
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(
        () => {
          expect(
            screen.getByText('Latest Terraform run for workspaces'),
          ).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    it('should render EntityTerraformWorkspaceHealthAssessmentsCard', async () => {
      renderInTestApp(
        <TestApiProvider apis={[[terraformApiRef, mockTerraformApi]]}>
          <EntityProvider entity={mockEntity}>
            {createExtensionTester(
              EntityTerraformWorkspaceHealthAssessmentsCard,
            ).reactElement()}
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(
        () => {
          expect(screen.getByText('Workspace Health')).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });
  });
});
