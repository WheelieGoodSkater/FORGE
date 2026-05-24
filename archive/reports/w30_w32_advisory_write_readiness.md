# W30-W32: Advisory Naming, Sandbox Handoff, And Pilot Evidence

Decision: COMPLETE / MAIN CREATE STILL DISABLED

## W30: Advisory Naming Visibility In Review

Objective: Make N/LLM naming advisory status visible without adding scroll noise.

Completed:
- Added compact Naming Advisor visibility in Review.
- Shows source basis, confidence, advisory status, and `writeAuthority: none`.
- Keeps the detailed naming basis behind an expander.

No regression:
- Advisory remains naming-only.
- No lane, proof, DCC toggle, packet-order, or create-authority changes.

## W31: Advisory-Named Sandbox Write Handoff

Objective: Prepare the governed sandbox handoff for advisory-named Customer and Proof Item writes.

Completed:
- Added a governed pilot handoff model.
- SuiteScript review packet now carries `sandboxPilotHandoff` and `recordNamingAdvisoryRequest`.
- Handoff makes the current limitation explicit: W24 pilot scope can write only Customer and Proof Item in the approved sandbox branch, and only for the approved pilot lane.

No regression:
- Main drawer and main Suitelet stay create-disabled.
- No Sales Order write.
- No supporting proof write.
- Proof Item requires returned Customer ID and URL.

## W32: Pilot Evidence Readiness UX

Objective: Show what evidence is ready before a controlled pilot write.

Completed:
- Added pilot evidence readiness model.
- Review write confirmation now shows evidence gate count and checklist.
- Trace export includes `namingAdvisorySummary`, `governedPilotHandoff`, and `pilotEvidenceReadiness`.

No regression:
- Evidence is informational only.
- No production readiness claim without sandbox evidence.
- No hidden retry or deletion path.

## Finding To Carry Forward

W24 currently approves only Food / Beverage Customer + Proof Item writes. Other lanes can produce reviewed packets and advisory names, but they must remain review-only until separate lane write scopes are added. Transaction context should stay after W32 and only after Customer and Proof Item IDs/URLs are stable.
