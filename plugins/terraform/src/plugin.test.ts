import {
  terraformPlugin,
  EntityTerraformCard,
  EntityTerraformContent,
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
});
