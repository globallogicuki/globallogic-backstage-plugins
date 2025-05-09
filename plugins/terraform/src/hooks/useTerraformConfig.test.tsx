import { act, renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@backstage/core-plugin-api';
import useTerraformConfig from './useTerraformConfig';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
  createApiRef: jest.fn(),
}));

describe('useTerraformConfig', () => {
  const mockTerraformConfig = { baseUrl: 'https://test.terraform-url.io' };

  beforeEach(() => {
    (useApi as jest.Mock).mockReturnValue({
      getTerraformConfiguration: jest
        .fn()
        .mockResolvedValue(mockTerraformConfig),
    });
  });

  it('initial state is correct', () => {
    expect.assertions(5);

    const { result } = renderHook(() => useTerraformConfig());

    expect(result.current.pluginData).toBeUndefined();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.isError).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(typeof result.current.pluginRefetch).toBe('function');
  });

  it('sets correct state when refetch is called', async () => {
    expect.assertions(1);
    const { result } = renderHook(() => useTerraformConfig());

    act(() => {
      result.current.pluginRefetch();
    });

    await waitFor(() => expect(result.current.isLoading).toBeTruthy());
  });

  it('sets correct state when refetch is successful', async () => {
    expect.assertions(4);

    const { result } = renderHook(() => useTerraformConfig());

    await act(async () => {
      await result.current.pluginRefetch();
    });

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.pluginData).toEqual(mockTerraformConfig);
    expect(result.current.isError).toBeFalsy();
    expect(result.current.error).toBeUndefined();
  });

  it('sets correct state when refetch is not successful', async () => {
    expect.assertions(4);

    const error = new Error('Oops!');
    (useApi as jest.Mock).mockReturnValue({
      getTerraformConfiguration: jest.fn().mockRejectedValue(error),
    });

    const { result } = renderHook(() => useTerraformConfig());

    await act(async () => {
      await result.current.pluginRefetch();
    });

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.pluginData).toBeUndefined();
    expect(result.current.isError).toBeTruthy();
    expect(result.current.error).toEqual(error);
  });
});
