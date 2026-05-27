# W258 Consultant Story Surface Density Pass And FORGE Assistant Header Polish

## Summary

W258 tightens the Review/Run story surface so the first glance acts as the live proof CTA, while keeping deeper coaching available in expandable sections.

W258 also polishes the FORGE assistant header into a compact SCOUT-style top bar:

- smaller FORGE logo
- muted teal/blue header bar
- version displayed beside the logo
- small warm yellow `Bug / Idea` placeholder button
- balanced close button
- compact header height so tabs and the first content card appear sooner

## Guardrails

- No drawer-created records.
- No drawer transaction writes.
- No live runner invocation.
- No W144 deployment update.
- N/LLM remains advisory-only and uncertainty-visible.
- W256 script and W257 guided sequence remain available.
- W254 receipt remains expandable and consultant-safe.
- Normal consultant UI hides raw diagnostics and admin-only proposal review.

## Validation

Expected command:

```bash
npm run harness:story-density-header-polish-w258
```

Expected result:

- W258 harness passes all archived cases.
