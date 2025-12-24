# Unleash Plugin for Backstage

A Backstage plugin that integrates with [Unleash](https://www.getunleash.io/) feature flag management, allowing developers and product owners to view, toggle, and manage feature flags directly within their service catalog context.

## Features

- **Entity Overview Card**: Displays a summary of feature flags on the component overview page
- **Feature Flags Tab**: Full feature flag management interface with environment-specific toggles
- **Permission-based Access Control**: Read-only by default, with granular permissions for toggle actions
- **Multi-environment Support**: View and manage flags across all configured environments
- **Real-time Toggle**: Toggle flags on/off with confirmation dialogs to prevent accidental changes
- **Stale Flag Detection**: Identifies flags that may no longer be in use

## Installation

The plugin is already installed in this Backstage instance. It consists of three packages:

- `@globallogicuki/backstage-plugin-unleash` - Frontend plugin
- `@globallogicuki/backstage-plugin-unleash-backend` - Backend plugin
- `@globallogicuki/backstage-plugin-unleash-common` - Shared types and utilities

## Configuration

### 1. Add Unleash Configuration

Add your Unleash instance configuration to `app-config.yaml`:

```yaml
unleash:
  url: https://your-unleash-instance.com
  apiToken: ${UNLEASH_API_TOKEN}

# Optional: Enable permissions
permission:
  enabled: true
```

Set the `UNLEASH_API_TOKEN` environment variable with your Unleash API token:

```bash
export UNLEASH_API_TOKEN="your-service-account-token"
```

**Token Requirements:**

- Use a **Service Account token** (Unleash Enterprise) or **Personal Access Token**
- Token must have access to the projects you want to manage
- Recommended scopes: `READ` for viewing, `ADMIN` for toggling flags

### 2. Add Annotations to Catalog Entities

Link catalog entities to Unleash projects by adding annotations to your `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  description: My awesome service
  annotations:
    unleash.io/project-id: my-project-id
    unleash.io/environment: production # Optional: default environment to display
spec:
  type: service
  lifecycle: production
  owner: team-platform
```

**Available Annotations:**

- `unleash.io/project-id` (required): The Unleash project ID
- `unleash.io/environment` (optional): Default environment to display
- `unleash.io/filter-tags` (optional): JSON array of tags to filter flags

## Usage

Once configured and annotated, the Unleash integration will appear on component pages:

### Overview Card

Navigate to any component with the `unleash.io/project-id` annotation. The Overview tab will display a **Feature Flags** card showing:

- Total number of flags
- Number of enabled flags
- Flag status across environments
- Link to the full Feature Flags tab

### Feature Flags Tab

Click the **Feature Flags** tab to access the full management interface:

- View all flags for the project
- Toggle flags on/off by environment
- See flag types (release, experiment, operational, etc.)
- Identify stale flags
- View strategy counts per environment

### Toggling Flags

1. Select an environment using the tabs at the top
2. Click the toggle switch next to any flag
3. Confirm the action in the dialog
4. The flag will be enabled/disabled in Unleash

## Permissions

The plugin supports Backstage's permission system with three permissions:

- `unleash.flag.read` - View feature flags
- `unleash.flag.toggle` - Toggle flags on/off
- `unleash.variant.manage` - Manage flag variants

By default, all authenticated users can read flags. To restrict toggle actions, configure permission policies in your backend.

## API

### Frontend API

```typescript
import { unleashApiRef } from '@globallogicuki/backstage-plugin-unleash';

// Use in components
const unleashApi = useApi(unleashApiRef);

// Get flags for a project
const { features } = await unleashApi.getFlags('my-project-id');

// Toggle a flag
await unleashApi.toggleFlag('my-project-id', 'my-flag', 'production', true);
```

### Utility Functions

```typescript
import {
  isUnleashAvailable,
  getUnleashProjectId,
} from '@globallogicuki/backstage-plugin-unleash';

// Check if entity has Unleash integration
if (isUnleashAvailable(entity)) {
  const projectId = getUnleashProjectId(entity);
}
```

## Development

### Running Locally

```bash
# Install dependencies
yarn install

# Start the frontend plugin in isolation
cd plugins/unleash
yarn start

# Start the backend plugin
cd plugins/unleash-backend
yarn start
```

### Building

```bash
# Build all packages
yarn build

# Build specific plugin
cd plugins/unleash
yarn build
```

### Testing

```bash
# Run tests
yarn test

# Run linting
yarn lint
```

## Architecture

The plugin uses a hybrid architecture with:

1. **Backend Plugin**: Proxies requests to Unleash API with proper authentication and permission checks
2. **Frontend Plugin**: Provides React components and API client for the UI
3. **Common Package**: Shared TypeScript types, permissions, and utilities

This architecture ensures:

- Secure token management (tokens never exposed to frontend)
- Proper permission enforcement
- Type safety across frontend and backend
- Reusable components and utilities

## Troubleshooting

### Plugin not appearing on entity page

- Check that the entity has the `unleash.io/project-id` annotation
- Verify the project ID matches your Unleash instance
- Check browser console for errors

### API errors

- Verify the `UNLEASH_API_TOKEN` environment variable is set
- Check that the token has access to the specified project
- Confirm the Unleash URL in `app-config.yaml` is correct
- Review backend logs for detailed error messages

### Permission denied errors

- Ensure the permission system is configured in `app-config.yaml`
- Check that your permission policy allows the required actions
- Verify you're authenticated in Backstage

## License

Apache-2.0
