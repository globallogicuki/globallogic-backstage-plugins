import type { CheckResponse } from '@backstage-community/plugin-tech-insights-common';

/**
 * Where a check with no declared category goes.
 *
 * A real category could be named "Uncategorised" too, and that is fine: it
 * would simply merge with the implicit bucket, which is what a reader would
 * expect from the name.
 */
export const UNCATEGORISED = 'Uncategorised';

/**
 * A check's category, read from `metadata.category` in the backend's check
 * config:
 *
 * ```yaml
 * techInsights:
 *   factChecker:
 *     checks:
 *       hasImageScan:
 *         metadata:
 *           category: Security
 * ```
 *
 * The category lives with the check definition rather than in this plugin's
 * config because the backend already owns what a check *is* — a category is
 * part of that, and duplicating the mapping frontend-side is how the two drift
 * apart. `metadata` is passed through verbatim onto every check result, so both
 * the per-entity and catalog-wide views read the same value.
 *
 * Put `category` in `metadata`, not `successMetadata`/`failureMetadata`: the
 * backend merges those over `metadata` per outcome, so a category declared
 * there would change depending on whether the check passed.
 */
export const readCheckCategory = (
  check: Pick<CheckResponse, 'metadata'>,
): string => {
  const raw = check.metadata?.category;
  if (typeof raw !== 'string') return UNCATEGORISED;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : UNCATEGORISED;
};

/**
 * Whether any check declared a category — the switch between the categorised
 * views and the flat ones.
 *
 * A catalog where nothing sets `metadata.category` would otherwise get a single
 * "Uncategorised" heading wrapped around every check, which is pure noise.
 */
export const hasCategories = (categories: Iterable<string>): boolean => {
  for (const category of categories) {
    if (category !== UNCATEGORISED) return true;
  }
  return false;
};

/**
 * Category order: whatever needs attention first, then the backend's own order.
 *
 * Sorting by name would bury a failing category under passing ones that happen
 * to start with an earlier letter. Within each group the caller's insertion
 * order survives, because `Array.prototype.sort` is stable — and insertion
 * order is the order the backend returned the checks, which reflects config
 * order rather than anything this plugin invented.
 */
export const compareCategoriesFailingFirst = <T extends { passing: boolean }>(
  a: T,
  b: T,
): number => Number(a.passing) - Number(b.passing);
