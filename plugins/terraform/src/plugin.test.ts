import {
  terraformPlugin,
  EntityTerraformCard,
  EntityTerraformContent,
  EntityTerraformLatestRunCard,
  EntityTerraformWorkspaceHealthAssessmentsCard,
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

  it('should export latest run', () => {
    expect(EntityTerraformLatestRunCard).toBeDefined();
  });

  it('should export workspace health assessments', () => {
    expect(EntityTerraformWorkspaceHealthAssessmentsCard).toBeDefined();
  });
});
