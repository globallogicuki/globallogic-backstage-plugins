---
'@globallogicuki/backstage-plugin-tech-insights-overview': minor
---

Colour the catalog-wide overview on a sliding scale rather than pass/fail:

- **Check and category tiles** now fill their meter to the pass rate and hue it on a continuous red-to-green ramp, replacing the previous three-step neutral/warning/critical buckets that put anything from 25% to 100% failing into the same red. A standard almost everyone meets no longer looks like one nobody meets. The meter fill also switches from the failing share to the passing share, so bar length and hue tell the same story.
- **Category cells in the scorecard matrix** take the same ramp, graded by how many of that category's checks the component passes. Previously one missing check out of six and six out of six were both a flat red dot. Cells covering a single check stay flat pass/fail, since there is nothing between passed and failed to grade.
- Matrix cells now name their count — "Docs: failed (5 of 6 checks passed)" — in the tooltip and accessible name, so the gradient is never colour alone.

`FailingEntity` gains `categoryTallies`, the per-category passed/total counts behind a cell's colour. `FailuresTable` gains an optional `cellRatio` prop; without it, cells keep the flat colouring. `checkSeverity` and the `Severity` type are replaced by `meterColor`.
