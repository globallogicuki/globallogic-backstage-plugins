/**
 * Annotation constants for linking catalog entities to Unleash projects
 */
import type { Entity } from '@backstage/catalog-model';

export const UNLEASH_PROJECT_ANNOTATION = 'unleash.io/project-id';
export const UNLEASH_ENVIRONMENT_ANNOTATION = 'unleash.io/environment';
export const UNLEASH_FILTER_TAGS_ANNOTATION = 'unleash.io/filter-tags';

/**
 * Check if an entity has Unleash integration available
 */
export const isUnleashAvailable = (entity: Entity): boolean =>
  Boolean(entity.metadata.annotations?.[UNLEASH_PROJECT_ANNOTATION]);

/**
 * Get the Unleash project ID from an entity
 */
export const getUnleashProjectId = (entity: Entity): string | undefined =>
  entity.metadata.annotations?.[UNLEASH_PROJECT_ANNOTATION];

/**
 * Get the default environment from an entity
 */
export const getUnleashEnvironment = (entity: Entity): string | undefined =>
  entity.metadata.annotations?.[UNLEASH_ENVIRONMENT_ANNOTATION];

/**
 * Get filter tags from an entity
 */
export const getUnleashFilterTags = (entity: Entity): string[] => {
  const tagsAnnotation =
    entity.metadata.annotations?.[UNLEASH_FILTER_TAGS_ANNOTATION];
  if (!tagsAnnotation) return [];
  try {
    return JSON.parse(tagsAnnotation);
  } catch {
    return [];
  }
};
