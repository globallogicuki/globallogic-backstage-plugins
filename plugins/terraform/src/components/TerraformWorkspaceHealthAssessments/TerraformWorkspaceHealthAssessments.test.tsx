import { screen } from '@testing-library/react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp } from '@backstage/frontend-test-utils';
import useAssessmentResults from '../../hooks/useAssessmentResults';
import { mockEntity } from '../../mocks/entity';
import { TerraformWorkspaceHealthAssessments } from './TerraformWorkspaceHealthAssessments';

jest.mock('../../hooks/useAssessmentResults');

jest.mock('../TerraformWorkspaceHealth', () => ({
  TerraformWorkspaceHealth: ({ data }: any) => (
    <div data-testid={`health-card-${data.id}`}>
      Health Card for {data.workspaceName}
    </div>
  ),
}));

describe('TerraformWorkspaceHealthAssessments', () => {
  const refetchMock = jest.fn(() => {});

  beforeEach(() => {
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

    renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <TerraformWorkspaceHealthAssessments />
      </EntityProvider>,
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

    renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <TerraformWorkspaceHealthAssessments />
      </EntityProvider>,
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

  it('overrides heading with title property value if provided', async () => {
    const mockData = [
      { id: '1', workspaceName: 'workspaceA', health: 'healthy' },
      { id: '2', workspaceName: 'workspaceB', health: 'warning' },
    ];

    const overriddenTitle = 'Title Override';

    (useAssessmentResults as jest.Mock).mockReturnValue({
      data: mockData,
      error: undefined,
      isLoading: false,
      refetch: refetchMock,
    });

    renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <TerraformWorkspaceHealthAssessments title={overriddenTitle} />
      </EntityProvider>,
    );

    expect(screen.getByText(overriddenTitle)).toBeInTheDocument();
  });

  it('renders no TerraformWorkspaceHealthCard components when data is an empty array', async () => {
    (useAssessmentResults as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      refetch: refetchMock,
    });

    renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <TerraformWorkspaceHealthAssessments />
      </EntityProvider>,
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
    renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <TerraformWorkspaceHealthAssessments />
      </EntityProvider>,
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
    renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <TerraformWorkspaceHealthAssessments />
      </EntityProvider>,
    );
  });

  it('calls refetch when refresh is clicked', async () => {
    (useAssessmentResults as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      refetch: refetchMock,
    });

    renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <TerraformWorkspaceHealthAssessments />
      </EntityProvider>,
    );

    const refresh = await screen.findByLabelText('Refresh');
    refresh.click();
    expect(refetchMock).toHaveBeenCalledTimes(2);
  });
});
