import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { alertApiRef } from '@backstage/core-plugin-api';
import { FlagToggle } from './FlagToggle';
import { unleashApiRef } from '../../api';

describe('FlagToggle', () => {
  const mockUnleashApi = {
    toggleFlag: jest.fn(),
  };
  const mockAlertApi = { post: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a readonly status chip', async () => {
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagToggle
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          enabled
          readonly
          onToggled={jest.fn()}
        />
      </TestApiProvider>,
    );

    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('confirms toggling and calls the API', async () => {
    const user = userEvent.setup();
    const onToggled = jest.fn();
    mockUnleashApi.toggleFlag.mockResolvedValue(undefined);

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagToggle
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          enabled={false}
          onToggled={onToggled}
        />
      </TestApiProvider>,
    );

    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByText('Confirm Flag Toggle')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockUnleashApi.toggleFlag).toHaveBeenCalledWith(
        'test-project',
        'test-flag',
        'development',
        true,
      );
    });

    expect(mockAlertApi.post).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
      }),
    );
    expect(onToggled).toHaveBeenCalled();
  });

  it('shows a permission error message when forbidden', async () => {
    const user = userEvent.setup();
    mockUnleashApi.toggleFlag.mockRejectedValue(
      new Error('Permission denied: not allowed'),
    );

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagToggle
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          enabled
          onToggled={jest.fn()}
        />
      </TestApiProvider>,
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockAlertApi.post).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            "You don't have permission to modify this flag. Only component owners can toggle flags.",
          severity: 'error',
        }),
      );
    });
  });

  it('closes the confirmation dialog when cancelled', async () => {
    const user = userEvent.setup();

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagToggle
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          enabled
          onToggled={jest.fn()}
        />
      </TestApiProvider>,
    );

    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByText('Confirm Flag Toggle')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(
        screen.queryByText('Confirm Flag Toggle'),
      ).not.toBeInTheDocument();
    });
  });

  it('disables toggle when disabled prop is true', async () => {
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagToggle
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          enabled={false}
          disabled
          onToggled={jest.fn()}
        />
      </TestApiProvider>,
    );

    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeDisabled();
  });

  it('shows loading state while toggling', async () => {
    const user = userEvent.setup();
    mockUnleashApi.toggleFlag.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100)),
    );

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagToggle
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          enabled={false}
          onToggled={jest.fn()}
        />
      </TestApiProvider>,
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    // Check that button shows loading state
    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });

    // Wait for toggle to complete
    await waitFor(() => {
      expect(mockUnleashApi.toggleFlag).toHaveBeenCalled();
    });
  });

  it('handles "not editable" environment error', async () => {
    const user = userEvent.setup();
    mockUnleashApi.toggleFlag.mockRejectedValue(
      new Error('Environment production is not editable'),
    );

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagToggle
          projectId="test-project"
          flagName="test-flag"
          environment="production"
          enabled
          onToggled={jest.fn()}
        />
      </TestApiProvider>,
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockAlertApi.post).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Environment production is not editable',
          severity: 'error',
        }),
      );
    });
  });

  it('handles "Forbidden" error', async () => {
    const user = userEvent.setup();
    mockUnleashApi.toggleFlag.mockRejectedValue(new Error('Forbidden'));

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagToggle
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          enabled
          onToggled={jest.fn()}
        />
      </TestApiProvider>,
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockAlertApi.post).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You don't have permission to modify this flag.",
          severity: 'error',
        }),
      );
    });
  });

  it('handles generic Unleash API errors', async () => {
    const user = userEvent.setup();
    mockUnleashApi.toggleFlag.mockRejectedValue(
      new Error('Unleash API error: Feature not found'),
    );

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagToggle
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          enabled
          onToggled={jest.fn()}
        />
      </TestApiProvider>,
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockAlertApi.post).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Feature not found',
          severity: 'error',
        }),
      );
    });
  });

  it('disables toggle during loading', async () => {
    const user = userEvent.setup();
    let resolveToggle: () => void;
    mockUnleashApi.toggleFlag.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveToggle = resolve as () => void;
        }),
    );

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [unleashApiRef, mockUnleashApi],
          [alertApiRef, mockAlertApi],
        ]}
      >
        <FlagToggle
          projectId="test-project"
          flagName="test-flag"
          environment="development"
          enabled={false}
          onToggled={jest.fn()}
        />
      </TestApiProvider>,
    );

    await user.click(screen.getByRole('checkbox'));
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    await user.click(confirmButton);

    // Confirm button should be disabled during loading
    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });

    const updatingButton = screen.getByRole('button', { name: 'Updating...' });
    expect(updatingButton).toBeDisabled();

    // Cleanup: resolve the promise
    resolveToggle!();
  });
});
