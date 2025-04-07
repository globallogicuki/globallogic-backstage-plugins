interface TerraformEntityBase {
  id: string;
  type: string;
  attributes: {};
}

interface Relationship {
  data: {
    id: string;
    type: string;
  };
  links?: {
    related: string;
  };
}

export interface TerraformRun extends TerraformEntityBase {
  type: 'runs';
  attributes: {
    message?: string;
    status: string;
    'created-at': string;
  };
  relationships: {
    'confirmed-by'?: Relationship;
    plan?: Relationship;
    workspace?: Relationship;
  };
}

export interface TerraformWorkspace extends TerraformEntityBase {
  id: string;
  type: 'workspaces';
  attributes: {
    name: string;
    description?: string;
    'created-at': string;
  };
  relationships?: {
    'current-assessment-result'?: Relationship;
  };
}

export interface TerraformUser extends TerraformEntityBase {
  type: 'users';
  attributes: {
    username?: string;
    'avatar-url'?: string;
  };
}

export interface TerraformPlan extends TerraformEntityBase {
  type: 'plans';
  attributes: {
    'log-read-url'?: string;
  };
}

export interface TerraformAssessmentResult extends TerraformEntityBase {
  type: 'assessment-results';
  attributes: {
    'created-at': string;
    'all-checks-succeeded': boolean;
    'checks-errored': number;
    'checks-failed': number;
    'checks-passed': number;
    'checks-unknown': number;
    drifted: boolean;
    'resources-drifted': number;
    'resources-undrifted': number;
  };
}

export type TerraformEntity =
  | TerraformRun
  | TerraformWorkspace
  | TerraformUser
  | TerraformPlan;

export interface TerraformResponse<EntityType> {
  data: EntityType;
  included: TerraformEntity[];
}
