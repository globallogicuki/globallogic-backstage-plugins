import { act, renderHook, waitFor } from '@testing-library/react';
import useRuns from './useRuns';
import { useApi } from '@backstage/core-plugin-api';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
  createApiRef: jest.fn(),
}));

describe('useRuns', () => {
  const mockRuns = [{ id: 'run1' }, { id: 'run2' }];
  let getRuns: jest.Mock;

  beforeEach(() => {
    getRuns = jest.fn().mockResolvedValue(mockRuns);
    (useApi as jest.Mock).mockReturnValue({ getRuns });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches on mount and sets the correct state', async () => {
    const { result } = renderHook(() => useRuns('org1', ['workspace1']));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBeTruthy();
    expect(typeof result.current.refetch).toBe('function');

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(getRuns).toHaveBeenCalledTimes(1);
    expect(getRuns).toHaveBeenCalledWith('org1', ['workspace1']);
    expect(result.current.data).toEqual(mockRuns);
    expect(result.current.error).toBeUndefined();
  });

  it('sets correct state when the fetch is not successful', async () => {
    const error = new Error('Oops!');
    getRuns.mockRejectedValue(error);

    const { result } = renderHook(() => useRuns('org1', ['workspace1']));

    await waitFor(() => expect(result.current.error).toEqual(error));

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.data).toBeUndefined();
  });

  it('fetches again when refetch is called', async () => {
    const { result } = renderHook(() => useRuns('org1', ['workspace1']));

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(getRuns).toHaveBeenCalledTimes(2));
  });

  it('fetches again when the workspaces change', async () => {
    const { rerender } = renderHook(
      ({ workspaceNames }: { workspaceNames: string[] }) =>
        useRuns('org1', workspaceNames),
      { initialProps: { workspaceNames: ['workspace1'] } },
    );

    await waitFor(() => expect(getRuns).toHaveBeenCalledTimes(1));

    rerender({ workspaceNames: ['workspace1', 'workspace2'] });

    await waitFor(() => expect(getRuns).toHaveBeenCalledTimes(2));
    expect(getRuns).toHaveBeenLastCalledWith('org1', [
      'workspace1',
      'workspace2',
    ]);
  });

  it('does not fetch again when rerendered with an equal workspaces array', async () => {
    const { rerender, result } = renderHook(
      ({ workspaceNames }: { workspaceNames: string[] }) =>
        useRuns('org1', workspaceNames),
      { initialProps: { workspaceNames: ['workspace1'] } },
    );

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    rerender({ workspaceNames: ['workspace1'] });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(getRuns).toHaveBeenCalledTimes(1);
  });
});
