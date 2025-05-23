//

// ******************************************************************
// * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY. *
// ******************************************************************
import { DriftMetrics } from '../models/DriftMetrics.model';
import { ValidationMetrics } from '../models/ValidationMetrics.model';

/**
 * @public
 */
export interface AssessmentResult {
  id?: string;
  createdAt?: string;
  workspaceId?: string;
  workspaceName?: string;
  driftMetrics?: DriftMetrics;
  validationMetrics?: ValidationMetrics;
}
