import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { TerraformRuns } from '../TerraformRuns/TerraformRuns';
import TerraformWorkspaceHealthAssessments from '../TerraformWorkspaceHealthAssessments/TerraformWorkspaceHealthAssessments';

export interface TerraformContentProps {
  organization: string;
  workspaceNames: string[];
  hideDescription?: boolean;
  showWorkspaceHealth?: boolean;
}

export const TerraformContent = ({
  organization,
  workspaceNames,
  hideDescription = false,
  showWorkspaceHealth = true,
}: TerraformContentProps) => {
  if (hideDescription) {
    return (
      <Grid container spacing={2} direction="column">
        <Grid item>
          <TerraformRuns
            organization={organization!}
            workspaceNames={workspaceNames!}
            hideDescription={hideDescription!}
          />
        </Grid>
        {showWorkspaceHealth && (
          <Grid item>
            <TerraformWorkspaceHealthAssessments
              organization={organization!}
              workspaceNames={workspaceNames!}
            />
          </Grid>
        )}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <Grid
          container
          direction="row"
          spacing={0}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h5">Terraform</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <TerraformRuns
          organization={organization!}
          workspaceNames={workspaceNames!}
          hideDescription={hideDescription!}
        />
      </Grid>
      {showWorkspaceHealth && (
        <Grid item>
          <TerraformWorkspaceHealthAssessments
            organization={organization!}
            workspaceNames={workspaceNames!}
          />
        </Grid>
      )}
    </Grid>
  );
};
