import { useEffect } from 'react';
import useAssessmentResults from '../../hooks/useAssessmentResults';
import { InfoCard, ResponseErrorPanel } from '@backstage/core-components';
import { CircularProgress, Grid, IconButton } from '@material-ui/core';
import TerraformWorkspaceHealthCard from '../TerraformWorkspaceHealth/TerraformWorkspaceHealth';
import RefreshIcon from '@material-ui/icons/Refresh';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getAnnotations } from '../../utils';

export interface TerraformWorkspaceHealthAssessmentsProps {
  title?: string;
  showDrift?: boolean;
  showValidationChecks?: boolean;
}

export const TerraformWorkspaceHealthAssessments = ({
  title = 'Workspace Health',
  showDrift = true,
  showValidationChecks = true,
}: TerraformWorkspaceHealthAssessmentsProps) => {
  const { entity } = useEntity();

  const { organization, workspaces } = getAnnotations(entity);

  const { data, error, isLoading, refetch } = useAssessmentResults(
    organization!,
    workspaces!,
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <Grid container spacing={0} direction="column">
        <InfoCard title={title}>
          <Grid item>
            <CircularProgress
              aria-label="Getting health assessments"
              aria-busy
            />
          </Grid>
        </InfoCard>
      </Grid>
    );
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Grid container spacing={0} direction="column">
      <InfoCard title={title}>
        <Grid
          container
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Grid>
            <IconButton onClick={refetch} aria-label="Refresh">
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>

        <Grid
          container
          spacing={6}
          style={{ padding: '1rem', minWidth: '70vw' }}
        >
          {data.map(assessmentResult => (
            <Grid item key={assessmentResult.id} xs={12} sm={6} md={4} lg={4}>
              <TerraformWorkspaceHealthCard
                data={assessmentResult}
                showDrift={showDrift}
                showValidationChecks={showValidationChecks}
              />
            </Grid>
          ))}
        </Grid>
      </InfoCard>
    </Grid>
  );
};

export default TerraformWorkspaceHealthAssessments;
