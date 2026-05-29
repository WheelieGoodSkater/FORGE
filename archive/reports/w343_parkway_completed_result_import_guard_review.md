# W343: Parkway Completed Result Import Guard Review

## Trace Reviewed

`/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780088384303.json`

## Decision

Build finished, but import failed.

The governed runner submitted and result capture found a completed sidecar with real NetSuite ids and URLs. The drawer correctly refused to import it because the completed-result payload lost the distribution operating mode and runner naming policy during adapter promotion.

## Evidence

- Runner task captured: yes
- Result capture status: `completed_result_capture_ready`
- Completed result present: yes
- Import accepted by W151/W214: no
- Import status: `operating_mode_record_contract_failed`
- Failure message: `Component item 1: Generic component naming is manufacturing vocabulary when Manufacturing=false.`
- W342 drawer marker visible: yes
- W341 runner naming marker returned to drawer: no

Returned records were real:

- Customer: `Parkway Contractor Supply Customer Account` / `3122`
- Sales order: `SO2699` / `83529`
- Product item: `Parkway Contractor Supply Product Availability SKU - ALDISTRI-RCQ3F2-M0T` / `4845`
- Flow item: `Branch Availability / Replenishment Flow - Parkway Contractor - ALDISTRI-RCQ3F2-M0T` / `4846`
- Support item: `Fulfillment Support SKU - Parkway Contractor Supply Component - ALDISTRI-RCQ3F2-M0T` / `4847`

## Root Cause

The adapter promotion path rebuilt the completed runner result after CSV import resolution, but did not preserve:

- `resolvedOperatingMode`
- `runnerLaneVocabularyPolicy`
- the W341 `prospectSpecificProofNamingMarker`

With `resolvedOperatingMode` empty, canonical role mapping fell back to manufacturing-shaped legacy roles:

- `finished_or_assembly_item`
- `formula_or_batch_structure`
- `component_item`

For a Manufacturing=false distribution run, W214 correctly blocked import instead of allowing misleading Open links.

## Fix Applied

The adapter now preserves sidecar mode and vocabulary policy into the promoted completed result, result-capture envelope, and top-level adapter response.

The drawer W341 marker reader now also checks completed `finalGeneratedNamesJson` locations, so the marker remains visible after adapter promotion.

## Boundaries

- W144 submit/refresh/import flow preserved
- W151/W214/W245 import guard preserved
- no drawer-created records
- no drawer transaction writes
- no fake Open links
- runner remains record creation authority

## Next Block

Move through W344: Upload W343 Adapter Preservation Fix And Rerun Parkway Smoke. Upload the updated drawer and W144 adapter, keep the runner file unchanged unless the deployed runner marker is still absent after adapter preservation, rerun the Parkway smoke, and verify the completed result imports with distribution roles and W341 marker visibility. Preserve no drawer-created records, no transaction writes, no fake Open links, and W151/W214/W245 import authority. Output fresh trace review, pass/fail import decision, marker decision, and next remediation if the runner still omits prospect-specific proof names.
