---
"@globallogicuki/backstage-plugin-unleash": patch
"@globallogicuki/backstage-plugin-unleash-backend": patch
"@globallogicuki/backstage-plugin-unleash-common": patch
---

Fixed npm install failure caused by `workspace:^` protocol in published packages. Replaced workspace protocol references with explicit version numbers to ensure packages can be installed from npm registry.
