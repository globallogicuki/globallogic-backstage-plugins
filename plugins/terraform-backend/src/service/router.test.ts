import { getVoidLogger } from '@backstage/backend-common';
import { wrapInOpenApiTestServer } from '@backstage/backend-openapi-utils/testUtils'
import { ConfigReader } from '@backstage/config';
import { Server } from 'http';
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { mockConfig } from '../mocks/config';
import { getLatestRunForWorkspaces, listOrgRuns } from '../lib';
import { mockRun } from '../mocks/run';

jest.mock('../lib');

describe('createRouter', () => {
  let app: express.Express | Server;
  const config = new ConfigReader(mockConfig);

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: config,
    });
    app = wrapInOpenApiTestServer(express().use(router));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /organizations/:orgName/workspaces/:workspaceNames/runs', () => {
    it('returns all runs', async () => {
      (listOrgRuns as jest.Mock).mockResolvedValue([mockRun]);

      const response = await request(app).get(
        '/organizations/testOrg/workspaces/testWorkspace1,testWorkspace2/runs',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([mockRun]);
    });

    it('calls listOrgRuns correctly with single workspace', async () => {
      (listOrgRuns as jest.Mock).mockResolvedValue([mockRun]);

      await request(app).get(
        '/organizations/testOrg/workspaces/testWorkspace1/runs',
      );

      expect(listOrgRuns).toHaveBeenCalledWith({
        organization: 'testOrg',
        token: 'fakeToken',
        workspaces: ['testWorkspace1'],
      });
    });

    it('calls listOrgRuns correctly with multiple workspaces', async () => {
      (listOrgRuns as jest.Mock).mockResolvedValue([mockRun]);

      await request(app).get(
        '/organizations/testOrg/workspaces/testWorkspace1,testWorkspace2/runs',
      );

      expect(listOrgRuns).toHaveBeenCalledWith({
        organization: 'testOrg',
        token: 'fakeToken',
        workspaces: ['testWorkspace1', 'testWorkspace2'],
      });
    });

    it('returns error if listOrgRuns throws', async () => {
      const response = await request(app).get(
        '/organizations/testOrg/workspaces/testWorkspace1,testWorkspace2/runs',
      );

      (listOrgRuns as jest.Mock).mockRejectedValue(new Error('Some error.'));

      expect(response.status).toEqual(500);
    });
  });

  describe('GET /organizations/:orgName/workspaces/:workspaceNames/latestRun', () => {
    const TEST_URL =
      '/organizations/testOrg/workspaces/testWorkspace1,testWorkspace2/latestRun';

    it('returns latest run', async () => {
      (getLatestRunForWorkspaces as jest.Mock).mockResolvedValue(mockRun);

      const response = await request(app).get(TEST_URL);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockRun);
    });

    it('calls getLatestRunForWorkspaces correctly with single workspace', async () => {
      (getLatestRunForWorkspaces as jest.Mock).mockResolvedValue([mockRun]);

      await request(app).get(
        '/organizations/testOrg/workspaces/testWorkspace1/latestRun',
      );

      expect(getLatestRunForWorkspaces).toHaveBeenCalledWith(
        'fakeToken',
        'testOrg',
        ['testWorkspace1'],
      );
    });

    it('calls getLatestRunForWorkspaces correctly with multiple workspaces', async () => {
      (getLatestRunForWorkspaces as jest.Mock).mockResolvedValue([mockRun]);

      await request(app).get(TEST_URL);

      expect(getLatestRunForWorkspaces).toHaveBeenCalledWith(
        'fakeToken',
        'testOrg',
        ['testWorkspace1', 'testWorkspace2'],
      );
    });

    it('returns error if getLatestRunForWorkspaces throws', async () => {
      const response = await request(app).get(TEST_URL);

      (getLatestRunForWorkspaces as jest.Mock).mockRejectedValue(
        new Error('Some error.'),
      );

      expect(response.status).toEqual(500);
    });
  });
});
