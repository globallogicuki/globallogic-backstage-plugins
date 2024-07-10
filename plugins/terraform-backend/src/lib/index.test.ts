import {
  TF_BASE_URL,
  findWorkspace,
  getRunsForWorkspace,
  getLatestRunForWorkspace,
} from '.';
import axios from 'axios';
import { TerraformEntity, TerraformRun, TerraformWorkspace } from './types';

jest.mock('axios');

describe('lib/index', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getRunsForWorkspace method', () => {
    it('should call the correct API url with the correct bearer token', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: [],
        },
      });
      expect(axios.get).not.toHaveBeenCalled();
      const workSpaceId = 'id-1';
      const token = 'token-1';
      await getRunsForWorkspace(token, workSpaceId);

      expect(axios.get).toHaveBeenCalledWith(
        `${TF_BASE_URL}/workspaces/${workSpaceId}/runs?include=created_by,plan`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should correctly map the data received from the tearraform API', async () => {
      const responseData: TerraformRun[] = [
        {
          id: 'id-1',
          relationships: {
            'confirmed-by': {
              data: {
                id: 'id-confirmed',
              },
            },
            plan: {
              data: {
                id: 'id-plan',
              },
            },
          },
          attributes: {
            status: 'status-1',
            'created-at': '2020-01-01',
            message: 'hello world',
          },
        },
        {
          id: 'id-2',
          relationships: {},
          attributes: { status: 'status-2', 'created-at': '2022-02-02' },
        },
      ];

      const responseIncluded: TerraformEntity[] = [];

      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: responseData,
          included: responseIncluded,
        },
      });

      const result = await getRunsForWorkspace('token', 'workspaceId');

      expect(result).toEqual([
        {
          id: 'id-1',
          message: 'hello world',
          status: 'status-1',
          createdAt: '2020-01-01',
          confirmedBy: null,
          plan: null,
        },
        {
          id: 'id-2',
          message: undefined,
          status: 'status-2',
          createdAt: '2022-02-02',
          confirmedBy: null,
          plan: null,
        },
      ]);
    });

    it('should map the correct confirmedBy to the correct element', async () => {
      const responseData: TerraformRun[] = [
        {
          id: 'id-1',
          relationships: {
            'confirmed-by': {
              data: {
                id: 'id-confirmed',
              },
            },
            plan: {
              data: {
                id: 'id-plan',
              },
            },
          },
          attributes: {
            status: 'status-1',
            'created-at': '2020-01-01',
            message: 'hello world',
          },
        },
        {
          id: 'id-2',
          relationships: {},
          attributes: { status: 'status-2', 'created-at': '2022-02-02' },
        },
      ];

      const responseIncluded: TerraformEntity[] = [
        {
          id: 'id-confirmed',
          attributes: {
            username: 'confirmed-username',
            'avatar-url': 'confirmed/avatar/url',
          },
        },
      ];

      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: responseData,
          included: responseIncluded,
        },
      });

      const result = await getRunsForWorkspace('token', 'workspaceId');

      expect(result).toEqual([
        {
          id: 'id-1',
          message: 'hello world',
          status: 'status-1',
          createdAt: '2020-01-01',
          confirmedBy: {
            name: 'confirmed-username',
            avatar: 'confirmed/avatar/url',
          },
          plan: null,
        },
        {
          id: 'id-2',
          message: undefined,
          status: 'status-2',
          createdAt: '2022-02-02',
          confirmedBy: null,
          plan: null,
        },
      ]);
    });

    it('should map the correct plan to the correct element', async () => {
      const responseData: TerraformRun[] = [
        {
          id: 'id-1',
          relationships: {
            'confirmed-by': {
              data: {
                id: 'id-confirmed',
              },
            },
            plan: {
              data: {
                id: 'id-plan',
              },
            },
          },
          attributes: {
            status: 'status-1',
            'created-at': '2020-01-01',
            message: 'hello world',
          },
        },
        {
          id: 'id-2',
          relationships: {},
          attributes: { status: 'status-2', 'created-at': '2022-02-02' },
        },
      ];

      const responseIncluded: TerraformEntity[] = [
        { id: 'id-plan', attributes: { 'log-read-url': 'the-logs' } },
      ];

      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: responseData,
          included: responseIncluded,
        },
      });

      const result = await getRunsForWorkspace('token', 'workspaceId');

      expect(result).toEqual([
        {
          id: 'id-1',
          message: 'hello world',
          status: 'status-1',
          createdAt: '2020-01-01',
          confirmedBy: null,
          plan: { logs: 'the-logs' },
        },
        {
          id: 'id-2',
          message: undefined,
          status: 'status-2',
          createdAt: '2022-02-02',
          confirmedBy: null,
          plan: null,
        },
      ]);
    });
  });

  describe('getLatestRunForWorkspace method', () => {
    it('should call the correct API url with the correct bearer token', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: [],
        },
      });
      expect(axios.get).not.toHaveBeenCalled();
      const workSpaceId = 'id-1';
      const token = 'token-1';
      await getLatestRunForWorkspace(token, workSpaceId);

      expect(axios.get).toHaveBeenCalledWith(
        `${TF_BASE_URL}/workspaces/${workSpaceId}/runs?include=created_by,plan&page%5Bnumber%5D=1&page%5Bsize%5D=1`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should correctly map the data received from the terraform API', async () => {
      const responseData: TerraformRun[] = [
        {
          id: 'id-1',
          relationships: {
            'confirmed-by': {
              data: {
                id: 'id-confirmed',
              },
            },
            plan: {
              data: {
                id: 'id-plan',
              },
            },
          },
          attributes: {
            status: 'status-1',
            'created-at': '2020-01-01',
            message: 'hello world',
          },
        },
      ];

      const responseIncluded: TerraformEntity[] = [];

      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: responseData,
          included: responseIncluded,
        },
      });

      const result = await getLatestRunForWorkspace('token', 'workspaceId');

      expect(result).toEqual({
        id: 'id-1',
        message: 'hello world',
        status: 'status-1',
        createdAt: '2020-01-01',
        confirmedBy: null,
        plan: null,
      });
    });

    it('should map the correct confirmedBy to the correct element', async () => {
      const responseData: TerraformRun[] = [
        {
          id: 'id-1',
          relationships: {
            'confirmed-by': {
              data: {
                id: 'id-confirmed',
              },
            },
            plan: {
              data: {
                id: 'id-plan',
              },
            },
          },
          attributes: {
            status: 'status-1',
            'created-at': '2020-01-01',
            message: 'hello world',
          },
        },
      ];

      const responseIncluded: TerraformEntity[] = [
        {
          id: 'id-confirmed',
          attributes: {
            username: 'confirmed-username',
            'avatar-url': 'confirmed/avatar/url',
          },
        },
      ];

      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: responseData,
          included: responseIncluded,
        },
      });

      const result = await getLatestRunForWorkspace('token', 'workspaceId');

      expect(result).toEqual({
        id: 'id-1',
        message: 'hello world',
        status: 'status-1',
        createdAt: '2020-01-01',
        confirmedBy: {
          name: 'confirmed-username',
          avatar: 'confirmed/avatar/url',
        },
        plan: null,
      });
    });

    it('should map the correct plan to the correct element', async () => {
      const responseData: TerraformRun[] = [
        {
          id: 'id-1',
          relationships: {
            'confirmed-by': {
              data: {
                id: 'id-confirmed',
              },
            },
            plan: {
              data: {
                id: 'id-plan',
              },
            },
          },
          attributes: {
            status: 'status-1',
            'created-at': '2020-01-01',
            message: 'hello world',
          },
        },
      ];

      const responseIncluded: TerraformEntity[] = [
        { id: 'id-plan', attributes: { 'log-read-url': 'the-logs' } },
      ];

      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: responseData,
          included: responseIncluded,
        },
      });

      const result = await getLatestRunForWorkspace('token', 'workspaceId');

      expect(result).toEqual({
        id: 'id-1',
        message: 'hello world',
        status: 'status-1',
        createdAt: '2020-01-01',
        confirmedBy: null,
        plan: { logs: 'the-logs' },
      });
    });
  });

  describe('findWorkspace method', () => {
    const TOKEN = 'token-2';
    const ORGANIZATION_NAME = 'ORGANIZATION-NAME';
    const WORKSPACE_NAME = 'WORKSPACE-NAME';

    it('should call the correct URL with the correct bearer token', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: [{}],
        },
      });
      expect(axios.get).not.toHaveBeenCalled();
      await findWorkspace(TOKEN, ORGANIZATION_NAME, WORKSPACE_NAME);
      expect(axios.get).toHaveBeenCalledWith(
        `${TF_BASE_URL}/organizations/${ORGANIZATION_NAME}/workspaces?search[wildcard-name]=${WORKSPACE_NAME}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } },
      );
    });

    it('should throw an error if the API returns an empty array', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: [],
        },
      });

      await expect(
        findWorkspace(TOKEN, ORGANIZATION_NAME, WORKSPACE_NAME),
      ).rejects.toMatchObject({
        message: `Workspace with name '${WORKSPACE_NAME}' not found.`,
      });
    });

    it('should return the correct workspace id', async () => {
      const responseData: TerraformWorkspace[] = [
        {
          id: 'correct-workspace-id',
          attributes: {
            'created-at': '',
            description: '',
          },
        },
        {
          id: 'wrong-workspace-id',
          attributes: {
            'created-at': '',
            description: '',
          },
        },
      ];
      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: responseData,
        },
      });

      const result = await findWorkspace(
        TOKEN,
        ORGANIZATION_NAME,
        WORKSPACE_NAME,
      );

      expect(result).toEqual({
        id: 'correct-workspace-id',
      });
    });
  });
});
