---
'@globallogicuki/backstage-plugin-skills-marketplace': minor
'@globallogicuki/backstage-plugin-skills-marketplace-backend': minor
---

Configure marketplaces as a list only.

**Breaking (config):** the top-level `skillsMarketplace.url` and
`skillsMarketplace.installUrlFormat` are gone. Every marketplace is now an entry
in `skillsMarketplace.marketplaces` — one entry or many — and carries its own
optional `installUrlFormat` (still `ssh` by default):

```yaml
skillsMarketplace:
  marketplaces:
    - url: https://github.com/my-org/skills-marketplace/tree/main
      installUrlFormat: https
    - url: https://gitlab.com/my-group/team-skills/-/tree/main
      installUrlFormat: ssh
```

Starting up with the old top-level keys reports an error pointing at the list,
rather than the generic "not configured" message. No API or UI behaviour
changes.
