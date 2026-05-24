# W33: Plan Flow, Website Confidence, And Review Navigation Corrective

Decision: COMPLETE / CREATE STILL DISABLED

## What Was Fixed

- Plan now puts the Live Question before Guided Intake so the consultant sees the next action first.
- Unknown local website signals now require review instead of committing a lane from notes alone.
- YETI now has website-first Dealer Hardgoods / Product SKU routing with outdoor drinkware and cooler naming.
- `buildAcceptedPacketContext` no longer references an undefined `packet`, which was the likely reason Run IDB could fail before Review.
- Plan button traces now use lightweight summaries instead of full setup and dry-run packets.

## UX Findings

- The Plan screen should remain action-first: live question, then intake, then compact Story Bar.
- Known websites can still auto-recommend when local website evidence is strong.
- Unknown websites should either wait for N/LLM website review or make the consultant choose a lane manually.

## Future Plan Updates

- W34: pilot result import and transaction context readiness after real Customer and Proof Item sandbox results exist.
- W35: interaction performance pass if button lag persists after lighter tracing.
- W36: website intelligence expansion so unknown sites can be classified by governed N/LLM review rather than local fallback.

## No Regression

- Main drawer remains create-disabled.
- Main Suitelet remains create-disabled.
- N/LLM remains advisory only.
- No transaction context write is enabled.
- Notes can shape story and value, but website evidence owns package identity.
