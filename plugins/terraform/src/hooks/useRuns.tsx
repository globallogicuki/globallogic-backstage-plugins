import {
  useApi,
  configApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { Run } from './types';
import { useAsync } from 'react-use';

const getRuns = async (
  baseUrl: string,
  token: string,
  organization: string,
  workspaceName: string,
) => {
  const response = await fetch(
    `${baseUrl}/api/terraform/runs/${organization}/${workspaceName}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(data.error?.message ?? 'Error fetching runs!');
  }

  const data = (await response.json()) as Run[];
  return data;
};

const useRuns = (organization: string, workspaceName: string) => {
  const config = useApi(configApiRef);
  const baseUrl = config.getString('backend.baseUrl');

  const identity = useApi(identityApiRef);
  const { loading: isLoadingToken, value: credentials } = useAsync(
    async (): Promise<{ token?: string }> => identity.getCredentials(),
    [],
  );

  const [{ value, loading, error }, fetchRuns] = useAsyncFn(async (): Promise<
    Run[]
  > => {
    if (!credentials?.token) return [];

    return getRuns(baseUrl, credentials.token, organization, workspaceName);
  }, [credentials]);

  return {
    data: value,
    isLoading: loading || isLoadingToken,
    isError: !!error,
    error,
    refetch: fetchRuns,
  };
};

export default useRuns;
