import React from 'react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { errorApiRef } from '@backstage/core-plugin-api';
import { render, screen } from '@testing-library/react';
import { TerraformLatestRun } from './TerraformLatestRun';
import { useLatestRun } from '../../hooks';
import { Run } from '../../hooks/types';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { mockEntity } from '../../mocks/entity';

jest.mock('../../hooks/useLatestRun');

const mockErrorApi = {
  post: jest.fn(),
  error$: jest.fn(),
};
const apis = [[errorApiRef, mockErrorApi] as const] as const;

const testDataUndefinedName = {
  id: '123',
  message: 'this is a text message',
  status: 'done',
  createdAt: '2023-05-24T10:23:40.172Z',
  confirmedBy: undefined,
  plan: {
    logs: 'some text',
  },
};

const testDataValid = {
  id: 'testId',
  message: 'testMessage',
  status: 'testStatus',
  createdAt: new Date().toISOString(),
  confirmedBy: {
    name: 'testUser',
  },
};

describe('TerraformLatestRun', () => {
  const refetchMock = jest.fn(() => {});

  afterEach(() => {
    (useLatestRun as jest.Mock).mockRestore();
    refetchMock.mockReset();
  });

  it('renders the card when isLoading', async () => {
    buildUseLatestRunMock({ isLoading: true, refetch: refetchMock });
    render(
      <EntityProvider entity={mockEntity}>
        <TerraformLatestRun />
      </EntityProvider>,
    );

    const loadingProgress = screen.getByRole('progressbar');

    expect(loadingProgress).toBeInTheDocument();
  });

  it('renders the card when data is empty', async () => {
    buildUseLatestRunMock({ refetch: refetchMock });
    await renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <TerraformLatestRun />
      </EntityProvider>,
    );

    const title = await screen.findByText('No runs for this workspace!');
    const userLabel = screen.queryByText(/User/i);

    expect(title).toBeInTheDocument();
    expect(userLabel).toBeNull();
  });

  it('renders the card when empty name is passed', async () => {
    buildUseLatestRunMock({
      latestRun: testDataUndefinedName,
      refetch: refetchMock,
    });
    await renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <TerraformLatestRun />
      </EntityProvider>,
    );

    const title = await screen.findByText(/Latest Terraform run/i);
    const unknownUser = await screen.findByText(/Unknown/i);

    expect(title).toBeInTheDocument();
    expect(unknownUser).toBeInTheDocument();
  });

  it('renders normally with correct data', async () => {
    buildUseLatestRunMock({ latestRun: testDataValid, refetch: refetchMock });
    render(
      <EntityProvider entity={mockEntity}>
        <TerraformLatestRun />
      </EntityProvider>,
    );

    const latestRunText = await screen.findByText(/Latest Terraform run/i);
    expect(latestRunText).toBeInTheDocument();
  });

  it('renders error panel on error fetching', async () => {
    buildUseLatestRunMock({
      latestRun: undefined,
      isLoading: false,
      error: new Error('Some fake error.'),
      refetch: refetchMock,
    });

    await renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={mockEntity}>
          <TerraformLatestRun />
        </EntityProvider>
      </TestApiProvider>,
    );

    const errorTitle = await screen.findByText('Error');
    const error = await screen.findByText('Some fake error.');

    expect(errorTitle).toBeInTheDocument();
    expect(error).toBeInTheDocument();
  });

  function buildUseLatestRunMock({
    latestRun,
    isLoading,
    error,
    refetch,
  }: {
    latestRun?: Run;
    error?: Error;
    isLoading?: boolean;
    refetch?: Promise<Run> | jest.Mock<void, [], any>;
  }): jest.ProvidesHookCallback {
    return (useLatestRun as jest.Mock).mockReturnValue({
      data: latestRun,
      isLoading,
      error,
      refetch,
    });
  }
});
