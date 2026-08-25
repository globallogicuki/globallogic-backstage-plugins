import { act, renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@backstage/core-plugin-api';
import useAssessmentResults from './useAssessmentResults';

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: jest.fn(),
  createApiRef: jest.fn(),
}));

describe('useAssessmentResults', () => {
  const mockAssessmentResults = [
    { id: 'assessmentResult1' },
    { id: 'assessmentResult2' },
  ];
  let getAssessmentResultsForWorkspaces: jest.Mock;

  beforeEach(() => {
    getAssessmentResultsForWorkspaces = jest
      .fn()
      .mockResolvedValue(mockAssessmentResults);
    (useApi as jest.Mock).mockReturnValue({
      getAssessmentResultsForWorkspaces,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches on mount and sets the correct state', async () => {
    const { result } = renderHook(() =>
      useAssessmentResults('org1', ['workspace1']),
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBeTruthy();
    expect(typeof result.current.refetch).toBe('function');

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(getAssessmentResultsForWorkspaces).toHaveBeenCalledTimes(1);
    expect(getAssessmentResultsForWorkspaces).toHaveBeenCalledWith('org1', [
      'workspace1',
    ]);
    expect(result.current.data).toEqual(mockAssessmentResults);
    expect(result.current.error).toBeUndefined();
  });

  it('sets correct state when the fetch is not successful', async () => {
    const error = new Error('Oops!');
    getAssessmentResultsForWorkspaces.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useAssessmentResults('org1', ['workspace1']),
    );

    await waitFor(() => expect(result.current.error).toEqual(error));

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.data).toBeUndefined();
  });

  it('fetches again when refetch is called', async () => {
    const { result } = renderHook(() =>
      useAssessmentResults('org1', ['workspace1']),
    );

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    act(() => {
      result.current.refetch();
    });

    await waitFor(() =>
      expect(getAssessmentResultsForWorkspaces).toHaveBeenCalledTimes(2),
    );
  });

  it('fetches again when the organization changes', async () => {
    const { rerender } = renderHook(
      ({ organization }: { organization: string }) =>
        useAssessmentResults(organization, ['workspace1']),
      { initialProps: { organization: 'org1' } },
    );

    await waitFor(() =>
      expect(getAssessmentResultsForWorkspaces).toHaveBeenCalledTimes(1),
    );

    rerender({ organization: 'org2' });

    await waitFor(() =>
      expect(getAssessmentResultsForWorkspaces).toHaveBeenCalledTimes(2),
    );
    expect(getAssessmentResultsForWorkspaces).toHaveBeenLastCalledWith('org2', [
      'workspace1',
    ]);
  });
});
