import { TerraformAssessmentResult, TerraformWorkspace } from './types';

export const formatTerraformAssessmentResult = (
  terraformAssessmentResult: TerraformAssessmentResult,
  terraformWorkspace: TerraformWorkspace,
) => ({
  id: terraformAssessmentResult.id,
  createdAt: terraformAssessmentResult.attributes['created-at'],
  workspaceId: terraformWorkspace.id,
  workspaceName: terraformWorkspace.attributes.name,
  driftMetrics: {
    drifted: terraformAssessmentResult.attributes.drifted,
    resourcesDrifted: terraformAssessmentResult.attributes['resources-drifted'],
    resourcesUndrifted:
      terraformAssessmentResult.attributes['resources-undrifted'],
  },
  validationMetrics: {
    allChecksSucceeded:
      terraformAssessmentResult.attributes['all-checks-succeeded'],
    checksErrored: terraformAssessmentResult.attributes['checks-errored'],
    checksFailed: terraformAssessmentResult.attributes['checks-failed'],
    checksPassed: terraformAssessmentResult.attributes['checks-passed'],
    checksUnknown: terraformAssessmentResult.attributes['checks-unknown'],
  },
});
