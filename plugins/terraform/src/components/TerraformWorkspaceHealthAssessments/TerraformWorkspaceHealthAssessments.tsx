import { useEffect } from 'react';
import useAssessmentResults from '../../hooks/useAssessmentResults';
import { InfoCard, ResponseErrorPanel } from '@backstage/core-components';
import { CircularProgress, Grid, IconButton } from '@material-ui/core';
import TerraformWorkspaceHealthCard from '../TerraformWorkspaceHealth/TerraformWorkspaceHealth';
import RefreshIcon from '@material-ui/icons/Refresh';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getAnnotations } from '../../utils';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

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

  const config = useApi(configApiRef);

  const baseUrl = config.getOptionalString('integrations.terraform.baseUrl');

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <InfoCard title={title}>
        <CircularProgress aria-label="Getting health assessments" aria-busy />
      </InfoCard>
    );
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <InfoCard
      title={title}
      action={
        <IconButton onClick={refetch} aria-label="Refresh">
          <RefreshIcon />
        </IconButton>
      }
    >
      <Grid container>
        {data.map(assessmentResult => (
          <Grid item key={assessmentResult.id} xs={12} sm={6} md={4} lg={4}>
            <TerraformWorkspaceHealthCard
              data={assessmentResult}
              showDrift={showDrift}
              showValidationChecks={showValidationChecks}
              terraformBaseUrl={baseUrl!}
              organizationName={organization!}
            />
          </Grid>
        ))}
      </Grid>
    </InfoCard>
  );
};

export default TerraformWorkspaceHealthAssessments;
