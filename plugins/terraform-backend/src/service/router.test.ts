import { getVoidLogger } from '@backstage/backend-common';
import { wrapInOpenApiTestServer } from '@backstage/backend-openapi-utils';
import { ConfigReader } from '@backstage/config';
import { Server } from 'http';
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { mockConfig } from '../mocks/config';
import { findWorkspace, getRunsForWorkspace } from '../lib';
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

  describe('GET /organizations/:orgName/workspaces/:workspaceName/runs', () => {
    it('returns all runs', async () => {
      (findWorkspace as jest.Mock).mockResolvedValue({ id: 'fakeWorkspaceId' });
      (getRunsForWorkspace as jest.Mock).mockResolvedValue([mockRun]);

      const response = await request(app).get(
        '/organizations/testOrg/workspaces/testWorkspace/runs'
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([mockRun]);
    });

    it('returns error if findWorkspace throws', async () => {
      const response = await request(app).get(
        '/organizations/testOrg/workspaces/testWorkspace/runs'
      );

      (findWorkspace as jest.Mock).mockRejectedValue(new Error('Some error.'));
      (getRunsForWorkspace as jest.Mock).mockResolvedValue([mockRun]);

      expect(response.status).toEqual(500);
    });

    it('returns error if getRunsForWorkspace throws', async () => {
      const response = await request(app).get(
        '/organizations/testOrg/workspaces/testWorkspace/runs'
      );

      (findWorkspace as jest.Mock).mockResolvedValue({ id: 'fakeWorkspaceId' });
      (getRunsForWorkspace as jest.Mock).mockRejectedValue(
        new Error('Some error.')
      );

      expect(response.status).toEqual(500);
    });
  });
});
