import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    logs: 'some text',
  },
};

const testData1 = {
  id: '123',
  message: 'this is a text message',
  status: 'done',
  createdAt: '2023-05-24T10:23:40.172Z',
  confirmedBy: undefined,
  plan: {
    logs: 'some text',
  },
};

describe('DenseTable', () => {
  it('renders the table when data is empty', async () => {
    render(
      <DenseTable
        isLoading={false}
        title={'Runs for test workspace'}
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
        title={'Runs for test workspace'}
        data={[testData1]}
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
        title={'Runs for test workspace'}
        data={[testData]}
      />,
    );

    const title = await screen.findByText(/Runs for test workspace/i);
    const text = await screen.findByText(/User/i);
    const user = await screen.findByText(/ABC/i);
    const msg = await screen.findByText(/this is a text message/i);

    expect(text).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(user).toBeInTheDocument();
    expect(msg).toBeInTheDocument();
  });

  it('opens the logs on click of action button', async () => {
    await renderInTestApp(
      <DenseTable
        isLoading={false}
        title={'Runs for test workspace'}
        data={[testData]}
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
        title={'Runs for test workspace'}
        data={[testData]}
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
    const close = screen.getByTestId('close-icon')
    expect(close).toBeInTheDocument();
    fireEvent.click(close);
    await waitFor(() => {
      expect(logs).not.toBeVisible();
    })
  });
});
