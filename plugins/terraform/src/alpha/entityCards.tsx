import { compatWrapper } from '@backstage/core-compat-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { isTerraformAvailable } from '../annotations';

/**
 * @alpha
 */
export const EntityTerraformCard = EntityCardBlueprint.make({
  name: 'EntityTerraformCard',
  params: {
    filter: isTerraformAvailable,
    loader: () =>
      import('../components/Terraform').then(m =>
        compatWrapper(<m.Terraform isCard />),
      ),
  },
});

/**
 * @alpha
 */
export const EntityTerraformLatestRunCard = EntityCardBlueprint.make({
  name: 'EntityTerraformLatestRunCard',
  params: {
    filter: isTerraformAvailable,
    loader: () =>
      import('../components/TerraformLatestRun').then(m =>
        compatWrapper(<m.TerraformLatestRun />),
      ),
  },
});

/**
 * @alpha
 */
export const EntityTerraformWorkspaceHealthAssessmentsCard =
  EntityCardBlueprint.make({
    name: 'EntityTerraformWorkspaceHealthAssessmentsCard',
    params: {
      filter: isTerraformAvailable,
      loader: () =>
        import('../components/TerraformWorkspaceHealthAssessments').then(m =>
          compatWrapper(<m.TerraformWorkspaceHealthAssessments />),
        ),
    },
  });
