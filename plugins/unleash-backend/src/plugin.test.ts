import { createRouter } from './router';
import { mockServices } from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { CatalogService } from '@backstage/plugin-catalog-node';

describe('unleashPlugin', () => {
  it('should create router successfully', async () => {
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
      catalog: mockCatalog,
    });

    expect(router).toBeDefined();
  });
});
