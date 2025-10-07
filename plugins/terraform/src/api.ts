import {
  createApiRef,
  ApiBlueprint,
  DiscoveryApi,
  discoveryApiRef,
  FetchApi,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { AssessmentResult, Run } from './hooks/types';

export interface TerraformApi {
  getRuns(organization: string, workspaceNames: string[]): Promise<Run[]>;
  getLatestRun(organization: string, workspaceNames: string[]): Promise<Run>;
  getAssessmentResultsForWorkspaces(
    organization: string,
    workspaceNames: string[],
  ): Promise<AssessmentResult[]>;
}

export const terraformApiRef = createApiRef<TerraformApi>({
  id: 'plugin.terraform.service',
});

export const terraformApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: terraformApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new TerraformApiClient({ discoveryApi, fetchApi }),
    }),
});

export class TerraformApiClient implements TerraformApi {
  public discoveryApi: DiscoveryApi;
  private fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  public async getRuns(organization: string, workspaceNames: string[]) {
    const apiOrigin = await this.getApiOrigin();

    const response = await this.fetchApi.fetch(
      `${apiOrigin}/organizations/${organization}/workspaces/${workspaceNames.join(
        ',',
      )}/runs`,
      {
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const data = await response.json();

      throw new Error(data.error?.message ?? 'Error fetching runs!');
    }

    const data = (await response.json()) as Run[];
    return data;
  }

  public async getLatestRun(organization: string, workspaceNames: string[]) {
    const apiOrigin = await this.getApiOrigin();

    const response = await this.fetchApi.fetch(
      `${apiOrigin}/organizations/${organization}/workspaces/${workspaceNames.join(
        ',',
      )}/latestRun`,
      {
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const data = await response.json();

      throw new Error(data.error?.message ?? 'Error fetching runs!');
    }

    return (await response.json()) as Run;
  }

  public async getAssessmentResultsForWorkspaces(
    organization: string,
    workspaceNames: string[],
  ) {
    const apiOrigin = await this.getApiOrigin();

    const response = await this.fetchApi.fetch(
      `${apiOrigin}/organizations/${organization}/workspaces/${workspaceNames.join(
        ',',
      )}/assessment-results`,
      {
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.error?.message ?? 'Error fetching assessment results!',
      );
    }

    return (await response.json()) as AssessmentResult[];
  }

  async getApiOrigin(): Promise<string> {
    return await this.discoveryApi.getBaseUrl('terraform');
  }
}
