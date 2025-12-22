import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { alertApiRef } from '@backstage/core-plugin-api';
import { FlagDetailsModal } from './FlagDetailsModal';
import { unleashApiRef } from '../../api';
import { mockFeatureFlag } from '../../mocks/flags';

jest.mock('../StrategyEditor', () => ({
  StrategyEditor: () => null,
}));

describe('FlagDetailsModal', () => {
  const mockUnleashApi = {
    getFlag: jest.fn(),
    updateStrategy: jest.fn(),
  };
  const mockAlertApi = { post: jest.fn() };

  const flagWithDetails = {
    ...mockFeatureFlag,
    stale: true,
    environments: [
      {
        name: 'development',
        enabled: true,
        strategies: [
          {
            id: 'strategy-1',
            name: 'default',
            parameters: { owner: 'team-a' },
            constraints: [
              {
                contextName: 'userId',
                operator: 'IN',
                values: ['a', 'b'],
              },
            ],
            segments: [1, 2],
            variants: [
              {
                name: 'variant-a',
                weight: 500,
                weightType: 'variable',
                payload: { type: 'string', value: 'a' },
              },
            ],
          },
        ],
      },
    ],
    variants: [{ name: 'flag-variant', weight: 50, weightType: 'variable' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while fetching flag data', async () => {
    mockUnleashApi.getFlag.mockImplementation(() => new Promise(() => {}));

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  it('renders details for the selected environment', async () => {
    mockUnleashApi.getFlag.mockResolvedValue(flagWithDetails);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('test-flag - development'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('release')).toBeInTheDocument();
    expect(screen.getByText('Stale')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Strategies (1)')).toBeInTheDocument();
    expect(screen.getByText('Parameters:')).toBeInTheDocument();
    expect(screen.getByText('Constraints:')).toBeInTheDocument();
    expect(screen.getAllByText('Variants (1)').length).toBeGreaterThan(0);
  });

  it('saves strategy updates and posts a success alert', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    mockUnleashApi.getFlag.mockResolvedValue(flagWithDetails);
    mockUnleashApi.updateStrategy.mockResolvedValue(undefined);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          open
          onClose={onClose}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Strategies (1)')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Edit strategy'));
    await user.click(screen.getByText('default'));

    const saveButton = await screen.findByRole('button', {
      name: 'Save Changes',
    });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUnleashApi.updateStrategy).toHaveBeenCalledWith(
        'test-project',
        'test-flag',
        'development',
        'strategy-1',
        expect.objectContaining({ id: 'strategy-1', name: 'default' }),
      );
    });

    expect(mockAlertApi.post).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Strategy updated successfully',
        severity: 'success',
      }),
    );
  });

  it('hides edit actions in readonly mode and closes via the button', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    mockUnleashApi.getFlag.mockResolvedValue(flagWithDetails);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          readonly
          open
          onClose={onClose}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Strategies (1)')).toBeInTheDocument();
    });

    expect(screen.queryByTitle('Edit strategy')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error message when save fails', async () => {
    const user = userEvent.setup();
    mockUnleashApi.getFlag.mockResolvedValue(flagWithDetails);
    mockUnleashApi.updateStrategy.mockRejectedValue(
      new Error('Failed to update'),
    );

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Strategies (1)')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Edit strategy'));
    await user.click(screen.getByText('default'));

    const saveButton = await screen.findByRole('button', {
      name: 'Save Changes',
    });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockAlertApi.post).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Failed to update strategy: Failed to update',
          severity: 'error',
        }),
      );
    });
  });

  it('handles failed flag fetch gracefully', async () => {
    mockUnleashApi.getFlag.mockResolvedValue(null);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load flag details')).toBeInTheDocument();
    });
  });

  it('cancels strategy editing without saving', async () => {
    const user = userEvent.setup();
    mockUnleashApi.getFlag.mockResolvedValue(flagWithDetails);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Strategies (1)')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Edit strategy'));
    await user.click(screen.getByText('default'));

    // Strategy editor should be visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Should return to view mode
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
    });

    expect(mockUnleashApi.updateStrategy).not.toHaveBeenCalled();
  });

  it('displays all environments when no environment specified', async () => {
    const flagWithMultipleEnvs = {
      ...mockFeatureFlag,
      environments: [
        {
          name: 'development',
          enabled: true,
          hasStrategies: true,
        },
        {
          name: 'staging',
          enabled: false,
          hasStrategies: false,
        },
        {
          name: 'production',
          enabled: true,
          hasStrategies: true,
        },
      ],
    };

    mockUnleashApi.getFlag.mockResolvedValue(flagWithMultipleEnvs);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('All Environments')).toBeInTheDocument();
    });

    expect(screen.getByText('development')).toBeInTheDocument();
    expect(screen.getByText('staging')).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();
  });

  it('handles flags without variants', async () => {
    const flagWithoutVariants = {
      ...mockFeatureFlag,
      variants: undefined,
      environments: [
        {
          name: 'development',
          enabled: true,
          strategies: [
            {
              id: 'strategy-1',
              name: 'default',
              parameters: {},
            },
          ],
        },
      ],
    };

    mockUnleashApi.getFlag.mockResolvedValue(flagWithoutVariants);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('test-flag - development')).toBeInTheDocument();
    });

    // Variants section should not be present
    expect(screen.queryByText(/^Variants \(\d+\)$/)).not.toBeInTheDocument();
  });

  it('handles strategies without constraints', async () => {
    const flagWithoutConstraints = {
      ...mockFeatureFlag,
      environments: [
        {
          name: 'development',
          enabled: true,
          strategies: [
            {
              id: 'strategy-1',
              name: 'default',
              parameters: {},
              constraints: [],
            },
          ],
        },
      ],
    };

    mockUnleashApi.getFlag.mockResolvedValue(flagWithoutConstraints);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Strategies (1)')).toBeInTheDocument();
    });

    // Expand the strategy accordion
    const user = userEvent.setup();
    await user.click(screen.getByText('default'));

    // Constraints section should not be present
    await waitFor(() => {
      expect(screen.queryByText('Constraints:')).not.toBeInTheDocument();
    });
  });

  it('handles strategies without parameters', async () => {
    const flagWithoutParameters = {
      ...mockFeatureFlag,
      environments: [
        {
          name: 'development',
          enabled: true,
          strategies: [
            {
              id: 'strategy-1',
              name: 'default',
              parameters: {},
            },
          ],
        },
      ],
    };

    mockUnleashApi.getFlag.mockResolvedValue(flagWithoutParameters);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Strategies (1)')).toBeInTheDocument();
    });

    // Expand the strategy accordion
    const user = userEvent.setup();
    await user.click(screen.getByText('default'));

    // Parameters section should not be present since parameters object is empty
    await waitFor(() => {
      expect(screen.queryByText('Parameters:')).not.toBeInTheDocument();
    });
  });

  it('displays saving state while updating strategy', async () => {
    const user = userEvent.setup();
    let resolveUpdate: () => void;
    mockUnleashApi.getFlag.mockResolvedValue(flagWithDetails);
    mockUnleashApi.updateStrategy.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveUpdate = resolve as () => void;
        }),
    );

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Strategies (1)')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Edit strategy'));
    await user.click(screen.getByText('default'));

    const saveButton = await screen.findByRole('button', {
      name: 'Save Changes',
    });
    await user.click(saveButton);

    // Check for saving state
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    // Cleanup: resolve the promise
    resolveUpdate!();
  });

  it('displays environment name in title when specified', async () => {
    mockUnleashApi.getFlag.mockResolvedValue(flagWithDetails);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagDetailsModal
          projectId="test-project"
          flagName="test-flag"
          environment="production"
          open
          onClose={jest.fn()}
        />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('test-flag - production')).toBeInTheDocument();
    });
  });
});
