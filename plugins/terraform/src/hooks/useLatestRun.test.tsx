import { act, renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@backstage/core-plugin-api';
import useLatestRun from './useLatestRun';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
  createApiRef: jest.fn(),
}));

describe('useLatestRun', () => {
  const latestRun = { id: 'run1' };
  let getLatestRun: jest.Mock;

  beforeEach(() => {
    getLatestRun = jest.fn().mockResolvedValue(latestRun);
    (useApi as jest.Mock).mockReturnValue({ getLatestRun });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches on mount and sets the correct state', async () => {
    const { result } = renderHook(() => useLatestRun('org1', ['workspace1']));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBeTruthy();
    expect(typeof result.current.refetch).toBe('function');

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(getLatestRun).toHaveBeenCalledTimes(1);
    expect(getLatestRun).toHaveBeenCalledWith('org1', ['workspace1']);
    expect(result.current.data).toEqual(latestRun);
    expect(result.current.error).toBeUndefined();
  });

  it('returns null when the workspaces have no runs', async () => {
    getLatestRun.mockResolvedValue(null);

    const { result } = renderHook(() => useLatestRun('org1', ['workspace1']));

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeUndefined();
  });

  it('sets correct state when the fetch is not successful', async () => {
    const error = new Error('Oops!');
    getLatestRun.mockRejectedValue(error);

    const { result } = renderHook(() => useLatestRun('org1', ['workspace1']));

    await waitFor(() => expect(result.current.error).toEqual(error));

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.data).toBeUndefined();
  });

  it('fetches again when refetch is called', async () => {
    const { result } = renderHook(() => useLatestRun('org1', ['workspace1']));

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(getLatestRun).toHaveBeenCalledTimes(2));
  });

  it('fetches again when the workspaces change', async () => {
    const { rerender } = renderHook(
      ({ workspaceNames }: { workspaceNames: string[] }) =>
        useLatestRun('org1', workspaceNames),
      { initialProps: { workspaceNames: ['workspace1'] } },
    );

    await waitFor(() => expect(getLatestRun).toHaveBeenCalledTimes(1));

    rerender({ workspaceNames: ['workspace2'] });

    await waitFor(() => expect(getLatestRun).toHaveBeenCalledTimes(2));
    expect(getLatestRun).toHaveBeenLastCalledWith('org1', ['workspace2']);
  });
});
