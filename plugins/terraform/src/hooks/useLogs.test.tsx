import { renderHook, waitFor } from '@testing-library/react';
import useLogs from './useLogs';
import { useApi } from '@backstage/core-plugin-api';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
}));

describe('useLogs', () => {
  const mockLogs = 'Here are some mock logs.';

  beforeEach(() => {
    (useApi as jest.Mock).mockReturnValue({
      fetch: jest
        .fn()
        .mockReturnValue({ text: jest.fn().mockResolvedValue(mockLogs) }),
    });
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
    (useApi as jest.Mock).mockReturnValue({
      fetch: jest
        .fn()
        .mockReturnValue({ text: jest.fn().mockRejectedValue(error) }),
    });

    const { result } = renderHook(() => useLogs('logs.txt'));

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.error).toEqual(error);
    });
  });
});
