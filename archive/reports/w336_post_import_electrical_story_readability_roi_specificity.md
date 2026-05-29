# W336: Post-Import Electrical Story Readability And ROI Competitive Specificity Polish

Status: `post_import_story_readability_polish_ready`

## W335 Keystone Evidence Review

- Trace reviewed: `/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780012482222.json`
- Runtime marker verified: `W332 post-import story polish active`
- Import status: `dcc_final_names_imported`
- Adapter readiness: `records_imported`
- Open links: valid after returned records were imported
- Old lane-confirmation CTA after import: absent

## Findings

- The W335 writeback path is stable and should remain frozen.
- The post-import proof CTA was correct but too long for the drawer width.
- The CTA headline still anchored on long generated NetSuite record names.
- Run and proof surfaces needed aliases as the primary consultant-facing labels.
- The evidence receipt could show an `Industrial Manufacturing / Low` lane label for an electrical distribution run.
- ROI / Competitive still had a generic fallback path available even when the sales notes named better competitive pressure.

## W336 Polish

- Shortened the post-import CTA headline to: `Open Product SKU, then prove branch availability.`
- Shortened proof CTA columns:
  - Proof action: `Open Product SKU; prove branch availability.`
  - Safe claim: `Use imported records; confirm lane and ROI.`
  - Stop: `No ROI, write, creation, or availability claim beyond evidence.`
- Kept weak-evidence honesty visible for lane and ROI claims.
- Made normal consultant receipt and Run proof surfaces prefer aliases:
  - `Product SKU`
  - `Branch Availability / Replenishment Flow`
  - `Fulfillment Support SKU`
- Kept raw NetSuite names, ids, and URLs unchanged for import/link authority.
- Changed electrical distribution evidence receipt labeling to `Industrial Distribution & Branch Fulfillment / Low`.
- Updated ROI / Competitive so note-specific electrical pressure wins over generic fallback:
  - supplier portals
  - transfer spreadsheets
  - text threads
  - branch inventory checks
  - manual counter promise tracking

## Protected Boundaries

- W144 submit/refresh/import unchanged.
- W151/W214/W245 validation unchanged.
- Returned record import unchanged.
- Open links still appear only after valid import.
- No source lane-pack mutation.
- No runner or adapter changes.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.

## Decision

`needs_attention_addressed_ready_for_marker_verified_smoke`
