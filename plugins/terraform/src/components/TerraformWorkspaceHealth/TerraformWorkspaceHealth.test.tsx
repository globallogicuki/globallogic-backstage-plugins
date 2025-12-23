import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { AssessmentResult } from '../../hooks/types.ts';
import {
  createDriftUrl,
  createValidationChecksUrl,
} from '../../utils/index.ts';
import { TerraformWorkspaceHealth } from './TerraformWorkspaceHealth';

jest.mock('../../utils', () => ({
  createDriftUrl: jest.fn(() => 'mock-drift-url'),
  createValidationChecksUrl: jest.fn(() => 'mock-validation-url'),
}));

jest.mock('../TerraformDrift', () => ({
  TerraformDrift: jest.fn(() => (
    <div data-testid="drift-card-mock">TerraformDriftCard Mock</div>
  )),
}));

jest.mock('../TerraformValidationChecks', () => ({
  TerraformValidationChecks: jest.fn(() => (
    <div data-testid="validation-card-mock">
      TerraformValidationChecksCard Mock
    </div>
  )),
}));

describe('TerraformWorkspaceHealth Component', () => {
  const mockAssessmentResult: AssessmentResult = {
    id: 'test-id',
    createdAt: '2024-01-01T00:00:00.000Z',
    workspaceId: 'test-workspace-id',
    workspaceName: 'test-workspace',
    driftMetrics: {
      drifted: true,
      resourcesDrifted: 5,
      resourcesUndrifted: 10,
    },
    validationMetrics: {
      allChecksSucceeded: false,
      checksErrored: 1,
      checksFailed: 2,
      checksPassed: 3,
      checksUnknown: 4,
    },
  };

  const organizationName = 'organizationName';
  const mockTerraformBaseUrl = 'https://tf.example.com';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the workspace name', () => {
    renderInTestApp(
      <TerraformWorkspaceHealth
        data={mockAssessmentResult}
        organizationName={organizationName}
      />,
    );
    const workspaceNameElement = screen.getByText('test-workspace');
    expect(workspaceNameElement).toBeInTheDocument();
  });

  it('renders the TerraformDriftCard and TerraformValidationChecksCard by default', () => {
    renderInTestApp(
      <TerraformWorkspaceHealth
        data={mockAssessmentResult}
        organizationName={organizationName}
      />,
    );
    const driftCard = screen.getByTestId('drift-card-mock');
    const validationCard = screen.getByTestId('validation-card-mock');
    expect(driftCard).toBeInTheDocument();
    expect(validationCard).toBeInTheDocument();
  });

  it('does not render TerraformDriftCard when showDrift is false', () => {
    renderInTestApp(
      <TerraformWorkspaceHealth
        data={mockAssessmentResult}
        showDrift={false}
        organizationName={organizationName}
      />,
    );
    const driftCard = screen.queryByTestId('drift-card-mock');
    expect(driftCard).not.toBeInTheDocument();
    const validationCard = screen.getByTestId('validation-card-mock');
    expect(validationCard).toBeInTheDocument();
  });

  it('does not render TerraformValidationChecksCard when showValidationChecks is false', () => {
    renderInTestApp(
      <TerraformWorkspaceHealth
        data={mockAssessmentResult}
        showValidationChecks={false}
        organizationName={organizationName}
      />,
    );
    const driftCard = screen.getByTestId('drift-card-mock');
    const validationCard = screen.queryByTestId('validation-card-mock');
    expect(driftCard).toBeInTheDocument();
    expect(validationCard).not.toBeInTheDocument();
  });

  it('renders neither card when both showDrift and showValidationChecks are false', () => {
    renderInTestApp(
      <TerraformWorkspaceHealth
        data={mockAssessmentResult}
        showDrift={false}
        showValidationChecks={false}
        organizationName={organizationName}
      />,
    );
    const driftCard = screen.queryByTestId('drift-card-mock');
    const validationCard = screen.queryByTestId('validation-card-mock');
    expect(driftCard).not.toBeInTheDocument();
    expect(validationCard).not.toBeInTheDocument();
  });

  it('calls createDriftUrl with the correct parameters', () => {
    renderInTestApp(
      <TerraformWorkspaceHealth
        data={mockAssessmentResult}
        organizationName={organizationName}
        terraformBaseUrl={mockTerraformBaseUrl}
      />,
    );
    expect(createDriftUrl).toHaveBeenCalledWith(
      mockTerraformBaseUrl,
      organizationName,
      mockAssessmentResult.workspaceName,
    );
    expect(createDriftUrl).toHaveBeenCalledTimes(1); // It's called once for the terraformDriftUrl prop
  });

  it('calls createValidationChecksUrl with the correct parameters', () => {
    renderInTestApp(
      <TerraformWorkspaceHealth
        data={mockAssessmentResult}
        organizationName={organizationName}
        terraformBaseUrl={mockTerraformBaseUrl}
      />,
    );
    expect(createValidationChecksUrl).toHaveBeenCalledWith(
      mockTerraformBaseUrl,
      organizationName,
      mockAssessmentResult.workspaceName,
    );
    expect(createValidationChecksUrl).toHaveBeenCalledTimes(1); // It's called once for the terraformValidationChecksUrl prop
  });
});
