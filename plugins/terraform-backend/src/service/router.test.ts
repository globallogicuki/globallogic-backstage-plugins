import { wrapServer } from '@backstage/backend-openapi-utils/testUtils';
import { ConfigReader } from '@backstage/config';
import { Server } from 'http';
import express from 'express';
import request from 'supertest';
import { createRouter, DEFAULT_TF_BASE_URL, getApiBaseUrl } from './router';
import { mockConfig } from '../mocks/config';
import {
  getAssessmentResultsForWorkspaces,
  getLatestRunForWorkspaces,
  listOrgRuns,
} from '../lib';
import { mockRun } from '../mocks/run';
import { mockServices } from '@backstage/backend-test-utils';
import {
  mockAssessmentResults,
  mockSingleAssessmentResult,
} from '../mocks/assessmentResults';

jest.mock('../lib');

describe('getApiBaseUrl', () => {
  it('appends /api/v2 to a web origin', () => {
    expect(getApiBaseUrl('https://tfe.enterprise.com')).toEqual(
      'https://tfe.enterprise.com/api/v2',
    );
  });

  it('appends /api/v2 to the default base URL', () => {
    expect(getApiBaseUrl(DEFAULT_TF_BASE_URL)).toEqual(
      'https://app.terraform.io/api/v2',
    );
  });

  it('handles trailing slashes', () => {
    expect(getApiBaseUrl('https://tfe.enterprise.com/')).toEqual(
      'https://tfe.enterprise.com/api/v2',
    );
  });

  it('uses a base URL already ending in /api/v2 as-is for backwards compatibility', () => {
    expect(getApiBaseUrl('https://tfe.enterprise.com/api/v2')).toEqual(
      'https://tfe.enterprise.com/api/v2',
    );
  });
});

describe('createRouter', () => {
  let app: express.Express | Server;
  const config = new ConfigReader(mockConfig);
  const apiBaseUrl = getApiBaseUrl(DEFAULT_TF_BASE_URL);

  beforeAll(async () => {
    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config: config,
    });
    app = await wrapServer(express().use(router));
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
        baseUrl: apiBaseUrl,
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
        baseUrl: apiBaseUrl,
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
      (getLatestRunForWorkspaces as jest.Mock).mockResolvedValue(mockRun);

      await request(app).get(
        '/organizations/testOrg/workspaces/testWorkspace1/latestRun',
      );

      expect(getLatestRunForWorkspaces).toHaveBeenCalledWith(
        apiBaseUrl,
        'fakeToken',
        'testOrg',
        ['testWorkspace1'],
      );
    });

    it('calls getLatestRunForWorkspaces correctly with multiple workspaces', async () => {
      (getLatestRunForWorkspaces as jest.Mock).mockResolvedValue(mockRun);

      await request(app).get(TEST_URL);

      expect(getLatestRunForWorkspaces).toHaveBeenCalledWith(
        apiBaseUrl,
        'fakeToken',
        'testOrg',
        ['testWorkspace1', 'testWorkspace2'],
      );
    });

    it('returns null with status 200 when the workspaces have no runs', async () => {
      (getLatestRunForWorkspaces as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get(TEST_URL);

      expect(response.status).toEqual(200);
      expect(response.text).toEqual('null');
      expect(response.body).toBeNull();
    });

    it('returns error if getLatestRunForWorkspaces throws', async () => {
      const response = await request(app).get(TEST_URL);

      (getLatestRunForWorkspaces as jest.Mock).mockRejectedValue(
        new Error('Some error.'),
      );

      expect(response.status).toEqual(500);
    });
  });

  describe('GET /organizations/:orgName/workspaces/:workspaceNames/assessment-results', () => {
    const TEST_URL =
      '/organizations/testOrg/workspaces/testWorkspace1,testWorkspace2/assessment-results';

    it('returns assessment results', async () => {
      (getAssessmentResultsForWorkspaces as jest.Mock).mockResolvedValue(
        mockAssessmentResults,
      );

      const response = await request(app).get(TEST_URL);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockAssessmentResults);
    });

    it('calls getAssessmentResultsForWorkspaces correctly with single workspace', async () => {
      (getAssessmentResultsForWorkspaces as jest.Mock).mockResolvedValue(
        mockSingleAssessmentResult,
      );

      await request(app).get(
        '/organizations/testOrg/workspaces/testWorkspace1/assessment-results',
      );

      expect(getAssessmentResultsForWorkspaces).toHaveBeenCalledWith({
        baseUrl: apiBaseUrl,
        token: 'fakeToken',
        organization: 'testOrg',
        workspaces: ['testWorkspace1'],
        logger: expect.anything(),
      });
    });

    it('calls getAssessmentResultsForWorkspaces correctly with multiple workspaces', async () => {
      (getAssessmentResultsForWorkspaces as jest.Mock).mockResolvedValue(
        mockAssessmentResults,
      );

      await request(app).get(TEST_URL);

      expect(getAssessmentResultsForWorkspaces).toHaveBeenCalledWith({
        baseUrl: apiBaseUrl,
        token: 'fakeToken',
        organization: 'testOrg',
        workspaces: ['testWorkspace1', 'testWorkspace2'],
        logger: expect.anything(),
      });
    });

    it('returns error if getAssessmentResultsForWorkspaces throws', async () => {
      const response = await request(app).get(TEST_URL);

      (getAssessmentResultsForWorkspaces as jest.Mock).mockRejectedValue(
        new Error('Some error.'),
      );

      expect(response.status).toEqual(500);
    });
  });
});
