import { act, renderHook, waitFor } from '@testing-library/react';
import useRuns from './useRuns';
import { useApi } from '@backstage/core-plugin-api';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
  createApiRef: jest.fn(),
}));

describe('useRuns', () => {
  const mockRuns = [{ id: 'run1' }, { id: 'run2' }];

  beforeEach(() => {
    (useApi as jest.Mock).mockReturnValue({
      getRuns: jest.fn().mockResolvedValue(mockRuns),
    });
  });

  it('initial state is correct', () => {
    expect.assertions(5);

    const { result } = renderHook(() => useRuns('org1', ['workspace1']));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.isError).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('sets correct state when refetch is called', async () => {
    expect.assertions(1);
    const { result } = renderHook(() => useRuns('org1', ['workspace1']));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.isLoading).toBeTruthy());
  });

  it('sets correct state when refetch is successful', async () => {
    expect.assertions(4);

    const { result } = renderHook(() => useRuns('org1', ['workspace1']));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.data).toEqual(mockRuns);
    expect(result.current.isError).toBeFalsy();
    expect(result.current.error).toBeUndefined();
  });

  it('sets correct state when refetch is not successful', async () => {
    expect.assertions(4);

    const error = new Error('Oops!');
    (useApi as jest.Mock).mockReturnValue({
      getRuns: jest.fn().mockRejectedValue(error),
    });

    const { result } = renderHook(() => useRuns('org1', ['workspace1']));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBeTruthy();
    expect(result.current.error).toEqual(error);
  });
});
