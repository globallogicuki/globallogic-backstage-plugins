import {
  getAssessmentResultsForWorkspaces,
  getLatestRunForWorkspaces,
  listOrgRuns,
} from '.';
import axios from 'axios';
import { mockServices } from '@backstage/backend-test-utils';
import {
  TerraformAssessmentResult,
  TerraformEntity,
  TerraformRun,
  TerraformWorkspace,
} from './types';
import { DEFAULT_TF_BASE_URL, getApiBaseUrl } from '../service/router';

jest.mock('axios');

const mockOrganization: string = 'org-1';
const mockWorkspace1Name: string = 'workspace-1';
const mockWorkspace2Name: string = 'workspace-2';

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

const mockWorkspaces: TerraformWorkspace[] = [
  {
    id: 'workspace1-id',
    type: 'workspaces',
    attributes: {
      'created-at': '2024-08-09T10:02:27.019Z',
      name: 'workspace-1',
    },
    relationships: {
      'current-assessment-result': {
        data: {
          id: 'asmtres-xwjsUPg2Q8QDm2QF',
          type: 'assessment-results',
        },
        links: {
          related: '/api/v2/workspaces/workspace1-id/current-assessment-result',
        },
      },
    },
  },
  {
    id: 'workspace2-id',
    type: 'workspaces',
    attributes: {
      'created-at': '2024-08-09T10:02:27.019Z',
      name: 'workspace-2',
    },
    relationships: {
      'current-assessment-result': {
        data: {
          id: 'asmtres-xwjsUPg2Q8QDm2QF',
          type: 'assessment-results',
        },
        links: {
          related: '/api/v2/workspaces/workspace2-id/current-assessment-result',
        },
      },
    },
  },
];

const mockAssessmentResult1: TerraformAssessmentResult = {
  id: 'assessmentResult1',
  type: 'assessment-results',
  attributes: {
    'all-checks-succeeded': false,
    'checks-errored': 0,
    'checks-failed': 1,
    'checks-passed': 4,
    'checks-unknown': 0,
    'created-at': '2025-04-01T16:26:28.423Z',
    drifted: true,
    'resources-drifted': 1,
    'resources-undrifted': 135,
  },
};

const mockAssessmentResult2: TerraformAssessmentResult = {
  id: 'assessmentResult2',
  type: 'assessment-results',
  attributes: {
    'all-checks-succeeded': true,
    'checks-errored': 0,
    'checks-failed': 0,
    'checks-passed': 5,
    'checks-unknown': 0,
    'created-at': '2025-04-02T06:20:31.884Z',
    drifted: false,
    'resources-drifted': 0,
    'resources-undrifted': 93,
  },
};

const baseUrl = getApiBaseUrl(DEFAULT_TF_BASE_URL);

