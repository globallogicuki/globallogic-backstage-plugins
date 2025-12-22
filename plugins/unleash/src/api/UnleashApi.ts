/**
 * Unleash API interface definition
 */
import { createApiRef } from '@backstage/core-plugin-api';
import type {
  FeatureFlag,
  Variant,
  FeatureFlagMetrics,
  Strategy,
  ProjectSummary,
  EnvironmentSummary,
} from '@internal/backstage-plugin-unleash-common';

export interface UnleashConfig {
  editableEnvs: string[];
  numEnvs?: number;
}

export interface UnleashApi {
  /**
   * Get configuration (including readonly mode)
   */
  getConfig(): Promise<UnleashConfig>;

  /**
   * Get all feature flags for a project
   */
  getFlags(projectId: string): Promise<{ features: FeatureFlag[] }>;

  /**
   * Get a single feature flag with full details
   */
  getFlag(projectId: string, flagName: string): Promise<FeatureFlag>;

  /**
   * Toggle a feature flag on or off in a specific environment
   */
  toggleFlag(
    projectId: string,
    flagName: string,
    environment: string,
    enable: boolean,
  ): Promise<void>;

  /**
   * Update variants for a feature flag
   */
  updateVariants(
    projectId: string,
    flagName: string,
    variants: Variant[],
  ): Promise<void>;

  /**
   * Get metrics for a feature flag
   */
  getMetrics(
    projectId: string,
    flagName: string,
  ): Promise<FeatureFlagMetrics>;

  /**
   * Update a strategy for a feature flag in an environment
   */
  updateStrategy(
    projectId: string,
    flagName: string,
    environment: string,
    strategyId: string,
    strategy: Partial<Strategy>,
  ): Promise<void>;

  /**
   * Get all projects summary
   */
  getProjects(): Promise<{ version: number; projects: ProjectSummary[] }>;

  /**
   * Get all environments summary
   */
  getEnvironments(): Promise<{ version: number; environments: EnvironmentSummary[] }>;
}

export const unleashApiRef = createApiRef<UnleashApi>({
  id: 'plugin.unleash.service',
});
