# Skill Marketplace Backend

Backend for the
[Skill Marketplace](https://github.com/globallogicuki/globallogic-backstage-plugins/tree/main/plugins/skills-marketplace)
plugin. Reads the marketplace repo via Backstage's `UrlReader` and the standard
[`integrations`](https://backstage.io/docs/integrations/) config — GitHub,
GitLab, and Bitbucket, public or private, cloud or self-hosted. Responses are
cached for five minutes.

## Endpoints

- `GET /api/skills-marketplace/marketplace` — the marketplace manifest plus
  the derived git install URL.
- `GET /api/skills-marketplace/skill-doc?source=./skills/foo` — the raw
  `SKILL.md` for one skill (404 when the skill has none).

## Installation

```sh
yarn --cwd packages/backend add @globallogicuki/backstage-plugin-skills-marketplace-backend
```

```ts
// packages/backend/src/index.ts
backend.add(
  import('@globallogicuki/backstage-plugin-skills-marketplace-backend'),
);
```

## Configuration

```yaml
skillsMarketplace:
  url: https://github.com/my-org/skills-marketplace/tree/main
  installUrlFormat: https # optional: ssh (default) | https
```

See the frontend plugin's README for the full reference, including private
repos.
