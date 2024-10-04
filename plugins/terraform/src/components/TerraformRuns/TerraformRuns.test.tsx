import React from 'react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { errorApiRef } from '@backstage/core-plugin-api';
import { render, screen } from '@testing-library/react';
import { TerraformRuns } from './TerraformRuns';
import { useRuns } from '../../hooks';

jest.mock('../../hooks/useRuns');

const mockErrorApi = {
  post: jest.fn(),
  error$: jest.fn(),
};
const apis = [[errorApiRef, mockErrorApi] as const] as const;

describe('TerraformRuns', () => {
  const refetchMock = jest.fn(() => {});
  const props = {
    organization: 'gluk',
    workspaceNames: ['fakeWorkspaceName', 'anotherFakeWorkspaceName'],
  };

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

  it('renders title when single workspace', async () => {
    render(
      <TerraformRuns {...props} workspaceNames={['fakeSingleWorkspace']} />,
    );

    const title = await screen.findByText('Runs for fakeSingleWorkspace');

    expect(title).toBeInTheDocument();
  });

  it('renders title when multiple workspaces', async () => {
    render(<TerraformRuns {...props} />);

    const title = await screen.findByText('Runs for 2 workspaces');

    expect(title).toBeInTheDocument();
  });

  it('renders description and refresh', async () => {
    render(<TerraformRuns {...props} />);

    const description = await screen.findByText(
      /This contains some useful information/i,
    );
    const refresh = await screen.findByLabelText('Refresh');

    expect(description).toBeInTheDocument();
    expect(refresh).toBeInTheDocument();
  });

  it('does not render description and refresh if hideDescription is true', async () => {
    render(<TerraformRuns hideDescription {...props} />);

    const description = screen.queryByText(
      /This contains some useful information/i,
    );
    const refresh = screen.queryByLabelText('Refresh');

    expect(description).not.toBeInTheDocument();
    expect(refresh).not.toBeInTheDocument();
  });

  it('calls refetch when refresh is clicked', async () => {
    render(<TerraformRuns {...props} />);

    const refresh = await screen.findByLabelText('Refresh');
    refresh.click();

    expect(refetchMock).toHaveBeenCalledTimes(2);
  });

  it('renders error panel on error fetching', async () => {
    (useRuns as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Some fake error.'),
      refetch: refetchMock,
    });

    await renderInTestApp(
      <TestApiProvider apis={apis}>
        <TerraformRuns {...props} />
      </TestApiProvider>,
    );

    const error = await screen.findByText('Error: Some fake error.');

    expect(error).toBeInTheDocument();
  });
});
