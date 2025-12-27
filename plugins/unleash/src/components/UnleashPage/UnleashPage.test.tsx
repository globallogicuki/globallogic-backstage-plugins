import { screen, waitFor } from '@testing-library/react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { UnleashPage } from './UnleashPage';
import { unleashApiRef } from '../../api';
import type {
  ProjectSummary,
  EnvironmentSummary,
} from '@globallogicuki/backstage-plugin-unleash-common';

describe('UnleashPage', () => {
  const mockProjects: ProjectSummary[] = [
    {
      name: 'Project Alpha',
      id: 'alpha',
      description: 'First test project',
      health: 85,
      technicalDebt: 15,
      favorite: false,
      featureCount: 10,
      memberCount: 5,
      createdAt: '2024-01-01T00:00:00.000Z',
      archivedAt: null,
      mode: 'open',
      lastReportedFlagUsage: '2024-01-15T00:00:00.000Z',
      lastUpdatedAt: '2024-01-15T00:00:00.000Z',
      owners: [{ ownerType: 'user' }],
    },
    {
      name: 'Project Beta',
      id: 'beta',
      description: 'Second test project',
      health: 70,
      technicalDebt: 30,
      favorite: true,
      featureCount: 15,
      memberCount: 3,
      createdAt: '2024-01-05T00:00:00.000Z',
      archivedAt: null,
      mode: 'open',
      lastReportedFlagUsage: '2024-01-10T00:00:00.000Z',
      lastUpdatedAt: '2024-01-10T00:00:00.000Z',
      owners: [{ ownerType: 'user' }],
    },
    {
      name: 'Archived Project',
      id: 'archived',
      description: 'This should be filtered out',
      health: 60,
      technicalDebt: 40,
      favorite: false,
      featureCount: 5,
      memberCount: 2,
      createdAt: '2023-12-01T00:00:00.000Z',
      archivedAt: '2024-01-01T00:00:00.000Z',
      mode: 'open',
      lastReportedFlagUsage: null,
      lastUpdatedAt: null,
      owners: [{ ownerType: 'user' }],
    },
  ];

  const mockEnvironments: EnvironmentSummary[] = [
    {
      name: 'development',
      type: 'development',
      sortOrder: 1,
      enabled: true,
      protected: false,
      requiredApprovals: null,
      projectCount: 5,
      apiTokenCount: 2,
      enabledToggleCount: 20,
    },
    {
      name: 'production',
      type: 'production',
      sortOrder: 2,
      enabled: true,
      protected: true,
      requiredApprovals: 2,
      projectCount: 3,
      apiTokenCount: 1,
      enabledToggleCount: 15,
    },
    {
      name: 'disabled-env',
      type: 'test',
      sortOrder: 3,
      enabled: false,
      protected: false,
      requiredApprovals: null,
      projectCount: 1,
      apiTokenCount: 0,
      enabledToggleCount: 5,
    },
  ];

  const mockUnleashApi = {
    getConfig: jest.fn(),
    getFlags: jest.fn(),
    getFlag: jest.fn(),
    toggleFlag: jest.fn(),
    updateVariants: jest.fn(),
    getMetrics: jest.fn(),
    updateStrategy: jest.fn(),
    getProjects: jest.fn(),
    getEnvironments: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', async () => {
    mockUnleashApi.getProjects.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );
    mockUnleashApi.getEnvironments.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    expect(screen.getByTestId('progress')).toBeInTheDocument();
    expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    expect(
      screen.getByText('Manage feature flags across your organization'),
    ).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    const error = new Error('API Error');
    mockUnleashApi.getProjects.mockRejectedValue(error);
    mockUnleashApi.getEnvironments.mockRejectedValue(error);

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });

    // Verify the APIs were called
    expect(mockUnleashApi.getProjects).toHaveBeenCalled();
    expect(mockUnleashApi.getEnvironments).toHaveBeenCalled();
  });

  it('renders dashboard with projects and environments', async () => {
    mockUnleashApi.getProjects.mockResolvedValue({
      version: 1,
      projects: mockProjects,
    });
    mockUnleashApi.getEnvironments.mockResolvedValue({
      version: 1,
      environments: mockEnvironments,
    });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unleash Dashboard')).toBeInTheDocument();
    });

    // Check header
    expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    expect(
      screen.getByText('Manage feature flags across your organization'),
    ).toBeInTheDocument();

    // Check that projects are rendered (excluding archived)
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
    expect(screen.queryByText('Archived Project')).not.toBeInTheDocument();

    // Check that environments are rendered (excluding disabled)
    expect(screen.getAllByText('development').length).toBeGreaterThan(0);
    expect(screen.getAllByText('production').length).toBeGreaterThan(0);
    expect(screen.queryByText('disabled-env')).not.toBeInTheDocument();
  });

  it('displays correct summary metrics', async () => {
    mockUnleashApi.getProjects.mockResolvedValue({
      version: 1,
      projects: mockProjects,
    });
    mockUnleashApi.getEnvironments.mockResolvedValue({
      version: 1,
      environments: mockEnvironments,
    });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unleash Dashboard')).toBeInTheDocument();
    });

    // Total Projects (excluding archived): 2
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    const projectCards = screen.getAllByText('2');
    expect(projectCards.length).toBeGreaterThan(0);

    // Total Flags: 10 + 15 = 25
    expect(screen.getByText('Total Flags')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();

    // Avg Technical Debt: ((100-85) + (100-70)) / 2 = (15 + 30) / 2 = 22.5 rounded to 23
    expect(screen.getByText('Avg Technical Debt')).toBeInTheDocument();
    expect(screen.getByText('23%')).toBeInTheDocument();

    // Enabled Toggles (excluding disabled env): 20 + 15 = 35
    expect(screen.getByText('Enabled Toggles')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
  });

  it('filters out archived projects', async () => {
    mockUnleashApi.getProjects.mockResolvedValue({
      version: 1,
      projects: mockProjects,
    });
    mockUnleashApi.getEnvironments.mockResolvedValue({
      version: 1,
      environments: mockEnvironments,
    });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unleash Dashboard')).toBeInTheDocument();
    });

    // Archived project should not be displayed
    expect(screen.queryByText('Archived Project')).not.toBeInTheDocument();

    // Only active projects should be shown
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
  });

  it('filters out disabled environments', async () => {
    mockUnleashApi.getProjects.mockResolvedValue({
      version: 1,
      projects: mockProjects,
    });
    mockUnleashApi.getEnvironments.mockResolvedValue({
      version: 1,
      environments: mockEnvironments,
    });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unleash Dashboard')).toBeInTheDocument();
    });

    // Disabled environment should not be displayed
    expect(screen.queryByText('disabled-env')).not.toBeInTheDocument();

    // Only enabled environments should be shown
    expect(screen.getAllByText('development').length).toBeGreaterThan(0);
    expect(screen.getAllByText('production').length).toBeGreaterThan(0);
  });

  it('displays environment details correctly', async () => {
    mockUnleashApi.getProjects.mockResolvedValue({
      version: 1,
      projects: mockProjects,
    });
    mockUnleashApi.getEnvironments.mockResolvedValue({
      version: 1,
      environments: mockEnvironments,
    });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unleash Dashboard')).toBeInTheDocument();
    });

    // Check production environment chip
    const productionChips = screen.getAllByText('production');
    expect(productionChips.length).toBeGreaterThan(0);

    // Check protected badge
    expect(screen.getByText('Protected')).toBeInTheDocument();

    // Check environment stats
    expect(screen.getByText(/5 projects • 20 toggles/i)).toBeInTheDocument();
    expect(screen.getByText(/3 projects • 15 toggles/i)).toBeInTheDocument();
  });

  it('displays project details correctly', async () => {
    mockUnleashApi.getProjects.mockResolvedValue({
      version: 1,
      projects: mockProjects,
    });
    mockUnleashApi.getEnvironments.mockResolvedValue({
      version: 1,
      environments: mockEnvironments,
    });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unleash Dashboard')).toBeInTheDocument();
    });

    // Check project descriptions
    expect(screen.getByText('First test project')).toBeInTheDocument();
    expect(screen.getByText('Second test project')).toBeInTheDocument();

    // Check project details
    expect(screen.getByText(/Debt: 15%/i)).toBeInTheDocument();
    expect(screen.getByText(/10 flags/i)).toBeInTheDocument();
    expect(screen.getByText(/5 members/i)).toBeInTheDocument();

    expect(screen.getByText(/Debt: 30%/i)).toBeInTheDocument();
    expect(screen.getByText(/15 flags/i)).toBeInTheDocument();
    expect(screen.getByText(/3 members/i)).toBeInTheDocument();
  });

  it('handles empty projects and environments', async () => {
    mockUnleashApi.getProjects.mockResolvedValue({
      version: 1,
      projects: [],
    });
    mockUnleashApi.getEnvironments.mockResolvedValue({
      version: 1,
      environments: [],
    });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unleash Dashboard')).toBeInTheDocument();
    });

    // Metrics should show 0
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('Total Flags')).toBeInTheDocument();
    expect(screen.getByText('Avg Technical Debt')).toBeInTheDocument();
    expect(screen.getByText('Enabled Toggles')).toBeInTheDocument();

    // Should display 0 for all metrics
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues.length).toBeGreaterThanOrEqual(3);
  });

  it('handles projects without descriptions', async () => {
    const projectsWithoutDesc = [
      {
        ...mockProjects[0],
        description: undefined,
      },
    ];

    mockUnleashApi.getProjects.mockResolvedValue({
      version: 1,
      projects: projectsWithoutDesc,
    });
    mockUnleashApi.getEnvironments.mockResolvedValue({
      version: 1,
      environments: mockEnvironments,
    });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unleash Dashboard')).toBeInTheDocument();
    });

    // Project should still be rendered
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    // But description should not be present
    expect(screen.queryByText('First test project')).not.toBeInTheDocument();
  });

  it('calculates technical debt as inverse of health', async () => {
    const projectWith100Health: ProjectSummary = {
      ...mockProjects[0],
      health: 100,
    };

    const projectWith0Health: ProjectSummary = {
      ...mockProjects[1],
      health: 0,
    };

    mockUnleashApi.getProjects.mockResolvedValue({
      version: 1,
      projects: [projectWith100Health, projectWith0Health],
    });
    mockUnleashApi.getEnvironments.mockResolvedValue({
      version: 1,
      environments: mockEnvironments,
    });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <UnleashPage />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unleash Dashboard')).toBeInTheDocument();
    });

    // Avg Technical Debt: ((100-100) + (100-0)) / 2 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();

    // Individual project debt
    expect(screen.getByText(/Debt: 0%/i)).toBeInTheDocument(); // 100 health = 0% debt
    expect(screen.getByText(/Debt: 100%/i)).toBeInTheDocument(); // 0 health = 100% debt
  });
});
