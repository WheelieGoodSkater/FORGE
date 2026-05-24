# Consultant Acceptance Run

Generated: 2026-05-24T21:02:14.184Z

Decision: GO for real NetSuite smoke check

## Checklist

- Ready lane: Products CPG on Sales Order View recommends Sales Order View and keeps Primary proof as Sales Order View.
- Guarded lane: Food / Beverage CPG Manufacturing on an item-like page recommends Finished Good and exposes guardrails.
- Ambiguous intake: generic NetSuite page falls back to Customer Record / Sales Order View without changing lane authority.
- Setup intake: customer, website, and conversation notes save locally and export with the trace.
- Trace export includes page context, setup intake, recommendation, selected action, guardrail view, and export timestamp.
- No architecture expansion during acceptance.

## Trace Sample

- trace_samples/consultant_acceptance_trace_sample.json

## Final Install Instructions

1. Open Tampermonkey.
2. Create a new script.
3. Paste the contents of `idb-drawer.user.js`.
4. Save.
5. Open a NetSuite customer, sales order, item/inventory, manufacturing, or service page.
6. Click the `IDB` rail button and run the ready, guarded, and ambiguous checks above.

## Stop / Go

- GO when the validator passes and the three acceptance scenarios behave as described.
- STOP if a lane proof anchor changes, a new lane appears, unsupported modules become visible, or trace export fails.
