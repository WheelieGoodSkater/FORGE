# W35: Website Resolver Source Consolidation

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Make website evidence the canonical source for lane package, product seed, product family, and demand moment. Conversation notes stay powerful, but they drive pain, ROI, competitive framing, objections, and live run coaching rather than object identity.

## Roles

- Website Intelligence Architect: owns resolver consolidation.
- Context Boundary Sentinel: keeps notes out of website-owned package fields.
- N/LLM Advisory Agent: remains advisory-only for sharpening names and explaining evidence.
- Code Review Sentinel: preserves no-write and no-regression boundaries.
- Validation And Evidence Agent: extends checks so W36 can become an executable scenario harness.

## What Changed

- Introduced a normalized resolver catalog using `idb.website-resolver-entry.v1`.
- Added `governedWebsiteResolver(state)` as the single website resolver source.
- `websiteSignalProfile(state)` now exposes `resolverVersion: w35`, `resolverSource`, competing candidates, and explicit website-vs-notes ownership fields.
- `websitePackageClassifier(state)` now consumes the governed resolver output rather than independently re-matching category hints.
- `productIntelligence(state, lane)` no longer contains a duplicated website product pattern table. Website product naming flows through `websiteSignalProfile` first.
- Added YETI to `website_signal_contract.json` so documented known-domain coverage matches runtime behavior.

## No-Regression Boundaries

- No live write enablement.
- Main drawer still creates nothing.
- Main Suitelet remains create-disabled.
- No transaction-context write.
- No lane expansion, proof-anchor change, DCC toggle change, or packet-order change.
- N/LLM remains advisory-only and cannot invoke SuiteScript or approve creation.

## Findings Carried Forward

1. W36 needs true scenario execution, not just string-presence validation.
2. W37 should harden notes boundaries so the UI can say clearly: website chose the package; notes shaped the value story.
3. Broad category terms like `bag`, `bottle`, `packaging`, and `warehouse` still need conflict scoring coverage.
4. New websites with weak URL/category signals should invoke N/LLM advisory or manual review instead of committing a lane from notes.

## Immediate Next Blocks

- W36: Executable Website Scenario Harness.
- W37: Notes Boundary Hardening.
- W38: Real Pilot Result Evidence Review.

