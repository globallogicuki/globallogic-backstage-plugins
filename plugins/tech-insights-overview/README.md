# Tech Insights Overview

A catalog-wide overview for
[Tech Insights](https://github.com/backstage/community-plugins/tree/main/workspaces/tech-insights):
one page that aggregates check results across every component in the catalog.

- A summary band: how many components pass everything, and how many have no
  results yet.
- One tile per check, worst first, doubling as the page's primary filter.
- A worst-first table of components with failures, filterable by name, owner,
  and check.
- Failing-by-owner bars — the accountability axis the per-check view lacks.

Checks are discovered dynamically from the bulk check response, so the page
works against whatever checks your tech-insights backend has configured — no
check IDs are hardcoded and the plugin itself needs no configuration. Styling
comes entirely from the host app's theme.

## Prerequisites

A working Tech Insights setup:

- `@backstage-community/plugin-tech-insights-backend` (plus a fact checker,
  e.g. `-backend-module-jsonfc`) with fact retrievers and checks configured
  under `techInsights` in `app-config.yaml`.
- The `techInsightsApiRef` registered in the frontend — including
  `@backstage-community/plugin-tech-insights` in the app provides it.

## Installation

```sh
yarn --cwd packages/app add @globallogicuki/backstage-plugin-tech-insights-overview
```

### New frontend system

```tsx
// packages/app/src/App.tsx
import techInsightsPlugin from '@backstage-community/plugin-tech-insights/alpha';
import techInsightsOverviewPlugin from '@globallogicuki/backstage-plugin-tech-insights-overview/alpha';

export default createApp({
  features: [techInsightsOverviewPlugin, techInsightsPlugin],
});
```

This registers an `/tech-insights-overview` page with a sidebar nav item.

### Classic frontend system

```tsx
import { TechInsightsOverviewPage } from '@globallogicuki/backstage-plugin-tech-insights-overview';

// inside <FlatRoutes>
<Route path="/tech-insights-overview" element={<TechInsightsOverviewPage />} />;

// packages/app/src/components/Root/Root.tsx
<SidebarItem
  icon={EqualizerIcon}
  to="tech-insights-overview"
  text="Tech Insights Overview"
/>;
```

## How it scores

- **Components only** — logical groupings like Systems have no source
  location, image, or docs of their own to satisfy a check, and scoring them
  double-counts the components they contain.
- A component's denominator is the checks that returned a result for it, so
  denominators legitimately differ across the catalog.
- Components with **no results yet** are reported separately, never counted
  as passing.
- Owners are keyed by canonical ref (`group:default/platform`), so a group
  and a user sharing a display name are never merged.
