# Tech Insights Overview

Three views over
[Tech Insights](https://github.com/backstage/community-plugins/tree/main/workspaces/tech-insights)
check results, sharing one visual language: failures first, and never colour on
its own — every verdict is spelled out in words beside its mark.

| View                     | Where                     | What it shows                                                                                         |
| ------------------------ | ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Catalog-wide overview    | `/tech-insights-overview` | How many components pass everything, a tile row you drill through, and a scorecard matrix of failures |
| Entity scorecard summary | Entity overview card      | The score, a segmented meter, and one verdict per category                                            |
| Entity scorecard         | Entity `/scorecard` tab   | Every check with its description, grouped under its category                                          |

Checks and categories are discovered from the check responses, so the views work
against whatever your backend has configured — no check IDs or category names are
hardcoded and the plugin needs no configuration of its own. Styling comes
entirely from the host app's theme.

Compared with the card upstream ships, these order failures first rather than
listing checks in config order, pair every mark with a `PASSED`/`FAILED` word so
the status survives greyscale and forced-colours mode, and add the catalog-wide
view that a per-entity card cannot give you.

## Categories

Add `metadata.category` to a check in your **backend** config to group it:

```yaml
techInsights:
  factChecker:
    checks:
      hasImageScan:
        type: json-rules-engine
        name: Has image scan
        description: The image has been scanned
        metadata:
          category: Security
        factIds: [harborFactRetriever]
        rule: ...
```

The category lives with the check definition because the backend already owns
what a check is; `metadata` is passed through onto every check result, so all
three views read the same value and cannot disagree. Use `metadata`, not
`successMetadata` / `failureMetadata` — the backend merges those over `metadata`
per outcome, so a category declared there would change with the result.

Checks are read at backend startup, so **restart the backend** after editing
them; a browser refresh is not enough.

**A category is a single all-or-nothing verdict** — it passes only when every
check in it passes. "80% met" is not something anyone acts on; the `N of M` count
beside each verdict carries the nuance.

On the catalog-wide page a category is the top level of a drill-down: you land on
the category tiles, and picking one replaces the tile row with that category's
checks (breadcrumb back), narrows the matrix columns to those checks, and scopes
the rows to components failing it. Since a category is one verdict per component,
a category tile counts **components**, not checks.

Checks with no category fall into an `Uncategorised` bucket that behaves like any
other category, so a check you forgot to label stays visible. If _nothing_
declares a category, every view falls back to a flat failing/passing layout.

## Why the table is a matrix

Standards are named once in the column header, and each cell is one mark: red
failed, green passed, a dash for no result yet. Listing a component's failing
checks as chips in its row does not survive a real catalog — twenty failing
checks is twenty chips in one cell and nothing you can compare down a column. It
is also why the columns follow the drill level rather than being every check:
categories, and the checks inside one, are both small bounded sets. The component
column stays pinned when a wide matrix scrolls sideways.

## Prerequisites

- `@backstage-community/plugin-tech-insights-backend` plus a fact checker (e.g.
  `-backend-module-jsonfc`), with retrievers and checks configured under
  `techInsights`.
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

That registers three extensions — `page:tech-insights-overview/page` (the page
and a sidebar item), `entity-card:tech-insights-overview/scorecard` (the summary
card) and `entity-content:tech-insights-overview/scorecard` (the `Scorecard` tab
at `/scorecard`). Both entity extensions show on components by default.

Upstream registers its own card and tab, so switch those off or you get two
scorecards side by side:

```yaml
# app-config.yaml
app:
  extensions:
    - entity-card:tech-insights/scorecards: false
    - entity-content:tech-insights/scorecards-content: false

    # Optional — title, description, checkIds and filter are all configurable:
    - entity-card:tech-insights-overview/scorecard:
        config:
          title: Catalog hygiene
          checkIds: [hasOwner, hasDescription]
          filter:
            kind: component
            spec.type: service
```

The card's footer links to `/scorecard`; if you change the tab's `path`, the link
does not follow.

### Classic frontend system

```tsx
import {
  TechInsightsOverviewPage,
  EntityScorecardSummaryCard,
  EntityScorecardContent,
} from '@globallogicuki/backstage-plugin-tech-insights-overview';

// inside <FlatRoutes>
<Route path="/tech-insights-overview" element={<TechInsightsOverviewPage />} />;

// entity overview grid
<Grid item md={6}>
  <EntityScorecardSummaryCard contentPath="/scorecard" />
</Grid>;

// and as a tab
<EntityLayout.Route path="/scorecard" title="Scorecard">
  <EntityScorecardContent description="Applies to services we build." />
</EntityLayout.Route>;
```

Both take `checkIds` (run only these) and `filter` (a `(check) => boolean`
applied afterwards). `contentPath` on the card is the tab's path, or omit it for
no footer link.

## Building your own view

`useEntityCheckResults({ checkIds, filter })` returns the current entity's
results grouped into `failed`, `passed` and `categories`;
`groupCheckResults` is the same grouping as a pure function. `linksFor` resolves
a result's links, and `readCheckCategory` / `hasCategories` / `UNCATEGORISED`
expose the category convention.

If you read `aggregate.categories` directly, note it is never empty once anything
is scored — with no categories anywhere it holds a single `Uncategorised` bucket.
Check the `categorised` flag first.

## How it scores

- **Components only.** Systems and other groupings have no source, image or docs
  of their own to satisfy a check, and scoring them double-counts their
  components. Override via the extensions' `filter` config.
- A component's denominator is the checks that returned a result for it, so
  denominators legitimately differ across the catalog.
- Components with **no results yet** are reported separately, never as passing.
- A category passes only when every one of its checks passes, judged once per
  component. Categories sort failing-first on an entity, worst-first across the
  catalog.
- Within a category, check order is the backend's — config order is deliberate —
  split into failing then passing.
- Owners are keyed by canonical ref (`group:default/platform`), so a group and a
  user sharing a name are never merged.
