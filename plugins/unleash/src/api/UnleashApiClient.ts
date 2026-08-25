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
import type { UnleashApi, UnleashConfig } from './UnleashApi';

/**
 * Error thrown when the Unleash backend responds with a non-ok status.
 * Carries the error `name` and `statusCode` from the standardized
 * `{ error: { name, message } }` backend error body so callers can branch
 * on structured information instead of message substrings.
 */
export class UnleashApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    name?: string,
  ) {
    super(message);
    this.name = name ?? 'UnleashApiError';
  }
}

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
      let errorName: string | undefined;
      let message = errorText || `${response.status} ${response.statusText}`;

      // The backend responds with the standard Backstage error body:
      // { error: { name, message } }
      try {
        const parsed = JSON.parse(errorText);
        if (parsed?.error) {
          errorName = parsed.error.name;
          message = parsed.error.message ?? message;
        }
      } catch {
        // Not a JSON body, fall back to the raw text
      }

      throw new UnleashApiError(message, response.status, errorName);
    }

    return response.json() as Promise<T>;
  }

  async getConfig() {
    return this.fetch<UnleashConfig>('/config');
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
