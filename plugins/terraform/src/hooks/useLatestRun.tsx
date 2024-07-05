import { useApi } from '@backstage/core-plugin-api';
import { terraformApiRef } from '../api';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { Run } from './types';

const useLatestRun = (organization: string, workspaceName: string) => {
  const terraformApi = useApi(terraformApiRef);

  const [{ value, loading, error }, fetchLatestRun] = useAsyncFn(
    async (): Promise<Run> =>
      terraformApi.getLatestRun(organization, workspaceName),
    [],
  );

  return {
    data: value,
    isLoading: loading,
    isError: !!error,
    error,
    refetch: fetchLatestRun,
  };
};

export default useLatestRun;
