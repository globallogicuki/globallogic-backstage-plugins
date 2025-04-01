import { TerraformAssessmentResult, TerraformWorkspace } from './types';
import { formatTerraformAssessmentResult } from './formatTerraformAssessmentResult';

describe('formatTerraformAssessmentResult', () => {
  const mockTerraformAssessmentResult: TerraformAssessmentResult = {
    id: 'asmtres-N1mL2bpKXNhkciam',
    type: 'assessment-results',
    attributes: {
      'all-checks-succeeded': false,
      'checks-errored': 1,
      'checks-failed': 2,
      'checks-passed': 3,
      'checks-unknown': 4,
      'created-at': '2025-04-02T16:35:45.899Z',
      'drifted': true,
      'resources-drifted': 2,
      'resources-undrifted': 93
    }
  };

  const mockTerraformWorkspace: TerraformWorkspace = {
    id: 'workspace-id',
    type: 'workspaces',
    attributes: {
      name: "workspace-name",
      'created-at': '2025-04-02T16:35:45.899Z'
    }
  };

  const minExpectedResult = {
    id: mockTerraformAssessmentResult.id,
    createdAt: mockTerraformAssessmentResult.attributes['created-at'],
    workspaceId: mockTerraformWorkspace.id,
    workspaceName:mockTerraformWorkspace.attributes.name,
    driftMetrics: {
      drifted: true,
      resourcesDrifted: 2,
      resourcesUndrifted: 93
    },
    validationMetrics: {
      allChecksSucceeded: false,
      checksErrored: 1,
      checksFailed: 2,
      checksPassed: 3,
      checksUnknown: 4
    }
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should correctly map the data received from the API', () => {
    const response = formatTerraformAssessmentResult(mockTerraformAssessmentResult, mockTerraformWorkspace);
    expect(response).toEqual({
      ...minExpectedResult
    });
  });
});
