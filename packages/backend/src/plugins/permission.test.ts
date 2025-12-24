import { LoggerService } from '@backstage/backend-plugin-api';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';
import { CustomPermissionPolicy } from './permission';

const createLoggerMock = (): LoggerService =>
  ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis(),
  }) as unknown as LoggerService;

const makeQuery = (
  permissionName: string,
  resourceRef?: string,
): PolicyQuery =>
  ({
    permission: { name: permissionName },
    ...(resourceRef ? { resourceRef } : {}),
  }) as PolicyQuery;

const makeUser = (
  userEntityRef: string,
  ownershipEntityRefs: string[] = [],
): BackstageIdentityResponse =>
  ({
    identity: {
      userEntityRef,
      ownershipEntityRefs,
    },
  }) as BackstageIdentityResponse;

describe('CustomPermissionPolicy', () => {
  it('allows Unleash read for any user', async () => {
    const policy = new CustomPermissionPolicy(createLoggerMock());
    const result = await policy.handle(makeQuery('unleash.flag.read'));
    expect(result).toEqual({ result: AuthorizeResult.ALLOW });
  });

  it('denies Unleash write when no user is authenticated', async () => {
    const policy = new CustomPermissionPolicy(createLoggerMock());
    const result = await policy.handle(makeQuery('unleash.flag.toggle'));
    expect(result).toEqual({ result: AuthorizeResult.DENY });
  });

  it('denies Unleash write for guest users', async () => {
    const policy = new CustomPermissionPolicy(createLoggerMock());
    const guest = makeUser('user:default/guest');
    const result = await policy.handle(makeQuery('unleash.flag.toggle'), guest);
    expect(result).toEqual({ result: AuthorizeResult.DENY });
  });

  it('returns conditional authorization for resourceRef writes', async () => {
    const policy = new CustomPermissionPolicy(createLoggerMock());
    const user = makeUser('user:default/alice', ['group:default/owners']);
    const result = await policy.handle(
      makeQuery('unleash.variant.manage', 'component:default/example'),
      user,
    );
    expect(result).toEqual({
      result: AuthorizeResult.CONDITIONAL,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      conditions: {
        rule: 'IS_ENTITY_OWNER',
        resourceType: 'catalog-entity',
        params: {
          claims: ['group:default/owners'],
        },
      },
    });
  });

  it('denies Unleash write when no resourceRef is provided', async () => {
    const policy = new CustomPermissionPolicy(createLoggerMock());
    const user = makeUser('user:default/alice');
    const result = await policy.handle(makeQuery('unleash.flag.toggle'), user);
    expect(result).toEqual({ result: AuthorizeResult.DENY });
  });

  it('allows non-Unleash permissions by default', async () => {
    const policy = new CustomPermissionPolicy(createLoggerMock());
    const user = makeUser('user:default/alice');
    const result = await policy.handle(makeQuery('catalog.entity.read'), user);
    expect(result).toEqual({ result: AuthorizeResult.ALLOW });
  });
});
