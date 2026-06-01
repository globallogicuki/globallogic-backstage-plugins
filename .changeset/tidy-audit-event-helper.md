---
'@globallogicuki/backstage-plugin-unleash-backend': patch
---

Refactor audit logging to use a shared `createAuditEvent` helper, removing duplicated credential resolution and event creation across the flag-toggle, variant-update, and strategy-update routes. No behavioural change.
