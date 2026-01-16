---
"@globallogicuki/backstage-plugin-unleash": patch
---

Refactor alpha (new frontend system) implementation to align with Backstage v1.42+ patterns:
- Restructured into modular alpha/ folder
- Updated ApiBlueprint to use defineParams callback pattern
- Replaced string filters with isUnleashAvailable predicate function
- Added explicit type annotations
- Updated tests to use frontend-test-utils
