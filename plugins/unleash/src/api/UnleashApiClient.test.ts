import { UnleashApiClient } from './UnleashApiClient';
import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import type {
  FeatureFlag,
  Variant,
  FeatureFlagMetrics,
  Strategy,
  ProjectSummary,
  EnvironmentSummary,
} from '@globallogicuki/backstage-plugin-unleash-common';

describe('UnleashApiClient', () => {
  let mockDiscoveryApi: jest.Mocked<DiscoveryApi>;
  let mockFetchApi: jest.Mocked<FetchApi>;
  let client: UnleashApiClient;

  const baseUrl = 'http://localhost:7007/api/unleash';

  beforeEach(() => {
    mockDiscoveryApi = {
      getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
    } as jest.Mocked<DiscoveryApi>;

    mockFetchApi = {
      fetch: jest.fn(),
    } as jest.Mocked<FetchApi>;

    client = new UnleashApiClient(mockDiscoveryApi, mockFetchApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('fetches configuration successfully', async () => {
      const mockConfig = {
        editableEnvs: ['development', 'staging'],
        numEnvs: 3,
      };

      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockConfig),
      } as unknown as Response);

      const result = await client.getConfig();

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('unleash');
      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/config`,
        undefined,
      );
      expect(result).toEqual(mockConfig);
    });

    it('handles API errors', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Server error occurred'),
      } as unknown as Response);

      await expect(client.getConfig()).rejects.toThrow(
        'Unleash API error: 500 Internal Server Error - Server error occurred',
      );
    });
  });

  describe('getFlags', () => {
    it('fetches all flags for a project', async () => {
      const mockFlags = {
        features: [
          {
            name: 'test-flag-1',
            type: 'release',
            project: 'test-project',
            stale: false,
            impressionData: false,
          } as FeatureFlag,
          {
            name: 'test-flag-2',
            type: 'experiment',
            project: 'test-project',
            stale: false,
            impressionData: false,
          } as FeatureFlag,
        ],
      };

      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockFlags),
      } as unknown as Response);

      const result = await client.getFlags('test-project');

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/test-project/features`,
        undefined,
      );
      expect(result).toEqual(mockFlags);
      expect(result.features).toHaveLength(2);
    });

    it('handles 404 errors when project not found', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Project not found'),
      } as unknown as Response);

      await expect(client.getFlags('nonexistent-project')).rejects.toThrow(
        'Unleash API error: 404 Not Found - Project not found',
      );
    });
  });

  describe('getFlag', () => {
    it('fetches a single flag with full details', async () => {
      const mockFlag: FeatureFlag = {
        name: 'test-flag',
        type: 'release',
        project: 'test-project',
        stale: false,
        impressionData: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        description: 'Test flag description',
        environments: [
          {
            name: 'development',
            enabled: true,
            strategies: [],
          },
        ],
      };

      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockFlag),
      } as unknown as Response);

      const result = await client.getFlag('test-project', 'test-flag');

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/test-project/features/test-flag`,
        undefined,
      );
      expect(result).toEqual(mockFlag);
    });

    it('handles errors when flag not found', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Feature flag not found'),
      } as unknown as Response);

      await expect(
        client.getFlag('test-project', 'nonexistent-flag'),
      ).rejects.toThrow(
        'Unleash API error: 404 Not Found - Feature flag not found',
      );
    });
  });

  describe('toggleFlag', () => {
    it('enables a flag in an environment', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      await client.toggleFlag('test-project', 'test-flag', 'development', true);

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/test-project/features/test-flag/environments/development/on`,
        { method: 'POST' },
      );
    });

    it('disables a flag in an environment', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      await client.toggleFlag('test-project', 'test-flag', 'production', false);

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/test-project/features/test-flag/environments/production/off`,
        { method: 'POST' },
      );
    });

    it('handles permission errors', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: jest.fn().mockResolvedValue('Permission denied'),
      } as unknown as Response);

      await expect(
        client.toggleFlag('test-project', 'test-flag', 'production', true),
      ).rejects.toThrow('Unleash API error: 403 Forbidden - Permission denied');
    });

    it('handles non-editable environment errors', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest
          .fn()
          .mockResolvedValue('Environment production is not editable'),
      } as unknown as Response);

      await expect(
        client.toggleFlag('test-project', 'test-flag', 'production', true),
      ).rejects.toThrow(
        'Unleash API error: 400 Bad Request - Environment production is not editable',
      );
    });
  });

  describe('updateVariants', () => {
    it('updates variants successfully', async () => {
      const mockVariants: Variant[] = [
        {
          name: 'variant-a',
          weight: 500,
          weightType: 'variable',
          payload: { type: 'string', value: 'a' },
        },
        {
          name: 'variant-b',
          weight: 500,
          weightType: 'variable',
        },
      ];

      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      await client.updateVariants('test-project', 'test-flag', mockVariants);

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/test-project/features/test-flag/variants`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockVariants),
        },
      );
    });

    it('handles validation errors for variants', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('Invalid variant configuration'),
      } as unknown as Response);

      await expect(
        client.updateVariants('test-project', 'test-flag', []),
      ).rejects.toThrow(
        'Unleash API error: 400 Bad Request - Invalid variant configuration',
      );
    });
  });

  describe('getMetrics', () => {
    it('fetches metrics for a flag', async () => {
      const mockMetrics: FeatureFlagMetrics = {
        version: 1,
        maturity: 'stable',
        featureName: 'test-flag',
        lastHourUsage: [
          {
            start: '2024-01-01T00:00:00.000Z',
            stop: '2024-01-01T01:00:00.000Z',
            yes: 100,
            no: 50,
          },
        ],
        seenApplications: ['app-1', 'app-2'],
      };

      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMetrics),
      } as unknown as Response);

      const result = await client.getMetrics('test-project', 'test-flag');

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/test-project/features/test-flag/metrics`,
        undefined,
      );
      expect(result).toEqual(mockMetrics);
    });

    it('handles errors when metrics unavailable', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Metrics not available'),
      } as unknown as Response);

      await expect(
        client.getMetrics('test-project', 'test-flag'),
      ).rejects.toThrow(
        'Unleash API error: 404 Not Found - Metrics not available',
      );
    });
  });

  describe('updateStrategy', () => {
    it('updates a strategy successfully', async () => {
      const mockStrategy: Partial<Strategy> = {
        id: 'strategy-1',
        name: 'flexibleRollout',
        parameters: {
          rollout: '50',
          stickiness: 'default',
        },
        constraints: [
          {
            contextName: 'userId',
            operator: 'IN',
            values: ['user-1', 'user-2'],
          },
        ],
      };

      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      await client.updateStrategy(
        'test-project',
        'test-flag',
        'development',
        'strategy-1',
        mockStrategy,
      );

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects/test-project/features/test-flag/environments/development/strategies/strategy-1`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockStrategy),
        },
      );
    });

    it('handles errors when strategy update fails', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('Invalid strategy configuration'),
      } as unknown as Response);

      await expect(
        client.updateStrategy(
          'test-project',
          'test-flag',
          'development',
          'strategy-1',
          { name: 'invalid' },
        ),
      ).rejects.toThrow(
        'Unleash API error: 400 Bad Request - Invalid strategy configuration',
      );
    });

    it('handles permission errors for protected environments', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: jest
          .fn()
          .mockResolvedValue('Cannot modify protected environment'),
      } as unknown as Response);

      await expect(
        client.updateStrategy(
          'test-project',
          'test-flag',
          'production',
          'strategy-1',
          {},
        ),
      ).rejects.toThrow(
        'Unleash API error: 403 Forbidden - Cannot modify protected environment',
      );
    });
  });

  describe('getProjects', () => {
    it('fetches all projects successfully', async () => {
      const mockProjects: ProjectSummary[] = [
        {
          name: 'Project Alpha',
          id: 'alpha',
          description: 'First project',
          health: 85,
          technicalDebt: 15,
          favorite: false,
          featureCount: 10,
          memberCount: 5,
          createdAt: '2024-01-01T00:00:00.000Z',
          archivedAt: null,
          mode: 'open',
          lastReportedFlagUsage: '2024-01-15T00:00:00.000Z',
          lastUpdatedAt: '2024-01-15T00:00:00.000Z',
          owners: [{ ownerType: 'user' }],
        },
        {
          name: 'Project Beta',
          id: 'beta',
          description: 'Second project',
          health: 70,
          technicalDebt: 30,
          favorite: true,
          featureCount: 15,
          memberCount: 3,
          createdAt: '2024-01-05T00:00:00.000Z',
          archivedAt: null,
          mode: 'open',
          lastReportedFlagUsage: '2024-01-10T00:00:00.000Z',
          lastUpdatedAt: '2024-01-10T00:00:00.000Z',
          owners: [{ ownerType: 'user' }],
        },
      ];

      const mockResponse = { version: 1, projects: mockProjects };

      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await client.getProjects();

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/projects`,
        undefined,
      );
      expect(result).toEqual(mockResponse);
      expect(result.projects).toHaveLength(2);
    });

    it('handles errors when fetching projects', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Failed to fetch projects'),
      } as unknown as Response);

      await expect(client.getProjects()).rejects.toThrow(
        'Unleash API error: 500 Internal Server Error - Failed to fetch projects',
      );
    });

    it('handles empty projects list', async () => {
      const mockResponse = { version: 1, projects: [] };

      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await client.getProjects();

      expect(result.projects).toHaveLength(0);
    });
  });

  describe('getEnvironments', () => {
    it('fetches all environments successfully', async () => {
      const mockEnvironments: EnvironmentSummary[] = [
        {
          name: 'development',
          type: 'development',
          sortOrder: 1,
          enabled: true,
          protected: false,
          requiredApprovals: null,
          projectCount: 5,
          apiTokenCount: 2,
          enabledToggleCount: 20,
        },
        {
          name: 'production',
          type: 'production',
          sortOrder: 2,
          enabled: true,
          protected: true,
          requiredApprovals: 2,
          projectCount: 3,
          apiTokenCount: 1,
          enabledToggleCount: 15,
        },
      ];

      const mockResponse = { version: 1, environments: mockEnvironments };

      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await client.getEnvironments();

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/environments`,
        undefined,
      );
      expect(result).toEqual(mockResponse);
      expect(result.environments).toHaveLength(2);
    });

    it('handles errors when fetching environments', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Failed to fetch environments'),
      } as unknown as Response);

      await expect(client.getEnvironments()).rejects.toThrow(
        'Unleash API error: 500 Internal Server Error - Failed to fetch environments',
      );
    });

    it('handles empty environments list', async () => {
      const mockResponse = { version: 1, environments: [] };

      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await client.getEnvironments();

      expect(result.environments).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('handles network errors', async () => {
      mockFetchApi.fetch.mockRejectedValue(new Error('Network error'));

      await expect(client.getConfig()).rejects.toThrow('Network error');
    });

    it('handles malformed JSON responses', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response);

      await expect(client.getConfig()).rejects.toThrow('Invalid JSON');
    });

    it('preserves error messages from API', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest
          .fn()
          .mockResolvedValue(
            'Validation failed: flag name must be alphanumeric',
          ),
      } as unknown as Response);

      await expect(client.getConfig()).rejects.toThrow(
        'Unleash API error: 400 Bad Request - Validation failed: flag name must be alphanumeric',
      );
    });
  });

  describe('discovery API integration', () => {
    it('calls discovery API for each request', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ editableEnvs: [] }),
      } as unknown as Response);

      await client.getConfig();
      await client.getProjects();

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledTimes(2);
      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('unleash');
    });

    it('handles discovery API failures', async () => {
      mockDiscoveryApi.getBaseUrl.mockRejectedValue(
        new Error('Service discovery failed'),
      );

      await expect(client.getConfig()).rejects.toThrow(
        'Service discovery failed',
      );
    });
  });
});
