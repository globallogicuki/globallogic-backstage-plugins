import { TerraformApiClient } from './api';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

jest.mock('@backstage/core-plugin-api', () => ({
  DiscoveryApi: jest.fn(),
  FetchApi: jest.fn(),
  createApiRef: jest.fn(),
}));

describe('TerraformApiClient', () => {
  let discoveryApiMock: DiscoveryApi;
  let fetchApiMock: FetchApi;
  let client: TerraformApiClient;

  const mockRuns = [{ id: 'run1' }, { id: 'run2' }];

  beforeEach(() => {
    discoveryApiMock = {
      getBaseUrl: jest.fn().mockResolvedValue('http://mock-api.com'),
    };
    fetchApiMock = {
      fetch: jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRuns),
      }),
    };

    client = new TerraformApiClient({
      discoveryApi: discoveryApiMock,
      fetchApi: fetchApiMock,
    });
  });

  it('calls DiscoveryApi with the correct id', async () => {
    await client.getRuns('org1', 'workspace1');
    expect(discoveryApiMock.getBaseUrl).toHaveBeenCalledWith('terraform');
  });

  it('calls FetchApi with the correct args', async () => {
    await client.getRuns('org1', 'workspace1');

    expect(fetchApiMock.fetch).toHaveBeenCalledWith(
      'http://mock-api.com/organizations/org1/workspaces/workspace1/runs',
      { credentials: 'include' },
    );
  });

  it('returns runs when successful', async () => {
    const runs = await client.getRuns('org1', 'workspace1');

    expect(runs).toEqual(mockRuns);
  });

  it('should throw an error when the FetchApi call is unsuccessful', async () => {
    const response = {
      ok: false,
      json: jest
        .fn()
        .mockResolvedValue({ error: { message: 'Failed to fetch runs' } }),
    };
    (fetchApiMock.fetch as jest.Mock).mockResolvedValue(response);

    await expect(client.getRuns('org1', 'workspace1')).rejects.toThrow(
      'Failed to fetch runs',
    );
  });

  it('should throw an error when the FetchApi call is unsuccessful and no error message is present', async () => {
    const response = {
      ok: false,
      json: jest.fn().mockResolvedValue({ error: undefined }),
    };
    (fetchApiMock.fetch as jest.Mock).mockResolvedValue(response);

    await expect(client.getRuns('org1', 'workspace1')).rejects.toThrow(
      'Error fetching runs!',
    );
  });
});
