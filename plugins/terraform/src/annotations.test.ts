import {
  isEitherTerraformOrGitubActionsAvailable,
  isTerraformAvailable,
  TERRAFORM_WORKSPACE_ANNOTATION,
  TERRAFORM_WORKSPACE_ORGANIZATION,
} from './annotations';
import { mockEntity } from './mocks/entity';
import { Entity } from '@backstage/catalog-model';

describe('annotations', () => {
  describe('isTerraformAvailable', () => {
    it('returns truthy if the expected annotations are present', () => {
      expect(isTerraformAvailable(mockEntity)).toBeTruthy();
    });

    it('returns falsey if the expected annotations are not present', () => {
      const missingAnnotation = { ...mockEntity };
      // @ts-ignore
      missingAnnotation.metadata.annotations = {};

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

  jest.mock('./annotations', () => {
    const originalModule = jest.requireActual('./annotations');

    const mockIsGithubActionsAvailable = (entity: Entity): boolean => true;

    return {
      isTerraformAvailable: originalModule.isTerraformAvailable,
      isGithubActionsAvailable: mockIsGithubActionsAvailable,
    };
  });

  describe('isEitherTerraformOrGitubActionsAvailable', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('returns true if only isGithubActionsAvailable is true', () => {});
    expect(isEitherTerraformOrGitubActionsAvailable(mockEntity)).toBeTruthy();
  });
});
