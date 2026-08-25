# @globallogicuki/backstage-plugin-skills-marketplace-backend

## 0.2.0

### Minor Changes

- f68a376: Support pulling skills from multiple marketplace repos.

  `skillsMarketplace` now accepts an optional `marketplaces` list alongside (or
  instead of) the single `url`; each entry takes a repo tree `url` and may
  override `installUrlFormat`. Skills from every configured repo are listed
  together, tagged with their source repo, and filterable by repo name — the repo
  name is searchable too. Each skill's install commands use its own repo's git URL
  and marketplace name. A marketplace that fails to load no longer breaks the
  page: the others still render and the failure is reported as a warning.

  Repo names must be unique across all configured marketplaces.

  Skill docs now fall back to `README.md` when a plugin has no `SKILL.md`, so
  plugins documented with only a README render docs in the detail drawer instead
  of an empty state.

  **Breaking (API):** `GET /marketplace` now returns
  `{ marketplaces: [{ repo, url, installUrl, marketplace }], errors }` instead of
  `{ marketplace, installUrl }`, and `GET /skill-doc` accepts an optional `repo`
  query parameter. The frontend and backend plugins must be upgraded together.

## 0.1.1

### Patch Changes

- ed3d071: Security fix: the `skill-doc` endpoint's source validation now rejects embedded `..` path segments, which previously allowed reading files outside the configured marketplace tree (including other repositories reachable by the integration credentials). Also: a marketplace manifest that is not valid JSON now returns 502 instead of 500.

## 0.1.0

### Minor Changes

- fdda5b9: Initial release of the Skills Marketplace plugin: a browsable, searchable page of shared Claude Code skills read from a Claude Code marketplace repo, with per-skill SKILL.md documentation and copy-able install commands. The backend reads the repo through Backstage's UrlReader and the standard `integrations` config, so GitHub, GitLab, and Bitbucket (cloud and self-hosted) work, including private repos. The frontend is styled entirely with the host app's default theme.
