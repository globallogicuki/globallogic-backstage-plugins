import React from 'react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { errorApiRef } from '@backstage/core-plugin-api';
import { Matcher, render, screen } from '@testing-library/react';
import { TerraformLatestRun } from './TerraformLatestRun';
import { useRuns } from '../../hooks';
import { Run } from '../../hooks/types';

jest.mock('../../hooks/useRuns');

const mockErrorApi = {
  post: jest.fn(),
  error$: jest.fn(),
};
const apis = [[errorApiRef, mockErrorApi] as const] as const;


describe('TerraformLatestRun', () => {
  const refetchMock = jest.fn(() => { });
  const runProps = { organization: 'testOrganization', workspaceName: 'testWorkspaceName' };
  const runDescription: RegExp = /This contains some useful information/i

  // beforeEach(buildUseRunMock());

  afterEach(() => {
    (useRuns as jest.Mock).mockRestore();
    refetchMock.mockReset();
  });


  it('renders empty data message', async () => {
    _buildUseRunMock();
    render(<TerraformLatestRun {...runProps} />);

    await _expectation(`No runs for ${runProps.workspaceName}`);

    _expectNotFound([runDescription, 'Refresh']);
  });


  it('renders normally with correct data', async () => {
    _buildValidUseRunsMock();

    render(<TerraformLatestRun {...runProps} />);

    await _expectation(runDescription);
  })


  // test.skip('does not render description and refresh if hideDescription is true', async () => {
  //   render(<TerraformLatestRun hideDescription {...props} />);

  //   const description = screen.queryByText(
  //     runDescription,
  //   );
  //   const refresh = screen.queryByLabelText('Refresh');

  //   expect(description).not.toBeInTheDocument();
  //   expect(refresh).not.toBeInTheDocument();
  // });


  it('calls refetch when refresh is clicked', async () => {
    _buildValidUseRunsMock();
    render(<TerraformLatestRun {...runProps} />);

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
        <TerraformLatestRun {...runProps} />
      </TestApiProvider>,
    );

    const error = await screen.findByText('Error: Some fake error.');

    expect(error).toBeInTheDocument();
  });


  function _buildUseRunMock(
    runs: Run[] = [],
    error?: Error,
    isLoading: boolean = true,
  ): jest.ProvidesHookCallback {
    return (useRuns as jest.Mock).mockReturnValue({
      data: runs,
      isLoading: isLoading,
      error: error,
      refetch: refetchMock,
    });
  }



  function _buildValidUseRunsMock() {
    return _buildUseRunMock([{
      id: "testId",
      message: "testMessage",
      status: "testStatus",
      createdAt: "testDate",
      confirmedBy: {
        name: "testUser",
      }
    }]);
  }



  async function _expectation(matcher: Matcher) {
    const htmlElement = await screen.findByText(matcher);
    expect(htmlElement).toBeInTheDocument();
  }


  function _expectNotFound(notFoundExpectations: Matcher[]) {

    notFoundExpectations
      .map(m => screen.queryByText(m))
      .map((e: HTMLElement | null) => expect(e).toBeNull());
  }


});