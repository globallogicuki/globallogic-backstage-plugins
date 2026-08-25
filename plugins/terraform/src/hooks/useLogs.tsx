import { useApi, fetchApiRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

const useLogs = (logsUrl: string) => {
  const fetchApi = useApi(fetchApiRef);

  const { value, loading, error } = useAsync(async (): Promise<string> => {
    const res = await fetchApi.fetch(logsUrl);

    if (!res.ok) {
      throw new Error(
        `Error fetching logs: ${res.status} ${res.statusText}`.trim(),
      );
    }

    return res.text();
  }, [fetchApi, logsUrl]);

  return {
    data: value,
    isLoading: loading,
    error,
  };
};

export default useLogs;
