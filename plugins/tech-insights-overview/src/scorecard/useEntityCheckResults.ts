import { useMemo } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  techInsightsApiRef,
  type TechInsightsApi,
} from '@backstage-community/plugin-tech-insights-react';
import type {
  CheckLink,
  CheckResponse,
  CheckResult,
} from '@backstage-community/plugin-tech-insights-common';
import { getCompoundEntityRef, type Entity } from '@backstage/catalog-model';
import {
  compareCategoriesFailingFirst,
  hasCategories,
  readCheckCategory,
} from '../categories';

/** Client-side check predicate, applied after the backend has run the checks. */
export type CheckFilter = (check: CheckResponse) => boolean;

/** One category's checks and its single verdict. */
export type CategoryGroup = {
  name: string;
  /** Every check in this category, in the order the backend returned them. */
  results: CheckResult[];
  failed: CheckResult[];
  passed: CheckResult[];
  /**
   * All-or-nothing: a category passes only when every check in it passes.
   *
   * A category that is "80% passing" is a category nobody acts on — the point of
   * grouping checks under a heading is to be able to say whether that standard
   * is met. The `failed`/`results` counts carry the nuance for anyone who wants
   * it.
   */
  passing: boolean;
};

export type GroupedResults = {
  /** Every result that survived the filter, in the order the backend returned them. */
  results: CheckResult[];
  failed: CheckResult[];
  passed: CheckResult[];
  /** One entry per category, failing first. */
  categories: CategoryGroup[];
  /**
   * Whether any check declared a category. False means the views fall back to a
   * flat failing/passing split rather than wrapping everything in one
   * meaningless heading.
   */
  categorised: boolean;
};

/**
 * Split one entity's results into failing and passing, and into categories.
 *
 * Order within each group is the backend's — check configuration order is
 * deliberate, so it is kept rather than re-sorted by name.
 *
 * Pure and exported so it can be tested without an ApiProvider.
 */
export const groupCheckResults = (
  results: CheckResult[],
  isFailed: (result: CheckResult) => boolean,
  filter?: CheckFilter,
): GroupedResults => {
  const kept = filter ? results.filter(r => filter(r.check)) : results;
  const failed: CheckResult[] = [];
  const passed: CheckResult[] = [];
  // Insertion-ordered, so categories appear in the order their first check did.
  const byCategory = new Map<string, CategoryGroup>();

  for (const result of kept) {
    const isResultFailed = isFailed(result);
    (isResultFailed ? failed : passed).push(result);

    const name = readCheckCategory(result.check);
    const group =
      byCategory.get(name) ??
      ({
        name,
        results: [],
        failed: [],
        passed: [],
        passing: true,
      } satisfies CategoryGroup);
    group.results.push(result);
    (isResultFailed ? group.failed : group.passed).push(result);
    if (isResultFailed) group.passing = false;
    byCategory.set(name, group);
  }

  return {
    results: kept,
    failed,
    passed,
    categories: [...byCategory.values()].sort(compareCategoriesFailingFirst),
    categorised: hasCategories(byCategory.keys()),
  };
};

/**
 * Links a user can follow to act on a result: the check's own static links plus
 * whatever the host's TechInsightsClient derives for this entity. Older API
 * implementations (and thin test doubles) predate `getLinksForEntity`, so its
 * absence falls back to the static links rather than throwing.
 */
export const linksFor = (
  api: TechInsightsApi,
  result: CheckResult,
  entity: Entity,
): CheckLink[] => {
  const links =
    typeof api.getLinksForEntity === 'function'
      ? api.getLinksForEntity(result, entity, { includeStaticLinks: true })
      : result.check.links ?? [];
  const seen = new Set<string>();
  return links.filter(link => {
    if (seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
};

/**
 * The current entity's check results, grouped. Must be rendered inside an
 * `EntityProvider` (any entity page card or tab is).
 *
 * `checkIds` is passed to the backend so only those checks run; `filter` is
 * applied afterwards for anything the id list cannot express.
 */
export const useEntityCheckResults = ({
  checkIds,
  filter,
}: {
  checkIds?: string[];
  filter?: CheckFilter;
} = {}) => {
  const api = useApi(techInsightsApiRef);
  const { entity } = useEntity();
  const { kind, namespace, name } = getCompoundEntityRef(entity);
  // A fresh array literal on every render must not re-run the checks.
  const checkIdsKey = checkIds?.join(' ');

  const state = useAsync(
    () => api.runChecks({ kind, namespace, name }, checkIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, kind, namespace, name, checkIdsKey],
  );

  const grouped = useMemo<GroupedResults | undefined>(() => {
    if (!state.value) return undefined;
    return groupCheckResults(
      state.value,
      result => api.isCheckResultFailed(result),
      filter,
    );
  }, [state.value, api, filter]);

  return { ...state, grouped, entity, api };
};
