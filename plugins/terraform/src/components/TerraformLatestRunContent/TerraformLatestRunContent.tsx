import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { Run } from '../../hooks/types';
import { formatTimeToWords } from '../../utils';


interface TerraformLatestRunCardProps {
  run: Run;
  workspace: string;
}


export const TerraformLatestRunContent = ({ run, workspace }: TerraformLatestRunCardProps) => {

  return (
    <InfoCard title={`Latest run for ${workspace}`}>
      <div>
        <div><p>User: {run.confirmedBy?.name ?? 'Unknown'}</p></div>
        <div><p>Message: {run.message}</p></div>
        <div><p>Created: {formatTimeToWords(run.createdAt, { strict: true })}</p></div>
        <div><p>Status: {run.status}</p></div>
      </div>
    </InfoCard>
  );

};

