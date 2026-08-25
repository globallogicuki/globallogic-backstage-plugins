import { useApi } from '@backstage/core-plugin-api';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { TerraformApi, terraformApiRef } from '../api';

/**
 * Internal hook shared by the data hooks. Fetches on mount and whenever the
 * organization or workspace names change, and exposes a manual refetch.
 */
const useTerraformData = <T>(
  fetchData: (
    terraformApi: TerraformApi,
    organization: string,
    workspaceNames: string[],
  ) => Promise<T>,
  organization: string,
  workspaceNames: string[],
) => {
  const terraformApi = useApi(terraformApiRef);
  const joinedWorkspaceNames = workspaceNames.join(',');

  const {
    value: data,
    loading: isLoading,
    error,
    retry: refetch,
  } = useAsyncRetry(
    async () => fetchData(terraformApi, organization, workspaceNames),
    [terraformApi, organization, joinedWorkspaceNames],
  );

  return { data, isLoading, error, refetch };
};

export default useTerraformData;
