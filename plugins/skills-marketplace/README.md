# Skill Marketplace

Browse and install shared **Claude Code skills** from a
[Claude Code marketplace](https://docs.anthropic.com/en/docs/claude-code) repo
(a repo containing `.claude-plugin/marketplace.json`) inside Backstage.

- Skill cards with name, description, category, and keywords; full-text search
  plus category and marketplace filtering.
- One marketplace repo, or several — skills from every configured repo are
  listed together and filterable by the marketplace they came from.
- A detail drawer with the skill's rendered docs — its `SKILL.md`, or its
  `README.md` where it has no `SKILL.md` — and copy-able Claude Code install
  commands.
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

Required — there are no defaults. Each entry's `url` is the web URL of a repo
tree at the branch to read; `installUrlFormat` is optional and defaults to
`ssh`:

```yaml
skillsMarketplace:
  marketplaces:
    - url: https://github.com/my-org/skills-marketplace/tree/main
      installUrlFormat: https
    - url: https://gitlab.com/my-group/team-skills/-/tree/main
      installUrlFormat: ssh
    - url: https://bitbucket.org/my-workspace/platform-skills/src/main
```

One entry or many — hosts can be mixed freely. `installUrlFormat` sets the git
URL shown in that repo's `/plugin marketplace add` command:
`git@host:owner/repo.git` (ssh) or `https://host/owner/repo.git`.

With more than one marketplace configured, every skill is shown with the repo it
came from and a **Marketplace** filter appears; the repo name is searchable too.
Each skill's install commands use its own repo's git URL and marketplace name,
so installing from a mixed listing always points at the right place.

Repo names must be unique across the list — two repos with the same name (in
different orgs, say) cannot be told apart in the UI, and the plugin reports a
config error rather than guessing. If one marketplace fails to load, the page
still lists the others and warns about the one it skipped.

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
