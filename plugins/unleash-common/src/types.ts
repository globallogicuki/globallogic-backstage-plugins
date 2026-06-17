/**
 * Unleash feature flag type definitions
 */

export interface Tag {
  type: string;
  value: string;
}

export interface FeatureFlag {
  name: string;
  description?: string;
  type: 'release' | 'experiment' | 'operational' | 'kill-switch' | 'permission';
  stale: boolean;
  createdAt: string;
  lastSeenAt?: string;
  environments: EnvironmentStatus[];
  variants?: Variant[];
  project?: string;
  impressionData?: boolean;
  tags?: Tag[];
}

export interface EnvironmentStatus {
  name: string;
  displayName?: string;
  enabled: boolean;
  strategies?: Strategy[]; // Only present when fetching individual flag
  hasStrategies?: boolean; // Present in list responses
  hasEnabledStrategies?: boolean; // Present in list responses
  type?: string;
  sortOrder?: number;
  variantCount?: number;
  lastSeenAt?: string;
}

export interface Variant {
  name: string;
  weight: number;
  weightType: 'fix' | 'variable';
  stickiness?: string;
  payload?: { type: string; value: string };
  overrides?: { contextName: string; values: string[] }[];
}

export interface Strategy {
  id: string;
  name: string;
  title?: string;
  parameters?: Record<string, string>;
  constraints?: Constraint[];
  segments?: number[];
  variants?: Variant[];
  disabled?: boolean;
  sortOrder?: number;
}

export interface Constraint {
  contextName: string;
  operator: string;
  values?: string[];
  value?: string;
  caseInsensitive?: boolean;
  inverted?: boolean;
}

export interface UnleashProject {
  id: string;
  name: string;
  description?: string;
  health?: number;
  favorite?: boolean;
}

export interface ProjectSummary {
  name: string;
  id: string;
  description?: string;
  health: number;
  technicalDebt: number;
  favorite: boolean;
  featureCount: number;
  memberCount: number;
  createdAt: string;
  archivedAt: string | null;
  mode: string;
  lastReportedFlagUsage: string | null;
  lastUpdatedAt: string | null;
  owners: Array<{ ownerType: string }>;
}

export interface EnvironmentSummary {
  name: string;
  type: string;
  sortOrder: number;
  enabled: boolean;
  protected: boolean;
  requiredApprovals: number | null;
  projectCount: number;
  apiTokenCount: number;
  enabledToggleCount: number;
}

export interface FeatureFlagMetrics {
  version: number;
  maturity: string;
  featureName: string;
  lastHourUsage: MetricsBucket[];
  seenApplications: string[];
}

export interface MetricsBucket {
  start: string;
  stop: string;
  yes: number;
  no: number;
}
