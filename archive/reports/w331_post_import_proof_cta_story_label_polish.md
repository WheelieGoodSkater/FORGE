# W331: Post-Import Proof CTA And Story Label Polish

## Summary

W331 protects the W321 live writeback baseline and W330 Crescent evidence while polishing the consultant-facing post-import proof surface.

After valid returned records are imported, the Review/Run proof CTA should no longer ask the consultant to confirm the lane before opening proof records. It now guides the consultant to use imported NetSuite records with supported Open links, while keeping lane confidence and ROI claims confirmation-first.

## Story and Label Polish

- Post-import proof CTA: use imported records as the proof path after valid import.
- Weak-evidence honesty: keep lane and ROI claims confirmation-first.
- Run/navigation labels: prefer consultant-facing labels from W322:
  - Product SKU
  - Availability/Replenishment Flow
  - Supporting SKU
- Legacy internal labels remain available for raw compatibility but should not appear in normal consultant Run/navigation output:
  - Hero item
  - Matrix item / proof item
  - Component item 1
- Electrical distribution language now leans into:
  - contractor counter
  - branch availability
  - branch transfer and replenishment
  - supplier portal checks
  - callbacks
  - urgent alternates
  - margin-safe substitutes

## Protected Boundaries

- W144 submit/refresh/import unchanged.
- W151/W214/W245 validation unchanged.
- Finish build/import authority unchanged.
- Open links remain supported only after valid import.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
- No `src/contracts/lanePacks.js` mutation.

## Next Block

W332 should run a fresh live smoke after this polish, using a new electrical distribution sales-call scenario to verify the post-import CTA, Run labels, and story language in the installed drawer.
