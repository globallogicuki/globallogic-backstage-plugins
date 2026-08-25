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
  failedCheckIds: string[];
  failedCheckNames: string[];
};

export type CheckSummary = {
  id: string;
  name: string;
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

export type Aggregate = {
  entities: FailingEntity[];
  checks: CheckSummary[];
  owners: OwnerSummary[];
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
    { name: string; failing: number; total: number }
  >();
  const ownerTotals = new Map<string, OwnerSummary>();
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

    for (const result of results) {
      const failed = isFailed(result);
      if (failed) {
        failing += 1;
        failedCheckIds.push(result.check.id);
        failedCheckNames.push(result.check.name);
      }
      const existing = checkTotals.get(result.check.id) ?? {
        name: result.check.name,
        failing: 0,
        total: 0,
      };
      existing.total += 1;
      if (failed) existing.failing += 1;
      checkTotals.set(result.check.id, existing);
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
      failedCheckIds,
      failedCheckNames,
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
    owners: [...ownerTotals.values()].sort(
      (a, b) => b.failing - a.failing || a.owner.localeCompare(b.owner),
    ),
    fullyPassing,
    scored,
    unscored,
  };
};

/**
 * Catalog-wide check results, aggregated by check and by owner.
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
