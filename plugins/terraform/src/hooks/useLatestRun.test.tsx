import { act, renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@backstage/core-plugin-api';
import useLatestRun from './useLatestRun';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
  createApiRef: jest.fn(),
}));

describe('useLatestRun', () => {
  const latestRun = { id: 'run1' };

  beforeEach(() => {
    (useApi as jest.Mock).mockReturnValue({
      getLatestRun: jest.fn().mockResolvedValue(latestRun),
    });
  });

  it('initial state is correct', () => {
    expect.assertions(5);

    const { result } = renderHook(() => useLatestRun('org1', ['workspace1']));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.isError).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('sets correct state when refetch is called', async () => {
    expect.assertions(1);
    const { result } = renderHook(() => useLatestRun('org1', ['workspace1']));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.isLoading).toBeTruthy());
  });

  it('sets correct state when refetch is successful', async () => {
    expect.assertions(4);

    const { result } = renderHook(() => useLatestRun('org1', ['workspace1']));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.data).toEqual(latestRun);
    expect(result.current.isError).toBeFalsy();
    expect(result.current.error).toBeUndefined();
  });

  it('sets correct state when refetch is not successful', async () => {
    expect.assertions(4);

    const error = new Error('Oops!');
    (useApi as jest.Mock).mockReturnValue({
      getLatestRun: jest.fn().mockRejectedValue(error),
    });

    const { result } = renderHook(() => useLatestRun('org1', ['workspace1']));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBeTruthy();
    expect(result.current.error).toEqual(error);
  });
});
