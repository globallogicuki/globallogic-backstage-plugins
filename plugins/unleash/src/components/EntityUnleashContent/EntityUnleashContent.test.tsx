import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { alertApiRef } from '@backstage/core-plugin-api';
import { EntityUnleashContent } from './EntityUnleashContent';
import { unleashApiRef } from '../../api';
import {
  mockEntity,
  mockEntityWithoutAnnotation,
  mockEntityWithFilterTags,
} from '../../mocks/entity';
import {
  mockFeatureFlagsList,
  mockFeatureFlag,
  mockFeatureFlagsWithTags,
} from '../../mocks/flags';

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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      });

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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      });

      expect(screen.getByText('release')).toBeInTheDocument();
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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      });

      // Stale flag indicator is shown as a warning icon with tooltip, not text
      expect(
        screen.getByTitle(
          'This flag is marked as stale and may no longer be in use',
        ),
      ).toBeInTheDocument();
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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          /Some flags are marked as stale and may no longer be in use/i,
        ),
      ).toBeInTheDocument();
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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      });

      const strategiesElements = screen.getAllByText('1 strategies');
      expect(strategiesElements.length).toBeGreaterThan(0);
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
        expect(
          screen.getByRole('tab', { name: 'development' }),
        ).toBeInTheDocument();
      });

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
        expect(
          screen.getByRole('tab', { name: 'development' }),
        ).toBeInTheDocument();
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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      });

      // Click the "Has strategies" chip
      const hasStrategiesChip = screen.getByText('Has strategies');
      await user.click(hasStrategiesChip);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('opens modal when clicking info icon button', async () => {
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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      });

      // Click the info icon button (View details)
      const infoButton = screen.getByTitle('View details');
      await user.click(infoButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('closes modal when clicking close button', async () => {
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
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      });

      // Open the modal
      const hasStrategiesChip = screen.getByText('Has strategies');
      await user.click(hasStrategiesChip);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close the modal by clicking the Close button
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Refresh', () => {
    const mockAlertApi = { post: jest.fn() };

    beforeEach(() => {
      mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });
      mockUnleashApi.toggleFlag.mockResolvedValue(undefined);
    });

    it('fetches data on mount', async () => {
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

    it('refreshes data after successfully toggling a flag', async () => {
      const user = userEvent.setup();

      await renderInTestApp(
        <TestApiProvider
          apis={[
            [unleashApiRef, mockUnleashApi],
            [alertApiRef, mockAlertApi],
          ]}
        >
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      });

      expect(mockUnleashApi.getFlags).toHaveBeenCalledTimes(1);

      const toggles = screen.getAllByRole('checkbox');
      await user.click(toggles[0]);

      await waitFor(() => {
        expect(screen.getByText('Confirm Flag Toggle')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(mockUnleashApi.toggleFlag).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockUnleashApi.getFlags).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Content Rendering', () => {
    beforeEach(() => {
      mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });
    });

    it('renders content with flags', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('test-flag')).toBeInTheDocument();
      });

      expect(screen.getByText('another-flag')).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(() => {
      mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsWithTags);
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });
    });

    it('renders backstage table component with flags', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('shared-flag')).toBeInTheDocument();
      });

      // Table should have environment tabs
      expect(
        screen.getByRole('tab', { name: 'development' }),
      ).toBeInTheDocument();
    });

    it('displays tag chips on flags', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('shared-flag')).toBeInTheDocument();
      });

      expect(screen.getAllByText('component:service-a').length).toBeGreaterThan(
        0,
      );
      expect(screen.getAllByText('component:service-b').length).toBeGreaterThan(
        0,
      );
    });
  });

  describe('Tag Filtering with Annotation Defaults', () => {
    beforeEach(() => {
      mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsWithTags);
      mockUnleashApi.getConfig.mockResolvedValue({
        editableEnvs: ['development'],
      });
    });

    it('applies default tag filter from annotation', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntityWithFilterTags}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('shared-flag')).toBeInTheDocument();
      });

      expect(screen.getByText('service-a-only')).toBeInTheDocument();

      // Flags without the matching tag should be filtered out
      expect(screen.queryByText('service-b-only')).not.toBeInTheDocument();
      expect(screen.queryByText('no-tags-flag')).not.toBeInTheDocument();
    });

    it('shows filtered flags with their tags', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntityWithFilterTags}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('shared-flag')).toBeInTheDocument();
      });

      // The filtered flags should display their tags
      const serviceAChips = screen.getAllByText('component:service-a');
      expect(serviceAChips.length).toBeGreaterThan(0);
    });

    it('displays active filter chips with remove buttons', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntityWithFilterTags}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Filtering by:')).toBeInTheDocument();
      });

      const filterChips = screen.getAllByText('component:service-a');
      expect(filterChips.length).toBeGreaterThan(0);
    });

    it('removes filter when clicking delete button on filter chip', async () => {
      const user = userEvent.setup();

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntityWithFilterTags}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('shared-flag')).toBeInTheDocument();
      });

      expect(screen.queryByText('service-b-only')).not.toBeInTheDocument();

      const filteringByText = screen.getByText('Filtering by:');
      const filterContainer = filteringByText.parentElement;
      const deleteButton = filterContainer?.querySelector(
        '.MuiChip-deleteIcon',
      );
      expect(deleteButton).toBeInTheDocument();
      await user.click(deleteButton!);

      await waitFor(() => {
        expect(screen.getByText('service-b-only')).toBeInTheDocument();
      });
    });

    it('shows reset filters button when filters have been modified', async () => {
      const user = userEvent.setup();

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntityWithFilterTags}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('shared-flag')).toBeInTheDocument();
      });

      expect(screen.queryByText('Reset filters')).not.toBeInTheDocument();

      const filteringByText = screen.getByText('Filtering by:');
      const filterContainer = filteringByText.parentElement;
      const deleteButton = filterContainer?.querySelector(
        '.MuiChip-deleteIcon',
      );
      await user.click(deleteButton!);

      await waitFor(() => {
        expect(screen.getByText('Reset filters')).toBeInTheDocument();
      });
    });

    it('resets filters when clicking reset button', async () => {
      const user = userEvent.setup();

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntityWithFilterTags}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('shared-flag')).toBeInTheDocument();
      });

      const filteringByText = screen.getByText('Filtering by:');
      const filterContainer = filteringByText.parentElement;
      const deleteButton = filterContainer?.querySelector(
        '.MuiChip-deleteIcon',
      );
      await user.click(deleteButton!);

      await waitFor(() => {
        expect(screen.getByText('service-b-only')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Reset filters'));

      await waitFor(() => {
        expect(screen.queryByText('service-b-only')).not.toBeInTheDocument();
      });
    });

    it('adds filter when clicking a tag in the table', async () => {
      const user = userEvent.setup();

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('shared-flag')).toBeInTheDocument();
      });

      expect(screen.queryByText('Filtering by:')).not.toBeInTheDocument();

      const tagChips = screen.getAllByText('component:service-a');
      await user.click(tagChips[0]);

      await waitFor(() => {
        expect(screen.getByText('Filtering by:')).toBeInTheDocument();
      });

      expect(screen.queryByText('service-b-only')).not.toBeInTheDocument();
    });

    it('does not add duplicate filter when clicking already active tag', async () => {
      const user = userEvent.setup();

      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntityWithFilterTags}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('shared-flag')).toBeInTheDocument();
      });

      const filterContainer = screen.getByText('Filtering by:').parentElement;
      const initialFilterCount =
        filterContainer?.querySelectorAll('.MuiChip-root').length;

      const tagChips = screen.getAllByText('component:service-a');
      await user.click(tagChips[1]);

      const finalFilterCount =
        filterContainer?.querySelectorAll('.MuiChip-root').length;
      expect(finalFilterCount).toBe(initialFilterCount);
    });

    it('does not show filter chips when no filters are configured', async () => {
      await renderInTestApp(
        <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
          <EntityProvider entity={mockEntity}>
            <EntityUnleashContent />
          </EntityProvider>
        </TestApiProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('shared-flag')).toBeInTheDocument();
      });

      expect(screen.queryByText('Filtering by:')).not.toBeInTheDocument();
    });
  });
});
