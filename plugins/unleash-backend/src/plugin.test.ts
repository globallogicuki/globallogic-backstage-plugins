import { createRouter } from './router';
import { unleashPlugin } from './plugin';
import { mockServices } from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { CatalogService } from '@backstage/plugin-catalog-node';

describe('unleashPlugin exports', () => {
  it('should export plugin', () => {
    expect(unleashPlugin).toBeDefined();
  });
});

describe('unleashPlugin router creation', () => {
  it('should create router successfully with full configuration', async () => {
    const mockPermissions = mockServices.permissions.mock();
    mockPermissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.ALLOW },
    ]);

    const mockCatalog = {
      getEntities: jest.fn(),
      getEntitiesByRefs: jest.fn(),
      getEntityByRef: jest.fn(),
      refreshEntity: jest.fn(),
      getEntityFacets: jest.fn(),
      queryEntities: jest.fn(),
      removeEntityByUid: jest.fn(),
      validateEntity: jest.fn(),
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

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      unleashUrl: 'https://unleash.example.com',
      unleashToken: 'test-token',
      httpAuth: mockServices.httpAuth(),
      permissions: mockPermissions,
      editableEnvs: ['development', 'staging'],
      numEnvs: 4,
      catalog: mockCatalog,
      enablePermissions: true,
    });

    expect(router).toBeDefined();
  });

  it('should create router with minimal configuration', async () => {
    const mockPermissions = mockServices.permissions.mock();
    mockPermissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.ALLOW },
    ]);

    const mockCatalog = {
      getEntities: jest.fn(),
      getEntitiesByRefs: jest.fn(),
      getEntityByRef: jest.fn(),
      refreshEntity: jest.fn(),
      getEntityFacets: jest.fn(),
      queryEntities: jest.fn(),
      removeEntityByUid: jest.fn(),
      validateEntity: jest.fn(),
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

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      unleashUrl: 'https://unleash.example.com',
      unleashToken: 'test-token',
      httpAuth: mockServices.httpAuth(),
      permissions: mockPermissions,
      editableEnvs: [],
      catalog: mockCatalog,
    });

    expect(router).toBeDefined();
  });

  it('should create router with permissions disabled', async () => {
    const mockPermissions = mockServices.permissions.mock();

    const mockCatalog = {
      getEntities: jest.fn(),
      getEntitiesByRefs: jest.fn(),
      getEntityByRef: jest.fn(),
      refreshEntity: jest.fn(),
      getEntityFacets: jest.fn(),
      queryEntities: jest.fn(),
      removeEntityByUid: jest.fn(),
      validateEntity: jest.fn(),
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

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      unleashUrl: 'https://unleash.example.com',
      unleashToken: 'test-token',
      httpAuth: mockServices.httpAuth(),
      permissions: mockPermissions,
      editableEnvs: ['development'],
      catalog: mockCatalog,
      enablePermissions: false,
    });

    expect(router).toBeDefined();
  });

  it('should create router with custom numEnvs', async () => {
    const mockPermissions = mockServices.permissions.mock();

    const mockCatalog = {
      getEntities: jest.fn(),
      getEntitiesByRefs: jest.fn(),
      getEntityByRef: jest.fn(),
      refreshEntity: jest.fn(),
      getEntityFacets: jest.fn(),
      queryEntities: jest.fn(),
      removeEntityByUid: jest.fn(),
      validateEntity: jest.fn(),
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

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      unleashUrl: 'https://unleash.example.com',
      unleashToken: 'test-token',
      httpAuth: mockServices.httpAuth(),
      permissions: mockPermissions,
      editableEnvs: ['development'],
      numEnvs: 6,
      catalog: mockCatalog,
    });

    expect(router).toBeDefined();
  });

  it('should create router with multiple editable environments', async () => {
    const mockPermissions = mockServices.permissions.mock();

    const mockCatalog = {
      getEntities: jest.fn(),
      getEntitiesByRefs: jest.fn(),
      getEntityByRef: jest.fn(),
      refreshEntity: jest.fn(),
      getEntityFacets: jest.fn(),
      queryEntities: jest.fn(),
      removeEntityByUid: jest.fn(),
      validateEntity: jest.fn(),
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

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      unleashUrl: 'https://unleash.example.com',
      unleashToken: 'test-token',
      httpAuth: mockServices.httpAuth(),
      permissions: mockPermissions,
      editableEnvs: ['dev', 'staging', 'qa'],
      catalog: mockCatalog,
    });

    expect(router).toBeDefined();
  });
});
