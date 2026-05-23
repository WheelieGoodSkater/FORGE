# W207 Production Build Mode Smoke With Saved Admin Config

Status: PASS_W207_PRODUCTION_BUILD_MODE_SMOKE
Release decision: release_ready_for_controlled_production_consultant_smoke

## Smoke Evidence
- Request: idb-build-ariat-international-apparel-accessories-apparelaccessories
- Runner task: SCHEDSCRIPT_REDACTED
- W151 guard: completed_runner_result_accepted
- Imported status: production_build_completed_imported
- Verified Open links: 5

## Pass / Fail Checklist
- PASS normal_consultant_inputs_only: Customer / Prospect Name, Website, Conversation Notes
- PASS saved_admin_config_submit_ready: production_build_ready_to_submit
- PASS confirmed_request_generated: idb-build-ariat-international-apparel-accessories-apparelaccessories
- PASS runner_task_captured_after_build: SCHEDSCRIPT_REDACTED
- PASS completed_result_w151_valid: completed_runner_result_accepted
- PASS final_names_imported_only_after_operator_import: production_build_completed_imported
- PASS five_real_open_links_ready: [{"role":"customer","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=1722"},{"role":"sales_order","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=80828"},{"role":"hero_item","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865"},{"role":"matrix_or_proof_item","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2545"},{"role":"component_item","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2546"}]
- PASS no_regression_boundaries_preserved: {"noDrawerWrites":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectDrawerSuiteScriptOutsideApprovedAdapterPath":true,"runnerOwnershipPreserved":true,"w151ImportGuardPreserved":true,"absoluteNetSuiteUrlsRequired":true,"noActiveOpenLinksBeforeCompletedResultImport":true,"handoffJsonStillRejectedByFinalImport":true}
- PASS w207_normal_ready_build_surface_has_no_admin_plumbing: Ready state hides endpoint/flags/operator fields and exposes Build demo records.
- PASS w207_pending_runner_exposes_check_result_only_after_task: Check status appears only after the build has started.
- PASS w207_completed_poll_exposes_import_cta_before_links: Completed records can be finished, but Open links are still blocked before import commit.
- PASS w207_w151_import_guard_accepts_completed_result: {"schema":"idb.runner-result-import-guard.v1","valid":true,"status":"completed_runner_result_accepted","message":"Completed runner result JSON accepted. Final names and verified URLs can be imported.","finalNaming":{"schema":"idb.dcc-final-naming-result.v1","status":"dcc_final_names_imported","displayStatus":"Final generated names imported","importedAt":"2026-05-18T23:50:19.719Z","source":"dcc_result_import_only","finalNamesImported":true,"runStatus":"completed","prospect":"Ariat International Customer Account","scenario":"Style / SKU Matrix","familyKey":"apparel_accessories","generated":{"extId":"","agenda":""},"displayObjects":[{"role":"customer","label":"Customer","name":"Ariat International Customer Account","internalName":"","id":"1722","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=1722","source":"dcc_final"},{"role":"sales_order","label":"Sales Order / demo transaction","name":"SO2677","internalName":"","id":"80828","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=80828","source":"dcc_final"},{"role":"hero_item","label":"Hero item","name":"Ariat International Style SKU","internalName":"SCAI - Ariat International Style SKU - ESSORIES","id":"1865","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865","source":"dcc_final"},{"role":"matrix_or_proof_item","label":"Matrix item / proof item","name":"Ariat International Omnichannel Availability Flow","internalName":"","id":"2545","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2545","source":"dcc_final"}],"componentItems":[{"role":"component_item","label":"Component item 1","name":"Ariat International Core Style","internalName":"","id":"2546","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2546","source":"dcc_final"}],"locationPlanningRecords":[],"csvSalesOrderArtifacts":[],"warnings":[],"errors":[],"recoverableBlockers":[],"traceCoverage":{"includedInTraceExport":true,"secretsRedacted":true,"importedOnly":true},"noRegression":{"importOnly":true,"noIdbWrites":true,"noSuiteScriptInvocationFromIdb":true,"noTransactionWritesFromIdb":true,"dccOwnsObjectGeneration":true,"provisionalNamesCannotBeMarkedFinal":true,"w92StateAuthorityPreserved":true,"w110HandoffParityPreserved":true}}}
- PASS w207_build_and_run_show_real_open_links_after_import: {"linkChecklist":[{"role":"customer","name":"Ariat International Customer Account","internalId":"1722","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=1722","openable":true,"absoluteNetSuiteUrl":true},{"role":"sales_order","name":"SO2677","internalId":"80828","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=80828","openable":true,"absoluteNetSuiteUrl":true},{"role":"hero_item","name":"Ariat International Style SKU","internalId":"1865","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865","openable":true,"absoluteNetSuiteUrl":true},{"role":"matrix_or_proof_item","name":"Ariat International Omnichannel Availability Flow","internalId":"2545","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2545","openable":true,"absoluteNetSuiteUrl":true},{"role":"component_item","name":"Ariat International Core Style","internalId":"2546","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2546","openable":true,"absoluteNetSuiteUrl":true}],"linkAuthoritySummary":{"verified_openable":5}}
- PASS w207_all_urls_are_absolute_netsuite_urls: [{"role":"customer","name":"Ariat International Customer Account","internalId":"1722","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=1722","openable":true,"absoluteNetSuiteUrl":true},{"role":"sales_order","name":"SO2677","internalId":"80828","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=80828","openable":true,"absoluteNetSuiteUrl":true},{"role":"hero_item","name":"Ariat International Style SKU","internalId":"1865","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865","openable":true,"absoluteNetSuiteUrl":true},{"role":"matrix_or_proof_item","name":"Ariat International Omnichannel Availability Flow","internalId":"2545","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2545","openable":true,"absoluteNetSuiteUrl":true},{"role":"component_item","name":"Ariat International Core Style","internalId":"2546","url":"https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2546","openable":true,"absoluteNetSuiteUrl":true}]
- PASS w207_no_regression_boundaries_preserved: {"noDrawerWrites":true,"noDrawerCreatedRecords":true,"noDrawerTransactionWrites":true,"noDirectSuiteScriptOutsideApprovedServerAdapterPath":true,"runnerOwnershipPreserved":true,"w151ImportGuardPreserved":true,"absoluteNetSuiteUrls":true,"noOpenLinksBeforeCompletedImport":true}
- PASS w207_release_decision_ready: release_ready_for_controlled_production_consultant_smoke

## Link Checklist
- PASS customer: Ariat International Customer Account (1722) https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=1722
- PASS sales_order: SO2677 (80828) https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=80828
- PASS hero_item: Ariat International Style SKU (1865) https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865
- PASS matrix_or_proof_item: Ariat International Omnichannel Availability Flow (2545) https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2545
- PASS component_item: Ariat International Core Style (2546) https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2546

## Boundaries
- No drawer writes.
- No drawer-created records.
- No drawer transaction writes.
- No direct SuiteScript outside the approved server adapter path.
- Runner owns generated records.
- Open links appear only after W151-valid completed runner result import.
