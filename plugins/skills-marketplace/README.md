# Skill Marketplace

A Backstage plugin that surfaces shared **Claude Code skills** — read from a
[Claude Code marketplace](https://docs.anthropic.com/en/docs/claude-code) repo
on GitHub, GitLab, or Bitbucket — as a browsable, searchable marketplace
inside Backstage.

## What it does

- Reads the `.claude-plugin/marketplace.json` manifest from the marketplace
  repo and renders each skill as a card (name, description, category,
  keywords).
- Full-text search plus one-click category filtering.
- Click a card to open a side drawer with the skill's rendered `SKILL.md`
  documentation and copy-able install commands for Claude Code:

  ```
  /plugin marketplace add git@<host>:<owner>/<repo>.git
  /plugin install <skill-name>@<marketplace-name>
  ```

The repo is read server-side by the companion backend plugin
(`@globallogicuki/backstage-plugin-skills-marketplace-backend`) through
Backstage's `UrlReader` and your existing `integrations` configuration — so
private repos and self-hosted providers work with no extra plumbing, and
responses are cached to protect API rate limits. The frontend uses the host
app's theme throughout — standard Material UI cards, chips and drawer — so it
looks native in any Backstage instance.

## Installation

Add the frontend plugin to `packages/app` and the backend plugin to
`packages/backend`:

```sh
yarn --cwd packages/app add @globallogicuki/backstage-plugin-skills-marketplace
yarn --cwd packages/backend add @globallogicuki/backstage-plugin-skills-marketplace-backend
```

Register the backend in `packages/backend/src/index.ts`:

```ts
backend.add(
  import('@globallogicuki/backstage-plugin-skills-marketplace-backend'),
);
```

### New frontend system

Register the plugin in `packages/app/src/App.tsx`:

```tsx
import skillsMarketplacePlugin from '@globallogicuki/backstage-plugin-skills-marketplace/alpha';

export default createApp({
  features: [
    // ...other features
    skillsMarketplacePlugin,
  ],
});
```

The plugin registers a page at `/skills` with a sidebar nav item.

### Classic frontend system

Register the API factory and page route in `packages/app`:

```tsx
import {
  SkillsMarketplacePage,
  SkillsMarketplaceClient,
  skillsMarketplaceApiRef,
} from '@globallogicuki/backstage-plugin-skills-marketplace';

// in packages/app/src/apis.ts
createApiFactory({
  api: skillsMarketplaceApiRef,
  deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
  factory: ({ discoveryApi, fetchApi }) =>
    new SkillsMarketplaceClient({ discoveryApi, fetchApi }),
});

// inside <FlatRoutes>
<Route path="/skills" element={<SkillsMarketplacePage />} />;
```

And add a sidebar entry in `packages/app/src/components/Root/Root.tsx`:

```tsx
<SidebarItem icon={StorefrontIcon} to="skills" text="Skills" />
```

## Configuration

Point the plugin at your marketplace repo in `app-config.yaml` — this is
required, there are no built-in defaults. Use the web URL of the repo tree at
the branch to read (the URL you see in the browser when viewing the repo at a
branch):

```yaml
skillsMarketplace:
  url: https://github.com/my-org/skills-marketplace/tree/main
  installUrlFormat: https # optional: ssh (default) | https
```

Equivalent `url` forms for the other providers:

```
https://gitlab.com/my-group/skills-marketplace/-/tree/main
https://bitbucket.org/my-workspace/skills-marketplace/src/main
```

`installUrlFormat` controls the git URL shown in the
`/plugin marketplace add` install command: `ssh` (the default,
`git@host:owner/repo.git`) or `https` (`https://host/owner/repo.git`).
Without configuration the page shows an error explaining what to set.

### Private repos and self-hosted providers

The backend reads the repo with Backstage's `UrlReader`, which resolves hosts
and credentials from your standard
[`integrations`](https://backstage.io/docs/integrations/) configuration — the
same one the catalog uses. A public repo needs nothing. For a private repo,
add (or reuse) the credentials for its host:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
  gitlab:
    - host: gitlab.com
      token: ${GITLAB_TOKEN}
  bitbucketCloud:
    - username: ${BITBUCKET_USERNAME}
      appPassword: ${BITBUCKET_APP_PASSWORD}
```

Self-hosted GitHub Enterprise, GitLab, and Bitbucket Server instances work the
same way — declare the host under `integrations` and use its web URL in
`skillsMarketplace.url`.
