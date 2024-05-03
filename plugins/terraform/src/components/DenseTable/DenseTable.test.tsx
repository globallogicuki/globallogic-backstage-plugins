import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { DenseTable } from './DenseTable';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';

import useAsync from 'react-use/lib/useAsync';

jest.mock('react-use/lib/useAsync');

// jest.mock('@backstage/core-components', () => {
//   const originalModule = jest.requireActual('@backstage/core-components');

//   const MockLogViewer = ({ text }: { text: string }) => (
//     <div>{`Mock TerraformRuns: ${text}`}</div>
//   );

//   return {
//     __esModule: true,
//     ...originalModule,
//     LogViewer: MockLogViewer,
//   };
// });

const testData = {
  id: '123',
  message: 'this is a text message',
  status: 'done',
  createdAt: '2023-05-24T10:23:40.172Z',
  confirmedBy: {
    name: 'ABC',
    avatar: 'icon',
  }, 
  plan: {
    logs: "some text",
  },
};

describe('DenseTable', () => {
  // beforeEach(() => {
  //   (useAsync as jest.Mock).mockReturnValue({
  //     value: undefined,
  //     loading: true,
  //     error: undefined,
  //   });
  // });

  // afterEach(() => {
  //   (useAsync as jest.Mock).mockRestore();
  // });


it('renders the table',  async () => {
  render(<DenseTable  isLoading={false}
    title={'Runs for test workspace'} data={[]}  />);
   const text =  await screen.findByText(/User/i);
    // const text = await waitFor(() =>{
    //   screen.findByText(/User/i);
    //       }) 
    expect(text).toBeInTheDocument();
  });

  it.only('opens the logs on click of action button',  async () => {
    renderInTestApp(<DenseTable  isLoading={false}
      title={'Runs for test workspace'} data={[testData]}  />);
      console.log("testdata", testData);
      const actionButton = await waitFor(() =>{
        screen.getByTestId('open-logs-123');
      }) 
   //const actionButton =  await screen.getByTestId('open-logs-123');

    expect(actionButton).toBeInTheDocument();
  });
  
});
