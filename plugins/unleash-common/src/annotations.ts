/**
 * Annotation constants for linking catalog entities to Unleash projects
 */
import type { Entity } from '@backstage/catalog-model';

export const UNLEASH_PROJECT_ANNOTATION = 'unleash.io/project-id';
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

export interface TagFilter {
  type: string;
  value: string;
}

export const parseTagFilter = (tag: string): TagFilter => {
  const colonIndex = tag.indexOf(':');
  if (colonIndex === -1) {
    return { type: 'simple', value: tag };
  }
  return {
    type: tag.slice(0, colonIndex),
    value: tag.slice(colonIndex + 1),
  };
};

export const formatTagFilter = (filter: TagFilter): string => {
  if (filter.type === 'simple') {
    return filter.value;
  }
  return `${filter.type}:${filter.value}`;
};

export const getUnleashFilterTags = (entity: Entity): TagFilter[] => {
  const tagsAnnotation =
    entity.metadata.annotations?.[UNLEASH_FILTER_TAGS_ANNOTATION];
  if (!tagsAnnotation?.trim()) return [];

  return tagsAnnotation
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(parseTagFilter);
};
