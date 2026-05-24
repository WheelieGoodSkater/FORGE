# W17 Confirmation Result UX

Decision: COMPLETE / MAIN CREATE STILL DISABLED

## Objective

Make the write moment safe and understandable before actual consultant execution. W17 turns Create Readiness into a confirmation and result review surface, so a consultant can see the exact write list, the pilot gates, the type-to-confirm phrase, and the evidence expected from SuiteScript.

## What Changed

- Added `data/w17_confirmation_result_ux_contract.json`.
- Added `writeResultUxModel` to the drawer.
- Changed the Review create-readiness card into `Write confirmation and result`.
- Moved the exact write list into the visible top of the card.
- Added a pilot gate summary before technical gate details.
- Added expandable result states and recovery rules for `success`, `blocked`, `partial_failed`, and `failed`.
- Kept the action button disabled as `Create records locked`.

## Current UX State

The consultant should now see:

- exact write list first
- pilot gate summary
- confirmation phrase
- result states and recovery details behind an expander
- export packet / refresh packet actions
- disabled create button

This keeps the live demo focused on what might happen to records without implying that writes are enabled.

## No Regression

- Main package remains `CREATE_ENABLED = false`.
- Drawer still performs no automatic creation.
- Create button remains disabled unless every future pilot gate passes.
- No hidden write, no silent retry, and no silent deletion.
- N/LLM remains advisory only.
- transaction context remains gated until Customer and Proof Item result IDs and URLs exist.

## What To Test

1. Open NetSuite with the newest `idb-drawer.user.js`.
2. Use a known scenario like Gordon and Smith.
3. Click `Run IDB`.
4. Move to `Review`.
5. Confirm the first useful write section is `Execution plan preview`.
6. Confirm `Write confirmation and result` shows the exact write list without needing deep scrolling.
7. Confirm `Pilot gate summary` shows the create path is still locked.
8. Expand `Result states and recovery`.
9. Confirm `partial_failed`, no silent retry, and no silent deletion are visible.
10. Confirm the button says `Create records locked` and is disabled.
