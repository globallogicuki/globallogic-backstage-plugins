---
'@globallogicuki/backstage-plugin-skills-marketplace-backend': patch
'@globallogicuki/backstage-plugin-skills-marketplace': patch
---

Security fix: the `skill-doc` endpoint's source validation now rejects embedded `..` path segments, which previously allowed reading files outside the configured marketplace tree (including other repositories reachable by the integration credentials). Also: a marketplace manifest that is not valid JSON now returns 502 instead of 500.
