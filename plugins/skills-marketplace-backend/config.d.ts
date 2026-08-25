export interface Config {
  /**
   * Configuration for the Skills Marketplace plugin. Required for the plugin
   * to load skills — there are no built-in defaults. Set `url`, or
   * `marketplaces`, or both.
   */
  skillsMarketplace?: {
    /**
     * Web URL of the marketplace repo tree at the branch to read — the URL
     * you see in the browser when viewing the repo at a branch, e.g.
     * `https://github.com/my-org/skills-marketplace/tree/main`,
     * `https://gitlab.com/my-group/skills-marketplace/-/tree/main`, or
     * `https://bitbucket.org/my-workspace/skills-marketplace/src/main`.
     * Private repos are read with the credentials configured under
     * `integrations.*`.
     */
    url?: string;
    /**
     * URL format for the `/plugin marketplace add` install command shown to
     * users: `ssh` (`git@host:owner/repo.git`, the default) or `https`
     * (`https://host/owner/repo.git`). Applies to `url` and to any
     * `marketplaces` entry that does not set its own.
     */
    installUrlFormat?: 'ssh' | 'https';
    /**
     * Additional marketplace repos to load skills from. Skills from every
     * marketplace are shown together, filterable by repo name. Repo names
     * must be unique across `url` and this list.
     */
    marketplaces?: Array<{
      /** Web URL of the repo tree at the branch to read, as for `url`. */
      url: string;
      /** Overrides the top-level `installUrlFormat` for this repo. */
      installUrlFormat?: 'ssh' | 'https';
    }>;
  };
}
