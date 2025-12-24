import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';

export class CustomPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // Allow read permissions for all authenticated users (including Guest for viewing)
    if (request.permission.name === 'unleash.flag.read') {
      return { result: AuthorizeResult.ALLOW };
    }

    // For Unleash write permissions (toggle, manage variants/strategies)
    if (
      request.permission.name === 'unleash.flag.toggle' ||
      request.permission.name === 'unleash.variant.manage'
    ) {
      console.log('[Permission Policy] Unleash write permission check:', {
        permission: request.permission.name,
        userEntityRef: user?.identity.userEntityRef,
        ownershipEntityRefs: user?.identity.ownershipEntityRefs,
        resourceRef: 'resourceRef' in request ? request.resourceRef : undefined,
      });

      // Deny if no user is authenticated
      if (!user) {
        console.log('[Permission Policy] DENY - No user authenticated');
        return { result: AuthorizeResult.DENY };
      }

      // Deny Guest users explicitly
      if (
        user.identity.userEntityRef === 'user:development/guest' ||
        user.identity.userEntityRef === 'user:default/guest' ||
        user.identity.userEntityRef?.toLowerCase().includes('/guest')
      ) {
        console.log('[Permission Policy] DENY - Guest user detected');
        return { result: AuthorizeResult.DENY };
      }

      // For resource permissions with a resourceRef, use conditional authorization
      // This delegates the decision to check if the user is the entity owner
      if ('resourceRef' in request) {
        console.log(
          '[Permission Policy] Using conditional authorization with IS_ENTITY_OWNER',
        );
        return {
          result: AuthorizeResult.CONDITIONAL,
          pluginId: 'catalog',
          resourceType: 'catalog-entity',
          conditions: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: user?.identity.ownershipEntityRefs ?? [],
            },
          },
        };
      }

      // Default deny for Unleash write operations without a resourceRef
      console.log('[Permission Policy] DENY - No resourceRef provided');
      return { result: AuthorizeResult.DENY };
    }

    // For all other permissions, allow (catalog, scaffolder, etc.)
    return { result: AuthorizeResult.ALLOW };
  }
}
