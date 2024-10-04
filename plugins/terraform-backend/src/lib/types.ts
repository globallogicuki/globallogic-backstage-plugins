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
  type: 'workspaces';
  attributes: {
    name: string;
    description: string;
    'created-at': string;
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

export type TerraformEntity =
  | TerraformRun
  | TerraformWorkspace
  | TerraformUser
  | TerraformPlan;

export interface TerraformResponse<EntityType> {
  data: EntityType;
  included: TerraformEntity[];
}
