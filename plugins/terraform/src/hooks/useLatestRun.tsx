import useTerraformData from './useTerraformData';
import { Run } from './types';

const useLatestRun = (organization: string, workspaceNames: string[]) =>
  useTerraformData<Run | null>(
    (terraformApi, org, names) => terraformApi.getLatestRun(org, names),
    organization,
    workspaceNames,
  );

export default useLatestRun;
