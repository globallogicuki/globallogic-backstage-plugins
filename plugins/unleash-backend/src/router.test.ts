import {
  mockCredentials,
  mockErrorHandler,
  mockServices,
} from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { mockFeatureFlagsList, mockFeatureFlag } from './mocks/flags';
import {
  getProjectFeatures,
  getFeatureFlag,
  toggleFeatureFlag,
  updateFeatureVariants,
  getFeatureMetrics,
  updateStrategy,
} from './lib';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  unleashFlagTogglePermission,
  unleashVariantManagePermission,
} from '@internal/backstage-plugin-unleash-common';
import { CatalogService } from '@backstage/plugin-catalog-node';

// Mock the library functions
jest.mock('./lib');

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component',
    namespace: 'default',
    annotations: {
      'unleash.io/project-id': 'test-project',
    },
  },
  spec: {
    owner: 'user:default/guest',
    type: 'service',
    lifecycle: 'experimental',
  },
};

describe('createRouter', () => {
  let app: express.Express;
  const mockPermissions = mockServices.permissions.mock();
  const mockCatalogApi = {
    getEntities: jest.fn(),
    getEntitiesByRefs: jest.fn(),
    getEntityByRef: jest.fn(),
    refreshEntity: jest.fn(),
    getEntityFacets: jest.fn(),
    validateEntity: jest.fn(),
    removeEntityByUid: jest.fn(),
    queryEntities: jest.fn(),
    getEntityAncestors: jest.fn(),
    getLocations: jest.fn(),
    getLocationById: jest.fn(),
    getLocationByRef: jest.fn(),
    removeLocationById: jest.fn(),
    addLocation: jest.fn(),
    getLocationByEntity: jest.fn(),
    analyzeLocation: jest.fn(),
    streamEntities: jest.fn(),
  } as jest.Mocked<CatalogService>;

  beforeEach(async () => {
    mockCatalogApi.getEntities.mockResolvedValue({ items: [] });

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      unleashUrl: 'https://unleash.example.com',
      unleashToken: 'test-token',
      editableEnvs: ['development', 'staging'],
      numEnvs: 4,
      httpAuth: mockServices.httpAuth(),
      permissions: mockPermissions,
      catalog: mockCatalogApi,
    });
    app = express();
    app.use(router);
    app.use(mockErrorHandler());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /projects/:projectId/features', () => {
    beforeEach(() => {
      mockCatalogApi.getEntities.mockResolvedValue({ items: [mockEntity] });
      mockPermissions.authorize.mockResolvedValue([
        { result: AuthorizeResult.ALLOW },
      ]);
    });

    it('returns feature flags for a project', async () => {
      (getProjectFeatures as jest.Mock).mockResolvedValue(mockFeatureFlagsList);

      const response = await request(app)
        .get('/projects/test-project/features')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockFeatureFlagsList);
      expect(getProjectFeatures).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://unleash.example.com',
          token: 'test-token',
        }),
        'test-project',
      );
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .get('/projects/test-project/features')
        .set('Authorization', mockCredentials.none.header());

      expect(response.status).toBe(401);
    });

    it('handles errors from Unleash API', async () => {
      (getProjectFeatures as jest.Mock).mockRejectedValue(
        new Error('Unleash API error'),
      );

      const response = await request(app)
        .get('/projects/test-project/features')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toBe(500);
    });
  });

  describe('GET /projects/:projectId/features/:featureName', () => {
    beforeEach(() => {
      mockCatalogApi.getEntities.mockResolvedValue({ items: [mockEntity] });
      mockPermissions.authorize.mockResolvedValue([
        { result: AuthorizeResult.ALLOW },
      ]);
    });

    it('returns a single feature flag', async () => {
      (getFeatureFlag as jest.Mock).mockResolvedValue(mockFeatureFlag);

      const response = await request(app)
        .get('/projects/test-project/features/test-flag')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockFeatureFlag);
      expect(getFeatureFlag).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://unleash.example.com',
          token: 'test-token',
        }),
        'test-project',
        'test-flag',
      );
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .get('/projects/test-project/features/test-flag')
        .set('Authorization', mockCredentials.none.header());

      expect(response.status).toBe(401);
    });
  });

  describe('POST /projects/:projectId/features/:featureName/environments/:environment/:action', () => {
    it('toggles a flag on when user has permission via component ownership', async () => {
      (toggleFeatureFlag as jest.Mock).mockResolvedValue(null);
      mockCatalogApi.getEntities.mockResolvedValue({ items: [mockEntity] });
      mockPermissions.authorize.mockImplementation(async requests => {
        expect(requests).toEqual([
          {
            permission: unleashFlagTogglePermission,
            resourceRef: stringifyEntityRef(mockEntity),
          },
        ]);
        return [{ result: AuthorizeResult.ALLOW }];
      });

      const response = await request(app)
        .post(
          '/projects/test-project/features/test-flag/environments/development/on',
        )
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ success: true });
      expect(toggleFeatureFlag).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://unleash.example.com',
          token: 'test-token',
        }),
        'test-project',
        'test-flag',
        'development',
        'on',
      );
    });

    it('denies toggle when no component is linked to project', async () => {
      mockCatalogApi.getEntities.mockResolvedValue({ items: [] });

      const response = await request(app)
        .post(
          '/projects/test-project/features/test-flag/environments/development/on',
        )
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(403);
      expect(response.body.error).toBe('Permission denied for toggle action');
      expect(toggleFeatureFlag).not.toHaveBeenCalled();
    });

    it('denies toggle when user does not have permission', async () => {
      mockCatalogApi.getEntities.mockResolvedValue({ items: [mockEntity] });
      mockPermissions.authorize.mockResolvedValue([
        { result: AuthorizeResult.DENY },
      ]);

      const response = await request(app)
        .post(
          '/projects/test-project/features/test-flag/environments/development/on',
        )
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(403);
      expect(response.body.error).toBe('Permission denied for toggle action');
      expect(toggleFeatureFlag).not.toHaveBeenCalled();
    });

    it('rejects toggle for non-editable environment', async () => {
      const response = await request(app)
        .post(
          '/projects/test-project/features/test-flag/environments/production/on',
        )
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(403);
      expect(response.body).toEqual({
        error:
          "Environment 'production' is not editable. Editable environments: development, staging",
      });
    });

    it('rejects invalid actions', async () => {
      const response = await request(app)
        .post(
          '/projects/test-project/features/test-flag/environments/development/invalid',
        )
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toBe(400);
      expect(toggleFeatureFlag).not.toHaveBeenCalled();
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .post(
          '/projects/test-project/features/test-flag/environments/development/on',
        )
        .set('Authorization', mockCredentials.none.header());

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /projects/:projectId/features/:featureName/variants', () => {
    const variants = [
      { name: 'variant-a', weight: 50, weightType: 'fix' as const },
      { name: 'variant-b', weight: 50, weightType: 'fix' as const },
    ];

    it('updates variants for a flag when user has permission', async () => {
      (updateFeatureVariants as jest.Mock).mockResolvedValue({ variants });
      mockCatalogApi.getEntities.mockResolvedValue({ items: [mockEntity] });
      mockPermissions.authorize.mockImplementation(async requests => {
        expect(requests).toEqual([
          {
            permission: unleashVariantManagePermission,
            resourceRef: stringifyEntityRef(mockEntity),
          },
        ]);
        return [{ result: AuthorizeResult.ALLOW }];
      });

      const response = await request(app)
        .put('/projects/test-project/features/test-flag/variants')
        .set('Authorization', mockCredentials.user.header())
        .send(variants);

      expect(response.status).toEqual(200);
      expect(updateFeatureVariants).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://unleash.example.com',
          token: 'test-token',
        }),
        'test-project',
        'test-flag',
        variants,
      );
    });

    it('denies updating variants when no component is linked', async () => {
      mockCatalogApi.getEntities.mockResolvedValue({ items: [] });

      const response = await request(app)
        .put('/projects/test-project/features/test-flag/variants')
        .set('Authorization', mockCredentials.user.header())
        .send(variants);

      expect(response.status).toEqual(403);
      expect(updateFeatureVariants).not.toHaveBeenCalled();
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .put('/projects/test-project/features/test-flag/variants')
        .set('Authorization', mockCredentials.none.header())
        .send([]);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /projects/:projectId/features/:featureName/environments/:environment/strategies/:strategyId', () => {
    const strategyData = { name: 'default', parameters: { rollout: '50' } };

    it('updates a strategy when user has permission', async () => {
      (updateStrategy as jest.Mock).mockResolvedValue({ ...strategyData });
      mockCatalogApi.getEntities.mockResolvedValue({ items: [mockEntity] });
      mockPermissions.authorize.mockImplementation(async requests => {
        expect(requests).toEqual([
          {
            permission: unleashVariantManagePermission,
            resourceRef: stringifyEntityRef(mockEntity),
          },
        ]);
        return [{ result: AuthorizeResult.ALLOW }];
      });

      const response = await request(app)
        .put(
          '/projects/test-project/features/test-flag/environments/development/strategies/strat1',
        )
        .set('Authorization', mockCredentials.user.header())
        .send(strategyData);

      expect(response.status).toEqual(200);
      expect(updateStrategy).toHaveBeenCalled();
    });

    it('denies updating strategy when no component is linked', async () => {
      mockCatalogApi.getEntities.mockResolvedValue({ items: [] });

      const response = await request(app)
        .put(
          '/projects/test-project/features/test-flag/environments/development/strategies/strat1',
        )
        .set('Authorization', mockCredentials.user.header())
        .send(strategyData);

      expect(response.status).toEqual(403);
      expect(updateStrategy).not.toHaveBeenCalled();
    });
  });

  describe('GET /projects/:projectId/features/:featureName/metrics', () => {
    beforeEach(() => {
      mockCatalogApi.getEntities.mockResolvedValue({ items: [mockEntity] });
      mockPermissions.authorize.mockResolvedValue([
        { result: AuthorizeResult.ALLOW },
      ]);
    });

    it('returns metrics for a flag', async () => {
      const mockMetrics = {
        version: 1,
        maturity: 'stable',
        featureName: 'test-flag',
        lastHourUsage: [],
        seenApplications: [],
      };

      (getFeatureMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const response = await request(app)
        .get('/projects/test-project/features/test-flag/metrics')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockMetrics);
      expect(getFeatureMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://unleash.example.com',
          token: 'test-token',
        }),
        'test-project',
        'test-flag',
      );
    });
  });
});
