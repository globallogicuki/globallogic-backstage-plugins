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

// New-frontend-system render tests are heavy; give them headroom over the
// inner waitFor timeout so they don't flake against jest's 5s default.
jest.setTimeout(30000);

describe('entityCards extension', () => {
  const mockTerraformApi = {
    getRuns: jest.fn().mockReturnValue(mockRuns),
    getLatestRun: jest.fn().mockReturnValue(mockRuns[0]),
    getAssessmentResultsForWorkspaces: jest.fn().mockReturnValue([
      {
        id: 'asmt-1',
        createdAt: '2024-01-01T00:00:00Z',
        workspaceId: 'ws-1',
        workspaceName: 'test-workspace',
        driftMetrics: {
          drifted: false,
          resourcesDrifted: 0,
          resourcesUndrifted: 1,
        },
        validationMetrics: {
          allChecksSucceeded: true,
          checksErrored: 0,
          checksFailed: 0,
          checksPassed: 1,
          checksUnknown: 0,
        },
      },
    ]),
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
