---
"@globallogicuki/backstage-plugin-unleash-common": patch
---

Fixed ESM/CJS module resolution issue causing "does not provide an export named" errors on Node.js 22. Added proper conditional exports to package.json to ensure CJS consumers receive the `.cjs.js` build and ESM consumers receive the `.esm.js` build.
