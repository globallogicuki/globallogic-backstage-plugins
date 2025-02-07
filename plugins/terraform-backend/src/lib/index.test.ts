import { getLatestRunForWorkspaces, listOrgRuns } from '.';
import axios from 'axios';
import { TerraformEntity, TerraformRun } from './types';
import { DEFAULT_TF_BASE_URL } from '../service/router';

jest.mock('axios');

const mockRun: TerraformRun = {
  id: 'id-1',
  type: 'runs',
  relationships: {
    'confirmed-by': {
      data: {
        id: 'id-confirmed',
        type: 'users',
      },
      links: {
        related: '/users/id-confirmed',
      },
    },
    plan: {
      data: {
        id: 'id-plan',
        type: 'plans',
      },
      links: {
        related: '/plans/id-plan',
      },
    },
    workspace: {
      data: {
        id: 'id-workspace',
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
const mockEntities: TerraformEntity[] = [
  {
    id: 'id-confirmed',
    type: 'users',
    attributes: { username: 'username', 'avatar-url': 'avatar' },
  },
  {
    id: 'id-plan',
    type: 'plans',
    attributes: { 'log-read-url': 'logs' },
  },
  {
    id: 'id-workspace',
    type: 'workspaces',
    attributes: {
      name: 'workspaceName',
      description: 'description',
      'created-at': '2020-01-01',
    },
  },
];

describe('lib/index', () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        data: [mockRun],
        included: mockEntities,
      },
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('listOrgRuns', () => {
    const workspaces = ['workspace-1', 'workspace-2'];
    const token = 'token-1';
    const baseUrl = DEFAULT_TF_BASE_URL;
    const organization = 'org-1';

    it('should make the HTTP GET request correctly', async () => {
      await listOrgRuns({ token, baseUrl, organization, workspaces });

      expect(axios.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v2/organizations/${organization}/runs?filter[workspace_names]=workspace-1,workspace-2`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should make the correct number of HTTP GET requests for other entities', async () => {
      await listOrgRuns({ token, baseUrl, organization, workspaces });

      expect(axios.get).toHaveBeenCalledTimes(4);
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/api/v2/workspaces/id-workspace',
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/users/id-confirmed',
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/plans/id-plan',
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should make the correct HTTP GET request when workspace.links is set', async () => {
      const mockRunNoWorkspace: TerraformRun = {
        ...mockRun,
        relationships: {
          ...mockRun.relationships,
          workspace: {
            data: { id: 'id-workspace', type: 'workspaces' },
            links: { related: '/api/v2/workspaces/id-workspace' },
          },
        },
      };

      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          data: [mockRunNoWorkspace],
          included: mockEntities,
        },
      });

      await listOrgRuns({ token, baseUrl, organization, workspaces });

      expect(axios.get).toHaveBeenCalledTimes(4);
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/api/v2/workspaces/id-workspace',
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should not make the HTTP GET request when workspace is undefined', async () => {
      const mockRunNoWorkspace: TerraformRun = {
        ...mockRun,
        relationships: { ...mockRun.relationships, workspace: undefined },
      };

      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          data: [mockRunNoWorkspace],
          included: mockEntities,
        },
      });

      await listOrgRuns({ token, baseUrl, organization, workspaces });

      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(axios.get).not.toHaveBeenCalledWith(
        'https://app.terraform.io/users/id-workspace',
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should return the correctly formatted data when a related entity errors', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: [mockRun],
          included: mockEntities,
        },
      });
      (axios.get as jest.Mock).mockRejectedValueOnce(
        new Error('OOPS! workspace'),
      );
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            ...mockEntities[0],
          },
        },
      });
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            ...mockEntities[1],
          },
        },
      });

      const result = await listOrgRuns({
        token,
        baseUrl,
        organization,
        workspaces,
      });

      expect(result).toEqual([
        {
          id: 'id-1',
          message: 'hello world',
          status: 'status-1',
          createdAt: '2020-01-01',
          confirmedBy: {
            avatar: 'avatar',
            name: 'username',
          },
          plan: { logs: 'logs' },
          workspace: null,
        },
      ]);
    });

    it('should return the correctly formatted data', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: [mockRun],
          included: mockEntities,
        },
      });
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            ...mockEntities[0],
          },
        },
      });
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            ...mockEntities[1],
          },
        },
      });
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            ...mockEntities[2],
          },
        },
      });

      const result = await listOrgRuns({
        token,
        baseUrl,
        organization,
        workspaces,
      });

      expect(result).toEqual([
        {
          id: 'id-1',
          message: 'hello world',
          status: 'status-1',
          createdAt: '2020-01-01',
          confirmedBy: {
            avatar: 'avatar',
            name: 'username',
          },
          plan: { logs: 'logs' },
          workspace: { name: 'workspaceName' },
        },
      ]);
    });
  });

  describe('getLatestRunForWorkspaces', () => {
    const workSpaceNames = ['workspace-1', 'workspace-2'];
    const token = 'token-1';
    const baseUrl = DEFAULT_TF_BASE_URL;
    const organization = 'org-1';

    it('should make the HTTP GET request correctly', async () => {
      await getLatestRunForWorkspaces(
        baseUrl,
        token,
        organization,
        workSpaceNames,
      );

      expect(axios.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v2/organizations/${organization}/runs?filter[workspace_names]=workspace-1,workspace-2&page[number]=1&page[size]=1`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should make the correct number of HTTP GET requests for other entities', async () => {
      await getLatestRunForWorkspaces(
        baseUrl,
        token,
        organization,
        workSpaceNames,
      );

      expect(axios.get).toHaveBeenCalledTimes(4);
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/api/v2/workspaces/id-workspace',
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/users/id-confirmed',
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/plans/id-plan',
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should return the correctly formatted data', async () => {
      const result = await getLatestRunForWorkspaces(
        baseUrl,
        token,
        organization,
        workSpaceNames,
      );

      expect(result).toEqual({
        id: 'id-1',
        message: 'hello world',
        status: 'status-1',
        createdAt: '2020-01-01',
        confirmedBy: null,
        plan: null,
        workspace: null,
      });
    });
  });
});
