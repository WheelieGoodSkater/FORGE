# W275 Extraction Closure Runtime Inventory

## Purpose

W275 closes the W270-W274 extraction phase by mapping the extracted contracts back to the current `idb-drawer.user.js` helper areas, then choosing the first low-risk optimization slice.

This block is review-only. It does not change runtime behavior, normal consultant UI, lane resolution, connected submit/refresh/import behavior, or record creation authority.

## Extraction Closure Map

| Block | Artifact | Purpose | Runtime behavior |
| --- | --- | --- | --- |
| W270 | `archive/tools/lib/forge_harness_fixtures.js` | Shared archived harness fixture utilities for VM hook loading, Motion fixtures, response fixtures, assertions, and archive reads. | Unchanged |
| W271 | `src/contracts/adapterProfiles.js` | Adapter profile and W262 readiness contract extraction point. | Unchanged |
| W272 | `src/contracts/liveEvidencePackets.js` | Review-only live evidence, smoke evidence, screenshot reconciliation, Open-link verification, release keep, and signoff packet contract extraction point. | Unchanged |
| W273 | `src/contracts/storyCoachingSurfaces.js` | Consultant-safe W254 receipt, W255 first-glance story, W256 live script, and W257 guided sequence contract extraction point. | Unchanged |
| W274 | `src/contracts/lanePackExpansionWorkflow.js` | Lane-pack authoring, proposed-pack review, diff, admin review, receipt-driven QA, and review-only proposed-pack contract extraction point. | Unchanged |

## Runtime Helper Dependency Inventory

### Adapter Profile / Readiness

- Current anchors: `releasedAdapterProfileW263`, `adapterProfileEndpointW263`, `adapterProfilesFromConfigW263`, `selectedAdapterProfileW263`, `applySelectedAdapterProfileToConfigW263`, `adapterReadyRecordCreationUxW262`, `deployedAdapterReadinessTraceW263`
- Governing contract: `src/contracts/adapterProfiles.js`
- Protected surfaces: W262 real-build clarity, W263 deployed profile/readiness trace, W264 connected submit endpoint
- First safe opportunity: future parity adapter-profile bridge after endpoint/readiness fixtures prove equality
- Rollback boundary: restore drawer-owned W262/W263 helpers and keep the contract module as a review-only mirror

### Connected Submit / Refresh / Import

- Current anchors: `connectedBuildSubmitRefreshImportW264`, `actualAdapterResponseShapeW265`, `connectedBuildRetryPolicyW265`, `adapterReadyRecordCreationUxW262`, `canonicalImportResultNormalizationW245`
- Governing contract: protected runtime surface
- Protected surfaces: W245 canonical import, W264 submit/refresh/import, W265 retry safety, W266 controlled live evidence
- First safe opportunity: defer extraction; keep this path stable until review-only/admin packet helpers are isolated
- Rollback boundary: restore W264/W265 behavior and preserve fake-link blocking plus W151-valid import gating

### Live Evidence / Signoff Packets

- Current anchors: `liveAdapterSmokeEvidencePacketW265`, `liveRunDecisionHelperW266`, `controlledLiveBuildRunEvidencePacketW266`, `postLiveRunScreenshotEvidencePacketW267`, `openLinkVerificationCaptureW267`, `liveRunScreenshotSignoffHelperW267`, `installedDrawerLiveEvidenceIntakeTemplateW268`, `releaseKeepPacketV100W268`
- Governing contract: `src/contracts/liveEvidencePackets.js`
- Protected surfaces: W260 release packet, W261 signoff, W266 live evidence, W267 screenshot/Open-link signoff, W268 release keep packet
- First safe opportunity: selected first optimization slice
- Rollback boundary: restore review-only packet generation to drawer-local helpers without touching Build/Run or adapter submit

### Story Receipt / Script / Sequence

