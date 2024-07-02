import {
  isTerraformAvailable,
  TERRAFORM_WORKSPACE_ANNOTATION,
  TERRAFORM_WORKSPACE_ORGANIZATION,
} from './annotations';
import { mockEntity } from './mocks/entity';

describe('annotations', () => {
  const missingAnnotation = JSON.parse(JSON.stringify(mockEntity));
  missingAnnotation.metadata.annotations = {};

  describe('isTerraformAvailable', () => {
    it('returns truthy if the expected annotations are present', () => {
      expect(isTerraformAvailable(mockEntity)).toBeTruthy();
    });

    it('returns falsey if the expected annotations are not present', () => {
      expect(isTerraformAvailable(missingAnnotation)).toBeFalsy();
    });
  });

  describe('TERRAFORM_WORKSPACE_ANNOTATION', () => {
    it('exports TERRAFORM_WORKSPACE_ANNOTATION', () => {
      expect(TERRAFORM_WORKSPACE_ANNOTATION).toBeDefined();
    });
  });

  describe('TERRAFORM_WORKSPACE_ORGANIZATION', () => {
    it('exports TERRAFORM_WORKSPACE_ORGANIZATION', () => {
      expect(TERRAFORM_WORKSPACE_ORGANIZATION).toBeDefined();
    });
  });
});
