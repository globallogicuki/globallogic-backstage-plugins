/**
 * Unleash API client implementation
 */
import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import type {
  FeatureFlag,
  Variant,
  FeatureFlagMetrics,
  Strategy,
  ProjectSummary,
  EnvironmentSummary,
} from '@globallogicuki/backstage-plugin-unleash-common';
import type { UnleashApi } from './UnleashApi';

export class UnleashApiClient implements UnleashApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const baseUrl = await this.discoveryApi.getBaseUrl('unleash');
    const response = await this.fetchApi.fetch(`${baseUrl}${path}`, init);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Unleash API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  async getConfig() {
    return this.fetch<{ editableEnvs: string[]; numEnvs?: number }>('/config');
  }

  async getFlags(projectId: string): Promise<{ features: FeatureFlag[] }> {
    return this.fetch<{ features: FeatureFlag[] }>(
      `/projects/${projectId}/features`,
    );
  }

  async getFlag(projectId: string, flagName: string): Promise<FeatureFlag> {
    return this.fetch<FeatureFlag>(
      `/projects/${projectId}/features/${flagName}`,
    );
  }

  async toggleFlag(
    projectId: string,
    flagName: string,
    environment: string,
    enable: boolean,
  ): Promise<void> {
    await this.fetch(
      `/projects/${projectId}/features/${flagName}/environments/${environment}/${
        enable ? 'on' : 'off'
      }`,
      { method: 'POST' },
    );
  }

  async updateVariants(
    projectId: string,
    flagName: string,
    variants: Variant[],
  ): Promise<void> {
    await this.fetch(`/projects/${projectId}/features/${flagName}/variants`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variants),
    });
  }

  async getMetrics(
    projectId: string,
    flagName: string,
  ): Promise<FeatureFlagMetrics> {
    return this.fetch<FeatureFlagMetrics>(
      `/projects/${projectId}/features/${flagName}/metrics`,
    );
  }

  async updateStrategy(
    projectId: string,
    flagName: string,
    environment: string,
    strategyId: string,
    strategy: Partial<Strategy>,
  ): Promise<void> {
    await this.fetch(
      `/projects/${projectId}/features/${flagName}/environments/${environment}/strategies/${strategyId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategy),
      },
    );
  }

  async getProjects(): Promise<{
    version: number;
    projects: ProjectSummary[];
  }> {
    return this.fetch<{ version: number; projects: ProjectSummary[] }>(
      '/projects',
    );
  }

  async getEnvironments(): Promise<{
    version: number;
    environments: EnvironmentSummary[];
  }> {
    return this.fetch<{ version: number; environments: EnvironmentSummary[] }>(
      '/environments',
    );
  }
}
