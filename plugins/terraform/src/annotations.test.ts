import {
  isEitherTerraformOrGitubActionsAvailable,
  isTerraformAvailable,
  TERRAFORM_WORKSPACE_ANNOTATION,
  TERRAFORM_WORKSPACE_ORGANIZATION,
} from './annotations';
import { isGithubActionsAvailable } from '@backstage/plugin-github-actions';
import { mockEntity } from './mocks/entity';

jest.mock('@backstage/plugin-github-actions', () => ({
  isGithubActionsAvailable: jest.fn(),
}));

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

  describe('isEitherTerraformOrGitubActionsAvailable', () => {
    const setGithubActionsAvailabilityMock = (isAvailable: boolean) =>
      (isGithubActionsAvailable as jest.Mock).mockReturnValue(isAvailable);

    it('returns truthy for valid Entity and isGithubActionsAvailable is true', () => {
      setGithubActionsAvailabilityMock(true);
      expect(isEitherTerraformOrGitubActionsAvailable(mockEntity)).toBeTruthy();
    });

    it('returns truthy for valid Entity and isGithubActionsAvailable is false', () => {
      setGithubActionsAvailabilityMock(false);
      expect(isEitherTerraformOrGitubActionsAvailable(mockEntity)).toBeTruthy();
    });

    it('returns truthy for missingAnnotation and isGithubActionsAvailable is true', () => {
      setGithubActionsAvailabilityMock(true);
      expect(
        isEitherTerraformOrGitubActionsAvailable(missingAnnotation),
      ).toBeTruthy();
    });

    it('returns falsy for missingAnnotation and isGithubActionsAvailable is false', () => {
      setGithubActionsAvailabilityMock(false);
      expect(
        isEitherTerraformOrGitubActionsAvailable(missingAnnotation),
      ).toBeFalsy();
    });
  });
});
