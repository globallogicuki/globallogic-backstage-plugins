---
'@globallogicuki/backstage-plugin-terraform': patch
---

Hide the Workspace Health card when no health assessments are available. The card no longer renders a loading shell that disappears; it only appears once assessment results are found, and stays populated with an inline spinner while refreshing.
