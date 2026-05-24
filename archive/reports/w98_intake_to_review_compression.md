# W98 Intake-To-Review Compression

## Decision

COMPLETE / INTAKE-TO-REVIEW COMPRESSED / NO WRITE AUTHORITY.

## What Changed

- Replaced the ready-state Guided Intake surface with a compact `Request summary` card.
- The ready summary now shows prospect, website/domain, lane, proof anchor, DCC pack, DCC scenario, objective, and SC context count.
- The ready summary exposes one primary forward action:
  - confirm lane and review when the lane is not confirmed,
  - review DCC handoff when the lane is already confirmed.
- The edit path remains available, but the full intake form is no longer the default ready-state surface.
- Added `intakeToReviewCompression` to trace export.

## Consultant Result

Once the consultant has entered the request, the Plan tab reads like a demo-prep summary instead of a setup form. The next action is clear and the DCC handoff remains the execution artifact.

## Validator Gates

- Ready-state intake renders `Request summary`.
- Guided Intake remains available only while setup is incomplete or when the consultant edits setup.
- DCC pack and scenario are visible in the summary.
- One primary confirm/review action is visible.
- `intakeToReviewCompression` is included in trace export.
- W92 state authority remains preserved.
- W96 compressed value guidance remains preserved.
- W97 Run selector chips remain preserved.
- No IDB writes.
- No SuiteScript invocation from IDB.
- No transaction writes.
- Notes remain story-only.
- Consultant confirmation remains required.
- DCC owns object generation.

## Next Prompt

Move through W99: One-Run Pilot Retest Packet After Compression. Use W96, W97, and W98 to produce the exact next hands-on user test: file to upload, realistic sales request fields, expected Plan/Review/ROI/Run/Trace first-viewport screenshots, required DCC handoff JSON, required trace JSON, operator comparison checklist, scoring rubric, and stop/go criteria. Preserve W92 state authority, DCC handoff boundaries, no IDB writes, no SuiteScript invocation, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output test packet, validator gates, W99 report, and best next Codex prompt.
