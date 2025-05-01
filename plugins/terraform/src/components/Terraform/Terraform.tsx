import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import {
  isTerraformAvailable,
  TERRAFORM_WORKSPACE_ANNOTATION,
  TERRAFORM_WORKSPACE_ORGANIZATION,
} from '../../annotations';
import { getAnnotations } from '../../utils';
import { TerraformRuns } from '../TerraformRuns';
import { Grid } from '@material-ui/core';
import { TerraformWorkspaceHealthAssessments } from '../TerraformWorkspaceHealthAssessments';

interface Props {
  isCard?: boolean;
}

export const Terraform = ({ isCard = false }: Props) => {
  const { entity } = useEntity();
  const { organization, workspaces } = getAnnotations(entity);

  if (isTerraformAvailable(entity)) {
    return (
      <div>
        <Grid container direction="column">
          <Grid item>
            <TerraformRuns
              organization={organization!}
              workspaceNames={workspaces!}
              hideDescription={isCard}
            />
          </Grid>
          <Grid item>
            <TerraformWorkspaceHealthAssessments showValidationChecks={false} />
          </Grid>
        </Grid>
      </div>
    );
  }

  return (
    <MissingAnnotationEmptyState
      annotation={[
        TERRAFORM_WORKSPACE_ANNOTATION,
        TERRAFORM_WORKSPACE_ORGANIZATION,
      ]}
    />
  );
};
