import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Terraform } from './Terraform';
import { mockEntity } from '../../mocks/entity';

jest.mock('../TerraformRuns', () => {
  const MockTerraformRuns = () => <div>Mock TerraformRuns</div>;
  return { TerraformRuns: MockTerraformRuns };
});

jest.mock('../TerraformWorkspaceHealthAssessments', () => {
  const MockTerraformWorkspaceHealthAssessments = () => (
    <div>Mock TerraformWorkspaceHealthAssessments</div>
  );
  return {
    TerraformWorkspaceHealthAssessments:
      MockTerraformWorkspaceHealthAssessments,
  };
});

describe('Terraform', () => {
  it('renders TerraformRuns and TerraformWorkspaceHealthAssessments when annotation is present', async () => {
    renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <Terraform />
      </EntityProvider>,
    );

    const mockTerraformRunsText = await screen.findByText('Mock TerraformRuns');
    expect(mockTerraformRunsText).toBeInTheDocument();

    const mockTerraformWorkspaceHealthAssessmentsText = await screen.findByText(
      'Mock TerraformWorkspaceHealthAssessments',
    );
    expect(mockTerraformWorkspaceHealthAssessmentsText).toBeInTheDocument();

    jest.clearAllMocks();
  });

  it('renders MissingAnnotationEmptyState when annotation is not present', async () => {
    // If the following is refactored, ensure it is cloning mockEntity, and not merely referencing it!
    const missingAnnotation = JSON.parse(JSON.stringify(mockEntity));
    missingAnnotation.metadata.annotations = {};

    renderInTestApp(
      <EntityProvider entity={missingAnnotation}>
        <Terraform />
      </EntityProvider>,
    );

    const missingAnnotationText = await screen.findByText('Missing Annotation');

    expect(missingAnnotationText).toBeInTheDocument();
  });
});
