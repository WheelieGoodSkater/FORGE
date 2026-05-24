# Controlled Enablement Branch Plan

Generated: 2026-05-09

## Objective

Define how the first controlled enablement branch should be created and governed before any Food / Beverage SuiteScript write pilot is attempted.

This does not enable writes. It defines the branch boundary so the main package remains safe while a future sandbox pilot branch can test one lane.

## Recommended Branch

`codex/g13-food-beverage-create-pilot`

Branch only from a green main package after:

```bash
npm run preflight
```

## Pilot Boundary

- Lane: Food / Beverage CPG Manufacturing.
- Lane id: `food_beverage`.
- Proof anchor: Finished Good.
- Write path: `suitescript_direct_write`.
- Main package: `CREATE_ENABLED = false`.
- Drawer: never writes records directly.

## Allowed Pilot Branch Changes

- Add guarded create execution behind `CREATE_ENABLED` for `food_beverage` only.
- Add one-lane Food / Beverage SuiteScript write tests.
- Add trace capture for created record IDs and URLs.
- Add partial-failure response tests.
- Add deployment notes for a controlled sandbox Suitelet.

## Forbidden Pilot Branch Changes

- Enable create in main.
- Enable create for non-Food / Beverage lanes.
- Allow drawer direct writes.
- Bypass consultant confirmation.
- Change proof anchors.
- Change DCC toggles.
- Let LLM invoke the write path.

## Branch Go Criteria

- Main preflight passes.
- Authenticated NetSuite smoke completed.
- G12 harness passes.
- Food / Beverage pilot packet reviewed.
- Rollback owner assigned.
- Trace export verified before pilot.

## Branch Exit Criteria

- Food / Beverage create tests pass in sandbox.
- Created record IDs and URLs are returned in trace.
- Partial failure stops dependent writes.
- Non-pilot lanes remain blocked.
- Manual rollback notes are complete.

## No-Regression Closure

G13 is a branch plan only. It keeps the current package create-disabled and defines the exact controlled path for a future sandbox pilot branch.
