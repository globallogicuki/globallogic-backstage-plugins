# @globallogicuki/backstage-plugin-unleash-backend

## 0.4.0

### Minor Changes

- ed3d071: Comprehensive review fixes across the Unleash plugin family.

  Backend: removed leftover debug logging (warn/info breadcrumbs on every request); all errors now go through Backstage's standard error middleware as typed `@backstage/errors` (`{ error: { name, message } }` bodies with correct status codes, including upstream Unleash 404/403 on GET routes which previously surfaced as 500); credentials are resolved once per mutation; the guest permission-policy check now matches the `guest` user exactly instead of any name containing "guest"; the permission policy uses the shared permission constants via `isPermission`.

  Frontend: flag-level variant weights are now rendered with per-mille scaling (a 50% variant no longer displays as "500%"); FlagDetailsModal surfaces fetch errors via `ResponseErrorPanel`; FlagToggle classifies errors structurally (status/name) instead of matching backend message strings; StrategyEditor is fully controlled and no longer rewrites variant weights on mount; new shared `useUnleashFlags` hook removes duplicated fetch logic between the card and content views.

  Common: new `isEnvironmentEditable`, `DEFAULT_NUM_ENVS`, and shared mock fixtures; `TagFilter` is now an alias of `Tag`; removed the unused `UnleashProject` type.

### Patch Changes

- Updated dependencies [ed3d071]
  - @globallogicuki/backstage-plugin-unleash-common@0.4.0

## 0.3.3

### Patch Changes

- 8b7678c: Upgrade to Backstage 1.54.3. Replaces the removed NavItemBlueprint with PageBlueprint title/icon params in the Unleash alpha plugin, migrates PolicyQueryUser.identity to .info in the Unleash backend permission policy, and adds 500 error responses to the Terraform backend OpenAPI spec.
- Updated dependencies [8b7678c]
  - @globallogicuki/backstage-plugin-unleash-common@0.3.3

## 0.3.2

### Patch Changes

- 0d21880: Upgrade to Backstage v1.47.0
- Updated dependencies [0d21880]
  - @globallogicuki/backstage-plugin-unleash-common@0.3.2

## 0.3.1

### Patch Changes

- 923f331: Refactor audit logging to use a shared `createAuditEvent` helper, removing duplicated credential resolution and event creation across the flag-toggle, variant-update, and strategy-update routes. No behavioural change.
  - @globallogicuki/backstage-plugin-unleash-common@0.3.1

## 0.3.0

### Minor Changes

- a14b176: Add audit logging via Backstage Auditor Service for flag toggle, variant update, and strategy update operations

### Patch Changes

- @globallogicuki/backstage-plugin-unleash-common@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies [5983650]
  - @globallogicuki/backstage-plugin-unleash-common@0.2.1

## 0.2.0

### Minor Changes

- bd445a4: Register unleash permissions (read, toggle, manage-variants) with the permissions registry

### Patch Changes

- @globallogicuki/backstage-plugin-unleash-common@0.2.0

## 0.1.5

### Patch Changes

- f7f2e3f: Align unleash plugin versions using fixed versioning strategy.
- Updated dependencies [f7f2e3f]
  - @globallogicuki/backstage-plugin-unleash-common@0.1.5

## 0.1.3

### Patch Changes

- e115c9b: Fixed npm install failure caused by `workspace:^` protocol in published packages. Replaced workspace protocol references with explicit version numbers to ensure packages can be installed from npm registry.
- Updated dependencies [e115c9b]
  - @globallogicuki/backstage-plugin-unleash-common@0.1.3

## 0.1.2

### Patch Changes

- b79336d: Publish Unleash plugin
- Updated dependencies [b79336d]
  - @globallogicuki/backstage-plugin-unleash-common@0.1.2

## 0.1.1

### Patch Changes

- 11da489: Initial release of Unleash plugin
- Updated dependencies [11da489]
  - @globallogicuki/backstage-plugin-unleash-common@0.1.1

## 0.1.0

### Minor Changes

- Initial release of the Unleash backend plugin for Backstage

### Features

- Backend API endpoints for Unleash integration
- Proxy for Unleash API requests with configurable base URL
- Permission-based access control for feature flag operations
- Support for reading, updating, and toggling feature flags
- Strategy management and variant configuration
- Integration with Backstage catalog for entity-based permissions
- Comprehensive test coverage
