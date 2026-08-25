---
'@globallogicuki/backstage-plugin-terraform-backend': patch
'@globallogicuki/backstage-plugin-terraform': patch
'@globallogicuki/backstage-plugin-unleash-backend': patch
'@globallogicuki/backstage-plugin-unleash-common': patch
'@globallogicuki/backstage-plugin-unleash': patch
---

Upgrade to Backstage 1.54.3. Replaces the removed NavItemBlueprint with PageBlueprint title/icon params in the Unleash alpha plugin, migrates PolicyQueryUser.identity to .info in the Unleash backend permission policy, and adds 500 error responses to the Terraform backend OpenAPI spec.
