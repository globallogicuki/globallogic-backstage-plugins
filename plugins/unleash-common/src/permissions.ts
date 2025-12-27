/**
 * Permission definitions for the Unleash plugin
 */
import { RESOURCE_TYPE_CATALOG_ENTITY } from '@backstage/plugin-catalog-common/alpha';
import { createPermission } from '@backstage/plugin-permission-common';

export const unleashFlagReadPermission = createPermission({
  name: 'unleash.flag.read',
  attributes: { action: 'read' },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY,
});

export const unleashFlagTogglePermission = createPermission({
  name: 'unleash.flag.toggle',
  attributes: { action: 'update' },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY,
});

export const unleashVariantManagePermission = createPermission({
  name: 'unleash.variant.manage',
  attributes: { action: 'update' },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY,
});

export const unleashPermissions = [
  unleashFlagReadPermission,
  unleashFlagTogglePermission,
  unleashVariantManagePermission,
];
