# @globallogicuki/backstage-plugin-skills-marketplace

## 0.1.0

### Minor Changes

- fdda5b9: Initial release of the Skills Marketplace plugin: a browsable, searchable page of shared Claude Code skills read from a Claude Code marketplace repo, with per-skill SKILL.md documentation and copy-able install commands. The backend reads the repo through Backstage's UrlReader and the standard `integrations` config, so GitHub, GitLab, and Bitbucket (cloud and self-hosted) work, including private repos. The frontend is styled entirely with the host app's default theme.
