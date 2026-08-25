---
'@globallogicuki/backstage-plugin-terraform': minor
'@globallogicuki/backstage-plugin-terraform-backend': minor
---

Comprehensive review fixes across the Terraform plugin family.

Backend: workspace health assessments no longer silently miss workspaces in organizations with more than 20 workspaces (per-workspace lookups replace the unpaginated org listing, with failed lookups logged); an empty workspace now returns `null` for the latest run instead of an empty body, so the frontend's "no runs" state is reachable; org/workspace names are URL-encoded; `integrations.terraform.baseUrl` is now consistently the web origin (e.g. `https://tfe.enterprise.com`) with the `/api/v2` API root derived automatically and back-compat for values already ending in `/api/v2`; `config.d.ts` declares `pageSize` and marks `token` as secret; the OpenAPI spec's `confirmedBy` field matches what the API actually returns (`name`).

Frontend: the run-logs drawer refetches when a different run's logs are opened and reports HTTP errors instead of rendering error pages as log text; data hooks refetch when the entity annotations change (stale-closure fix; `isError` removed from their return shape); validation checks include errored checks in the pie chart, so errored-only workspaces no longer show "No checks found"; the runs table's user column sorts correctly; the API client encodes names, handles the `null` latest run, and reports accurate error messages; frontend types align with the corrected OpenAPI spec (nullable `message`/`confirmedBy`).
