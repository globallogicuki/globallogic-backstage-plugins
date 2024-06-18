import React, { useEffect } from 'react';
import { CircularProgress, Grid } from '@material-ui/core';
import { ResponseErrorPanel } from '@backstage/core-components';
import { TerraformLatestRunContent } from '../TerraformLatestRunContent';
import { useRuns } from '../../hooks';
import { Run } from '../../hooks/types';
import {
  isTerraformAvailable,
  TERRAFORM_WORKSPACE_ANNOTATION,
  TERRAFORM_WORKSPACE_ORGANIZATION,
} from '../../annotations';
import { MissingAnnotationEmptyState, useEntity } from '@backstage/plugin-catalog-react';


export const TerraformLatestRun = () => {

  const { entity } = useEntity();

  const { annotations } = entity.metadata;
  const organization = annotations?.[TERRAFORM_WORKSPACE_ORGANIZATION] ?? 'undefined';
  const workspaceName = annotations?.[TERRAFORM_WORKSPACE_ANNOTATION] ?? 'undefined';

  const { data, isLoading, error, refetch } = useRuns(organization, workspaceName);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (!isTerraformAvailable(entity)) {
    return (
      <MissingAnnotationEmptyState
        annotation={[TERRAFORM_WORKSPACE_ANNOTATION]}
      />
    );
  }



  if (error) {
    return <ResponseErrorPanel error={error} />;
  }


  if (isLoading) {
    return (
      <div>
        <CircularProgress aria-describedby='Getting latest run' aria-busy={true} />
      </div>
    )
  }

  const latestRun: Run | undefined = data ? data[0] : undefined

  if (!latestRun) {
    return (
      <>
        {`No runs for ${workspaceName}`}
      </>
    );
  };


  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <TerraformLatestRunContent run={latestRun} workspace={workspaceName} />
      </Grid>
    </Grid>
  )

};
