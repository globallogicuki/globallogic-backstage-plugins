import { useApi, configApiRef } from '@backstage/core-plugin-api';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { Run } from './types';

const getRuns = async (
  baseUrl: string,
  organization: string,
  workspaceName: string,
) => {
  const response = await fetch(
    `${baseUrl}/api/terraform/runs/${organization}/${workspaceName}`,
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

  const [{ value, loading, error }, fetchRuns] = useAsyncFn(
    async (): Promise<Run[]> => getRuns(baseUrl, organization, workspaceName),
    [],
  );

  return {
    data: value,
    isLoading: loading,
    isError: !!error,
    error,
    refetch: fetchRuns,
  };
};

export default useRuns;
