import useTerraformData from './useTerraformData';
import { AssessmentResult } from './types';

const useAssessmentResults = (organization: string, workspaceNames: string[]) =>
  useTerraformData<AssessmentResult[]>(
    (terraformApi, org, names) =>
      terraformApi.getAssessmentResultsForWorkspaces(org, names),
    organization,
    workspaceNames,
  );

export default useAssessmentResults;
