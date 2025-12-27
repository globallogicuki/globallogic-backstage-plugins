import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { EntityUnleashContent } from './EntityUnleashContent';
import { unleashApiRef } from '../../api';
import { mockEntity, mockEntityWithoutAnnotation } from '../../mocks/entity';
import { mockFeatureFlagsList, mockFeatureFlag } from '../../mocks/flags';

describe('EntityUnleashContent', () => {
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

  describe('Empty States', () => {
    it('renders empty state when no project annotation is present', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntityWithoutAnnotation}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(
          screen.getByText('No Unleash project configured'),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Add the unleash.io\/project-id annotation/i),
      ).toBeInTheDocument();

      expect(mockUnleashApi.getFlags).not.toHaveBeenCalled();
      expect(mockUnleashApi.getConfig).not.toHaveBeenCalled();
    });

    it('renders empty state when no flags exist', async () => {
      mockUnleashApi.getFlags.mockResolvedValue({ features: [] });
      mockUnleashApi.getConfig.mockResolvedValue({ editableEnvs: [] });

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('No feature flags found')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Create some flags in Unleash first/i),
      ).toBeInTheDocument();
    });

    it('renders empty state when flags data is not an array', async () => {
      mockUnleashApi.getFlags.mockResolvedValue({ features: null });
      mockUnleashApi.getConfig.mockResolvedValue({ editableEnvs: [] });

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('No feature flags found')).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state while fetching data', async () => {
      mockUnleashApi.getFlags.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );
      mockUnleashApi.getConfig.mockImplementation(() => new Promise(() => {}));

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('shows error state when API fails', async () => {
      const error = new Error('API Error');
      mockUnleashApi.getFlags.mockRejectedValue(error);
      mockUnleashApi.getConfig.mockResolvedValue({ editableEnvs: [] });

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.queryByText('Feature Flags')).not.toBeInTheDocument();
      });

      expect(mockUnleashApi.getFlags).toHaveBeenCalledWith('test-project');
    });
  });

  describe('Feature Flags Display', () => {
    beforeEach(() => {
      mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });
    });

    it('renders feature flags successfully', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      expect(screen.getByText('test-flag')).toBeInTheDocument();
      expect(screen.getByText('another-flag')).toBeInTheDocument();
      expect(screen.getByText('A test feature flag')).toBeInTheDocument();
      expect(screen.getByText('Another test flag')).toBeInTheDocument();
    });

    it('displays flag types correctly', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('release')).toBeInTheDocument();
      });

      expect(screen.getByText('experiment')).toBeInTheDocument();
    });

    it('displays stale flag indicator', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Stale')).toBeInTheDocument();
      });
    });

    it('shows stale flags alert when stale flags exist', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            /Some flags are marked as stale and may no longer be in use/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('displays strategies information', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        const strategiesElements = screen.getAllByText('1 strategies');
        expect(strategiesElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Environment Tabs', () => {
    beforeEach(() => {
      mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });
    });

    it('renders environment tabs', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      expect(
        screen.getByRole('tab', { name: 'development' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: 'production' }),
      ).toBeInTheDocument();
    });

    it('switches between environments when tabs are clicked', async () => {
      const user = userEvent.setup();

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      // Default should be development (first environment)
      const developmentTab = screen.getByRole('tab', { name: 'development' });
      expect(developmentTab).toHaveAttribute('aria-selected', 'true');

      // Click production tab
      const productionTab = screen.getByRole('tab', { name: 'production' });
      await user.click(productionTab);

      await waitFor(() => {
        expect(productionTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('displays correct flag status per environment', async () => {
      const user = userEvent.setup();

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      // In development, flags should have strategies
      expect(screen.getAllByText('1 strategies').length).toBeGreaterThan(0);

      // Switch to production
      const productionTab = screen.getByRole('tab', { name: 'production' });
      await user.click(productionTab);

      await waitFor(() => {
        // Production environment has empty strategies array, so should show "0 strategies"
        expect(screen.getAllByText('0 strategies').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Flag Toggle', () => {
    beforeEach(() => {
      mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
    });

    it('renders editable toggle for editable environments', async () => {
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      // Should render switches for toggles (not chips)
      const switches = screen.getAllByRole('checkbox');
      expect(switches.length).toBeGreaterThan(0);
    });

    it('renders readonly chips for non-editable environments', async () => {
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: [],
      });

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      // Should render status chips instead of switches
      expect(screen.getAllByText('Enabled').length).toBeGreaterThan(0);
    });

    it('renders readonly chips for production environment when not editable', async () => {
      const user = userEvent.setup();
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      // Switch to production (not in editableEnvs)
      const productionTab = screen.getByRole('tab', { name: 'production' });
      await user.click(productionTab);

      await waitFor(() => {
        // Should show Disabled chip (not a switch)
        expect(screen.getAllByText('Disabled').length).toBeGreaterThan(0);
      });

      // Should not have switches in readonly mode
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });

  describe('Flag Details Modal', () => {
    beforeEach(() => {
      mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });
      mockUnleashApi.getFlag.mockResolvedValue(mockFeatureFlag);
    });

    it('opens flag details modal when info icon is clicked', async () => {
      const user = userEvent.setup();

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      // Find and click the info button
      const infoButtons = screen.getAllByTitle('View details');
      await user.click(infoButtons[0]);

      await waitFor(() => {
        // Modal should open with flag details
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(
          within(dialog).getByText('test-flag - development'),
        ).toBeInTheDocument();
      });

      expect(mockUnleashApi.getFlag).toHaveBeenCalledWith(
        'test-project',
        'test-flag',
      );
    });

    it('closes flag details modal when close button is clicked', async () => {
      const user = userEvent.setup();

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      // Open modal
      const infoButtons = screen.getAllByTitle('View details');
      await user.click(infoButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('opens modal when clicking "Has strategies" chip', async () => {
      const user = userEvent.setup();

      // Create a flag with hasStrategies flag but no strategies array
      const flagWithHasStrategies = {
        features: [
          {
            ...mockFeatureFlag,
            environments: [
              {
                name: 'development',
                enabled: true,
                hasStrategies: true,
              },
            ],
          },
        ],
      };

      mockUnleashApi.getFlags.mockResolvedValue(flagWithHasStrategies);

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      // Click the "Has strategies" chip
      const hasStrategiesChip = screen.getByText('Has strategies');
      await user.click(hasStrategiesChip);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Data Refresh', () => {
    it('fetches data on mount', async () => {
      mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(mockUnleashApi.getFlags).toHaveBeenCalledWith('test-project');
        expect(mockUnleashApi.getConfig).toHaveBeenCalled();
      });
    });
  });

  describe('Content Header', () => {
    beforeEach(() => {
      mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });
    });

    it('renders content header with title', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Feature Flags')).toBeInTheDocument();
      });

      expect(screen.getByTestId('header-title')).toHaveTextContent(
        'Feature Flags',
      );
    });
  });
});
