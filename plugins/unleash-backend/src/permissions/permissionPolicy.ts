import { LoggerService } from '@backstage/backend-plugin-api';
import { parseEntityRef } from '@backstage/catalog-model';
import {
  AuthorizeResult,
  isPermission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import {
  unleashFlagReadPermission,
  unleashFlagTogglePermission,
  unleashVariantManagePermission,
} from '@globallogicuki/backstage-plugin-unleash-common';

const isGuestUser = (userEntityRef?: string): boolean => {
  if (!userEntityRef) {
    return false;
  }
  try {
    const { name } = parseEntityRef(userEntityRef);
    return name.toLowerCase() === 'guest';
  } catch {
    return false;
  }
};

export class UnleashPermissionPolicy implements PermissionPolicy {
  constructor(private readonly logger: LoggerService) {}

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    // Allow read permissions for all authenticated users (including Guest for viewing)
    if (isPermission(request.permission, unleashFlagReadPermission)) {
      return { result: AuthorizeResult.ALLOW };
    }

    // For Unleash write permissions (toggle, manage variants/strategies)
    if (
      isPermission(request.permission, unleashFlagTogglePermission) ||
      isPermission(request.permission, unleashVariantManagePermission)
    ) {
      this.logger.debug('[Permission Policy] Unleash write permission check', {
        permission: request.permission.name,
        userEntityRef: user?.info.userEntityRef,
        ownershipEntityRefs: user?.info.ownershipEntityRefs,
        resourceRef:
          'resourceRef' in request
            ? (request as { resourceRef: string }).resourceRef
            : undefined,
      });

      // Deny if no user is authenticated
      if (!user) {
        this.logger.warn('[Permission Policy] DENY - No user authenticated');
        return { result: AuthorizeResult.DENY };
      }

      // Deny Guest users explicitly
      if (isGuestUser(user.info.userEntityRef)) {
        this.logger.warn('[Permission Policy] DENY - Guest user detected');
        return { result: AuthorizeResult.DENY };
      }

      // For resource permissions with a resourceRef, use conditional authorization
      // This delegates the decision to check if the user is the entity owner
      if ('resourceRef' in request) {
        this.logger.debug(
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
              claims: user?.info.ownershipEntityRefs ?? [],
            },
          },
        };
      }

      // Default deny for Unleash write operations without a resourceRef
      this.logger.warn('[Permission Policy] DENY - No resourceRef provided');
      return { result: AuthorizeResult.DENY };
    }

    // For all other permissions, allow (catalog, scaffolder, etc.)
    return { result: AuthorizeResult.ALLOW };
  }
}
