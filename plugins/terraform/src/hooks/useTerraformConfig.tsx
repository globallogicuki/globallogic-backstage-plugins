import { useApi } from '@backstage/core-plugin-api';
import { terraformApiRef } from '../api';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { TerraformConfiguration } from './types';

const useTerraformConfig = () => {
  const terraformApi = useApi(terraformApiRef);

  const [{ value, loading, error }, fetchTerraformConfiguration] = useAsyncFn(
    async (): Promise<TerraformConfiguration> =>
      terraformApi.getTerraformConfiguration(),
    [],
  );

  return {
    pluginData: value!,
    isLoading: loading,
    isError: !!error,
    error,
    pluginRefetch: fetchTerraformConfiguration,
  };
};

export default useTerraformConfig;
