# Unleash Plugin - New Frontend System

This document describes how to use the Unleash plugin with Backstage's new frontend system.

## Overview

The Unleash plugin has been migrated to support the new Backstage frontend system while maintaining backward compatibility with the legacy system. The new system uses extension blueprints for better modularity and configurability.

## Installation

### For Apps Using the New Frontend System

If your Backstage app uses the new frontend system, you can import and use the extension definitions from the `/alpha` export:

```typescript
import unleashExtensions from '@internal/backstage-plugin-unleash/alpha';

// In your app configuration
export default createApp({
  features: [
    ...unleashExtensions,
    // ... other extensions
  ],
});
```

### Individual Extension Imports

You can also import individual extensions if you only need specific functionality:

```typescript
import {
  unleashApiExtension,
  unleashPageExtension,
  unleashEntityCardExtension,
  unleashEntityContentExtension,
} from '@internal/backstage-plugin-unleash/alpha';
```

## Available Extensions

### API Extension (`unleashApiExtension`)

Provides the Unleash API client for communicating with the backend plugin.

### Page Extension (`unleashPageExtension`)

Provides a standalone page at `/unleash` for managing feature flags across all projects.

### Entity Card Extension (`unleashEntityCardExtension`)

Adds a card to entity pages (kind: component) showing a summary of feature flags for that entity.

### Entity Content Extension (`unleashEntityContentExtension`)

Adds a tab to entity pages (kind: component) for detailed feature flag management.

## Legacy System

The legacy plugin exports are still available from the main entry point:

```typescript
import {
  unleashPlugin,
  EntityUnleashCard,
  EntityUnleashContent,
  UnleashPage,
} from '@internal/backstage-plugin-unleash';
```

## Migration Notes

- The new frontend system provides better modularity and allows for easier configuration
- All extensions use lazy loading for improved performance
- Entity filters can be customized by configuring the extension blueprints
- The legacy system will continue to work for apps that haven't migrated yet

## Configuration

Both systems use the same backend configuration in `app-config.yaml`:

```yaml
unleash:
  url: https://your-unleash-instance.com
  apiToken: ${UNLEASH_API_TOKEN}
  editableEnvs:
    - development
    - staging
  numEnvs: 4
```

## References

- [Backstage New Frontend System Documentation](https://backstage.io/docs/frontend-system/)
- [Common Extension Blueprints](https://backstage.io/docs/frontend-system/building-plugins/common-extension-blueprints/)
- [Migration Guide](https://backstage.io/docs/frontend-system/building-plugins/migrating/)
