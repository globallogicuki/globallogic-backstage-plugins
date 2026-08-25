# @globallogicuki/backstage-plugin-unleash

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

- @globallogicuki/backstage-plugin-unleash-common@0.3.1

## 0.3.0

### Patch Changes

- @globallogicuki/backstage-plugin-unleash-common@0.3.0

## 0.2.1

### Patch Changes

- 5983650: Add tag-based filtering for feature flags with interactive UI and annotation defaults
- Updated dependencies [5983650]
  - @globallogicuki/backstage-plugin-unleash-common@0.2.1

## 0.2.0

### Patch Changes

- @globallogicuki/backstage-plugin-unleash-common@0.2.0

## 0.1.5

### Patch Changes

- f7f2e3f: Align unleash plugin versions using fixed versioning strategy.
- a261034: Refactor alpha (new frontend system) implementation to align with Backstage v1.42+ patterns:
  - Restructured into modular alpha/ folder
  - Updated ApiBlueprint to use defineParams callback pattern
  - Replaced string filters with isUnleashAvailable predicate function
  - Added explicit type annotations
  - Updated tests to use frontend-test-utils
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

- Initial release of the Unleash frontend plugin for Backstage

### Features

- Entity card component for displaying feature flag summaries
- Full-page entity content view for managing feature flags
- Standalone Unleash page for viewing all flags across projects
- Interactive UI for toggling feature flags (with permission checks)
- Strategy editor with support for:
  - Flexible rollout strategies
  - Remote address targeting
  - Application hostname targeting
  - Constraint management
  - Variant configuration with automatic weight distribution
- Flag details modal with comprehensive strategy information
- Support for New Frontend System (alpha)
- Comprehensive test coverage with high code coverage
- Accessibility features (keyboard navigation, ARIA attributes)
