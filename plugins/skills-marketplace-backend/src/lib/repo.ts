import { ScmIntegrations } from '@backstage/integration';

/** Resolve a repo-relative path against the configured tree URL. */
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

/** `owner/repo` (or `group/sub-group/repo`) from a repo web URL. */
function repoPath(treeUrl: string): string {
  const path = new URL(treeUrl).pathname
    .replace(BRANCH_MARKER, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.git$/, '');
  if (!path || !path.includes('/')) {
    throw new Error(
      `Cannot derive a repo path from skillsMarketplace.url '${treeUrl}'`,
    );
  }
  return path;
}

/**
 * The repo name from a tree URL, e.g.
 * `https://github.com/my-org/skills-marketplace/tree/main` →
 * `skills-marketplace`. Used to label and filter skills by their source repo.
 */
export function deriveRepoName(treeUrl: string): string {
  const segments = repoPath(treeUrl).split('/');
  return segments[segments.length - 1];
}

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
  const { host } = new URL(treeUrl);
  const path = repoPath(treeUrl);
  return format === 'https'
    ? `https://${host}/${path}.git`
    : `git@${host}:${path}.git`;
}
