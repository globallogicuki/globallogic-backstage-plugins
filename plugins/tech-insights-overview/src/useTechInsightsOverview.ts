import { useMemo } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';
import type { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import {
  getCompoundEntityRef,
  parseEntityRef,
  stringifyEntityRef,
  type Entity,
} from '@backstage/catalog-model';
import { hasCategories, readCheckCategory } from './categories';

/** A component with at least one failing check. */
export type FailingEntity = {
  ref: string;
  name: string;
  /**
   * Canonical owner ref (e.g. `group:default/platform`) — the identity everything
   * keys on. `group:default/platform` and `user:default/platform` are different
   * owners that happen to share a display name; keying by the short name merged
   * them, so a team got blamed for a person's failures.
   */
  ownerRef: string;
  /** Short display label for spec.owner — the group or user name, not the full ref. */
  owner: string;
  ownerKind: 'group' | 'user' | 'unknown';
  failing: number;
  /** Checks with results for this component, not all configured checks. */
  total: number;
  /** Every check with a result for this component, failing or not. */
  checkIds: string[];
  failedCheckIds: string[];
  failedCheckNames: string[];
  /** Categories this component fails — one failing check in a category fails it. */
  failedCategories: string[];
  /**
   * Categories with at least one result for this component.
   *
   * Kept alongside `failedCategories` so a matrix cell can tell "passed" from
   * "no result yet": a component with no facts for a category must not be shown
   * as meeting it.
   */
  scoredCategories: string[];
  /**
   * How many of each category's checks this component passes.
   *
   * `failedCategories` is the verdict; this is the margin behind it. A
   * component missing one check of six and one missing all six both "fail" the
   * category, and a matrix of identical red dots cannot tell them apart — so
   * the dot takes its colour from this instead.
   */
  categoryTallies: Record<string, { passed: number; total: number }>;
};

export type CheckSummary = {
  id: string;
  name: string;
  /** From `metadata.category`, or the uncategorised bucket. */
  category: string;
  failing: number;
  total: number;
};

export type OwnerSummary = {
  ownerRef: string;
  owner: string;
  ownerKind: 'group' | 'user' | 'unknown';
  /** Total failing checks across this owner's components. */
  failing: number;
  /** How many of their components have at least one failure. */
  components: number;
};

/**
 * How the catalog fares against one category.
 *
 * The unit is components, not checks: a category is a single verdict per
 * component (all-or-nothing, matching the entity views), so the catalog-wide
 * question is how many components meet it.
 */
export type CategorySummary = {
  name: string;
  /** Components passing every check in this category. */
  passing: number;
  /** Components failing at least one check in this category. */
  failing: number;
  /** Components with at least one result in this category. */
  scored: number;
  /** The check ids that make up this category. */
  checkIds: string[];
};

// Worst first; a name-sorted list is one nobody acts on.
export const compareOwnersWorstFirst = (a: OwnerSummary, b: OwnerSummary) =>
  b.failing - a.failing || a.owner.localeCompare(b.owner);

export type Aggregate = {
  entities: FailingEntity[];
  checks: CheckSummary[];
  owners: OwnerSummary[];
  /**
   * One entry per category, worst first.
   *
   * Never empty when anything was scored: with no `metadata.category` anywhere
   * this holds a single `Uncategorised` bucket covering every check. Check
   * `categorised` before presenting these as categories — that bucket is a
   * fallback, not a standard anyone named.
   */
  categories: CategorySummary[];
  /** Whether any check declared a category. */
  categorised: boolean;
  fullyPassing: number;
  /** Components with at least one check result. */
  scored: number;
  /** Components with no check results yet — not counted as passing or failing. */
  unscored: number;
};

/** Bulk check response shape, kept local so the hook and its tests agree. */
export type BulkCheckResponse = {
  entity: string;
  results: CheckResult[];
}[];

/** Sentinel ref for entities with no spec.owner. A real group named "unowned" would
 *  stringify to `group:default/unowned`, so this bare form cannot collide. */
const UNOWNED_REF = 'unowned';

/**
 * spec.owner reduced to an identity plus something a column can show. The kind is
 * carried through so the UI can say whether an owner is a team or a person.
 */
const readOwner = (
  entity: Entity | undefined,
): Pick<FailingEntity, 'ownerRef' | 'owner' | 'ownerKind'> => {
  const raw = entity?.spec?.owner;
  if (typeof raw !== 'string' || raw.length === 0) {
    return { ownerRef: UNOWNED_REF, owner: 'unowned', ownerKind: 'unknown' };
  }
  try {
    const compound = parseEntityRef(raw, {
      defaultKind: 'group',
      defaultNamespace: 'default',
    });
    return {
      ownerRef: stringifyEntityRef(compound),
      owner: compound.name,
      ownerKind: compound.kind.toLowerCase() === 'user' ? 'user' : 'group',
    };
  } catch {
    // An owner that is not a parseable ref is still worth showing verbatim; the raw
    // string is its own identity.
    return { ownerRef: raw, owner: raw, ownerKind: 'unknown' };
  }
};

/** Per-category tallies while one component's results are being read. */
type CategoryTally = { failed: number; total: number };

/**
 * Turn a catalog page plus a bulk check response into the overview aggregate.
 *
 * Exported separately from the hook so the aggregation can be tested without an
 * ApiProvider: everything here is pure.
 */
export const aggregateInsights = (
  items: Entity[],
  bulk: BulkCheckResponse,
  isFailed: (result: CheckResult) => boolean,
): Aggregate => {
  const byRef = new Map<string, Entity>(
    items.map(e => [stringifyEntityRef(e), e]),
  );

  const checkTotals = new Map<
    string,
    { name: string; category: string; failing: number; total: number }
  >();
  const ownerTotals = new Map<string, OwnerSummary>();
  const categoryTotals = new Map<
    string,
    Omit<CategorySummary, 'checkIds'> & { checkIds: Set<string> }
  >();
  const entities: FailingEntity[] = [];
  let fullyPassing = 0;
  let scored = 0;
  let unscored = 0;

  for (const { entity: ref, results } of bulk) {
    if (results.length === 0) {
      // No facts collected yet — not "passing", but not failing either.
      unscored += 1;
      continue;
    }
    const entity = byRef.get(ref);

    scored += 1;
    let failing = 0;
    const failedCheckIds: string[] = [];
    const failedCheckNames: string[] = [];
    // Per-component, so a category is judged once per component rather than once
    // per check — the all-or-nothing verdict the entity views show.
    const componentCategories = new Map<string, CategoryTally>();

    for (const result of results) {
      const failed = isFailed(result);
      const category = readCheckCategory(result.check);

      if (failed) {
        failing += 1;
        failedCheckIds.push(result.check.id);
        failedCheckNames.push(result.check.name);
      }

      const existing = checkTotals.get(result.check.id) ?? {
        name: result.check.name,
        category,
        failing: 0,
        total: 0,
      };
      existing.total += 1;
      if (failed) existing.failing += 1;
      checkTotals.set(result.check.id, existing);

      const tally = componentCategories.get(category) ?? {
        failed: 0,
        total: 0,
      };
      tally.total += 1;
      if (failed) tally.failed += 1;
      componentCategories.set(category, tally);

      const catalogCategory = categoryTotals.get(category) ?? {
        name: category,
        passing: 0,
        failing: 0,
        scored: 0,
        checkIds: new Set<string>(),
      };
      catalogCategory.checkIds.add(result.check.id);
      categoryTotals.set(category, catalogCategory);
    }

    const failedCategories: string[] = [];
    for (const [category, tally] of componentCategories) {
      // Present because the loop above created it for every category seen.
      const catalogCategory = categoryTotals.get(category)!;
      catalogCategory.scored += 1;
      if (tally.failed > 0) {
        catalogCategory.failing += 1;
        failedCategories.push(category);
      } else {
        catalogCategory.passing += 1;
      }
    }

    if (failing === 0) {
      fullyPassing += 1;
      continue;
    }

    const { ownerRef, owner, ownerKind } = readOwner(entity);
    entities.push({
      ref,
      name: entity?.metadata.name ?? ref,
      ownerRef,
      owner,
      ownerKind,
      failing,
      total: results.length,
      checkIds: results.map(r => r.check.id),
      failedCheckIds,
      failedCheckNames,
      failedCategories,
      scoredCategories: [...componentCategories.keys()],
      categoryTallies: Object.fromEntries(
        [...componentCategories].map(([name, t]) => [
          name,
          { passed: t.total - t.failed, total: t.total },
        ]),
      ),
    });

    const tally = ownerTotals.get(ownerRef) ?? {
      ownerRef,
      owner,
      ownerKind,
      failing: 0,
      components: 0,
    };
    tally.failing += failing;
    tally.components += 1;
    ownerTotals.set(ownerRef, tally);
  }

  return {
    // Worst first; a name-sorted list is one nobody acts on.
    entities: entities.sort(
      (a, b) => b.failing - a.failing || a.name.localeCompare(b.name),
    ),
    checks: [...checkTotals.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.failing - a.failing || a.name.localeCompare(b.name)),
    owners: [...ownerTotals.values()].sort(compareOwnersWorstFirst),
    categories: [...categoryTotals.values()]
      .map(({ checkIds, ...rest }) => ({ ...rest, checkIds: [...checkIds] }))
      .sort((a, b) => b.failing - a.failing || a.name.localeCompare(b.name)),
    categorised: hasCategories(categoryTotals.keys()),
    fullyPassing,
    scored,
    unscored,
  };
};

/**
 * Catalog-wide check results, aggregated by check, by owner, and by category.
 *
 * Components only: scoring logical groupings like Systems double-counts the
 * components they contain while having no source location, image or docs of
 * their own to satisfy a check.
 */
export const useTechInsightsOverview = () => {
  const catalogApi = useApi(catalogApiRef);
  const techInsights = useApi(techInsightsApiRef);

  const state = useAsync(async () => {
    const { items } = await catalogApi.getEntities({
      filter: [{ kind: 'component' }],
      fields: [
        'kind',
        'metadata.name',
        'metadata.namespace',
        'spec.owner',
        'spec.type',
      ],
    });
    const refs = items.map(getCompoundEntityRef);
    const bulk = refs.length ? await techInsights.runBulkChecks(refs) : [];
    return { items, bulk: bulk as BulkCheckResponse };
  }, [catalogApi, techInsights]);

  const aggregate = useMemo<Aggregate | undefined>(() => {
    if (!state.value) return undefined;
    return aggregateInsights(state.value.items, state.value.bulk, result =>
      techInsights.isCheckResultFailed(result),
    );
  }, [state.value, techInsights]);

  return { ...state, aggregate };
};
