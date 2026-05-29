# W346: Consultant Post-Import UX Cleanup

## Baseline

W346 uses the locked W345 Parkway W344 smoke evidence as the baseline:

`archive/trace_samples/w345_parkway_w344_successful_live_smoke_evidence_trace.json`

## Decision

Proceed to broader smoke testing after one deploy/sync verification.

The W345 evidence proved the governed runner/import path. W346 only changes consultant-facing copy, visible installed-version labeling, and post-import confidence wording. It does not change runner creation, adapter invocation, completed-result validation, or Open-link authority.

## Changes

- Drawer userscript version moved to `1.0.4`.
- Header now shows `Drawer 1.0.4 / W346` instead of the legacy product contract `V1.0.0`.
- Trace export now includes `installedDrawerDisplayVersionW346`.
- Plan post-import state now separates:
  - build/import confidence: `verified`
  - website evidence confidence: unchanged, still visible as website evidence
- Plan post-import next action now points to imported proof records instead of looking like the build is still uncertain.
- Consultant-facing story, ROI, and Run copy now strips internal note labels such as `Business Pain / Request Notes`, `Requested Proof`, `Decision Criteria`, `Timeline / Urgency`, `Competitor / Current Tools`, `COV / Call Notes`, and `Optional Website / Category Evidence`.

## No-Regression Boundaries

- W151 completed-result import guard preserved.
- W214 semantic operating-mode guard preserved.
- W245 display-ready Open-link authority preserved.
- W341 prospect-specific proof naming preserved.
- W342 runner naming verification marker preserved.
- W344 supporting SKU role/name fix preserved.
- W345 live smoke evidence preserved.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
- No runner creation behavior change.
- No adapter behavior change.
- N/LLM remains advisory only.

## Recommendation

After pushing and deploying the W346 drawer copy, run a quick Parkway visual confirmation to verify:

- header shows `Drawer 1.0.4 / W346`
- Plan shows build/import verified
- website evidence uncertainty remains visible but does not look like build failure
- Build, ROI, and Run no longer show internal note-section labels

Then proceed to W348 broader smoke matrix.

## Next Block

Move through W347: Deployment sync guard. Add a lightweight operator checklist and hash-verify command that confirms GitHub/Tampermonkey/SuiteCloud/File Cabinet copies match before any new smoke. Preserve all W151/W214/W245/W341/W342/W344/W345/W346 boundaries and do not change runner or adapter behavior unless a hash or smoke gate fails.
