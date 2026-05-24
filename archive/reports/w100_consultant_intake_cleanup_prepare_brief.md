# W100 Consultant Intake Cleanup And Prepare Brief

## Decision

COMPLETE / PREPARE BRIEF FLOW READY / NO WRITE AUTHORITY.

## What Changed

- Plan intake now waits for an explicit `Prepare brief` action before showing lane and DCC pack recommendations.
- The first-entry flow stays surgical: customer, website, notes, optional website evidence, and collapsed request context.
- Raw labels are translated through a consultant-facing label map, for example `cpgProductsManufacturing` becomes `CPG Products Manufacturing`.
- Save remains draft-only and does not move the consultant into Review.
- Input edits reset the prepared brief and consultant confirmation so stale packets cannot survive changed request data.

## Validator Gates

- Prepare brief button is present.
- Recommendations remain hidden until the brief is prepared.
- Consultant label map is present.
- Raw DCC keys are not used as the primary visible label.
- No IDB writes.
- No SuiteScript invocation from IDB.
- No transaction writes.

## Next Prompt

Move through W101: Source Authority Refactor. Separate identity authority from value authority: website evidence owns lane/category/naming hints, consultant notes and SC context own ROI/competitive/story guidance, and consultant confirmation owns final lane and DCC pack readiness. Fix any contradiction where handoff status is blocked while state authority says confirmed or eligible. Preserve no IDB writes, no SuiteScript invocation, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output source authority model, state consistency fixes, validator gates, W101 report, and best next Codex prompt.