const runsQuery = (pageSize: number, workspaces: string[]) =>
  new URLSearchParams({
    'filter[workspace_names]': workspaces.join(','),
    'page[number]': '1',
    'page[size]': String(pageSize),
  }).toString();

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
    const organization = 'org-1';
    const pageSize = 7;

    it('should make the HTTP GET request correctly', async () => {
      await listOrgRuns({
        token,
        baseUrl,
        organization,
        workspaces,
        pageSize,
      });

      expect(axios.get).toHaveBeenCalledWith(
        `${baseUrl}/organizations/${organization}/runs?${runsQuery(
          pageSize,
          workspaces,
        )}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should make the HTTP GET request correctly with default pageSize', async () => {
      await listOrgRuns({
        token,
        baseUrl,
        organization,
        workspaces,
      });

      expect(axios.get).toHaveBeenCalledWith(
        `${baseUrl}/organizations/${organization}/runs?${runsQuery(
          20,
          workspaces,
        )}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should encode the organization and workspace names', async () => {
      await listOrgRuns({
        token,
        baseUrl,
        organization: 'org 1/2',
        workspaces: ['work space'],
      });

      expect(axios.get).toHaveBeenCalledWith(
        `${baseUrl}/organizations/org%201%2F2/runs?filter%5Bworkspace_names%5D=work+space&page%5Bnumber%5D=1&page%5Bsize%5D=20`,
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

    it('should attribute a VCS-triggered run (no confirmed-by) to the commit sender', async () => {
      const vcsRun: TerraformRun = {
        ...mockRun,
        relationships: {
          workspace: mockRun.relationships.workspace,
          plan: mockRun.relationships.plan,
          'configuration-version': {
            data: { id: 'id-cv', type: 'configuration-versions' },
            links: { related: '/api/v2/runs/id-1/configuration-version' },
          },
        },
      };

      (axios.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/runs?')) {
          return Promise.resolve({ data: { data: [vcsRun], included: [] } });
        }
        if (url.endsWith('/ingress-attributes')) {
          return Promise.resolve({
            data: {
              data: {
                id: 'id-ia',
                type: 'ingress-attributes',
                attributes: {
                  'sender-username': 'commit-sender',
                  'sender-avatar-url': 'sender-avatar',
                },
              },
            },
          });
        }
        if (url.endsWith('/configuration-version')) {
          return Promise.resolve({
            data: {
              data: {
                id: 'id-cv',
                type: 'configuration-versions',
                attributes: {},
                relationships: {
                  'ingress-attributes': {
                    data: { id: 'id-ia', type: 'ingress-attributes' },
                    links: {
                      related:
                        '/api/v2/configuration-versions/id-cv/ingress-attributes',
                    },
                  },
                },
              },
            },
          });
        }
        if (url.includes('/workspaces/')) {
          return Promise.resolve({
            data: { data: mockEntities.find(e => e.type === 'workspaces') },
          });
        }
        return Promise.resolve({
          data: { data: mockEntities.find(e => e.type === 'plans') },
        });
      });

      const result = await listOrgRuns({
        token,
        baseUrl,
        organization,
        workspaces,
      });

      expect(result[0].confirmedBy).toEqual({
        name: 'commit-sender',
        avatar: 'sender-avatar',
      });
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/api/v2/runs/id-1/configuration-version',
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/api/v2/configuration-versions/id-cv/ingress-attributes',
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should not fetch the configuration version when the run has a confirmed-by user', async () => {
      await listOrgRuns({ token, baseUrl, organization, workspaces });

      const calledUrls = (axios.get as jest.Mock).mock.calls.map(c => c[0]);
      expect(
        calledUrls.some((u: string) => u.includes('configuration-version')),
      ).toBe(false);
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
    const organization = 'org-1';

    it('should make the HTTP GET request correctly', async () => {
      await getLatestRunForWorkspaces(
        baseUrl,
        token,
        organization,
        workSpaceNames,
      );

      expect(axios.get).toHaveBeenCalledWith(
        `${baseUrl}/organizations/${organization}/runs?${runsQuery(
          1,
          workSpaceNames,
        )}`,
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

    it('should return null when the workspaces have no runs', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          data: [],
          included: [],
        },
      });

      const result = await getLatestRunForWorkspaces(
        baseUrl,
        token,
        organization,
        workSpaceNames,
      );

      expect(result).toBeNull();
    });
  });

  describe('getAssessmentResultsForWorkspaces', () => {
    const workspaces = [mockWorkspace1Name, mockWorkspace2Name];
    const token = 'token-1';
    const organization = mockOrganization;
    const logger = mockServices.logger.mock();

    const workspaceUrl = (name: string) =>
      `${baseUrl}/organizations/${organization}/workspaces/${encodeURIComponent(
        name,
      )}`;

    const mockWorkspaceAndAssessmentRequests = () => {
      (axios.get as jest.Mock).mockImplementation((url: string) => {
        if (url === workspaceUrl(mockWorkspace1Name)) {
          return Promise.resolve({ data: { data: mockWorkspaces[0] } });
        }
        if (url === workspaceUrl(mockWorkspace2Name)) {
          return Promise.resolve({ data: { data: mockWorkspaces[1] } });
        }
        if (
          url.endsWith('/workspaces/workspace1-id/current-assessment-result')
        ) {
          return Promise.resolve({ data: { data: mockAssessmentResult1 } });
        }
        if (
          url.endsWith('/workspaces/workspace2-id/current-assessment-result')
        ) {
          return Promise.resolve({ data: { data: mockAssessmentResult2 } });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });
    };

    it('should make an HTTP GET request per workspace', async () => {
      mockWorkspaceAndAssessmentRequests();

      await getAssessmentResultsForWorkspaces({
        baseUrl,
        token,
        organization,
        workspaces,
        logger,
      });

      expect(axios.get).toHaveBeenCalledWith(workspaceUrl(mockWorkspace1Name), {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(axios.get).toHaveBeenCalledWith(workspaceUrl(mockWorkspace2Name), {
        headers: { Authorization: `Bearer ${token}` },
      });
    });

    it('should make the correct number of HTTP GET requests for health assessments', async () => {
      mockWorkspaceAndAssessmentRequests();

      await getAssessmentResultsForWorkspaces({
        baseUrl,
        token,
        organization,
        workspaces,
        logger,
      });

      expect(axios.get).toHaveBeenCalledTimes(4);
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/api/v2/workspaces/workspace1-id/current-assessment-result',
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://app.terraform.io/api/v2/workspaces/workspace2-id/current-assessment-result',
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    it('should return the correctly formatted data', async () => {
      mockWorkspaceAndAssessmentRequests();

      const result = await getAssessmentResultsForWorkspaces({
        baseUrl,
        token,
        organization,
        workspaces,
        logger,
      });

      expect(result).toEqual([
        {
          id: 'assessmentResult1',
          createdAt: '2025-04-01T16:26:28.423Z',
          workspaceId: 'workspace1-id',
          workspaceName: 'workspace-1',
          driftMetrics: {
            drifted: true,
            resourcesDrifted: 1,
            resourcesUndrifted: 135,
          },
          validationMetrics: {
            allChecksSucceeded: false,
            checksErrored: 0,
            checksFailed: 1,
            checksPassed: 4,
            checksUnknown: 0,
          },
        },
        {
          id: 'assessmentResult2',
          createdAt: '2025-04-02T06:20:31.884Z',
          workspaceId: 'workspace2-id',
          workspaceName: 'workspace-2',
          driftMetrics: {
            drifted: false,
            resourcesDrifted: 0,
            resourcesUndrifted: 93,
          },
          validationMetrics: {
            allChecksSucceeded: true,
            checksErrored: 0,
            checksFailed: 0,
            checksPassed: 5,
            checksUnknown: 0,
          },
        },
      ]);
    });

    it('should not lose workspaces when there are more than one page of workspaces in the organization', async () => {
      // Terraform Cloud returns 20 workspaces per page when listing an
      // organization's workspaces. Fetching each annotated workspace
      // individually must return every workspace regardless of how many the
      // organization has.
      const manyWorkspaceNames = Array.from(
        { length: 25 },
        (_, i) => `workspace-${i + 1}`,
      );

      (axios.get as jest.Mock).mockImplementation((url: string) => {
        const workspaceMatch = url.match(/\/workspaces\/(workspace-\d+)$/);
        if (workspaceMatch) {
          const name = workspaceMatch[1];
          const workspace: TerraformWorkspace = {
            id: `${name}-id`,
            type: 'workspaces',
            attributes: {
              'created-at': '2024-08-09T10:02:27.019Z',
              name,
            },
            relationships: {
              'current-assessment-result': {
                data: {
                  id: `asmtres-${name}`,
                  type: 'assessment-results',
                },
                links: {
                  related: `/api/v2/workspaces/${name}-id/current-assessment-result`,
                },
              },
            },
          };
          return Promise.resolve({ data: { data: workspace } });
        }
        if (url.endsWith('/current-assessment-result')) {
          return Promise.resolve({ data: { data: mockAssessmentResult1 } });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const result = await getAssessmentResultsForWorkspaces({
        baseUrl,
        token,
        organization,
        workspaces: manyWorkspaceNames,
        logger,
      });

      expect(result).toHaveLength(25);
      expect(result.map(r => r.workspaceName)).toEqual(manyWorkspaceNames);
      // one lookup per workspace plus one assessment fetch per workspace
      expect(axios.get).toHaveBeenCalledTimes(50);
    });

    it('should skip and log workspaces that cannot be fetched', async () => {
      const warn = jest.spyOn(logger, 'warn');

      (axios.get as jest.Mock).mockImplementation((url: string) => {
        if (url === workspaceUrl(mockWorkspace1Name)) {
          return Promise.reject(new Error('Not Found'));
        }
        if (url === workspaceUrl(mockWorkspace2Name)) {
          return Promise.resolve({ data: { data: mockWorkspaces[1] } });
        }
        if (
          url.endsWith('/workspaces/workspace2-id/current-assessment-result')
        ) {
          return Promise.resolve({ data: { data: mockAssessmentResult2 } });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const result = await getAssessmentResultsForWorkspaces({
        baseUrl,
        token,
        organization,
        workspaces,
        logger,
      });

      expect(result).toHaveLength(1);
      expect(result[0].workspaceName).toEqual(mockWorkspace2Name);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(`Skipping workspace "${mockWorkspace1Name}"`),
      );
    });

    it('should filter out workspaces without a current assessment result', async () => {
      const workspaceWithoutAssessment: TerraformWorkspace = {
        id: 'workspace1-id',
        type: 'workspaces',
        attributes: {
          'created-at': '2024-08-09T10:02:27.019Z',
          name: 'workspace-1',
        },
      };

      (axios.get as jest.Mock).mockImplementation((url: string) => {
        if (url === workspaceUrl(mockWorkspace1Name)) {
          return Promise.resolve({
            data: { data: workspaceWithoutAssessment },
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const result = await getAssessmentResultsForWorkspaces({
        baseUrl,
        token,
        organization,
        workspaces: [mockWorkspace1Name],
        logger,
      });

      expect(result).toEqual([]);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle an error when fetching a single workspace assessment', async () => {
      (axios.get as jest.Mock).mockImplementation((url: string) => {
        if (url === workspaceUrl(mockWorkspace1Name)) {
          return Promise.resolve({ data: { data: mockWorkspaces[0] } });
        }
        if (url === workspaceUrl(mockWorkspace2Name)) {
          return Promise.resolve({ data: { data: mockWorkspaces[1] } });
        }
        if (
          url.endsWith('/workspaces/workspace1-id/current-assessment-result')
        ) {
          return Promise.resolve({ data: { data: mockAssessmentResult1 } });
        }
        return Promise.reject(
          new Error('Failed to fetch assessment for workspace-2'),
        );
      });

      await expect(
        getAssessmentResultsForWorkspaces({
          baseUrl,
          token,
          organization,
          workspaces,
          logger,
        }),
      ).rejects.toThrow('Failed to fetch assessment for workspace-2');
      expect(axios.get).toHaveBeenCalledTimes(4);
    });

    it('should handle the case where the workspaces array is empty', async () => {
      const result = await getAssessmentResultsForWorkspaces({
        baseUrl,
        token,
        organization,
        workspaces: [],
        logger,
      });

      expect(result).toEqual([]);
      expect(axios.get).not.toHaveBeenCalled();
    });
  });
});
