import React from 'react';
import { render, screen } from '@testing-library/react';
import { DenseTable } from './DenseTable';
import { renderInTestApp } from '@backstage/test-utils';

jest.mock('@backstage/core-components', () => {
  const originalModule = jest.requireActual('@backstage/core-components');

  const MockOverflowTooltip = ({ text }: { text: string }) => (
    <p>{`Mock OverflowTooltip: ${text}`}</p>
  );

  return {
    __esModule: true,
    OverflowTooltip: MockOverflowTooltip,
    Table: originalModule.Table,
    TableColumn: originalModule.TableColumn,
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
  });
});
