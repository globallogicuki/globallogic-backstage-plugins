# Skill Marketplace Backend

Backend for the
[Skill Marketplace](https://github.com/globallogicuki/globallogic-backstage-plugins/tree/main/plugins/skills-marketplace)
plugin. Reads the marketplace repo via Backstage's `UrlReader` and the standard
[`integrations`](https://backstage.io/docs/integrations/) config — GitHub,
GitLab, and Bitbucket, public or private, cloud or self-hosted. Responses are
cached for five minutes.

## Endpoints

- `GET /api/skills-marketplace/marketplace` — every configured marketplace as
  `{ marketplaces: [{ repo, url, installUrl, marketplace }], errors: [] }`.
  Marketplaces that fail to load are reported in `errors` so the rest still
  render; the request only fails when none could be read.
- `GET /api/skills-marketplace/skill-doc?source=./skills/foo&repo=my-repo` —
  the raw docs for one skill: its `SKILL.md`, falling back to its `README.md`
  (404 when it has neither). `repo` names the marketplace to read from and
  defaults to the first configured one.

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
  # optional: pull skills in from more repos as well
  marketplaces:
    - url: https://gitlab.com/my-group/team-skills/-/tree/main
      installUrlFormat: ssh # optional per-entry override
```

Repo names must be unique across `url` and `marketplaces` — the repo name
identifies a marketplace in the API and in the UI filter.

See the frontend plugin's README for the full reference, including private
repos.