- Current anchors: `storyEvidenceReceiptTrailW254`, `receiptDrivenLaneExpansionQaW255`, `consultantStoryFirstGlanceW255`, `consultantLiveDemoScriptW256`, `guidedDemoStepSequenceW257`, `consultantStorySurfaceFromLanePackW247`, `renderConsultantStorySurfaceW248`
- Governing contract: `src/contracts/storyCoachingSurfaces.js`
- Protected surfaces: W254 evidence receipt, W255 first glance, W256 live script, W257 guided sequence, W258 compact story density
- First safe opportunity: defer until after review-only packets; these are visible consultant surfaces
- Rollback boundary: restore drawer-owned story helpers and rerun W254-W258 plus W273

### Lane-Pack Authoring / Diff / Review / QA

- Current anchors: `reviewProposedLanePackChangeW247`, `lanePackProposedChangeDiffW251`, `renderLanePackDiffReviewW252`, `receiptDrivenLaneExpansionQaW255`
- Governing contract: `src/contracts/lanePackExpansionWorkflow.js`
- Protected surfaces: W247 authoring, W251 diff review, W252 admin review, W255 receipt-driven QA, W274 expansion workflow
- First safe opportunity: possible second optimization slice after live evidence/signoff packet bridge
- Rollback boundary: restore drawer-owned proposal review helpers and keep source packs in `src/contracts/lanePacks.js`

### Normal Consultant UI Renderers

- Current anchors: `renderDrawer`, `renderPlanView`, `renderBuildView`, `renderReviewView`, `renderRunView`, `renderConsultantStorySurfaceW248`, `renderCreateReadinessCard`
- Governing contract: protected runtime surface
- Protected surfaces: V1.0.0 header, Build records path, Review/Run story surface, fake Open-link blocking
- First safe opportunity: not first; visible UI needs dedicated visual parity
- Rollback boundary: restore exact renderer copy/layout and rerun W248/W258/W262 plus targeted visual smoke

### Admin / Debug-Only Renderers

- Current anchors: `renderLanePackDiffReviewW252`, `deployedAdapterReadinessTraceW263`, trace export helpers, admin/debug legacy intake fields
- Governing contracts: `src/contracts/lanePackExpansionWorkflow.js` and `src/contracts/liveEvidencePackets.js`
- Protected surfaces: admin-only proposal review, readiness trace/export, review-only evidence packets
- First safe opportunity: good early cleanup candidate after live evidence/signoff packet wrapper
- Rollback boundary: restore admin renderer helpers and prove normal consultant UI remains hidden from diagnostics

## Selected First Optimization Slice

Selected slice: `review_only_live_evidence_signoff_bridge`

Why this first:

- It is review-only/admin-only.
- It has a focused governing contract in `src/contracts/liveEvidencePackets.js`.
- It does not alter normal consultant UI.
- It does not sit directly on the record creation submit path.

Future scope:

- Add parity bridge helpers.
- Route review-only packet shape checks through W272 contract helpers where straightforward.
- Keep connected submit/refresh/import unchanged.
- Keep normal consultant UI unchanged.

Required parity harnesses:

- W260
- W261
- W266
- W267
- W268
- W272
- W275

Rollback boundary:

If any review-only packet field changes unexpectedly, restore drawer-local W265-W268 helpers and leave `src/contracts/liveEvidencePackets.js` as a mirror.

## Optimization Readiness Packet

Future runtime extraction is accepted only when:

- W244-W275 harnesses pass.
- `npm run check` passes.
- `npm run validate` passes.
- Normal consultant UI is unchanged.
- Connected build flow is unchanged.
- Lane resolution is unchanged.
- No drawer-created records are introduced.
- No drawer transaction writes are introduced.
- Weak/conflicting evidence remains confirmation-first.

## Guardrails

- Runtime behavior unchanged.
- Normal consultant UI unchanged.
- Connected build flow unchanged.
- Lane resolution unchanged.
- Record creation authority unchanged.
- No drawer-created records.
- No drawer transaction writes.
- Weak/conflicting evidence remains confirmation-first.

## Visual Testing Decision

Broad visual regression is not required for W275 because this block adds archived review/planning artifacts and a harness only. No visible UI or runtime behavior changes are introduced.
