# @globallogicuki/backstage-plugin-tech-insights-overview

## 0.3.0

### Minor Changes

- 09bab43: Colour the catalog-wide overview on a sliding scale rather than pass/fail:

  - **Check and category tiles** now fill their meter to the pass rate and hue it on a continuous red-to-green ramp, replacing the previous three-step neutral/warning/critical buckets that put anything from 25% to 100% failing into the same red. A standard almost everyone meets no longer looks like one nobody meets. The meter fill also switches from the failing share to the passing share, so bar length and hue tell the same story.
  - **Category cells in the scorecard matrix** take the same ramp, graded by how many of that category's checks the component passes. Previously one missing check out of six and six out of six were both a flat red dot. Cells covering a single check stay flat pass/fail, since there is nothing between passed and failed to grade.
  - Matrix cells now name their count — "Docs: failed (5 of 6 checks passed)" — in the tooltip and accessible name, so the gradient is never colour alone.

  `FailingEntity` gains `categoryTallies`, the per-category passed/total counts behind a cell's colour. `FailuresTable` gains an optional `cellRatio` prop; without it, cells keep the flat colouring. `checkSeverity` and the `Severity` type are replaced by `meterColor`.

## 0.2.0

### Minor Changes

- 599ef8c: Add per-entity scorecard views alongside the catalog-wide overview, and group checks into categories:

  - `EntityScorecardSummaryCard` — an overview card with the entity's score, a segmented meter (one segment per check, failures first) and one verdict per category, with a footer link to the full tab.
  - `EntityScorecardContent` — an entity page tab listing every check with its description, grouped under its category and led by that category's verdict, failures first, each with links to act on it.
  - **Categories** come from `metadata.category` on each check in the tech-insights backend config, so nothing is configured or hardcoded in this plugin. A category is a single all-or-nothing verdict: it passes only when every check in it passes. Checks with no category fall into an `Uncategorised` bucket, and when nothing is categorised every view falls back to its previous flat failing/passing layout.
  - The catalog-wide page becomes a drill-down: one tile row showing categories, which you click through to that category's checks with a breadcrumb back. The failures table becomes a scorecard matrix — one column per standard, one red/green mark per cell — so a row stays one line whether a component fails two checks or twenty, instead of listing every failing check as a chip. Columns follow the drill level, and the component column stays pinned when a wide matrix scrolls. The failing-by-owner bars and the per-row failing count have been removed.

  Both entity views are registered for the new frontend system as `entity-card:tech-insights-overview/scorecard` and `entity-content:tech-insights-overview/scorecard` (components only by default; `title`, `description` and `checkIds` are configurable), and exported for the classic frontend. `useEntityCheckResults`, `groupCheckResults`, `linksFor`, `readCheckCategory`, `hasCategories` and `UNCATEGORISED` are exported for hosts building their own views.

## 0.1.1

### Patch Changes

- ed3d071: Internal cleanup: deduplicated the owner ranking comparator and removed an unused devDependency.

## 0.1.0

### Minor Changes

- 6f91bb0: Initial release of the Tech Insights Overview plugin: a catalog-wide dashboard that aggregates check results across every component in the catalog — a summary band, per-check tiles that double as filters, a worst-first failures table, and failing-by-owner bars. Works against any tech-insights backend with configured checks; discovers checks dynamically and needs no configuration of its own.
