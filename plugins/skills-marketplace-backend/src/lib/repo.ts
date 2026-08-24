import { ScmIntegrations } from '@backstage/integration';

/**
 * Resolve a path within the marketplace repo against the configured tree URL,
 * in a provider-aware way (via the same resolution the catalog uses for
 * relative locations).
 */
export function resolveFileUrl(
  integrations: ScmIntegrations,
  treeUrl: string,
  path: string,
): string {
  const base = treeUrl.endsWith('/') ? treeUrl : `${treeUrl}/`;
  const clean = path.replace(/^\.?\//, '');
  return integrations.resolveUrl({ url: clean, base });
}

// Branch markers in repo web URLs: GitLab's /-/tree|blob/, and the plain
// /tree|blob|src/ used by GitHub and Bitbucket Cloud.
const BRANCH_MARKER = /\/(?:-\/)?(?:tree|blob|src)\/.*$/;

/** URL format for the marketplace install command. */
export type InstallUrlFormat = 'ssh' | 'https';

/**
 * Derive the git URL for the install command from the configured tree URL,
 * e.g. `https://github.com/my-org/repo/tree/main` →
 * `git@github.com:my-org/repo.git` (ssh) or
 * `https://github.com/my-org/repo.git` (https).
 */
export function deriveInstallUrl(
  treeUrl: string,
  format: InstallUrlFormat = 'ssh',
): string {
  const { host, pathname } = new URL(treeUrl);
  const repoPath = pathname
    .replace(BRANCH_MARKER, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.git$/, '');
  if (!repoPath || !repoPath.includes('/')) {
    throw new Error(
      `Cannot derive a repo path from skillsMarketplace.url '${treeUrl}'`,
    );
  }
  return format === 'https'
    ? `https://${host}/${repoPath}.git`
    : `git@${host}:${repoPath}.git`;
}
