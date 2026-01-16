# @globallogicuki/backstage-plugin-unleash

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
