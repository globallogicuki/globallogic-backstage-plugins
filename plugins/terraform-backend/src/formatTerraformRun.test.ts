import { TerraformRun } from './lib/types';
import { formatTerraformRun } from './formatTerraformRun';

describe('formatTerraformRun', () => {
  const mockTerraformRun: TerraformRun = {
    id: 'id-1',
    relationships: {
      'confirmed-by': {
        data: {
          id: 'confirmedBy-id-01',
        },
      },
      plan: {
        data: {
          id: 'plan-id-01',
        },
      },
    },
    attributes: {
      status: 'status-1',
      'created-at': '2020-01-01',
      message: 'hello world',
    },
  };

  const minExpectedResult = {
    id: mockTerraformRun.id,
    message: mockTerraformRun.attributes.message,
    status: mockTerraformRun.attributes.status,
    createdAt: mockTerraformRun.attributes['created-at'],
  };
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should correctly map the data received from the API', () => {
    const responseRun = formatTerraformRun(mockTerraformRun, []);
    expect(responseRun).toEqual({
      ...minExpectedResult,
      confirmedBy: null,
      plan: null,
    });
  });

  it('should map confirmedBy correctly', () => {
    const included = [
      {
        id: 'confirmedBy-id-01',
        attributes: { username: 'username-01', 'avatar-url': 'avatar-01' },
      },
      {
        id: 'confirmedBy-id-02',
        attributes: {
          username: 'wrong-username',
          'avatar-url': 'wrong-avatar',
        },
      },
    ];
    const responseRun = formatTerraformRun(mockTerraformRun, included);
    expect(responseRun).toEqual({
      ...minExpectedResult,
      confirmedBy: { name: 'username-01', avatar: 'avatar-01' },
      plan: null,
    });
  });

  it('should map plan correctly', () => {
    const included = [
      {
        id: 'plan-id-01',
        attributes: { 'log-read-url': 'custom-logs' },
      },
      {
        id: 'plan-id-02',
        attributes: { 'log-read-url': 'wrong-logs' },
      },
    ];
    const responseRun = formatTerraformRun(mockTerraformRun, included);
    expect(responseRun).toEqual({
      ...minExpectedResult,
      confirmedBy: null,
      plan: { logs: 'custom-logs' },
    });
  });
});
