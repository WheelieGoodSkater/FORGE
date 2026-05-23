# Sandbox Deployment Packet For Create-Disabled Suitelet

Generated: 2026-05-09

## Objective

Deploy the create-disabled SuiteScript write-path scaffold into a NetSuite sandbox for connectivity and gate smoke only. This packet does not enable live writes, automatic creation, lane expansion, proof-anchor changes, or LLM authority.

## Included Upload Artifact

- `netsuite/suitescript/idb_suitescript_write_path_suitelet.js`

The Suitelet must remain in this state before upload:

- `CREATE_ENABLED = false`
- No `record.create()` calls.
- No `.save()` calls.
- No production deployment.
- No drawer direct-write invocation.

## Sandbox Deployment Steps

1. Run `npm run preflight` from the repo root and confirm all checks pass.
2. Open NetSuite sandbox, not production.
3. Upload `netsuite/suitescript/idb_suitescript_write_path_suitelet.js` to the sandbox File Cabinet.
4. Create a SuiteScript 2.1 Script record using the uploaded file.
5. Create a restricted deployment for admin or controlled pilot roles only.
6. Confirm the deployed source still contains `CREATE_ENABLED = false`.
7. POST only reviewed smoke payloads from the local harness or a reviewed Food / Beverage packet.
8. Capture the response body and trace event for the evidence report.

## Expected Smoke Responses

### GET Or Non-POST

- Expected status: `blocked`
- Expected detail: method is not accepted.
- Expected write behavior: no record creation.

### Missing Consultant Confirmation

- Expected status: `blocked`
- Expected detail: `consultantConfirmed` is required.
- Expected write behavior: no record creation.

### Unauthorized Lane

- Expected status: `blocked`
- Expected detail: selected lane is not authorized for the pilot.
- Expected write behavior: no record creation.

### Reviewed Food / Beverage Packet

- Expected status: `validated`
- Expected create state: `createEnabled: false`
- Expected trace event: `suitescript_write_path_result`
- Expected payload: write plan is returned with reviewed records.
- Expected record IDs: none.
- Expected record URLs: none.

## Stop Conditions

Stop immediately if any of these occur:

- Any NetSuite record is created.
- `CREATE_ENABLED` is anything other than `false`.
- Production is selected instead of sandbox.
- A non-pilot lane is accepted for creation.
- Missing consultant confirmation is accepted.
- Trace event is missing from a validated response.
- A response includes record IDs or NetSuite record URLs while create is disabled.

## Rollback

1. Disable the Suitelet deployment.
2. Remove access from all pilot roles.
3. Export the failed request, response, and trace event.
4. Do not run cleanup scripts unless a record was unexpectedly created.
5. Return to the local harness and fix the create-disabled gates before another sandbox smoke.

## Evidence To Capture

- Local `npm run preflight` output.
- Deployed script internal ID and deployment ID.
- `CREATE_ENABLED = false` confirmation.
- GET/non-POST blocked response.
- Missing confirmation blocked response.
- Unauthorized lane blocked response.
- Reviewed Food / Beverage validated/create-disabled response.
- No-record-created confirmation.

## No-Regression Boundary

This packet is sandbox deployment readiness only. It preserves the prior Demo Command Center SuiteScript direct-write model as the future creation path, but creation remains locked until a separate governed pilot branch explicitly enables it with consultant confirmation, trace capture, rollback readiness, and one-lane Food / Beverage scope.
