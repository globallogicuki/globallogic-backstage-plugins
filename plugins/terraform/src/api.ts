import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/frontend-plugin-api';
import { AssessmentResult, Run } from './hooks/types';

export interface TerraformApi {
  getRuns(organization: string, workspaceNames: string[]): Promise<Run[]>;
  getLatestRun(
    organization: string,
    workspaceNames: string[],
  ): Promise<Run | null>;
  getAssessmentResultsForWorkspaces(
    organization: string,
    workspaceNames: string[],
  ): Promise<AssessmentResult[]>;
}

export const terraformApiRef = createApiRef<TerraformApi>({
  id: 'plugin.terraform.service',
});

const workspacesPath = (organization: string, workspaceNames: string[]) =>
  `/organizations/${encodeURIComponent(
    organization,
  )}/workspaces/${workspaceNames
    .map(name => encodeURIComponent(name))
    .join(',')}`;

export class TerraformApiClient implements TerraformApi {
  private discoveryApi: DiscoveryApi;
  private fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  public getRuns(organization: string, workspaceNames: string[]) {
    return this.get<Run[]>(
      `${workspacesPath(organization, workspaceNames)}/runs`,
      'Error fetching runs!',
    );
  }

  public getLatestRun(organization: string, workspaceNames: string[]) {
    // The backend returns null when the workspaces have no runs yet.
    return this.get<Run | null>(
      `${workspacesPath(organization, workspaceNames)}/latestRun`,
      'Error fetching latest run!',
    );
  }

  public getAssessmentResultsForWorkspaces(
    organization: string,
    workspaceNames: string[],
  ) {
    return this.get<AssessmentResult[]>(
      `${workspacesPath(organization, workspaceNames)}/assessment-results`,
      'Error fetching assessment results!',
    );
  }

  private async get<T>(path: string, errorMessage: string): Promise<T> {
    const apiOrigin = await this.getApiOrigin();

    const response = await this.fetchApi.fetch(`${apiOrigin}${path}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      let message: string | undefined;
      try {
        const data = await response.json();
        message = data.error?.message;
      } catch {
        // The error body was not JSON (e.g. an HTML 502 page); fall back to
        // the status text rather than masking the failure with a SyntaxError.
        message = response.statusText || undefined;
      }

      throw new Error(message ?? errorMessage);
    }

    return (await response.json()) as T;
  }

  private async getApiOrigin(): Promise<string> {
    return await this.discoveryApi.getBaseUrl('terraform');
  }
}
