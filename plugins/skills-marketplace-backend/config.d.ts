export interface Config {
  /**
   * Configuration for the Skills Marketplace plugin. Required for the plugin
   * to load skills — there are no built-in defaults.
   */
  skillsMarketplace?: {
    /**
     * The marketplace repos to load skills from — one entry, or several.
     * Skills from every marketplace are shown together, filterable by repo
     * name, so repo names must be unique across the list.
     */
    marketplaces: Array<{
      /**
       * Web URL of the marketplace repo tree at the branch to read — the URL
       * you see in the browser when viewing the repo at a branch, e.g.
       * `https://github.com/my-org/skills-marketplace/tree/main`,
       * `https://gitlab.com/my-group/skills-marketplace/-/tree/main`, or
       * `https://bitbucket.org/my-workspace/skills-marketplace/src/main`.
       * Private repos are read with the credentials configured under
       * `integrations.*`.
       */
      url: string;
      /**
       * URL format for this repo's `/plugin marketplace add` install command
       * shown to users: `ssh` (`git@host:owner/repo.git`, the default) or
       * `https` (`https://host/owner/repo.git`).
       */
      installUrlFormat?: 'ssh' | 'https';
    }>;
  };
}
