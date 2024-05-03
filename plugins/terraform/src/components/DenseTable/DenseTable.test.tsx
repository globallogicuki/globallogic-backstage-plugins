import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { DenseTable } from './DenseTable';
import { renderInTestApp } from '@backstage/test-utils';

jest.mock('@backstage/core-components', () => {
  const originalModule = jest.requireActual('@backstage/core-components');

  const MockOverflowTooltip = ({ text }: { text: string }) => (
    <p>{`Mock OverflowTooltip: ${text}`}</p>
  );

  const MockLogViewer = ({ text }: { text: string }) => (
    <div>{`Mock TerraformRuns: ${text}`}</div>
  );

  return {
    __esModule: true,
    OverflowTooltip: MockOverflowTooltip,
    Table: originalModule.Table,
    TableColumn: originalModule.TableColumn,
    LogViewer: MockLogViewer,
    Progress: originalModule.Progress,
  };
});

const mockData = [
  {
    id: '1234',
    message: 'Triggered via UI',
    status: 'applied',
    createdAt: '2023-05-24T10:23:40.172Z',
    confirmedBy: {
      name: 'ABC',
      avatar: 'icon',
    },
    plan: {
      logs: 'some text',
    },
  },
  {
    id: '123',
    message: 'Triggered via CLI',
    status: 'done',
    createdAt: '2023-05-24T10:23:40.172Z',
    confirmedBy: undefined,
    plan: {
      logs: 'some text',
    },
  },
];

describe('DenseTable', () => {
  it('renders the table when data is empty', async () => {
    render(
      <DenseTable
        isLoading={false}
        title="Runs for test workspace"
        data={[]}
      />,
    );

    const title = await screen.findByText(/Runs for test workspace/i);
    const text = await screen.findByText(/User/i);

    expect(text).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it('renders the table when empty name is passed', async () => {
    render(
      <DenseTable
        isLoading={false}
        title="Runs for test workspace"
        data={mockData}
      />,
    );

    const title = await screen.findByText(/Runs for test workspace/i);
    const text = await screen.findByText(/User/i);
    const user = await screen.findByText(/Unknown/i);

    expect(text).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(user).toBeInTheDocument();
  });

  it('renders the table when data is set', async () => {
    render(
      <DenseTable
        isLoading={false}
        title="Runs for test workspace"
        data={mockData}
      />,
    );

    const title = await screen.findByText(/Runs for test workspace/i);
    const text = await screen.findByText(/User/i);
    const user = await screen.findByText(/ABC/i);
    const msg = await screen.findByText(/Triggered via CLI/i);

    expect(text).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(user).toBeInTheDocument();
    expect(msg).toBeInTheDocument();
  });

  it('opens the logs on click of action button', async () => {
    await renderInTestApp(
      <DenseTable
        isLoading={false}
        title="Runs for test workspace"
        data={mockData}
      />,
    );

    const actionButton = screen.getByTestId('open-logs-123');

    expect(actionButton).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(actionButton);
    });
    const logs = screen.getByText('Logs');
    const heading = screen.getByRole('heading', { level: 5 });
    expect(logs).toBeInTheDocument();
    expect(heading).toHaveTextContent('Logs');
  });

  it('closes the logs on click of close button', async () => {
    await renderInTestApp(
      <DenseTable
        isLoading={false}
        title="Runs for test workspace"
        data={mockData}
      />,
    );

    const actionButton = screen.getByTestId('open-logs-123');

    expect(actionButton).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(actionButton);
    });
    const logs = screen.getByText('Logs');
    const heading = screen.getByRole('heading', { level: 5 });
    expect(logs).toBeInTheDocument();
    expect(heading).toHaveTextContent('Logs');
    const close = screen.getByTestId('close-icon');
    expect(close).toBeInTheDocument();
    fireEvent.click(close);
    await waitFor(() => {
      expect(logs).not.toBeVisible();
    });
  });

  it('renders filter option', () => {
    render(
      <DenseTable
        isLoading={false}
        title="Runs for test workspace"
        data={mockData}
      />,
    );
    const filterInput = screen.getByPlaceholderText(/Filter/i);

    expect(filterInput).toBeInTheDocument();
  });

  it('filter on user column', async () => {
    render(
      <DenseTable
        isLoading={false}
        title="Runs for test workspace"
        data={mockData}
      />,
    );
    const filterInput = screen.getByPlaceholderText(/Filter/i);
    const user = await screen.findByText(/ABC/i);
    const unknownUser = await screen.findByText(/Unknown/i);

    expect(user).toBeInTheDocument();
    expect(unknownUser).toBeInTheDocument();
    expect(filterInput).toBeInTheDocument();

    fireEvent.change(filterInput, { target: { value: 'Unknown' } });
    await waitFor(() => {
      expect(user).not.toBeInTheDocument();
      expect(unknownUser).toBeInTheDocument();
    });
  });

  it('filter on message column', async () => {
    render(
      <DenseTable
        isLoading={false}
        title="Runs for test workspace"
        data={mockData}
      />,
    );
    const filterInput = screen.getByPlaceholderText(/Filter/i);
    const message = await screen.findByText(/Triggered via CLI/i);
    const message1 = await screen.findByText(/Triggered via UI/i);

    expect(message).toBeInTheDocument();
    expect(message1).toBeInTheDocument();

    fireEvent.change(filterInput, { target: { value: 'UI' } });
    await waitFor(() => {
      expect(message).not.toBeInTheDocument();
      expect(message1).toBeInTheDocument();
    });
  });

  it('filter on status column', async () => {
    render(
      <DenseTable
        isLoading={false}
        title="Runs for test workspace"
        data={mockData}
      />,
    );
    const filterInput = screen.getByPlaceholderText(/Filter/i);
    const status = await screen.findByText(/done/i);
    const status1 = await screen.findByText(/applied/i);

    expect(status).toBeInTheDocument();
    expect(status1).toBeInTheDocument();

    fireEvent.change(filterInput, { target: { value: 'applied' } });
    await waitFor(() => {
      expect(status).not.toBeInTheDocument();
      expect(status1).toBeInTheDocument();
    });
  });

  it('sort the column', () => {
    render(
      <DenseTable
        isLoading={false}
        title="Runs for test workspace"
        data={mockData}
      />,
    );
    const userColumn = screen.getByText(/User/i);
    const user = screen.getByText(/ABC/i);
    const unknownUser = screen.getByText(/Unknown/i);

    expect(userColumn).toBeInTheDocument();
    expect(user).toBeInTheDocument();
    expect(unknownUser).toBeInTheDocument();
    expect(user.compareDocumentPosition(unknownUser)).toBe(4);
    fireEvent.click(userColumn);
    expect(user.compareDocumentPosition(unknownUser)).toBe(2);
    fireEvent.click(userColumn);
    expect(user.compareDocumentPosition(unknownUser)).toBe(4);
  });
});
