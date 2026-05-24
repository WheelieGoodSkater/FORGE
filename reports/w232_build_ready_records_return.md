# W232 Build Ready Records Return

Status: PASS_W232_BUILD_READY_RECORDS_RETURN (7/7)

## Root Cause
Active W144 adapter lacked pending sidecar transaction-resolution promotion, so FORGE could see build completion without a W151-valid completed result JSON to import.

## Consultant Path
- Consultant clicks Build demo records.
- FORGE waits while the governed runner builds records.
- When the runner sidecar exists but Sales Order import is still resolving, FORGE keeps links pending.
- When the CSV-created Sales Order resolves, active W144 promotes the sidecar to completed runner JSON.
- Bring back records imports the W151-valid completed result into FORGE.
- Build and Run show plain record names and real Open links.

## Upload Files
- idb-drawer.user.js
- netsuite/idb_governed_runner_adapter_w144_suitelet.js

## Validation
- PASS active_w144_promotes_pending_sidecar_after_sales_order_resolution: {"status":"completed_runner_result_ready","tx":{"status":"resolved_by_csv_import","authority":"legacy_runner_csv_import_path","matchedExternalId":"IDB-idb-build-liquid-death-food-beverage-foodmanufacturing-LIQUID_DEATH-FOOD_BEVERAGE"}}
- PASS completed_json_has_all_required_real_links: {"customer":{"type":"customer","name":"Liquid Death Customer Account","internalId":"81001","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=81001","role":"customer","legacyRole":"customer","label":"Customer","recordType":"customer"},"demoTransaction":{"type":"salesorder","name":"Sales Order LD-81002","internalId":"81002","url":"https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=81002","role":"sales_order","legacyRole":"demoTransaction","label":"Sales Order","recordType":"salesorder"},"heroItem":{"type":"inventoryitem","name":"Liquid Death Sparkling Water Variety 12-Pack","internalId":"81003","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=81003","role":"finished_or_assembly_item","legacyRole":"heroItem","label":"Finished/Assembly Item","recordType":"inventoryitem"},"matrixProofItem":{"type":"inventoryitem","name":"Liquid Death Canned Beverage Availability Flow","internalId":"81004","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=81004","role":"formula_or_batch_structure","legacyRole":"matrixProofItem","label":"Formula or Batch Structure","recordType":"inventoryitem"},"componentItem":{"type":"inventoryitem","name":"Liquid Death Packaging Component Item","internalId":"81005","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=81005","role":"component_item","legacyRole":"componentItem","label":"Component Item","recordType":"inventoryitem"}}
- PASS w151_guard_accepts_adapter_completed_json: completed_runner_result_accepted
- PASS bring_back_records_commit_creates_forge_final_names: {"commitAllowed":true,"openLinks":9}
- PASS build_and_run_show_plain_record_names_and_open_links: {"verified_openable":5}
- PASS normal_ui_stays_consultant_safe: Build/Run rendered without forbidden internal terms.
- PASS no_drawer_write_boundaries_preserved: {"noDrawerWrites":true,"noDrawerTransactionWrites":true,"noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath":true,"consultantConfirmationRequired":true,"stateAuthorityAndHandoffParityPreserved":true,"idempotencyPreserved":true,"internalRunnerOwnership":true,"rollbackByDisablingServerFlags":true,"w151CompletedResultImportGuardPreserved":true,"noActiveOpenLinksWithoutRealUrls":true}

## Visual Testing Decision
No broad visual testing. This harness verifies the targeted build-ready import path and real Open-link model with mocked NetSuite adapter/search/file modules.
