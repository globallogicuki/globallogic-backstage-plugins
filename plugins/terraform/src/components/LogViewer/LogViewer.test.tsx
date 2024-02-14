import React from 'react';
import useAsync from 'react-use/lib/useAsync';
import { render, screen } from '@testing-library/react';
import { LogViewer } from './LogViewer';

jest.mock('react-use/lib/useAsync');

jest.mock('@backstage/core-components', () => {
  const originalModule = jest.requireActual('@backstage/core-components');

  const MockLogViewer = ({ text }: { text: string }) => (
    <div>{`Mock TerraformRuns: ${text}`}</div>
  );

  return {
    __esModule: true,
    ...originalModule,
    LogViewer: MockLogViewer,
  };
});

describe('LogViewer', () => {
  beforeEach(() => {
    (useAsync as jest.Mock).mockReturnValue({
      value: undefined,
      loading: true,
      error: undefined,
    });
  });

  afterEach(() => {
    (useAsync as jest.Mock).mockRestore();
  });

  it('renders when loading', async () => {
    const { container } = render(<LogViewer txtUrl="someurl.txt" />);

    expect(container).toMatchSnapshot();
  });

  it('renders when error', async () => {
    (useAsync as jest.Mock).mockReturnValue({
      value: undefined,
      loading: false,
      error: new Error('Some fake error.'),
    });

    render(<LogViewer txtUrl="someurl.txt" />);

    const error = await screen.findByText(/Some fake error./i);

    expect(error).toBeInTheDocument();
  });

  it('renders when successful', async () => {
    (useAsync as jest.Mock).mockReturnValue({
      value: 'this is some text to be shown',
      loading: false,
      error: undefined,
    });

    render(<LogViewer txtUrl="someurl.txt" />);

    const text = await screen.findByText(/this is some text to be shown/i);

    expect(text).toBeInTheDocument();
  });
});
