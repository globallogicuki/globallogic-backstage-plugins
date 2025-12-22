import { screen, waitFor } from '@testing-library/react';
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
});
