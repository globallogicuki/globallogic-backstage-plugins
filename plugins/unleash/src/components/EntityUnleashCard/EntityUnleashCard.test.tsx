import { screen, waitFor, fireEvent } from '@testing-library/react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { EntityUnleashCard } from './EntityUnleashCard';
import { unleashApiRef } from '../../api';
import { mockEntity, mockEntityWithoutAnnotation } from '../../mocks/entity';
import { mockFeatureFlagsList } from '../../mocks/flags';

describe('EntityUnleashCard', () => {
  const mockUnleashApi = {
    getConfig: jest.fn(),
    getFlags: jest.fn(),
    getFlag: jest.fn(),
    toggleFlag: jest.fn(),
    updateVariants: jest.fn(),
    getMetrics: jest.fn(),
    updateStrategy: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders feature flags when annotation is present', async () => {
    mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });

    expect(screen.getByText('test-flag')).toBeInTheDocument();
    expect(screen.getByText('another-flag')).toBeInTheDocument();
    expect(mockUnleashApi.getFlags).toHaveBeenCalledWith('test-project');
  });

  it('shows correct flag count', async () => {
    mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/of 2 flags enabled/i)).toBeInTheDocument();
    });
  });

  it('renders MissingAnnotationEmptyState when annotation is not present', async () => {
    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntityWithoutAnnotation}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/missing annotation/i)).toBeInTheDocument();
    });

    expect(mockUnleashApi.getFlags).not.toHaveBeenCalled();
  });

  it('shows loading state', async () => {
    mockUnleashApi.getFlags.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    const error = new Error('API Error');
    mockUnleashApi.getFlags.mockRejectedValue(error);

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    // Wait for error to be displayed (ResponseErrorPanel renders the error)
    await waitFor(() => {
      // Check that the error panel component is rendered
      expect(screen.queryByText('Feature Flags')).not.toBeInTheDocument();
    });

    // Verify the API was called
    expect(mockUnleashApi.getFlags).toHaveBeenCalledWith('test-project');
  });

  it('shows empty state when no flags exist', async () => {
    mockUnleashApi.getFlags.mockResolvedValue({ features: [] });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No feature flags found for this project/i),
      ).toBeInTheDocument();
    });
  });

  it('identifies stale flags', async () => {
    mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('stale')).toBeInTheDocument();
    });
  });

  it('opens details modal when flag name is clicked', async () => {
    mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
    mockUnleashApi.getConfig.mockResolvedValue({
      editableEnvs: [],
      numEnvs: 4,
    });
    mockUnleashApi.getFlag.mockResolvedValue(mockFeatureFlagsList.features[0]);

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('test-flag')).toBeInTheDocument();
    });

    // Click on flag name
    const flagName = screen.getByText('test-flag');
    fireEvent.click(flagName);

    // Modal should open
    await waitFor(() => {
      expect(mockUnleashApi.getFlag).toHaveBeenCalledWith(
        'test-project',
        'test-flag',
      );
    });
  });

  it('opens details modal when Enter key is pressed on flag name', async () => {
    mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
    mockUnleashApi.getConfig.mockResolvedValue({
      editableEnvs: [],
      numEnvs: 4,
    });
    mockUnleashApi.getFlag.mockResolvedValue(mockFeatureFlagsList.features[0]);

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('test-flag')).toBeInTheDocument();
    });

    // Press Enter on flag name
    const flagName = screen.getByText('test-flag');
    fireEvent.keyDown(flagName, { key: 'Enter', code: 'Enter' });

    // Modal should open
    await waitFor(() => {
      expect(mockUnleashApi.getFlag).toHaveBeenCalledWith(
        'test-project',
        'test-flag',
      );
    });
  });

  it('opens details modal when Space key is pressed on flag name', async () => {
    mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
    mockUnleashApi.getConfig.mockResolvedValue({
      editableEnvs: [],
      numEnvs: 4,
    });
    mockUnleashApi.getFlag.mockResolvedValue(mockFeatureFlagsList.features[0]);

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('test-flag')).toBeInTheDocument();
    });

    // Press Space on flag name
    const flagName = screen.getByText('test-flag');
    fireEvent.keyDown(flagName, { key: ' ', code: 'Space' });

    // Modal should open
    await waitFor(() => {
      expect(mockUnleashApi.getFlag).toHaveBeenCalledWith(
        'test-project',
        'test-flag',
      );
    });
  });

  it('does not open modal when other keys are pressed on flag name', async () => {
    mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
    mockUnleashApi.getConfig.mockResolvedValue({
      editableEnvs: [],
      numEnvs: 4,
    });

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('test-flag')).toBeInTheDocument();
    });

    // Press a different key
    const flagName = screen.getByText('test-flag');
    fireEvent.keyDown(flagName, { key: 'a', code: 'KeyA' });

    // Modal should not open
    expect(mockUnleashApi.getFlag).not.toHaveBeenCalled();
  });

  it('closes details modal when onClose is called', async () => {
    mockUnleashApi.getFlags.mockResolvedValue(mockFeatureFlagsList);
    mockUnleashApi.getConfig.mockResolvedValue({
      editableEnvs: [],
      numEnvs: 4,
    });
    mockUnleashApi.getFlag.mockResolvedValue(mockFeatureFlagsList.features[0]);

    await renderInTestApp(
      <TestApiProvider apis={[[unleashApiRef, mockUnleashApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityUnleashCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('test-flag')).toBeInTheDocument();
    });

    // Open modal
    const flagName = screen.getByText('test-flag');
    fireEvent.click(flagName);

    await waitFor(() => {
      expect(mockUnleashApi.getFlag).toHaveBeenCalled();
    });

    // Close modal
    const closeButton = await screen.findByText('Close');
    fireEvent.click(closeButton);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Close')).not.toBeInTheDocument();
    });
  });
});
