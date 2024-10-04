import { TerraformEntity, TerraformRun } from './types';
import { formatTerraformRun } from './formatTerraformRun';

describe('formatTerraformRun', () => {
  const mockTerraformRun: TerraformRun = {
    id: 'id-1',
    type: 'runs',
    relationships: {
      'confirmed-by': {
        data: {
          id: 'confirmedBy-id-01',
          type: 'users',
        },
      },
      plan: {
        data: {
          id: 'plan-id-01',
          type: 'plans',
        },
      },
      workspace: {
        data: {
          id: 'workspace-id-01',
          type: 'workspaces',
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
    workspace: null,
    plan: null,
    confirmedBy: null,
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
    const included: TerraformEntity[] = [
      {
        id: 'confirmedBy-id-01',
        type: 'users',
        attributes: { username: 'username-01', 'avatar-url': 'avatar-01' },
      },
      {
        id: 'confirmedBy-id-02',
        type: 'users',
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
    const included: TerraformEntity[] = [
      {
        id: 'plan-id-01',
        type: 'plans',
        attributes: { 'log-read-url': 'custom-logs' },
      },
      {
        id: 'plan-id-02',
        type: 'plans',
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

  it('should map workspace correctly', () => {
    const included: TerraformEntity[] = [
      {
        id: 'workspace-id-01',
        type: 'workspaces',
        attributes: {
          name: 'workspace-name',
          description: 'string',
          'created-at': 'string',
        },
      },
      {
        id: 'workspace-id-02',
        type: 'workspaces',
        attributes: {
          name: 'wrong-name',
          description: 'string',
          'created-at': 'string',
        },
      },
    ];

    const responseRun = formatTerraformRun(mockTerraformRun, included);
    expect(responseRun).toEqual({
      ...minExpectedResult,
      confirmedBy: null,
      workspace: { name: 'workspace-name' },
    });
  });

  it('should set workspace to null if undefined', () => {
    const included: TerraformEntity[] = [
      {
        id: 'workspace-id-01',
        type: 'workspaces',
        attributes: {
          name: 'workspace-name',
          description: 'string',
          'created-at': 'string',
        },
      },
      {
        id: 'workspace-id-02',
        type: 'workspaces',
        attributes: {
          name: 'wrong-name',
          description: 'string',
          'created-at': 'string',
        },
      },
    ];

    const responseRun = formatTerraformRun(
      { ...mockTerraformRun, relationships: { workspace: undefined } },
      included,
    );
    expect(responseRun).toEqual({
      ...minExpectedResult,
      confirmedBy: null,
      workspace: null,
    });
  });
});
