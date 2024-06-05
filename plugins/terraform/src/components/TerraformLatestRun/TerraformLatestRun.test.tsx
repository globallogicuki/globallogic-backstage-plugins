import React from 'react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { errorApiRef } from '@backstage/core-plugin-api';
import { render, screen } from '@testing-library/react';
import { TerraformLatestRun } from './TerraformLatestRun';
import { useRuns } from '../../hooks';

jest.mock('../../hooks/useRuns');

const mockErrorApi = {
  post: jest.fn(),
  error$: jest.fn(),
};
const apis = [[errorApiRef, mockErrorApi] as const] as const;

describe('TerraformLatestRun', () => {
  const refetchMock = jest.fn(() => { });
  const props = { organization: 'gluk', workspaceName: 'fakeWorkspaceName' };

  beforeEach(() => {
    (useRuns as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      refetch: refetchMock,
    });
  });

  afterEach(() => {
    (useRuns as jest.Mock).mockRestore();
    refetchMock.mockReset();
  });

  it('renders title, description and refresh', async () => {
    render(<TerraformLatestRun {...props} />);

    const title = await screen.findByText(`No runs for ${props.workspaceName}`);
    const description = await screen.findByText(
      /This contains some useful information/i,
    );
    const refresh = await screen.findByLabelText('Refresh');

    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(refresh).toBeInTheDocument();
  });

  test.skip('does not render description and refresh if hideDescription is true', async () => {
    render(<TerraformLatestRun hideDescription {...props} />);

    const description = screen.queryByText(
      /This contains some useful information/i,
    );
    const refresh = screen.queryByLabelText('Refresh');

    expect(description).not.toBeInTheDocument();
    expect(refresh).not.toBeInTheDocument();
  });

  test.skip('calls refetch when refresh is clicked', async () => {
    render(<TerraformLatestRun {...props} />);

    const refresh = await screen.findByLabelText('Refresh');
    refresh.click();

    expect(refetchMock).toHaveBeenCalledTimes(2);
  });

  test.skip('renders error panel on error fetching', async () => {
    (useRuns as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Some fake error.'),
      refetch: refetchMock,
    });

    await renderInTestApp(
      <TestApiProvider apis={apis}>
        <TerraformLatestRun {...props} />
      </TestApiProvider>,
    );

    const error = await screen.findByText('Error: Some fake error.');

    expect(error).toBeInTheDocument();
  });
});
