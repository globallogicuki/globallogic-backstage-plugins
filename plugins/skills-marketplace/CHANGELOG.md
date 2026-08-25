# @globallogicuki/backstage-plugin-skills-marketplace

## 0.1.1

### Patch Changes

- ed3d071: Security fix: the `skill-doc` endpoint's source validation now rejects embedded `..` path segments, which previously allowed reading files outside the configured marketplace tree (including other repositories reachable by the integration credentials). Also: a marketplace manifest that is not valid JSON now returns 502 instead of 500.

## 0.1.0

### Minor Changes

- fdda5b9: Initial release of the Skills Marketplace plugin: a browsable, searchable page of shared Claude Code skills read from a Claude Code marketplace repo, with per-skill SKILL.md documentation and copy-able install commands. The backend reads the repo through Backstage's UrlReader and the standard `integrations` config, so GitHub, GitLab, and Bitbucket (cloud and self-hosted) work, including private repos. The frontend is styled entirely with the host app's default theme.
