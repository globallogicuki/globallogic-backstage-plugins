# Terraform Backend Plugin for Backstage

To use the terraform backend, you will need to configure the following in your `app-config.yaml` file:

```yaml
integrations:
  terraform:
    token: tokenGoesHere
```

Create a new file named `packages/backend/src/plugins/terraform.ts`, and add the following to it:

```typescript
import { createRouter } from '@internal/plugin-terraform-backend';
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

After you start the backend (e.g. using yarn start-backend from the repo root), you should be able to fetch data from it.

```shell
curl localhost:7007/api/terraform/health
```

This should return {"status":"ok"}.
