# @globallogicuki/backstage-plugin-unleash-common

## 0.2.1

### Patch Changes

- 5983650: Add tag-based filtering for feature flags with interactive UI and annotation defaults

## 0.2.0

## 0.1.5

### Patch Changes

- f7f2e3f: Align unleash plugin versions using fixed versioning strategy.

## 0.1.4

### Patch Changes

- fd43b66: Fixed ESM/CJS module resolution issue causing "does not provide an export named" errors on Node.js 22. Added proper conditional exports to package.json to ensure CJS consumers receive the `.cjs.js` build and ESM consumers receive the `.esm.js` build.

## 0.1.3

### Patch Changes

- e115c9b: Fixed npm install failure caused by `workspace:^` protocol in published packages. Replaced workspace protocol references with explicit version numbers to ensure packages can be installed from npm registry.

## 0.1.2

### Patch Changes

- b79336d: Publish Unleash plugin

## 0.1.1

### Patch Changes

- 11da489: Initial release of Unleash plugin

## 0.1.0

### Minor Changes

- Initial release of the Unleash common library for Backstage

### Features

- Common types and interfaces for Unleash feature flag integration
- Shared annotations for entity metadata
- TypeScript type definitions for Unleash API responses
- Permission definitions for feature flag management
