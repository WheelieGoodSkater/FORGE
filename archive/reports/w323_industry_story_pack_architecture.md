# W323: Industry Story Pack Architecture

## Purpose

W321 froze the successful live writeback path. W322 proved that distribution proof records can use consultant-safe vocabulary and stronger story coaching without touching connection authority. W323 defines the reusable product layer that turns first-call notes into industry-specific story packs.

## Story Pack Shape

Each industry or sub-industry story pack should produce:

- Buyer problem summary: a short sentence that names the buyer, the operating decision, and the trust gap.
- Proof record roles: the returned records a consultant should use as proof.
- Demo path: the lane and proof path to run live.
- Proof move: the exact action to take in NetSuite.
- Objection response: how to answer the likely buyer challenge without overclaiming.
- Competitive contrast: what FORGE/NetSuite keeps together that the current process splits apart.
- ROI-safe value framing: risk-reduction framing before any measured savings claim.
- No-claim caution: terms, claims, and authority boundaries to avoid.
- Weak-evidence confirmation behavior: what to confirm before ROI, competitive, or write-prep language is used.

## Role Ownership

Connection Steward:
Protect W144 submit, refresh/poll, sidecar lookup, completed-result validation, Finish build/import, and Open-link authority.

Proof Architect:
Design the proof record roles and make sure returned records tell the right industry story.

Industry Taxonomist:
Own industry/sub-industry story-pack boundaries and expansion rules.

Story Strategist:
Translate first-call notes into talk track, proof move, objection response, and final value answer.

Vocabulary Guard:
Block wrong industry terms, mode leakage, source-pack truth claims, and unsupported ROI language.

QA Story Runner:
Score the output like a sales rep or SC: useful, believable, differentiated, and safe.

## Review-Only Fixtures

W323 adds first-call fixtures for:

- Industrial Distribution / Branch Fulfillment
- Electrical Components Distribution / Contractor Counter Sales
- Dealer / Hardgoods Distribution / Outdoor Power Equipment Dealer Network

These are review-only story expectations. They do not mutate `src/contracts/lanePacks.js`, install packs, invoke the adapter, create records, or write transactions.

## Scoring Model

Each fixture is scored on:

- Industry specificity
- Proof-record fit
- Story usefulness
- Objection readiness
- Claim safety
- Vocabulary safety
- Weak-evidence honesty

The first implementation candidate should be the highest-value pack that can improve the live story surface without risking the W321 connection baseline.

## Guardrails

- W321 baseline remains protected.
- W322 distribution proof vocabulary remains protected.
- W144 submit/refresh/import unchanged.
- W151/W214/W245 validation unchanged.
- Open links remain supported only after valid import.
- No drawer-created records.
- No drawer transaction writes.
- No fake Open links.
- No source lane-pack mutation in W323.
