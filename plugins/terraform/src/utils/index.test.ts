import {
  createDriftUrl,
  createValidationChecksUrl,
  formatTimeToWords,
  getAnnotations,
} from './index';
import { Entity } from '@backstage/catalog-model';
import { mockEntity } from '../mocks/entity';

const isoString = '2023-05-24T10:23:40.172Z';

describe('utils', () => {
  describe('formatTimeToWords', () => {
    beforeEach(() => {
      const mockedDate = new Date(2023, 10, 12);

      jest.useFakeTimers();
      jest.setSystemTime(mockedDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('formats correctly with no opts', () => {
      const result = formatTimeToWords(isoString);

      expect(result).toEqual('6 months ago');
    });

    it('provides precise values if strict set', () => {
      const now = new Date().toISOString();
      const result = formatTimeToWords(now, { strict: true });

      expect(result).toEqual('0 seconds ago');
    });

    it('rounds values if strict not set', () => {
      const now = new Date().toISOString();
      const result = formatTimeToWords(now, { strict: false });

      expect(result).toEqual('less than a minute ago');
    });
  });

  describe('getAnnotations', () => {
    it('should return organization and workspaces when both annotations are present', () => {
      const { organization, workspaces } = getAnnotations(mockEntity);
      expect(organization).toEqual('gluk');
      expect(workspaces).toEqual([
        'terraform-cloud-gluk-project-config',
        'workspace-2',
      ]);
    });

    it('should return undefined organization and workspaces when both annotations are absent', () => {
      const emptyEntity: Entity = JSON.parse(JSON.stringify(mockEntity));
      emptyEntity.metadata.annotations = {};

      const { organization, workspaces } = getAnnotations(emptyEntity);
      expect(organization).toBeUndefined();
      expect(workspaces).toBeUndefined();
    });
  });

  describe('Terraform URL Creation Functions', () => {
    const baseUrl = 'https://terraform.example.com';
    const organizationName = 'test-org';
    const workspaceName = 'test-workspace';

    describe('createDriftUrl', () => {
      it('should create the correct drift URL with a defined baseUrl', () => {
        const expectedUrl = `${baseUrl}/app/${organizationName}/workspaces/${workspaceName}/health/drift`;
        expect(createDriftUrl(baseUrl, organizationName, workspaceName)).toBe(
          expectedUrl,
        );
      });

      it('should create the correct drift URL with an undefined baseUrl', () => {
        const expectedUrl = `undefined/app/${organizationName}/workspaces/${workspaceName}/health/drift`;
        expect(createDriftUrl(undefined, organizationName, workspaceName)).toBe(
          expectedUrl,
        );
      });

      it('should create the correct drift URL with an empty baseUrl', () => {
        const expectedUrl = `/app/${organizationName}/workspaces/${workspaceName}/health/drift`;
        expect(createDriftUrl('', organizationName, workspaceName)).toBe(
          expectedUrl,
        );
      });
    });

    describe('createValidationChecksUrl', () => {
      it('should create the correct validation checks URL with a defined baseUrl', () => {
        const expectedUrl = `${baseUrl}/app/${organizationName}/workspaces/${workspaceName}/health/continuous-validation`;
        expect(
          createValidationChecksUrl(baseUrl, organizationName, workspaceName),
        ).toBe(expectedUrl);
      });

      it('should create the correct validation checks URL with an undefined baseUrl', () => {
        const expectedUrl = `undefined/app/${organizationName}/workspaces/${workspaceName}/health/continuous-validation`;
        expect(
          createValidationChecksUrl(undefined, organizationName, workspaceName),
        ).toBe(expectedUrl);
      });

      it('should create the correct validation checks URL with an empty baseUrl', () => {
        const expectedUrl = `/app/${organizationName}/workspaces/${workspaceName}/health/continuous-validation`;
        expect(
          createValidationChecksUrl('', organizationName, workspaceName),
        ).toBe(expectedUrl);
      });
    });
  });
});
