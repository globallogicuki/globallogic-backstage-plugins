# Terraform Backend Plugin for Backstage

This plugin is the backend api used by the terraform frontend plugin.

## Install

```shell
yarn add @globallogicuki/backstage-plugin-terraform-backend
```

## Setup

To use the terraform backend, you will need to configure the following in your `app-config.yaml` file:

```yaml
integrations:
  terraform:
    token: tokenGoesHere
    baseUrl: https://tfe.enterprise.com/api/v2 # Optional, for self-hosted TFE
```

### New Backstage backend system

You must be using v0.3.0 or greater of the backend and frontend plugin if you are using the new Backstage backend system. [See here](https://backstage.io/docs/backend-system/) for more info.

Add the following to `packages/backend/src/index.ts`:

```typescript
backend.add(import('@globallogicuki/backstage-plugin-terraform-backend'));
```

### Legacy Backstage backend system

Create a new file named `packages/backend/src/plugins/terraform.ts`, and add the following to it:

```typescript
import { createRouter } from '@globallogicuki/backstage-plugin-terraform-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
  });
}
```

And finally, wire this into the overall backend router. Edit `packages/backend/src/index.ts`:

```typescript
import terraform from './plugins/terraform';
// ...
async function main() {
  // ...
  const terraformEnv = useHotMemoize(module, () => createEnv('terraform'));
  apiRouter.use('/terraform', await terraform(terraformEnv));
```

### Status Check

After you start the backend (e.g. using yarn start-backend from the repo root), you should be able to fetch data from it.

```shell
curl localhost:7007/api/terraform/health
```

This should return `{"status":"ok"}`.

## Updating OpenAPI Spec

OpenAPI spec can be found in `src/schema/openapi.yaml`

Once this file has been modified you should run the following to generate an update for `src/schema/openapi.generated.yaml`

```shell
yarn generate-openapi-schema
```
