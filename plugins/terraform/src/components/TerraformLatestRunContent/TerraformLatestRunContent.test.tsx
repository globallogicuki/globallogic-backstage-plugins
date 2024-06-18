import {
  render,
  screen,
} from '@testing-library/react';
import React from 'react';
import { TerraformLatestRunContent } from './TerraformLatestRunContent';

jest.mock('@backstage/core-components', () => {
  const originalModule = jest.requireActual('@backstage/core-components');

  const MockInfoCard = (props: React.PropsWithChildren<{ title: string }>) => (
    <div>
      <p>{`Mock InfoCard: ${props.title} `}</p>
      {props.children}
    </div>
  )

  const MockLogViewer = ({ text }: { text: string }) => (
    <div>{`Mock TerraformRuns: ${text}`}</div>
  );

  return {
    __esModule: true,
    InfoCard: MockInfoCard,
    LogViewer: MockLogViewer,
    Progress: originalModule.Progress,
  };
});




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


describe('TerraformLatestRunContent', () => {

  it('renders the card when data is set', async () => {
    render(
      <TerraformLatestRunContent
        workspace="test workspace"
        run={testData1}
      />,
    );

    const title = await screen.findByText(/Latest run for test workspace/i);
    const user = await screen.findByText(/ABC/i);
    const msg = await screen.findByText(/this is a text message/i);

    expect(title).toBeInTheDocument();
    expect(user).toBeInTheDocument();
    expect(msg).toBeInTheDocument();
  });

});

