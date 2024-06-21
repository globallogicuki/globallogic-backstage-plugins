import { getAnnotations } from './utils';
import { Entity } from '@backstage/catalog-model';
import { mockEntity } from '../../mocks/entity';
describe('getAnnotations', () => {

    it('should return organization and workspace when both annotations are present', () => {
        const { organization, workspace } = getAnnotations(mockEntity);
        expect(organization).toBe('gluk');
        expect(workspace).toBe('terraform-cloud-gluk-project-config');
    });

    it('should return undefined organization and workspace when both annotations are absent', () => {
        const emptyEntity: Entity = JSON.parse(JSON.stringify(mockEntity));
        emptyEntity.metadata.annotations = {};

        const { organization, workspace } = getAnnotations(emptyEntity);
        expect(organization).toBeUndefined();
        expect(workspace).toBeUndefined();
    });
});