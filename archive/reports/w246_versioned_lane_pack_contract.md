# W246 Versioned Lane Pack Contract

Status: implemented and harnessed.

W246 adds the first versioned lane-pack contract for live-demo coaching. Future industry and sub-industry expansion can now be expressed as structured packs instead of scattered userscript regex, naming logic, story copy, or N/LLM memory.

## Contract

- Schema: `forge.lane-pack.v1`
- Source contract: `src/contracts/lanePacks.js`
- Drawer runtime mirror: `idb-drawer.user.js`
- Harness: `archive/tools/run_w246_versioned_lane_pack_contract_harness.js`
- Trace: `archive/trace_samples/w246_versioned_lane_pack_contract_trace.json`

## Initial Lane Packs

- Industrial Manufacturing
- Equipment Manufacturing
- Industrial Distributor
- CPG Distributor
- CPG Manufacturer
- Food/Beverage Manufacturer
- Dealer Hardgoods
- Apparel Style Matrix
- Retail Availability

## N/LLM Boundary

N/LLM remains advisory-only. It may summarize evidence, propose names, synthesize pain/value/competitive/ROI, draft so-what language, and suggest future lane-pack updates for human review.

It cannot create records, invoke SuiteScript or write transactions, silently install truth, override website evidence, override consultant toggles, hide uncertainty, invent verified website facts, or claim measured ROI without a baseline.

## Consultant Outcome

W245 normalized import results now carry W246 lane-pack resolution and advisory payloads. Live-demo coaching can use returned records and the matched lane pack to answer:

- What should I open?
- What should I prove?
- What is safe to say?
- What should I not claim?
- What is the buyer-facing so what?

## No-Regression Notes

- No drawer-created records.
- No drawer transaction writes.
- No live runner invocation.
- No W144 deployment update.
- Harnesses, reports, and traces remain under `archive/`.
- Repo front stays clean.
