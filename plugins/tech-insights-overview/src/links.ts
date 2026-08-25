import { parseEntityRef } from '@backstage/catalog-model';

/**
 * A failing row links to the component's catalog page — the one destination
 * every Backstage instance has. Whether an entity page mounts a tech-insights
 * tab is a host-app layout decision this plugin cannot know.
 */
export const entityHref = (ref: string) => {
  const { kind, namespace, name } = parseEntityRef(ref);
  return `/catalog/${namespace}/${kind.toLocaleLowerCase('en-US')}/${name}`;
};
