# Skill Marketplace Backend

Backend for the
[Skill Marketplace](https://github.com/globallogicuki/globallogic-backstage-plugins/tree/main/plugins/skills-marketplace)
frontend plugin. It reads a Claude Code marketplace repo (a repo containing
`.claude-plugin/marketplace.json`) through Backstage's `UrlReader` and the
standard [`integrations`](https://backstage.io/docs/integrations/)
configuration, so GitHub, GitLab, and Bitbucket — cloud or self-hosted,
public or private — all work with no plugin-specific credentials. Responses
are cached for five minutes to protect API rate limits.

## Endpoints

- `GET /api/skills-marketplace/marketplace` — the parsed marketplace manifest
  plus the repo's derived SSH clone URL.
- `GET /api/skills-marketplace/skill-doc?source=./skills/foo` — the raw
  `SKILL.md` for one skill (404 when the skill does not provide one).

## Installation

```sh
yarn --cwd packages/backend add @globallogicuki/backstage-plugin-skills-marketplace-backend
```

Register it in `packages/backend/src/index.ts`:

```ts
backend.add(
  import('@globallogicuki/backstage-plugin-skills-marketplace-backend'),
);
```

## Configuration

```yaml
skillsMarketplace:
  url: https://github.com/my-org/skills-marketplace/tree/main
```

See the frontend plugin's README for the full configuration reference,
including private repos and self-hosted providers.
