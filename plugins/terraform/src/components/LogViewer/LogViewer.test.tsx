import { useLogs } from '../../hooks';
import { render, screen } from '@testing-library/react';
import { LogViewer } from './LogViewer';

jest.mock('../../hooks', () => ({
  useLogs: jest.fn(),
}));

jest.mock('@backstage/core-components', () => {
  const originalModule = jest.requireActual('@backstage/core-components');

  const MockLogViewer = ({ text }: { text: string }) => (
    <div>{`Mock TerraformRuns: ${text}`}</div>
  );

  return {
    __esModule: true,
    LogViewer: MockLogViewer,
    Progress: originalModule.Progress,
  };
});

describe('LogViewer', () => {
  beforeEach(() => {
    (useLogs as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    });
  });

  afterEach(() => {
    (useLogs as jest.Mock).mockRestore();
  });

  it('renders when loading', async () => {
    const { container } = render(<LogViewer txtUrl="someurl.txt" />);

    expect(container).toMatchSnapshot();
  });

  it('renders when error', async () => {
    (useLogs as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Some fake error.'),
    });

    render(<LogViewer txtUrl="someurl.txt" />);

    const error = await screen.findByText(/Some fake error./i);

    expect(error).toBeInTheDocument();
  });

  it('renders when successful', async () => {
    (useLogs as jest.Mock).mockReturnValue({
      data: 'this is some text to be shown',
      isLoading: false,
      error: undefined,
    });

    render(<LogViewer txtUrl="someurl.txt" />);

    const text = await screen.findByText(/this is some text to be shown/i);

    expect(text).toBeInTheDocument();
  });
});
