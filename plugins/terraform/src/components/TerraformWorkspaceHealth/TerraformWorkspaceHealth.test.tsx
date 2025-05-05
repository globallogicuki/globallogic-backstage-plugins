import { render, screen } from '@testing-library/react';
import TerraformWorkspaceHealth from './TerraformWorkspaceHealth';
import { AssessmentResult } from '../../hooks/types.ts';

// Mock child components
jest.mock('../TerraformDrift/TerraformDrift.tsx', () => ({
  __esModule: true,
  default: jest.fn(() => (
    <div data-testid="drift-card-mock">TerraformDriftCard Mock</div>
  )),
}));

jest.mock('../TerraformValidationChecks/TerraformValidationChecks.tsx', () => ({
  __esModule: true,
  default: jest.fn(() => (
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the workspace name', () => {
    render(<TerraformWorkspaceHealth data={mockAssessmentResult} />);
    const workspaceNameElement = screen.getByText('test-workspace');
    expect(workspaceNameElement).toBeInTheDocument();
  });

  it('renders the TerraformDriftCard and TerraformValidationChecksCard by default', () => {
    render(<TerraformWorkspaceHealth data={mockAssessmentResult} />);
    const driftCard = screen.getByTestId('drift-card-mock');
    const validationCard = screen.getByTestId('validation-card-mock');
    expect(driftCard).toBeInTheDocument();
    expect(validationCard).toBeInTheDocument();
  });

  it('does not render TerraformDriftCard when showDrift is false', () => {
    render(
      <TerraformWorkspaceHealth
        data={mockAssessmentResult}
        showDrift={false}
      />,
    );
    const driftCard = screen.queryByTestId('drift-card-mock');
    expect(driftCard).not.toBeInTheDocument();
    const validationCard = screen.getByTestId('validation-card-mock');
    expect(validationCard).toBeInTheDocument();
  });

  it('does not render TerraformValidationChecksCard when showValidationChecks is false', () => {
    render(
      <TerraformWorkspaceHealth
        data={mockAssessmentResult}
        showValidationChecks={false}
      />,
    );
    const driftCard = screen.getByTestId('drift-card-mock');
    const validationCard = screen.queryByTestId('validation-card-mock');
    expect(driftCard).toBeInTheDocument();
    expect(validationCard).not.toBeInTheDocument();
  });

  it('renders neither card when both showDrift and showValidationChecks are false', () => {
    render(
      <TerraformWorkspaceHealth
        data={mockAssessmentResult}
        showDrift={false}
        showValidationChecks={false}
      />,
    );
    const driftCard = screen.queryByTestId('drift-card-mock');
    const validationCard = screen.queryByTestId('validation-card-mock');
    expect(driftCard).not.toBeInTheDocument();
    expect(validationCard).not.toBeInTheDocument();
  });
});
