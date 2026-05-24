# G4 LLM Prompt Contracts

Generated: 2026-05-09

Decision: COMPLETE

## What Changed

- Added `LLM_PROMPT_CONTRACTS.md`.
- Added `data/llm_prompt_contracts.json`.
- Updated the architecture to state that IDB can preserve the previous SuiteScript direct-write creation model without an external connector.
- Updated creation contracts to include `suitescript_direct_write` as a future supported write path.
- Kept all create behavior blocked until review, supported write path readiness, explicit consultant confirmation, and traceable result capture.

## Prompt Contracts Locked

- Lane Selection Agent.
- Product Naming Agent.
- ROI And Competitive Strategy Agent.
- Live Run Coach Agent.
- Execution Plan Preview Agent.
- Creation Write Path Agent.

## No-Regression Notes

- LLM cannot authorize creation.
- LLM cannot invoke SuiteScript direct write.
- LLM cannot change lane authority or proof anchors.
- LLM cannot invent verified competitor facts.
- LLM cannot hide blockers.
- Live NetSuite writes remain disabled in the Tampermonkey drawer.
