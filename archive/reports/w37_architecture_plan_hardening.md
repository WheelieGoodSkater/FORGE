# W37 Architecture Plan Hardening

Decision: PLAN HARDENED / MAIN CREATE STILL DISABLED

## Blunt Analysis

The drawer has enough consultant UX to continue. More polish is useful, but the critical risk is no longer "can the consultant understand the flow?" The critical risk is "can the team trust the write path after the drawer recommends a lane and packet?"

The website intelligence problem is now correctly framed. We should not hardcode every website. A local browser script cannot infer every opaque brand from URL alone. The durable approach is:

1. known official domain,
2. website/domain/category tokens,
3. optional pasted website evidence,
4. future N/LLM advisory website summary,
5. notes for story/value/run only,
6. industry fallback only when evidence is weak.

The write path should stay narrow. Customer + Proof Item is enough to prove the whole system: packet review, SuiteScript write, idempotency, result IDs/URLs, import back to drawer, rollback evidence, and consultant confidence. Transaction context is not next until those parent records are stable.

## Current Strengths

- Website resolver is consolidated through `governedWebsiteResolver`.
- Website harness now validates executable outcomes instead of static presence.
- `websiteEvidence` gives unknown websites a real path without brittle domain exceptions.
- Review, ROI / Competitive, Run, and Trace are organized enough for controlled pilot use.
- SuiteScript write architecture has a separate W24 pilot file, runtime gates, type-to-confirm, Customer-first sequence, and Proof Item parent dependency.

## Current Weaknesses

- No live sandbox write evidence has been imported into the drawer yet.
- Transaction context remains design-only and must stay blocked.
- Website evidence UX could become noise if it is always visible for high-confidence sites.
- N/LLM advisory is architected but not yet a clean import/review workflow.
- The plan carried stale older "immediate next" language; this is now corrected around W38.

## Hardened Next Path

1. W38: prove sandbox Customer + Proof Item result evidence and import it.
2. W39: package the repeatable Food/Beverage pilot runbook.
3. W40: design transaction context only from parent-result evidence.
4. W41: make website evidence progressive and low-noise.
5. W42: define N/LLM website advisory import contract.
6. W43: run five-consultant scenario QA.
7. W44: decide whether write scope stays Food/Beverage-only or expands to one second lane.
8. W45: package Release Candidate V3.
9. W46: five-consultant go/no-go.

## No Regression

- Main drawer remains create-disabled.
- Main Suitelet remains create-disabled.
- W24 pilot branch remains sandbox-only.
- No Sales Order / transaction context write until Customer and Proof Item IDs/URLs are stable.
- N/LLM remains advisory-only.
- Website evidence owns lane/package/product identity.
- Conversation notes drive pain, ROI, competitive, objections, exceptions, and run coaching.

## Updated Immediate Prompt

W38: Pilot Result Evidence Review. Use the W24 sandbox branch result path, import Customer + Proof Item IDs/URLs into the drawer, verify blocked transaction context, and produce evidence that a consultant can understand.
