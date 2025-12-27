# unleash

Backend plugin for the Unleash integration. It provides the API proxy for communicating with your Unleash instance.

## Installation

This plugin is installed via the `@globallogicuki/backstage-plugin-unleash-backend` package. To install it to your backend package, run the following command:

```bash
# From your root directory
yarn --cwd packages/backend add @globallogicuki/backstage-plugin-unleash-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(import('@globallogicuki/backstage-plugin-unleash-backend'));
```

## Permissions

The Unleash plugin integrates with Backstage's permission framework. The plugin defines the following permissions (exported from `@globallogicuki/backstage-plugin-unleash-common`):

| Permission               | Description                                 |
| ------------------------ | ------------------------------------------- |
| `unleash.flag.read`      | View feature flags and their status         |
| `unleash.flag.toggle`    | Toggle feature flags on/off                 |
| `unleash.variant.manage` | Manage feature flag variants and strategies |

### Choosing a Permission Strategy

Backstage allows only **one permission policy** to be active at a time. Choose the approach that fits your needs:

#### Option 1: Open Access (allow-all)

Anyone can perform any action:

```ts
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);
```

#### Option 2: Convenience Module (owner-based for Unleash)

For simple setups where you only need owner-based access control for Unleash and allow-all for everything else:

```ts
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(
  import('@globallogicuki/backstage-plugin-unleash-backend/permissions'),
);
```

This enforces that only users who are owners of a component (via `spec.owner`) can toggle feature flags for projects linked to that component via the `unleash.io/project-id` annotation.

> **Note:** Do not use this alongside other permission policy modules - only one policy can be active.

#### Option 3: Custom Policy (recommended for complex setups)

For production environments or when you have multiple plugins with custom permission needs, create your own unified permission policy. Import the permission definitions and handle them in your policy:

```ts
// packages/backend/src/permissions/policy.ts
import {
  unleashFlagReadPermission,
  unleashFlagTogglePermission,
  unleashVariantManagePermission,
} from '@globallogicuki/backstage-plugin-unleash-common';
import { createBackendModule } from '@backstage/backend-plugin-api';
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
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';

class MyPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    // Allow reading flags for everyone
    if (isPermission(request.permission, unleashFlagReadPermission)) {
      return { result: AuthorizeResult.ALLOW };
    }

    // Require ownership for toggling flags
    if (
      isPermission(request.permission, unleashFlagTogglePermission) ||
      isPermission(request.permission, unleashVariantManagePermission)
    ) {
      if (!user) {
        return { result: AuthorizeResult.DENY };
      }

      // Use conditional authorization to check entity ownership
      if ('resourceRef' in request) {
        return {
          result: AuthorizeResult.CONDITIONAL,
          pluginId: 'catalog',
          resourceType: 'catalog-entity',
          conditions: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: user.identity.ownershipEntityRefs ?? [],
            },
          },
        };
      }

      return { result: AuthorizeResult.DENY };
    }

    // Handle other plugins' permissions here...

    // Default: allow
    return { result: AuthorizeResult.ALLOW };
  }
}

export const myPermissionPolicy = createBackendModule({
  pluginId: 'permission',
  moduleId: 'my-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        policy.setPolicy(new MyPermissionPolicy());
      },
    });
  },
});
```

Then register it in your backend:

```ts
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(myPermissionPolicy);
```

## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn start` from the root directory.
