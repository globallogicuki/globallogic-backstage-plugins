import {
  DiscoveryApi,
  FetchApi,
  createApiRef,
} from '@backstage/core-plugin-api';
import { Run } from './hooks/types';

export interface TerraformApi {
  getRuns(organization: string, workspaceName: string): Promise<Run[]>;
}

export const terraformApiRef = createApiRef<TerraformApi>({
  id: 'plugin.terraform.service',
});

export class TerraformApiClient implements TerraformApi {
  public discoveryApi: DiscoveryApi;
  private fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  public async getRuns(organization: string, workspaceName: string) {
    const apiOrigin = await this.getApiOrigin();

    const response = await this.fetchApi.fetch(
      `${apiOrigin}/runs/${organization}/${workspaceName}`,
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

  async getApiOrigin(): Promise<string> {
    return await this.discoveryApi.getBaseUrl('terraform');
  }
}
