import React, { useEffect } from 'react';
import useAssessmentResults from '../../hooks/useAssessmentResults';
import { ResponseErrorPanel } from '@backstage/core-components';
import {
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import TerraformWorkspaceHealthCard from '../TerraformWorkspaceHealth/TerraformWorkspaceHealth';
import RefreshIcon from '@material-ui/icons/Refresh';

export interface TerraformWorkspaceHealthAssessmentsProps {
  organization: string;
  workspaceNames: string[];
}

export const TerraformWorkspaceHealthAssessments = ({
  organization,
  workspaceNames,
}: TerraformWorkspaceHealthAssessmentsProps) => {
  const { data, error, isLoading, refetch } = useAssessmentResults(
    organization,
    workspaceNames,
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <Grid container>
        <Grid item>
          <CircularProgress aria-label="Getting health assessments" aria-busy />
        </Grid>
      </Grid>
    );
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      style={{ border: '1px solid #ccc', padding: '30px', borderRadius: '8px' }}
    >
      <Grid
        container
        direction="row"
        spacing={0}
        justifyContent="space-between"
        alignItems="center"
        style={{ marginBottom: '30px' }}
      >
        <Grid item>
          <Typography variant="h5">Workspace Health</Typography>
        </Grid>
        <Grid>
          <IconButton onClick={refetch} aria-label="Refresh">
            <RefreshIcon />
          </IconButton>
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        {data.map(assessmentResult => (
          <Grid item key={assessmentResult.id} xs={12} sm={6} md={4} lg={4}>
            <TerraformWorkspaceHealthCard data={assessmentResult} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default TerraformWorkspaceHealthAssessments;
