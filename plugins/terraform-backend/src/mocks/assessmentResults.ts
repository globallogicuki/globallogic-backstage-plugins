export const mockAssessmentResults = [
  {
    'id': 'assessmentResult1',
    'createdAt': '2025-04-01T16:26:28.423Z',
    'workspaceId': 'workspace1-id',
    'workspaceName': 'workspace-1',
    'driftMetrics': {
      'drifted': true,
      'resourcesDrifted': 1,
      'resourcesUndrifted': 135
    },
    'validationMetrics': {
      'allChecksSucceeded': false,
      'checksErrored': 0,
      'checksFailed': 1,
      'checksPassed': 4,
      'checksUnknown': 0
    }
  },
  {
    'id': 'assessmentResult2',
    'createdAt': '2025-04-02T06:20:31.884Z',
    'workspaceId': 'workspace2-id',
    'workspaceName': 'workspace-2',
    'driftMetrics': {
      'drifted': false,
      'resourcesDrifted': 0,
      'resourcesUndrifted': 93
    },
    'validationMetrics': {
      'allChecksSucceeded': true,
      'checksErrored': 0,
      'checksFailed': 0,
      'checksPassed': 5,
      'checksUnknown': 0
    }
  }
];

export const mockSingleAssessmentResult = [
  {
    'id': 'assessmentResult1',
    'createdAt': '2025-04-01T16:26:28.423Z',
    'workspaceId': 'workspace1-id',
    'workspaceName': 'workspace-1',
    'driftMetrics': {
      'drifted': true,
      'resourcesDrifted': 1,
      'resourcesUndrifted': 135
    },
    'validationMetrics': {
      'allChecksSucceeded': false,
      'checksErrored': 0,
      'checksFailed': 1,
      'checksPassed': 4,
      'checksUnknown': 0
    }
  }
];