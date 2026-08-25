import useTerraformData from './useTerraformData';
import { Run } from './types';

const useRuns = (organization: string, workspaceNames: string[]) =>
  useTerraformData<Run[]>(
    (terraformApi, org, names) => terraformApi.getRuns(org, names),
    organization,
    workspaceNames,
  );

export default useRuns;
