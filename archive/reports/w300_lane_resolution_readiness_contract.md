# W300 Lane Resolution Readiness Contract

Status: `contract_ready`

## Summary

W300 adds `src/contracts/laneResolutionReadiness.js` as a focused contract extraction point for lane-resolution readiness facts.

This contract is extraction-only. It is not wired into `idb-drawer.user.js` runtime.

## Contract Scope

The contract represents:

- W246 resolved lane pack and confidence.
- Website evidence bridge and matched signals.
- Consultant lane/toggle confirmation.
- `resolveLanePackFromEvidenceW246` output.
- `nllmAdvisoryPayloadForLanePackW246` limits.
- `consultantStorySurfaceFromLanePackW247` inputs.
- W250 lane-aware labels.
- Weak/conflicting evidence confirmation gate.
- Future lane-pack expansion workflow readiness.

## Statuses

- `lane_resolution_ready`
- `lane_resolution_needs_confirmation`
- `lane_resolution_blocked_missing_website_evidence`
- `lane_resolution_blocked_hidden_uncertainty`
- `lane_resolution_not_ready`

## Boundaries

The module may describe readiness from supplied facts. It cannot:

- choose a lane
- change confidence
- override website evidence
- override consultant toggles
- hide uncertainty
- render UI
- change visible copy
- mutate state
- import records
- create records
- write transactions
- create Open links
- invoke the adapter
- declare W245/W151/W214 validity

## Runtime Ownership

These remain drawer-owned:

- `resolveLanePackFromEvidenceW246`
- `websiteEvidenceBridge`
- `ensureWebsiteEvidenceRuntime`
- `nllmAdvisoryPayloadForLanePackW246`
- `consultantStorySurfaceFromLanePackW247`
- `lanePackAwareRecordLabelW250`

## Visual Testing Decision

Broad visual testing is not required because W300 is a contract-only extraction point and is not wired into runtime UI.

