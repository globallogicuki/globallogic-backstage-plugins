import { useApi, fetchApiRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

const useLogs = (logsUrl: string) => {
  const fetchApi = useApi(fetchApiRef);

  const { value, loading, error } = useAsync(async (): Promise<string> => {
    const res = fetchApi.fetch(logsUrl);
    return (await res).text();
  }, undefined);

  return {
    data: value,
    isLoading: loading,
    error,
  };
};

export default useLogs;
