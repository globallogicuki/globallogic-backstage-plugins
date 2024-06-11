import {
  // act,
  // fireEvent,
  render,
  screen,
} from '@testing-library/react';
import React from 'react';
import { TerraformLatestRunCard } from './TerraformLatestRunCard';

jest.mock('@backstage/core-components', () => {
  const originalModule = jest.requireActual('@backstage/core-components');

  // const MockOverflowTooltip = ({ text }: { text: string }) => (
  //   <p>{`Mock OverflowTooltip: ${text}`}</p>
  // );

  const MockLogViewer = ({ text }: { text: string }) => (
    <div>{`Mock TerraformRuns: ${text}`}</div>
  );

  const MockInfoCard = (props: React.PropsWithChildren<{ title: string }>) => (
    <div>
      <p>{`Mock InfoCard: ${props.title} `}</p>
      {props.children}
    </div>
  )

  return {
    __esModule: true,
    // InfoCard: originalModule.InfoCard,
    InfoCard: MockInfoCard,
    // OverflowTooltip: MockOverflowTooltip,
    LogViewer: MockLogViewer,
    Progress: originalModule.Progress,
  };
});

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


const testData1 = {
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


describe('TerraformLatestRunCard', () => {
  it('renders the card when data is empty', async () => {
    render(
      <TerraformLatestRunCard
        run={undefined}
        isLoading={true}
        workspace="test workspace"
      />
    );

    const title = await screen.findByText(/No runs for test workspace/i);
    const userLabel = screen.queryByText(/User/i);

    expect(title).toBeInTheDocument();
    expect(userLabel).toBeNull();
  });

  it('renders the card when empty name is passed', async () => {
    render(
      <TerraformLatestRunCard
        workspace="test workspace"
        isLoading={true}
        run={testDataUndefinedName}
      />
    );

    const title = await screen.findByText(/Latest run for test workspace/i);
    const userLabel = await screen.findByText(/User/i);
    const userName = await screen.findByText(/Unknown/i);

    expect(title).toBeInTheDocument();
    expect(userLabel).toBeInTheDocument();
    expect(userName).toBeInTheDocument();
  });

  it('renders the card when data is set', async () => {
    render(
      <TerraformLatestRunCard
        workspace="test workspace"
        isLoading={true}
        run={testData1}
      />,
    );

    const title = await screen.findByText(/Latest run for test workspace/i);
    const text = await screen.findByText(/User/i);
    const user = await screen.findByText(/ABC/i);
    const msg = await screen.findByText(/this is a text message/i);

    expect(text).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(user).toBeInTheDocument();
    expect(msg).toBeInTheDocument();
  });

  // it('opens the logs on click of action button', async () => {
  //   await renderInTestApp(
  //     <TerraformLatestRunCard
  //       isLoading={false}
  //       title="Runs for test workspace"
  //       data={[testData]}
  //     />,
  //   );

  //   const actionButton = screen.getByTestId('open-logs-123');

  //   expect(actionButton).toBeInTheDocument();
  //   await act(async () => {
  //     fireEvent.click(actionButton);
  //   });

  //   const logs = screen.getByText('Logs');
  //   const heading = screen.getByRole('heading', { level: 5 });
  //   expect(logs).toBeInTheDocument();
  //   expect(heading).toHaveTextContent('Logs');
  // });

  // it('closes the logs on click of close button', async () => {
  //   await renderInTestApp(
  //     <TerraformLatestRunCard
  //       isLoading={false}
  //       title="Runs for test workspace"
  //       data={[testData]}
  //     />,
  //   );

  //   const actionButton = screen.getByTestId('open-logs-123');

  //   expect(actionButton).toBeInTheDocument();
  //   await act(async () => {
  //     fireEvent.click(actionButton);
  //   });

  //   const logs = screen.getByText('Logs');
  //   const heading = screen.getByRole('heading', { level: 5 });
  //   expect(logs).toBeInTheDocument();
  //   expect(heading).toHaveTextContent('Logs');
  //   const close = screen.getByTestId('close-icon');
  //   expect(close).toBeInTheDocument();
  //   fireEvent.click(close);
  //   await waitFor(() => {
  //     expect(logs).not.toBeVisible();
  //   });
  // });
});

