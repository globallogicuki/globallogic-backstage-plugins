---
'@globallogicuki/backstage-plugin-unleash': minor
'@globallogicuki/backstage-plugin-unleash-backend': minor
'@globallogicuki/backstage-plugin-unleash-common': minor
---

Comprehensive review fixes across the Unleash plugin family.

Backend: removed leftover debug logging (warn/info breadcrumbs on every request); all errors now go through Backstage's standard error middleware as typed `@backstage/errors` (`{ error: { name, message } }` bodies with correct status codes, including upstream Unleash 404/403 on GET routes which previously surfaced as 500); credentials are resolved once per mutation; the guest permission-policy check now matches the `guest` user exactly instead of any name containing "guest"; the permission policy uses the shared permission constants via `isPermission`.

Frontend: flag-level variant weights are now rendered with per-mille scaling (a 50% variant no longer displays as "500%"); FlagDetailsModal surfaces fetch errors via `ResponseErrorPanel`; FlagToggle classifies errors structurally (status/name) instead of matching backend message strings; StrategyEditor is fully controlled and no longer rewrites variant weights on mount; new shared `useUnleashFlags` hook removes duplicated fetch logic between the card and content views.

Common: new `isEnvironmentEditable`, `DEFAULT_NUM_ENVS`, and shared mock fixtures; `TagFilter` is now an alias of `Tag`; removed the unused `UnleashProject` type.
