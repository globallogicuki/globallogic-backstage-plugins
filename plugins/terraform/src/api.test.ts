import { TerraformApiClient } from './api';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

jest.mock('@backstage/core-plugin-api', () => ({
  DiscoveryApi: jest.fn(),
  FetchApi: jest.fn(),
  createApiRef: jest.fn(),
}));

describe('TerraformApiClient', () => {
  describe('getRuns', () => {
    let discoveryApiMock: DiscoveryApi;
    let fetchApiMock: FetchApi;
    let client: TerraformApiClient;

    const mockRuns = [{ id: 'run1' }, { id: 'run2' }];

    beforeEach(() => {
      discoveryApiMock = {
        getBaseUrl: jest.fn().mockResolvedValue('http://mock-api.com'),
      };
      fetchApiMock = {
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue(mockRuns),
        }),
      };

      client = new TerraformApiClient({
        discoveryApi: discoveryApiMock,
        fetchApi: fetchApiMock,
      });
    });

    it('calls DiscoveryApi with the correct id', async () => {
      await client.getRuns('org1', ['workspace1', 'workspace2']);
      expect(discoveryApiMock.getBaseUrl).toHaveBeenCalledWith('terraform');
    });

    it('calls FetchApi with the correct args when single workspace', async () => {
      await client.getRuns('org1', ['workspace1']);

      expect(fetchApiMock.fetch).toHaveBeenCalledWith(
        'http://mock-api.com/organizations/org1/workspaces/workspace1/runs',
        { credentials: 'include' },
      );
    });

    it('calls FetchApi with the correct args when multiple workspaces', async () => {
      await client.getRuns('org1', ['workspace1', 'workspace2']);

      expect(fetchApiMock.fetch).toHaveBeenCalledWith(
        'http://mock-api.com/organizations/org1/workspaces/workspace1,workspace2/runs',
        { credentials: 'include' },
      );
    });

    it('returns runs when successful', async () => {
      const runs = await client.getRuns('org1', ['workspace1', 'workspace2']);

      expect(runs).toEqual(mockRuns);
    });

    it('should throw an error when the FetchApi call is unsuccessful', async () => {
      const response = {
        ok: false,
        json: jest
          .fn()
          .mockResolvedValue({ error: { message: 'Failed to fetch runs' } }),
      };
      (fetchApiMock.fetch as jest.Mock).mockResolvedValue(response);

      await expect(
        client.getRuns('org1', ['workspace1', 'workspace2']),
      ).rejects.toThrow('Failed to fetch runs');
    });

    it('should throw an error when the FetchApi call is unsuccessful and no error message is present', async () => {
      const response = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: undefined }),
      };
      (fetchApiMock.fetch as jest.Mock).mockResolvedValue(response);

      await expect(
        client.getRuns('org1', ['workspace1', 'workspace2']),
      ).rejects.toThrow('Error fetching runs!');
    });
  });

  describe('getLatestRun', () => {
    let discoveryApiMock: DiscoveryApi;
    let fetchApiMock: FetchApi;
    let client: TerraformApiClient;

    const mockLatestRun = { id: 'run1' };

    beforeEach(() => {
      discoveryApiMock = {
        getBaseUrl: jest.fn().mockResolvedValue('http://mock-api.com'),
      };
      fetchApiMock = {
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue(mockLatestRun),
        }),
      };

      client = new TerraformApiClient({
        discoveryApi: discoveryApiMock,
        fetchApi: fetchApiMock,
      });
    });

    it('calls DiscoveryApi with the correct id', async () => {
      await client.getLatestRun('org1', ['workspace1', 'workspace2']);
      expect(discoveryApiMock.getBaseUrl).toHaveBeenCalledWith('terraform');
    });

    it('calls FetchApi with the correct args when single workspace', async () => {
      await client.getLatestRun('org1', ['workspace1']);

      expect(fetchApiMock.fetch).toHaveBeenCalledWith(
        'http://mock-api.com/organizations/org1/workspaces/workspace1/latestRun',
        { credentials: 'include' },
      );
    });

    it('calls FetchApi with the correct args when multiple workspaces', async () => {
      await client.getLatestRun('org1', ['workspace1', 'workspace2']);

      expect(fetchApiMock.fetch).toHaveBeenCalledWith(
        'http://mock-api.com/organizations/org1/workspaces/workspace1,workspace2/latestRun',
        { credentials: 'include' },
      );
    });

    it('returns latest run when successful', async () => {
      const latestRunResult = await client.getLatestRun('org1', [
        'workspace1',
        'workspace2',
      ]);

      expect(latestRunResult).toEqual(mockLatestRun);
    });

    it('should throw an error when the FetchApi call is unsuccessful', async () => {
      const response = {
        ok: false,
        json: jest
          .fn()
          .mockResolvedValue({ error: { message: 'Failed to fetch runs' } }),
      };
      (fetchApiMock.fetch as jest.Mock).mockResolvedValue(response);

      await expect(
        client.getLatestRun('org1', ['workspace1', 'workspace2']),
      ).rejects.toThrow('Failed to fetch runs');
    });

    it('should throw an error when the FetchApi call is unsuccessful and no error message is present', async () => {
      const response = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: undefined }),
      };
      (fetchApiMock.fetch as jest.Mock).mockResolvedValue(response);

      await expect(
        client.getRuns('org1', ['workspace1', 'workspace2']),
      ).rejects.toThrow('Error fetching runs!');
    });
  });

  describe('getAssessmentResultsForWorkspaces', () => {
    let discoveryApiMock: DiscoveryApi;
    let fetchApiMock: FetchApi;
    let client: TerraformApiClient;

    const mockAssessmentResults = [
      {
        'id': 'asmtres-N6atvLGyj5hquU1k',
        'createdAt': '2025-04-01T16:26:28.423Z',
        'workspaceId': 'workspace1-id',
        'workspaceName': 'workspace1',
        'driftMetrics': {
          'drifted': true,
          'resourcesDrifted': 1,
          'resourcesUndrifted': 135
        },
        'validationMetrics': {
          'allChecksSucceeded': false,
          'checksErrored': 0,
          'checksFailed': 1,
          'checksPassed': 4,
          'checksUnknown': 0
        }
      },
      {
        'id': 'asmtres-epyF7fJBDnHp87Z7',
        'createdAt': '2025-04-02T06:20:31.884Z',
        'workspaceId': 'workspace2-id',
        'workspaceName': 'workspace2',
        'driftMetrics': {
          'drifted': false,
          'resourcesDrifted': 0,
          'resourcesUndrifted': 93
        },
        'validationMetrics': {
          'allChecksSucceeded': true,
          'checksErrored': 0,
          'checksFailed': 0,
          'checksPassed': 5,
          'checksUnknown': 0
        }
      }
    ];

    beforeEach(() => {
      discoveryApiMock = {
        getBaseUrl: jest.fn().mockResolvedValue('http://mock-api.com'),
      };
      fetchApiMock = {
        fetch: jest.fn().mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue(mockAssessmentResults),
        }),
      };

      client = new TerraformApiClient({
        discoveryApi: discoveryApiMock,
        fetchApi: fetchApiMock,
      });
    });

    it('calls DiscoveryApi with the correct id', async () => {
      await client.getAssessmentResultsForWorkspaces('org1', ['workspace1', 'workspace2']);
      expect(discoveryApiMock.getBaseUrl).toHaveBeenCalledWith('terraform');
    });

    it('calls FetchApi with the correct args when single workspace', async () => {
      await client.getAssessmentResultsForWorkspaces('org1', ['workspace1']);

      expect(fetchApiMock.fetch).toHaveBeenCalledWith(
        'http://mock-api.com/organizations/org1/workspaces/workspace1/assessment-results',
        { credentials: 'include' },
      );
    });

    it('calls FetchApi with the correct args when multiple workspaces', async () => {
      await client.getAssessmentResultsForWorkspaces('org1', ['workspace1', 'workspace2']);

      expect(fetchApiMock.fetch).toHaveBeenCalledWith(
        'http://mock-api.com/organizations/org1/workspaces/workspace1,workspace2/assessment-results',
        { credentials: 'include' },
      );
    });

    it('returns runs when successful', async () => {
      const runs = await client.getAssessmentResultsForWorkspaces('org1', ['workspace1', 'workspace2']);

      expect(runs).toEqual(mockAssessmentResults);
    });

    it('should throw an error when the FetchApi call is unsuccessful', async () => {
      const response = {
        ok: false,
        json: jest
          .fn()
          .mockResolvedValue({ error: { message: 'Failed to fetch assessment results' } }),
      };
      (fetchApiMock.fetch as jest.Mock).mockResolvedValue(response);

      await expect(
        client.getAssessmentResultsForWorkspaces('org1', ['workspace1', 'workspace2']),
      ).rejects.toThrow('Failed to fetch assessment results');
    });

    it('should throw an error when the FetchApi call is unsuccessful and no error message is present', async () => {
      const response = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: undefined }),
      };
      (fetchApiMock.fetch as jest.Mock).mockResolvedValue(response);

      await expect(
        client.getAssessmentResultsForWorkspaces('org1', ['workspace1', 'workspace2']),
      ).rejects.toThrow('Error fetching assessment results!');
    });
  });

});
