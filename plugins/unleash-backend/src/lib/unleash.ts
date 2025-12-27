/**
 * Unleash API client library
 */
import fetch, { RequestInit } from 'node-fetch';
import type { LoggerService } from '@backstage/backend-plugin-api';

export interface UnleashClientOptions {
  baseUrl: string;
  token: string;
  logger: LoggerService;
}

export async function unleashFetch(
  options: UnleashClientOptions,
  path: string,
  init?: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> },
) {
  const { baseUrl, token, logger } = options;
  const url = `${baseUrl}${path}`;
  logger.debug(`Unleash API request: ${init?.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(
      `Unleash API error: ${response.status} ${response.statusText} - ${errorText}`,
    );

    // Create a more specific error with status code
    const error: any = new Error(`Unleash API error: ${response.statusText}`);
    error.statusCode = response.status;
    throw error;
  }

  // Handle empty responses (e.g., from toggle endpoints)
  const text = await response.text();
  if (!text || text.length === 0) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    logger.warn(`Failed to parse Unleash response as JSON: ${text}`);
    return null;
  }
}

export async function getProjectFeatures(
  options: UnleashClientOptions,
  projectId: string,
) {
  return unleashFetch(options, `/api/admin/projects/${projectId}/features`);
}

export async function getFeatureFlag(
  options: UnleashClientOptions,
  projectId: string,
  featureName: string,
) {
  return unleashFetch(
    options,
    `/api/admin/projects/${projectId}/features/${featureName}`,
  );
}

export async function toggleFeatureFlag(
  options: UnleashClientOptions,
  projectId: string,
  featureName: string,
  environment: string,
  action: 'on' | 'off',
) {
  return unleashFetch(
    options,
    `/api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/${action}`,
    { method: 'POST' },
  );
}

export async function updateFeatureVariants(
  options: UnleashClientOptions,
  projectId: string,
  featureName: string,
  variants: any,
) {
  return unleashFetch(
    options,
    `/api/admin/projects/${projectId}/features/${featureName}/variants`,
    { method: 'PUT', body: JSON.stringify(variants) },
  );
}

export async function getFeatureMetrics(
  options: UnleashClientOptions,
  projectId: string,
  featureName: string,
) {
  return unleashFetch(
    options,
    `/api/admin/projects/${projectId}/features/${featureName}/metrics`,
  );
}

export async function updateStrategy(
  options: UnleashClientOptions,
  projectId: string,
  featureName: string,
  environment: string,
  strategyId: string,
  strategyData: any,
) {
  return unleashFetch(
    options,
    `/api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/strategies/${strategyId}`,
    {
      method: 'PUT',
      body: JSON.stringify(strategyData),
    },
  );
}

export async function getAllProjects(options: UnleashClientOptions) {
  return unleashFetch(options, `/api/admin/projects`);
}

export async function getAllEnvironments(options: UnleashClientOptions) {
  return unleashFetch(options, `/api/admin/environments`);
}
