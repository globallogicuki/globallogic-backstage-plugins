import { useApi } from '@backstage/core-plugin-api';
import { terraformApiRef } from '../api';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { AssessmentResult } from './types';

const useAssessmentResults = (
  organization: string,
  workspaceNames: string[],
) => {
  const terraformApi = useApi(terraformApiRef);

  const [{ value, loading, error }, fetchAssessmentResults] = useAsyncFn(
    async (): Promise<AssessmentResult[]> =>
      terraformApi.getAssessmentResultsForWorkspaces(
        organization,
        workspaceNames,
      ),
    [],
  );

  return {
    data: value ?? [],
    isLoading: loading,
    isError: !!error,
    error,
    refetch: fetchAssessmentResults,
  };
};

export default useAssessmentResults;
