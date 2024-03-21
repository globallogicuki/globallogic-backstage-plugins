import { useApi } from '@backstage/core-plugin-api';
import { terraformApiRef } from '../api';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { Run } from './types';

const useRuns = (organization: string, workspaceName: string) => {
  const terraformApi = useApi(terraformApiRef);

  const [{ value, loading, error }, fetchRuns] = useAsyncFn(
    async (): Promise<Run[]> =>
      terraformApi.getRuns(organization, workspaceName),
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
