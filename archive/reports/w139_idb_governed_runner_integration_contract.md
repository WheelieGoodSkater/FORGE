# W139 IDB Governed Runner Integration Contract

Status: idb_governed_runner_integration_contract_ready

## Decision

PASS_CONTRACT_READY__IMPLEMENT_RUNNER_ADAPTER_NEXT

## Product Authority

- Primary consultant product: Intelligent Demo Builder drawer
- Legacy DCC Suitelet UI: legacy_reference_only
- Record creation engine: governed_dcc_runner_internal_build_engine
- Normal operator path: IDB confirmed request -> governed runner adapter -> runner result JSON -> IDB import

## Contract JSON

- Confirmed IDB request schema: idb.confirmed-build-request.v1
- Runner input schema: idb.governed-runner-input.v1
- Dry-run result schema: idb.governed-runner-result.v1
- Governed runner result schema: idb.governed-runner-result.v1
- Required records: customer, demoTransaction, heroItem, matrixProofItem, componentItem

## Runner Validation Gates

- confirmed request schema is valid
- sales request complete
- demo path confirmed
- handoff exported
- operator review ready
- consultant confirmation true
- state authority and handoff parity matched
- no state mismatch
- idempotency key present
- sandbox environment confirmed before writes
- runner write flag enabled before governed sandbox write
- no drawer invocation token accepted
- unsupported record paths rejected

## Dry-Run Smoke

- Creates records: false
- Open anchors: 0
- Link pending labels: 0
- Missing URL records: 5
- Active Open links without real URLs: 0

## Governed Sandbox Result Smoke

- Creates records: true
- Runner owner: governed_dcc_runner_internal_build_engine
- Open anchors from real URL shape: 9
- Link pending labels: 0
- Active Open links without real URLs: 0

## No-Regression Boundaries

- No drawer writes: true
- No SuiteScript invocation from drawer: true
- No transaction writes from drawer: true
- Consultant confirmation required: true
- State authority and handoff parity preserved: true
- No-submit rollback preserved: true
- Internal runner ownership preserved: true
- No active Open links without real URLs: true

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual NetSuite testing required after governed write: Yes.
- Broader visual NetSuite testing required: No.

Reason: W139 is a contract and harness layer. Targeted visual NetSuite testing becomes required only after the governed runner adapter executes sandbox writes and returns actual record URLs.

## Best Next Codex Prompt

Move through W140: Runner Code Path Inventory And Adapter Extraction. Treat IDB as the primary consultant-facing product and the old DCC Suitelet UI as legacy. Inventory the governed DCC runner/internal build logic that currently creates or resolves Customer, demo transaction, hero item, matrix/proof item, and component item records. Extract the reusable runner adapter boundary that can consume the W139 confirmed IDB build request JSON and produce the W139 governed runner result JSON. Do not wire drawer writes, do not invoke SuiteScript from the drawer, and do not create transactions from the drawer. Preserve consultant confirmation, state authority and handoff parity, no-submit rollback, internal runner ownership, and no active Open links without real URLs. Output code-path inventory, adapter design, implementation steps, regression harness updates, W140 report, visual testing decision, and best next Codex prompt.
