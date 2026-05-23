# W97 Run Selector Chip Interaction

## Decision

COMPLETE / RUN SELECTOR CHIPS READY / NO WRITE AUTHORITY.

## What Changed

- Moved `Open`, `Prove`, `Handle objection`, and `Close value` to the top of the Run tab as selector chips.
- Kept the selected chip wired to the existing `selectedActionId` state so the live Say / Show / Close script changes immediately.
- Added `aria-pressed` state to the selector chips for accessibility.
- Removed the duplicate live-control button grid from the default audit body and replaced it with selected action detail.
- Added `runSelectorInteraction` to trace export so the selected live script mode is captured with the packet evidence.

## Consultant Result

Run now behaves like a live demo controller. The consultant can switch between opening the story, proving the path, handling an objection, and closing value without scrolling down into audit detail.

## Validator Gates

- Selector chips render above the live script.
- All four actions are present as chips.
- Selected chip state is visible and exported.
- Changing the selected chip updates the live script title and Say / Show / Close content through existing state.
- `story_action_selected` trace event remains intact.
- `runSelectorInteraction` is included in trace export.
- No IDB writes.
- No SuiteScript invocation from IDB.
- No transaction writes.
- Notes remain story-only.
- Consultant confirmation remains required.
- DCC owns object generation.
- W92 state authority remains unchanged.

## Next Prompt

Move through W98: Intake-To-Review Compression. After prospect, website, notes, and SC request context are entered, collapse Guided Intake into a concise request summary plus the single confirmation/review action. Preserve W92 state authority, W96 compressed value guidance, W97 Run selector chips, DCC handoff boundaries, no IDB writes, no SuiteScript invocation, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output compressed intake-to-review UI, trace coverage, validator gates, W98 report, and best next Codex prompt.
