import {
  terraformPlugin,
  EntityTerraformCard,
  EntityTerraformContent,
  EntityTerraformLatestRunContent,
} from './plugin';

describe('terraform', () => {
  it('should export plugin', () => {
    expect(terraformPlugin).toBeDefined();
  });

  it('should export content', () => {
    expect(EntityTerraformContent).toBeDefined();
  });

  it('should export card', () => {
    expect(EntityTerraformCard).toBeDefined();
  });

  it('should export latest run content', () => {
    expect(EntityTerraformLatestRunContent).toBeDefined();
  });
});
