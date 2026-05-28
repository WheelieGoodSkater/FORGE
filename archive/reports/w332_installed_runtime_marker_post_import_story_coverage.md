# W332: Installed Drawer Runtime Marker And Post-Import Story Coverage

## Northline Evidence Review

Uploaded trace reviewed:

- `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780001809153.json`

The Northline smoke confirmed the connection path is still healthy:

- Runner task was captured.
- Current result was imported.
- Returned records reached `records_imported`.
- W151/W214/W245 accepted the completed result.
- Customer, Sales Order, Product SKU, Availability/Replenishment Flow, and Supporting SKU returned with numeric ids and supported Open links.

## Finding

The installed UI did not show the W331 polish:

- The post-import proof CTA still showed `Confirm lane before opening proof records`.
- Run/navigation still showed internal legacy labels in at least one live mode:
  - `Hero item`
  - `Matrix item / proof item`
  - `Component item 1`

Local hook replay against the same Northline trace renders the corrected W331 behavior, so the root-cause decision is:

- `likely_stale_install_or_cache_plus_uncovered_runtime_marker`

W332 adds an explicit installed drawer runtime marker and expands rendered-story coverage so the next smoke can prove which drawer is installed.

## Coverage Added

- Trace tab displays `W332 post-import story polish active`.
- Exported trace includes `installedDrawerRuntimeMarkerW332`.
- Test hooks expose `installedDrawerRuntimeMarkerW332`.
- Post-import weak-evidence story remains confirmation-first for lane/ROI claims, but no longer blocks opening valid imported records.
- Run/navigation surfaces prefer consultant-facing labels:
  - Product SKU
  - Availability/Replenishment Flow
  - Supporting SKU
- Electrical distribution story remains specific to contractor counter, branch availability, branch transfer/replenishment, supplier portal checks, callbacks, urgent alternates, and margin-safe substitutes.

## Guardrails

- W144 submit/refresh/import unchanged.
- W151/W214/W245 validation unchanged.
- Open links still require valid imported records.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
- No `src/contracts/lanePacks.js` mutation.

## Next Step

Upload the W332 drawer package, open the Trace tab first, and confirm the visible marker before running another live smoke.
