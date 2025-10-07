export {
  terraformPlugin,
  EntityTerraformContent,
  EntityTerraformCard,
  EntityTerraformLatestRunCard,
  EntityTerraformWorkspaceHealthAssessmentsCard,
} from './plugin';
export { isTerraformAvailable } from './annotations';

import terraformPluginAlpha from './alpha';
export { terraformPluginAlpha as default };
