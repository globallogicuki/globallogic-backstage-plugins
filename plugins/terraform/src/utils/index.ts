import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  parseISO,
} from 'date-fns';
import { Entity } from '@backstage/catalog-model';
import {
  TERRAFORM_WORKSPACE_ANNOTATION,
  TERRAFORM_WORKSPACE_ORGANIZATION,
} from '../annotations';

export function formatTimeToWords(
  isoTime: string,
  opts?: { strict?: boolean },
) {
  const format = opts?.strict ? formatDistanceToNowStrict : formatDistanceToNow;
  const timeStr = format(parseISO(isoTime), {
    addSuffix: true,
  });

  return timeStr;
}

export const getAnnotations = (
  entity: Entity,
): { organization?: string; workspace?: string } => {
  const organization =
    entity.metadata.annotations?.[TERRAFORM_WORKSPACE_ORGANIZATION];
  const workspace =
    entity.metadata.annotations?.[TERRAFORM_WORKSPACE_ANNOTATION];
  return { organization, workspace };
};
