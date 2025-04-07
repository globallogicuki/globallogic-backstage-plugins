export interface Run {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  confirmedBy?: {
    name: string;
    avatar?: string;
  };
  plan?: {
    logs?: string | null;
  };
  workspace?: {
    name?: string | null;
  };
}

export interface AssessmentResult {
  id?: string;
  createdAt?: string;
  workspaceId?: string;
  workspaceName?: string;
  driftMetrics?: DriftMetrics;
  validationMetrics?: ValidationMetrics;
}

export interface DriftMetrics {
  drifted?: boolean;
  resourcesDrifted?: number;
  resourcesUndrifted?: number;
}

export interface ValidationMetrics {
  allChecksSucceeded?: boolean;
  checksErrored?: number;
  checksFailed?: number;
  checksPassed?: number;
  checksUnknown?: number;
}
