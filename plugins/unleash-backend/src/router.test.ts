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

    it('requires permission', async () => {
      mockCatalogApi.getEntities.mockResolvedValue({ items: [mockEntity] });
      mockPermissions.authorize.mockResolvedValue([
        { result: AuthorizeResult.DENY },
      ]);

      const response = await request(app)
        .get('/projects/test-project/features/test-flag/metrics')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(403);
      expect(getFeatureMetrics).not.toHaveBeenCalled();
    });
  });

  describe('GET /config', () => {
    it('returns configuration', async () => {
      const response = await request(app).get('/config');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        editableEnvs: ['development', 'staging'],
        numEnvs: 4,
      });
    });
  });

  describe('GET /projects', () => {
    const mockProjects = {
      version: 1,
      projects: [
        { id: 'project-1', name: 'Project 1' },
        { id: 'project-2', name: 'Project 2' },
      ],
    };

    it('returns all projects', async () => {
      const { getAllProjects } = require('./lib');
      (getAllProjects as jest.Mock).mockResolvedValue(mockProjects);

      const response = await request(app)
        .get('/projects')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockProjects);
      expect(getAllProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://unleash.example.com',
          token: 'test-token',
        }),
      );
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .get('/projects')
        .set('Authorization', mockCredentials.none.header());

      expect(response.status).toBe(401);
    });
  });

  describe('GET /environments', () => {
    const mockEnvironments = {
      version: 1,
      environments: [
        { name: 'development', enabled: true },
        { name: 'production', enabled: true },
      ],
    };

    it('returns all environments', async () => {
      const { getAllEnvironments } = require('./lib');
      (getAllEnvironments as jest.Mock).mockResolvedValue(mockEnvironments);

      const response = await request(app)
        .get('/environments')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockEnvironments);
      expect(getAllEnvironments).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://unleash.example.com',
          token: 'test-token',
        }),
      );
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .get('/environments')
        .set('Authorization', mockCredentials.none.header());

      expect(response.status).toBe(401);
    });
  });

  describe('Permission checks with multiple entities', () => {
    const mockEntity2 = {
      ...mockEntity,
      metadata: {
        ...mockEntity.metadata,
        name: 'test-component-2',
      },
    };

    it('allows access if user has permission on any linked entity', async () => {
      mockCatalogApi.getEntities.mockResolvedValue({
        items: [mockEntity, mockEntity2],
      });
      mockPermissions.authorize.mockResolvedValue([
        { result: AuthorizeResult.DENY }, // First entity: deny
        { result: AuthorizeResult.ALLOW }, // Second entity: allow
      ]);

      const response = await request(app)
        .get('/projects/test-project/features')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(200);
      expect(mockPermissions.authorize).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ resourceRef: stringifyEntityRef(mockEntity) }),
          expect.objectContaining({ resourceRef: stringifyEntityRef(mockEntity2) }),
        ]),
        expect.any(Object),
      );
    });

    it('denies access if user has no permission on any linked entity', async () => {
      mockCatalogApi.getEntities.mockResolvedValue({
        items: [mockEntity, mockEntity2],
      });
      mockPermissions.authorize.mockResolvedValue([
        { result: AuthorizeResult.DENY },
        { result: AuthorizeResult.DENY },
      ]);

      const response = await request(app)
        .get('/projects/test-project/features')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(403);
    });
  });

  describe('Error handling from Unleash API', () => {
    beforeEach(() => {
      mockCatalogApi.getEntities.mockResolvedValue({ items: [mockEntity] });
      mockPermissions.authorize.mockResolvedValue([
        { result: AuthorizeResult.ALLOW },
      ]);
    });

    it('handles 403 Forbidden from toggle endpoint', async () => {
      const forbiddenError: any = new Error('Forbidden');
      forbiddenError.statusCode = 403;
      (toggleFeatureFlag as jest.Mock).mockRejectedValue(forbiddenError);

      const response = await request(app)
        .post('/projects/test-project/features/test-flag/environments/development/on')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(403);
      expect(response.body.error).toContain('Permission denied');
    });

    it('handles 500 error from toggle endpoint', async () => {
      const serverError: any = new Error('Internal server error');
      serverError.statusCode = 500;
      (toggleFeatureFlag as jest.Mock).mockRejectedValue(serverError);

      const response = await request(app)
        .post('/projects/test-project/features/test-flag/environments/development/on')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(500);
    });

    it('handles 403 from variant update', async () => {
      const forbiddenError: any = new Error('Forbidden');
      forbiddenError.statusCode = 403;
      (updateFeatureVariants as jest.Mock).mockRejectedValue(forbiddenError);

      const response = await request(app)
        .put('/projects/test-project/features/test-flag/variants')
        .set('Authorization', mockCredentials.user.header())
        .send([]);

      expect(response.status).toEqual(403);
    });

    it('handles 403 from strategy update', async () => {
      const forbiddenError: any = new Error('Forbidden');
      forbiddenError.statusCode = 403;
      (updateStrategy as jest.Mock).mockRejectedValue(forbiddenError);

      const response = await request(app)
        .put('/projects/test-project/features/test-flag/environments/development/strategies/strat1')
        .set('Authorization', mockCredentials.user.header())
        .send({ name: 'default' });

      expect(response.status).toEqual(403);
    });
  });

  describe('Strategy update non-editable environment', () => {
    beforeEach(() => {
      mockCatalogApi.getEntities.mockResolvedValue({ items: [mockEntity] });
      mockPermissions.authorize.mockResolvedValue([
        { result: AuthorizeResult.ALLOW },
      ]);
    });

    it('denies strategy update for non-editable environment', async () => {
      const response = await request(app)
        .put('/projects/test-project/features/test-flag/environments/production/strategies/strat1')
        .set('Authorization', mockCredentials.user.header())
        .send({ name: 'default' });

      expect(response.status).toEqual(403);
      expect(response.body.error).toContain('not editable');
      expect(updateStrategy).not.toHaveBeenCalled();
    });
  });

  describe('Variant update with no editable environments', () => {
    it('denies variant update when no environments are editable', async () => {
      const routerNoEditable = await createRouter({
        logger: mockServices.logger.mock(),
        unleashUrl: 'https://unleash.example.com',
        unleashToken: 'test-token',
        editableEnvs: [],
        numEnvs: 4,
        httpAuth: mockServices.httpAuth(),
        permissions: mockPermissions,
        catalog: mockCatalogApi,
      });
      const appNoEditable = express();
      appNoEditable.use(routerNoEditable);
      appNoEditable.use(mockErrorHandler());

      const response = await request(appNoEditable)
        .put('/projects/test-project/features/test-flag/variants')
        .set('Authorization', mockCredentials.user.header())
        .send([]);

      expect(response.status).toEqual(403);
      expect(response.body.error).toContain('No environments are editable');
    });
  });

  describe('Permissions disabled mode', () => {
    let appNoPermissions: express.Express;

    beforeEach(async () => {
      const routerNoPermissions = await createRouter({
        logger: mockServices.logger.mock(),
        unleashUrl: 'https://unleash.example.com',
        unleashToken: 'test-token',
        editableEnvs: ['development'],
        numEnvs: 4,
        httpAuth: mockServices.httpAuth(),
        permissions: mockPermissions,
        catalog: mockCatalogApi,
        enablePermissions: false,
      });
      appNoPermissions = express();
      appNoPermissions.use(routerNoPermissions);
      appNoPermissions.use(mockErrorHandler());

      // Reset mocks
      mockCatalogApi.getEntities.mockReset();
      mockPermissions.authorize.mockReset();
    });

    it('allows toggle without permission checks when disabled', async () => {
      (toggleFeatureFlag as jest.Mock).mockResolvedValue(null);

      const response = await request(appNoPermissions)
        .post('/projects/test-project/features/test-flag/environments/development/on')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(200);
      expect(mockCatalogApi.getEntities).not.toHaveBeenCalled();
      expect(mockPermissions.authorize).not.toHaveBeenCalled();
      expect(toggleFeatureFlag).toHaveBeenCalled();
    });

    it('allows reading features without permission checks when disabled', async () => {
      (getProjectFeatures as jest.Mock).mockResolvedValue(mockFeatureFlagsList);

      const response = await request(appNoPermissions)
        .get('/projects/test-project/features')
        .set('Authorization', mockCredentials.user.header());

      expect(response.status).toEqual(200);
      expect(mockCatalogApi.getEntities).not.toHaveBeenCalled();
      expect(mockPermissions.authorize).not.toHaveBeenCalled();
    });

    it('allows variant updates without permission checks when disabled', async () => {
      (updateFeatureVariants as jest.Mock).mockResolvedValue({ variants: [] });

      const response = await request(appNoPermissions)
        .put('/projects/test-project/features/test-flag/variants')
        .set('Authorization', mockCredentials.user.header())
        .send([]);

      expect(response.status).toEqual(200);
      expect(mockCatalogApi.getEntities).not.toHaveBeenCalled();
      expect(mockPermissions.authorize).not.toHaveBeenCalled();
    });
  });
});
