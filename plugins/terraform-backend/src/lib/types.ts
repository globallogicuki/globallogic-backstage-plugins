export interface TerraformRun {
  id: string;
  attributes: {
    message?: string;
    status: string;
    'created-at': string;
  };
  relationships: {
    'confirmed-by'?: {
      data: Relationship;
    };
    plan?: {
      data: Relationship;
    };
  };
}

export interface TerraformWorkspace {
  id: string;
  attributes: {
    description: string;
    'created-at': string;
  };
}

interface Relationship {
  id: string;
}

export interface TerraformEntity {
  id: string;
  attributes: {
    username?: string;
    'avatar-url'?: string;
    'log-read-url'?: string;
  };
}

export interface TerraformResponse<EntityType> {
  data: EntityType;
  included: TerraformEntity[];
}
