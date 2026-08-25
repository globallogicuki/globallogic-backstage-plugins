# Skill Marketplace

Browse and install shared **Claude Code skills** from a
[Claude Code marketplace](https://docs.anthropic.com/en/docs/claude-code) repo
(a repo containing `.claude-plugin/marketplace.json`) inside Backstage.

- Skill cards with name, description, category, and keywords; full-text search
  and category filtering.
- A detail drawer with the skill's rendered `SKILL.md` and copy-able Claude
  Code install commands.
- The repo is read server-side by
  `@globallogicuki/backstage-plugin-skills-marketplace-backend` via Backstage's
  `UrlReader`, so GitHub, GitLab, and Bitbucket all work — public or private,
  cloud or self-hosted.
- Uses the host app's default theme throughout.

## Installation

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

```tsx
// packages/app/src/App.tsx
import skillsMarketplacePlugin from '@globallogicuki/backstage-plugin-skills-marketplace/alpha';

export default createApp({
  features: [skillsMarketplacePlugin],
});
```

This registers a `/skills` page with a sidebar nav item.

### Classic frontend system

```tsx
import {
  SkillsMarketplacePage,
  SkillsMarketplaceClient,
  skillsMarketplaceApiRef,
} from '@globallogicuki/backstage-plugin-skills-marketplace';

// packages/app/src/apis.ts
createApiFactory({
  api: skillsMarketplaceApiRef,
  deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
  factory: ({ discoveryApi, fetchApi }) =>
    new SkillsMarketplaceClient({ discoveryApi, fetchApi }),
});

// inside <FlatRoutes>
<Route path="/skills" element={<SkillsMarketplacePage />} />;

// packages/app/src/components/Root/Root.tsx
<SidebarItem icon={StorefrontIcon} to="skills" text="Skills" />;
```

## Configuration

Required — there are no defaults. `url` is the web URL of the repo tree at the
branch to read:

```yaml
skillsMarketplace:
  url: https://github.com/my-org/skills-marketplace/tree/main
  installUrlFormat: https # optional: ssh (default) | https
```

Other providers:

```
https://gitlab.com/my-group/skills-marketplace/-/tree/main
https://bitbucket.org/my-workspace/skills-marketplace/src/main
```

`installUrlFormat` sets the git URL shown in the `/plugin marketplace add`
command: `git@host:owner/repo.git` (ssh) or `https://host/owner/repo.git`.

### Private repos

Add credentials for the repo's host under
[`integrations`](https://backstage.io/docs/integrations/) — the same config
the catalog uses. Public repos need nothing.

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
  gitlab:
    - host: gitlab.com
      token: ${GITLAB_TOKEN}
  bitbucketCloud:
    - username: ${BITBUCKET_USERNAME} # Atlassian account email
      appPassword: ${BITBUCKET_API_TOKEN} # scoped API token with repository read
```

Self-hosted instances work the same way: declare the host under `integrations`
and use its web URL in `skillsMarketplace.url`.
