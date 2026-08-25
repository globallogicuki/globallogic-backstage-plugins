import { renderHook, waitFor } from '@testing-library/react';
import useLogs from './useLogs';
import { useApi } from '@backstage/core-plugin-api';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
}));

describe('useLogs', () => {
  const mockLogs = 'Here are some mock logs.';
  let fetch: jest.Mock;

  beforeEach(() => {
    fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(mockLogs),
    });
    (useApi as jest.Mock).mockReturnValue({ fetch });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initial state is correct', async () => {
    expect.hasAssertions();

    const { result } = renderHook(() => useLogs('logs.txt'));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockLogs);
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.error).toBeUndefined();
    });
  });

  it('initial state is correct when fetch is not successful', async () => {
    expect.hasAssertions();

    const error = new Error('Oops!');
    fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockRejectedValue(error),
    });

    const { result } = renderHook(() => useLogs('logs.txt'));

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.error).toEqual(error);
    });
  });

  it('sets a useful error when the response is not ok', async () => {
    expect.hasAssertions();

    fetch.mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      text: jest.fn().mockResolvedValue('<html>Bad Gateway</html>'),
    });

    const { result } = renderHook(() => useLogs('logs.txt'));

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.error?.message).toEqual(
        'Error fetching logs: 502 Bad Gateway',
      );
    });
  });

  it('fetches again when the URL changes', async () => {
    const { result, rerender } = renderHook(
      ({ logsUrl }: { logsUrl: string }) => useLogs(logsUrl),
      { initialProps: { logsUrl: 'logs.txt' } },
    );

    await waitFor(() => expect(result.current.data).toEqual(mockLogs));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('logs.txt');

    rerender({ logsUrl: 'other-logs.txt' });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenLastCalledWith('other-logs.txt');
  });
});
