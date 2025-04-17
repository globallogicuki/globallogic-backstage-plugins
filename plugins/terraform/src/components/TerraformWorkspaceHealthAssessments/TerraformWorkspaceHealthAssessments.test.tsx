import React from 'react';
import { render, screen } from '@testing-library/react';
import useAssessmentResults from '../../hooks/useAssessmentResults';
import { TerraformWorkspaceHealthAssessments } from './TerraformWorkspaceHealthAssessments';

// Mock the useAssessmentResults hook
jest.mock('../../hooks/useAssessmentResults');

// Mock the TerraformWorkspaceHealthCard component
jest.mock('../TerraformWorkspaceHealth/TerraformWorkspaceHealth', () => {
  return function MockTerraformWorkspaceHealthCard({ data }: { data: any }) {
    return (
      <div data-testid={`health-card-${data.id}`}>
        Health Card for {data.workspaceName}
      </div>
    );
  };
});

describe('TerraformWorkspaceHealthAssessments', () => {
  const refetchMock = jest.fn(() => {});

  const mockOrganization = 'test-org';
  const mockWorkspaceNames = ['workspace1', 'workspace2'];

  beforeEach(() => {
    // Reset the mock before each test
    (useAssessmentResults as jest.Mock).mockReset();
  });

  afterEach(() => {
    (useAssessmentResults as jest.Mock).mockRestore();
    refetchMock.mockReset();
  });

  it('renders loading indicator when isLoading is true', () => {
    (useAssessmentResults as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      refetch: refetchMock,
    });

    render(
      <TerraformWorkspaceHealthAssessments
        organization={mockOrganization}
        workspaceNames={mockWorkspaceNames}
      />,
    );

    expect(
      screen.getByRole('progressbar', { name: /Getting health assessments/i }),
    ).toBeInTheDocument();
  });

  it('renders "Workspace Health" title, refresh button and health cards when data is present', async () => {
    const mockData = [
      { id: '1', workspaceName: 'workspaceA', health: 'healthy' },
      { id: '2', workspaceName: 'workspaceB', health: 'warning' },
    ];
    (useAssessmentResults as jest.Mock).mockReturnValue({
      data: mockData,
      error: undefined,
      isLoading: false,
      refetch: refetchMock,
    });

    render(
      <TerraformWorkspaceHealthAssessments
        organization={mockOrganization}
        workspaceNames={mockWorkspaceNames}
      />,
    );

    expect(screen.getByText('Workspace Health')).toBeInTheDocument();
    const refresh = await screen.findByLabelText('Refresh');
    expect(refresh).toBeInTheDocument();

    mockData.forEach(assessment => {
      expect(
        screen.getByTestId(`health-card-${assessment.id}`),
      ).toBeInTheDocument();
    });
  });

  it('renders no TerraformWorkspaceHealthCard components when data is an empty array', async () => {
    (useAssessmentResults as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      refetch: refetchMock,
    });

    render(
      <TerraformWorkspaceHealthAssessments
        organization={mockOrganization}
        workspaceNames={mockWorkspaceNames}
      />,
    );

    expect(screen.queryByTestId('health-card-1')).toBeNull();
    expect(screen.queryByTestId('health-card-2')).toBeNull();
  });

  it('calls refetch function from useAssessmentResults on component mount', async () => {
    (useAssessmentResults as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      refetch: refetchMock,
    });

    render(
      <TerraformWorkspaceHealthAssessments
        organization={mockOrganization}
        workspaceNames={mockWorkspaceNames}
      />,
    );

    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('renders with the correct organization and workspaceNames passed to the hook', async () => {
    (useAssessmentResults as jest.Mock).mockImplementation((org, names) => {
      expect(org).toEqual('different-org');
      expect(names).toEqual(['ws3', 'ws4']);
      return {
        data: [],
        error: undefined,
        isLoading: false,
        refetch: refetchMock,
      };
    });
    (useAssessmentResults as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      refetch: refetchMock,
    });

    render(
      <TerraformWorkspaceHealthAssessments
        organization="different-org"
        workspaceNames={['ws3', 'ws4']}
      />,
    );
  });

  it('calls refetch when refresh is clicked', async () => {
    (useAssessmentResults as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      refetch: refetchMock,
    });

    render(
      <TerraformWorkspaceHealthAssessments
        organization={mockOrganization}
        workspaceNames={mockWorkspaceNames}
      />,
    );

    const refresh = await screen.findByLabelText('Refresh');
    refresh.click();
    expect(refetchMock).toHaveBeenCalledTimes(2);
  });
});
