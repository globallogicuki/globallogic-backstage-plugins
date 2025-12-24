/**
 * Tests for Unleash API client library
 */
import { mockServices } from '@backstage/backend-test-utils';
import fetch from 'node-fetch';
import {
  unleashFetch,
  getProjectFeatures,
  getFeatureFlag,
  toggleFeatureFlag,
  updateFeatureVariants,
  getFeatureMetrics,
  updateStrategy,
  getAllProjects,
  getAllEnvironments,
  UnleashClientOptions,
} from './unleash';

// Mock node-fetch
jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('unleash API client', () => {
  const mockLogger = mockServices.logger.mock();
  const options: UnleashClientOptions = {
    baseUrl: 'https://unleash.example.com',
    token: 'test-token-123',
    logger: mockLogger,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('unleashFetch', () => {
    it('makes successful GET request with correct headers', async () => {
      const mockResponse = { features: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
      } as any);

      const result = await unleashFetch(options, '/api/admin/projects');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/projects',
        {
          headers: {
            Authorization: 'test-token-123',
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('makes successful POST request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(''),
      } as any);

      const result = await unleashFetch(options, '/api/admin/toggle', {
        method: 'POST',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/toggle',
        {
          method: 'POST',
          headers: {
            Authorization: 'test-token-123',
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toBeNull();
    });

    it('makes successful PUT request with body', async () => {
      const mockBody = { variants: [] };
      const mockResponse = { success: true };
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
      } as any);

      const result = await unleashFetch(options, '/api/admin/variants', {
        method: 'PUT',
        body: JSON.stringify(mockBody),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/variants',
        {
          method: 'PUT',
          body: JSON.stringify(mockBody),
          headers: {
            Authorization: 'test-token-123',
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('includes custom headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('{}'),
      } as any);

      await unleashFetch(options, '/api/admin/test', {
        headers: { 'X-Custom-Header': 'value' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/test',
        {
          headers: {
            Authorization: 'test-token-123',
            'Content-Type': 'application/json',
            'X-Custom-Header': 'value',
          },
        },
      );
    });

    it('handles empty response body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(''),
      } as any);

      const result = await unleashFetch(options, '/api/admin/empty');

      expect(result).toBeNull();
    });

    it('handles non-JSON response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('not json'),
      } as any);

      const result = await unleashFetch(options, '/api/admin/invalid');

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse Unleash response as JSON'),
      );
    });

    it('throws error on 400 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('Invalid input'),
      } as any);

      await expect(
        unleashFetch(options, '/api/admin/bad'),
      ).rejects.toThrow('Unleash API error: Bad Request');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('400 Bad Request'),
      );
    });

    it('throws error with status code on 403 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: jest.fn().mockResolvedValue('Access denied'),
      } as any);

      try {
        await unleashFetch(options, '/api/admin/forbidden');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Unleash API error: Forbidden');
        expect(error.statusCode).toBe(403);
      }
    });

    it('throws error on 500 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Server error'),
      } as any);

      try {
        await unleashFetch(options, '/api/admin/error');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.statusCode).toBe(500);
      }
    });

    it('logs debug message for each request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('{}'),
      } as any);

      await unleashFetch(options, '/api/admin/test', { method: 'POST' });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Unleash API request: POST https://unleash.example.com/api/admin/test',
      );
    });
  });

  describe('getProjectFeatures', () => {
    it('fetches features for a project', async () => {
      const mockFeatures = { features: [{ name: 'feature-1' }] };
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockFeatures)),
      } as any);

      const result = await getProjectFeatures(options, 'my-project');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/projects/my-project/features',
        expect.any(Object),
      );
      expect(result).toEqual(mockFeatures);
    });
  });

  describe('getFeatureFlag', () => {
    it('fetches a single feature flag', async () => {
      const mockFlag = { name: 'my-flag', enabled: true };
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockFlag)),
      } as any);

      const result = await getFeatureFlag(
        options,
        'my-project',
        'my-flag',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/projects/my-project/features/my-flag',
        expect.any(Object),
      );
      expect(result).toEqual(mockFlag);
    });
  });

  describe('toggleFeatureFlag', () => {
    it('toggles flag on', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(''),
      } as any);

      await toggleFeatureFlag(
        options,
        'my-project',
        'my-flag',
        'production',
        'on',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/projects/my-project/features/my-flag/environments/production/on',
        {
          method: 'POST',
          headers: expect.any(Object),
        },
      );
    });

    it('toggles flag off', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(''),
      } as any);

      await toggleFeatureFlag(
        options,
        'my-project',
        'my-flag',
        'development',
        'off',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/projects/my-project/features/my-flag/environments/development/off',
        {
          method: 'POST',
          headers: expect.any(Object),
        },
      );
    });
  });

  describe('updateFeatureVariants', () => {
    it('updates variants for a feature', async () => {
      const variants = [
        { name: 'variant-a', weight: 50, weightType: 'fix' as const },
        { name: 'variant-b', weight: 50, weightType: 'fix' as const },
      ];
      const mockResponse = { variants };

      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
      } as any);

      const result = await updateFeatureVariants(
        options,
        'my-project',
        'my-flag',
        variants,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/projects/my-project/features/my-flag/variants',
        {
          method: 'PUT',
          body: JSON.stringify(variants),
          headers: expect.any(Object),
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFeatureMetrics', () => {
    it('fetches metrics for a feature', async () => {
      const mockMetrics = {
        version: 1,
        maturity: 'stable',
        featureName: 'my-flag',
        lastHourUsage: [],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockMetrics)),
      } as any);

      const result = await getFeatureMetrics(
        options,
        'my-project',
        'my-flag',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/projects/my-project/features/my-flag/metrics',
        expect.any(Object),
      );
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('updateStrategy', () => {
    it('updates a strategy for a feature', async () => {
      const strategyData = {
        name: 'default',
        parameters: { rollout: '50' },
      };
      const mockResponse = { ...strategyData, id: 'strat-1' };

      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
      } as any);

      const result = await updateStrategy(
        options,
        'my-project',
        'my-flag',
        'production',
        'strat-1',
        strategyData,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/projects/my-project/features/my-flag/environments/production/strategies/strat-1',
        {
          method: 'PUT',
          body: JSON.stringify(strategyData),
          headers: expect.any(Object),
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAllProjects', () => {
    it('fetches all projects', async () => {
      const mockProjects = {
        version: 1,
        projects: [
          { id: 'project-1', name: 'Project 1' },
          { id: 'project-2', name: 'Project 2' },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockProjects)),
      } as any);

      const result = await getAllProjects(options);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/projects',
        expect.any(Object),
      );
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getAllEnvironments', () => {
    it('fetches all environments', async () => {
      const mockEnvironments = {
        version: 1,
        environments: [
          { name: 'development', enabled: true },
          { name: 'production', enabled: true },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(mockEnvironments)),
      } as any);

      const result = await getAllEnvironments(options);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://unleash.example.com/api/admin/environments',
        expect.any(Object),
      );
      expect(result).toEqual(mockEnvironments);
    });
  });
});
