# unleash

Backend plugin for the Unleash integration. It provides the API proxy and optional permission policy module.

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

### Permissions

To enable the optional Unleash permission policy module, first ensure the permission backend is installed:

```ts
backend.add(import('@backstage/plugin-permission-backend'));
```

Then add the Unleash permission policy module:

```ts
backend.add(
  import('@globallogicuki/backstage-plugin-unleash-backend/permissions'),
);
```

## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn start` from the root directory.
