import { useApi } from '@backstage/core-plugin-api';
import { terraformApiRef } from '../api';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { Run } from './types';

const useLatestRun = (organization: string, workspaceNames: string[]) => {
  const terraformApi = useApi(terraformApiRef);

  const [{ value, loading, error }, fetchLatestRun] = useAsyncFn(
    async (): Promise<Run> =>
      terraformApi.getLatestRun(organization, workspaceNames),
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
