---
'@globallogicuki/backstage-plugin-skills-marketplace': minor
'@globallogicuki/backstage-plugin-skills-marketplace-backend': minor
---

Support pulling skills from multiple marketplace repos.

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
