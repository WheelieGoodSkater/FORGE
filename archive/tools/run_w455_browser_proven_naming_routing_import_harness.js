#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(repo, rel), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};
const contains = (source, text) => source.indexOf(text) !== -1;
const notContainsAny = (source, terms) => terms.filter((term) => source.indexOf(term) !== -1);

const drawer = read('idb-drawer.user.js');
const runner = read('src/FileCabinet/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const adapter = read('src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb_governed_runner_adapter_w144_suitelet.js');
const pkg = JSON.parse(read('package.json'));

assert(!contains(drawer, 'Drawer 1.0.67 / W463'), 'old installed drawer marker 1.0.67 / W463 must not be accepted');
assert(contains(drawer, '// @version      1.0.69'), 'drawer @version must be 1.0.69');
assert(contains(drawer, "const DRAWER_USERSCRIPT_VERSION = '1.0.69';"), 'drawer userscript constant must be 1.0.69');
assert(contains(drawer, "const CURRENT_UX_BLOCK_W346 = 'W466';"), 'drawer block marker must advance to W466');
assert(contains(drawer, 'W466 current-run sidecar provenance and product-first record naming active'), 'drawer installed marker must visibly identify the W466 sidecar/product deployment block');

assert(contains(adapter, 'createNamingPackFile(request, config, idempotencyToken)'), 'approved adapter must create a naming pack before runner submit');
assert(contains(adapter, 'custscript_scai_runner_naming_file_id'), 'approved adapter must pass custscript_scai_runner_naming_file_id');
assert(contains(adapter, 'boundedFileNameW461(`scai_naming_${safeFileToken(idempotencyToken)}.json`, NAMING_FILE_NAME_LIMIT_W468)'), 'approved adapter must write bounded discoverable scai_naming_<extId>.json files');
assert(contains(adapter, 'explicitNamingPackFromRequestW468(request)'), 'adapter must load explicit precomputed naming before writing the handoff');
assert(contains(adapter, 'industrySelectionFromRequestW468(request, website)'), 'adapter must compute Industry Selection separately from record naming');
assert(contains(adapter, 'suitelet-precomputed-naming-pack'), 'adapter must mark explicit naming pack authority');
assert(contains(adapter, 'suitelet-prospect-fallback-naming-pack'), 'adapter fallback must be prospect-shaped, not product inferred');
assert(contains(adapter, 'shop all') && contains(adapter, 'featured products') && contains(adapter, 'accessories') && contains(adapter, 'services'), 'adapter must reject generic nav/category labels as product candidates');
assert(contains(adapter, 'Forklift Truck') && contains(adapter, 'Pallet Truck') && contains(adapter, 'Reach Truck') && contains(adapter, 'Order Picker'), 'adapter must extract industrial equipment website product candidates');
assert(contains(adapter, 'Crown C-5 Series Forklift') && contains(adapter, 'Crown RC Series Stand-Up Rider Forklift'), 'adapter must seed concrete Crown product-line resolver candidates');
assert(contains(adapter, 'websiteEvidenceSourceUrls'), 'adapter must emit websiteEvidenceSourceUrls');
assert(contains(adapter, "ADAPTER_VERSION = 'w468-governed-adapter-precomputed-naming-pack-simple'"), 'adapter must expose the W468 simple precomputed naming marker');
assert(contains(adapter, 'explicitNamingPackFromRequestW468'), 'adapter must prefer explicit precomputed naming packs');
assert(contains(adapter, 'industrySelectionFromRequestW468'), 'adapter must emit website/LLM best-guess industry selection');
assert(contains(adapter, 'suitelet-precomputed-naming-pack'), 'adapter must mark explicit naming packs as the naming source');
assert(contains(adapter, 'suitelet-prospect-fallback-naming-pack'), 'adapter must use only prospect fallback when no precomputed names exist');
assert(contains(adapter, 'namingEvidenceSource'), 'adapter must emit namingEvidenceSource telemetry');
assert(contains(adapter, 'namingConfidence'), 'adapter must emit namingConfidence telemetry');
assert(contains(adapter, 'NAMING_FILE_NAME_LIMIT_W468 = 96'), 'adapter naming handoff filenames must be bounded below the prior 180-char ceiling');
assert(contains(runner, 'namingPayloadFound'), 'runner must keep namingPayloadFound telemetry');
assert(contains(runner, 'namingPayloadParsed'), 'runner must keep namingPayloadParsed telemetry');
assert(contains(runner, 'namingPayloadApplied'), 'runner must keep namingPayloadApplied telemetry');
assert(contains(runner, 'namingEvidenceSource'), 'runner must pass through namingEvidenceSource telemetry');
assert(contains(runner, "const names = namingPayload.payload;"), 'runner must apply the precomputed naming pack directly');
assert(contains(runner, 'industrySelection'), 'runner must expose industrySelection telemetry');
assert(contains(runner, 'websiteEvidenceSourceUrls'), 'runner must pass through websiteEvidenceSourceUrls telemetry');
assert(contains(runner, "VERSION = 'v4.0.0-runner-sandbox-w468-precomputed-naming-pack-simple'"), 'runner must expose the W468 runtime marker');
assert(contains(runner, "RELEASE_TRANCHE = 'w468-precomputed-naming-pack-simple-result-filename-safe'"), 'runner tranche must describe the W468 naming/filename repair');
assert(contains(runner, "_source: 'deterministic-prospect-fallback'"), 'runner fallback must be prospect-based, not product-catalog inference');
assert(contains(runner, 'waitForSalesOrderResolutionW460'), 'runner must wait briefly for Sales Order saved-search resolution after CSV import');
assert(contains(runner, 'boundedFileNameW461(`scai_so_${extId}.csv`, 180)'), 'runner SO CSV filenames must be bounded below NetSuite field length limits');
assert(contains(runner, 'resultCaptureFileNameW453({ extId, buildAttemptId, status })'), 'runner result capture filenames must route through the bounded W461 helper');
assert(contains(runner, 'resultCaptureFileNameW453({ extId, buildAttemptId: \'error\', status: \'error\' })'), 'runner error result capture filenames must route through the bounded W461 helper');
assert(contains(runner, 'RESULT_CAPTURE_FILENAME_LIMIT_W468 = 96'), 'runner result capture file names must be bounded below the prior 180-char ceiling');
assert(contains(runner, 'isExceededMaxFieldLengthW468'), 'runner result capture save must retry on NetSuite max-field-length errors');
assert(contains(runner, 'const safeName = boundedFileNameW461(filename || `scai_file_${Date.now()}.csv`, 180);'), 'runner CSV writer must bound file names');

[
  'Ginger Lemon Kombucha',
  'Pink Lady Apple Kombucha',
  'Pomegranate Kombucha',
  'Classic Kombucha',
  'Organic Tea and Sugar Fermentation Base',
  'Bottle and Case Packaging',
  'Brew and Ferment Kombucha Base',
  'Flavor, Bottle, and Case Pack ${product}',
  'QC and Release Finished Cases'
].forEach((term) => {
  assert(contains(adapter, term) || contains(runner, term), `Health-Ade naming fixture missing ${term}`);
});

assert(contains(runner, 'genericFallbackBlockedTerms'), 'runner must expose genericFallbackBlockedTerms');
assert(!/addStep\(40|addStep\(50|operation_names_by_seq:\s*\{[\s\S]*'40'/.test(runner), 'W455 runner must not default to five WIP operations');

assert(contains(runner, 'verifyAssemblyBomContextW455'), 'runner must verify assembly BOM context before routing');
assert(contains(runner, 'discoverReusableRoutingContextW455'), 'runner must discover reusable routings through a single exact-BOM policy');
assert(contains(runner, 'inspectRoutingCandidateForExactBomW456'), 'runner must load and inspect routing candidates before accepting them');
assert(contains(runner, 'findRoutingCandidatesByLoadedActiveScanW456'), 'runner must include a loaded-record active routing scan');
assert(contains(runner, 'routingDiscoveryMode'), 'runner must return routingDiscoveryMode telemetry');
assert(contains(runner, 'routingCandidatesInspected'), 'runner must return routingCandidatesInspected telemetry');
assert(contains(runner, 'routingCandidatesRejected'), 'runner must return rejected routing candidate evidence');
assert(contains(runner, 'acceptedRoutingBomId'), 'runner must expose the accepted routing BOM id');
assert(contains(runner, 'acceptedRoutingSubsidiaryMismatch'), 'runner must expose exact-BOM subsidiary mismatch telemetry instead of rejecting the route');
assert(contains(runner, "subsidiaryMismatchSeverity: subsidiaryMismatch ? 'attach_or_wo_warning'"), 'runner must classify subsidiary mismatch as attach/WO warning');
assert(!contains(runner, "reason: 'wrong_subsidiary'"), 'runner must not reject exact-BOM routing solely for subsidiary mismatch');
assert(contains(runner, 'verifyRoutingBomAndOperationsW456'), 'runner must verify routing BOM and operation labels after reuse/save');
assert(contains(runner, 'routeSaveSkippedReason'), 'runner must diagnose when operation lines are not editable');
assert(contains(runner, 'attachDefaultVerification'), 'runner must return attach/default verification');
assert(contains(runner, 'attachAttempted'), 'runner must expose whether exact-BOM route attach/default was attempted');
assert(contains(runner, 'routingBomVerified'), 'runner must expose post-save routing BOM verification');
assert(contains(runner, "manufacturingrouting: '/app/accounting/manufacturing/mfgrouting.nl'"), 'manufacturingrouting URLs must use mfgrouting.nl');
assert(!contains(runner, "manufacturingrouting: '/app/accounting/manufacturing/routing.nl'"), 'manufacturingrouting URLs must never use routing.nl');
assert(contains(runner, 'enableWip: effectiveEnableWip'), 'runner must pass the effective WIP toggle into Work Order creation');
assert(contains(runner, "const WORK_ORDER_WIP_FIELD_CANDIDATES_W455 = ['iswip'"), 'runner must guard candidate Work Order WIP field IDs');
assert(contains(runner, 'applyWorkOrderWipModeW455'), 'runner must apply/probe Work Order WIP mode during create attempts');
assert(contains(runner, 'applyWorkOrderWipModeToExistingW455'), 'runner must attempt WIP telemetry/application when reusing an existing Work Order');
assert(contains(runner, "status: enableWip === true ? 'requested_not_applied' : 'not_requested_wip_disabled'"), 'runner must leave Work Order WIP unmodified when WIP is disabled');
assert(contains(runner, 'all_candidate_fields_rejected'), 'runner must return explicit diagnostic telemetry when WIP fields are not scriptable');
assert(contains(runner, 'staleRoutingDetected'), 'runner must detect stale routing');
assert(contains(runner, 'stale_product_name_without_assembly_bom_proof'), 'runner must reject stale BBQ/Cookie/Sauce routes without exact safe proof');
assert(contains(runner, 'poppi|bbq|cookie|sauce'), 'runner must treat stale Poppi/BBQ/Cookie/Sauce names as renameable only after exact BOM proof');
assert(contains(runner, 'Existing WIP stack naming applied W456'), 'runner must explicitly log assembly/BOM/BOM revision rename attempts');

assert(contains(runner, 'displayReadyRecords'), 'runner result capture must emit displayReadyRecords');
assert(contains(runner, 'recordsArray'), 'runner result capture must emit recordsArray for older import paths');
assert(contains(runner, 'records.routingDiagnostic'), 'runner result capture must preserve keyed routingDiagnostic');
assert(contains(runner, 'routingOperations'), 'runner result capture must keep routing operation detail');
assert(contains(runner, 'ensureCustomerCurrentRunIdentityW457'), 'runner must overwrite/reload customer current-run identity before capture');
assert(contains(runner, 'current_run_identity_verified'), 'runner must verify current customer prospect, website, memo, and stale Health-Ade cleanup');
assert(contains(runner, 'demandRecordRolePolicy') && contains(runner, 'sales_order_only_never_work_order'), 'runner must not represent Work Order as demand/Sales Order');
assert(contains(runner, 'demandDiagnostic') && contains(runner, "blockedLinkRole: 'work_order'"), 'runner must return a Sales Order demand diagnostic instead of a fake Work Order demand link');
assert(contains(runner, 'customsearch_wms_atlas_bill_lookup_2'), 'runner must use the FORGE SO lookup saved search as a Sales Order resolution source');
assert(contains(runner, 'SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458') && contains(runner, "'5006'"), 'runner must keep the FORGE SO lookup internal id available for accounts that cannot load by script id');
assert(contains(runner, 'sales_order_resolved_by_saved_search'), 'runner must mark current-run Sales Orders resolved through the saved search distinctly');
assert(contains(runner, 'FORGE SO lookup did not return a current-run Sales Order internal id'), 'runner must preserve truthful demand diagnostics when the saved search cannot resolve the SO');
assert(contains(runner, "const names = namingPayload.payload;"), 'runner must apply parsed naming packs directly without product recovery/fallback override');
assert(contains(runner, "_source: 'deterministic-prospect-fallback'"), 'runner fallback must be old-runner-style prospect naming');
assert(contains(runner, 'industrySelectionW468'), 'runner fallback must expose Industry Selection separately from record naming');
assert(contains(runner, "namingAuthorityOrder: 'precomputed naming pack -> prospect fallback'"), 'runner telemetry must show the simplified naming authority order');
assert(contains(adapter, 'server naming pack file was not created before runner submit.'), 'adapter must block runner submit when server naming-pack creation fails');
assert(contains(adapter, '`${prospect} Finished Good`'), 'adapter fallback must use prospect-based finished-good names, not Catalog Product');
assert(contains(adapter, 'industrySelectionFromRequestW468'), 'adapter must expose Industry Selection separately from record naming');
assert(contains(runner, 'reusedRecordOverwriteTelemetryW457'), 'runner must emit reused-record overwrite telemetry');
assert(contains(runner, 'cleanWorkOrderLineDescriptionsW457'), 'runner must clean reused Work Order line descriptions');
assert(contains(runner, 'staleTermsDetectedAfterReload'), 'runner must reload-check stale Work Order line descriptions');
assert(!contains(runner, 'records[`operation${index + 1}`]'), 'runner result capture must not emit operations as keyed display records');
assert(contains(runner, 'routingTemplateSearchDisabled'), 'runner must block global template routing reuse');
assert(contains(runner, 'ROUTING_TEMPLATE_REUSE_BLOCKED'), 'runner must return a diagnostic when only template routings are available');
assert(!contains(runner, "record.copy({ type: 'manufacturingrouting'"), 'runner must not copy global manufacturing routing templates');
assert(!contains(runner, "record.create({ type: 'manufacturingrouting'"), 'runner must not create manufacturing routing in W456 exact-BOM reuse repair');
assert(!contains(runner, 'findRoutingCopyTemplateW455'), 'runner must not keep the old global routing template-copy path');
assert(contains(runner, 'No reusable routing exists with BOM'), 'runner must return the explicit correct-BOM seed/create nextFixHint');
assert(contains(runner, "decision: 'reused-existing-routing-renamed-operations'"), 'runner must return reused routing success only from an accepted context');

assert(contains(drawer, 'parseMaybeJsonObjectW455'), 'drawer must normalize object-or-string completed JSON');
assert(contains(drawer, 'normalizeManufacturingRoutingUrlW456'), 'drawer must normalize stale manufacturing routing URLs');
assert(contains(drawer, '/app/accounting/manufacturing/mfgrouting.nl'), 'drawer normalization must target mfgrouting.nl');
assert(contains(drawer, 'completedResultJson'), 'drawer must inspect completedResultJson');
assert(contains(drawer, 'generatedNamesJson'), 'drawer must inspect generatedNamesJson');
assert(contains(drawer, 'sidecarGeneratedNamesJson'), 'drawer must inspect sidecarGeneratedNamesJson');
assert(contains(drawer, 'partialGeneratedNamesJson'), 'drawer must inspect partialGeneratedNamesJson');
assert(contains(adapter, 'completed_with_wip_diagnostic'), 'adapter must treat completed_with_wip_diagnostic as terminal');
assert(contains(drawer, 'componentItem1') && contains(drawer, 'componentItem2') && contains(drawer, 'componentItem3'), 'drawer must import keyed component records');
assert(contains(drawer, "linkAuthorityStatus: plannedOperation ? 'planned_operation_not_record_link'"), 'drawer must keep planned operations as detail rows, not missing-link rows');
assert(contains(drawer, 'isOperationLinkRecordW455'), 'drawer must filter operation-style rows from primary record links');
assert(contains(drawer, 'plannedOperationRows.length'), 'drawer troubleshoot export must count operation rows as planned/detail-only');
assert(contains(drawer, "const runReceiptLabelW446 = hasPreviousDistinctRunW446 ? 'Previous run' : 'Current run receipt';"), 'drawer must not label the current run as Last run');
assert(contains(drawer, '/work[_\\s-]*order|workorder/i'), 'drawer troubleshoot export must recognize role work_order as a Work Order');
assert(contains(drawer, 'routingDiagnostic') && contains(drawer, 'workOrderDiagnostic'), 'drawer WIP flow must keep routing and Work Order diagnostic detail available');
assert(contains(drawer, 'erpBuildStoryModelW456'), 'drawer must build a compact ERP Story model');
assert(contains(drawer, 'renderErpBuildStoryW456'), 'drawer must render the compact ERP/Build Story');
assert(contains(drawer, 'idb-w456-erp-build-story'), 'drawer must include scoped ERP Story styling');
assert(contains(drawer, 'recordOpenAuthorityW446(item)'), 'drawer ERP Story links must use verified record authority');
assert(contains(drawer, 'currentRunIdentityLinkBlockW457'), 'drawer must block dangerous Customer/SO links without current-run identity');
assert(contains(drawer, 'demand_role_mapped_to_work_order_blocked'), 'drawer must block Work Order links from satisfying demand/Sales Order proof');
assert(contains(drawer, 'isSalesOrderRecordW458'), 'drawer workflow demand target must be Sales Order only');
assert(contains(drawer, 'Demand proof pending'), 'drawer must show a compact demand diagnostic when Sales Order is missing');
assert(contains(drawer, 'Sales Order not returned; Work Order is not valid demand proof.'), 'drawer must state the Work Order cannot satisfy demand proof');
assert(!/stage === 'demand'[\s\S]{0,900}matches\(\[\/sales\/,\s*\/demand\/,\s*\/order\/\]\)/.test(drawer), 'drawer demand target must not use generic /order/ matching that can catch Work Order');
assert(contains(drawer, "'Order', 'Demand', 'Buy Inputs', 'Build Batch', 'WIP Steps', 'Finished Cases'"), 'drawer story rail must include the WIP proof path');
assert(contains(drawer, "visibleNarrative && visibleNarrative.mode === 'wip'"), 'drawer story rail must render WIP Steps only when WIP is enabled');
assert(contains(drawer, 'WIP production steps'), 'drawer must show compact WIP production steps');
assert(contains(drawer, 'Product Expansion Audit'), 'drawer must keep Product Expansion Audit visible above the operational story');
assert(contains(drawer, '<strong>Fallback:</strong>'), 'drawer Product Expansion Audit must expose fallback truth visibly');
assert(contains(drawer, 'Rejected generic:'), 'drawer Product Expansion Audit must expose rejected generic candidates');
assert(contains(drawer, 'resultCaptureSourceW462'), 'drawer troubleshoot export must expose result capture file source metadata');
assert(contains(drawer, 'sourceFileId: resultCaptureSourceW462.sourceFileId'), 'drawer troubleshoot export must include completed result sourceFileId');
assert(contains(drawer, 'sourceFileName: resultCaptureSourceW462.sourceFileName'), 'drawer troubleshoot export must include completed result sourceFileName');
assert(contains(drawer, 'resultCaptureStatusTrailW462'), 'drawer troubleshoot export must distinguish nonterminal stale rejection from terminal stale failure');
assert(contains(drawer, 'nonterminalStaleRejected') && contains(drawer, 'terminalStaleFailure'), 'drawer export must distinguish nonterminal stale candidate rejection from terminal stale failure');
assert(contains(drawer, 'lookupStatus: resultCaptureSourceW462.lookupStatus'), 'drawer troubleshoot export must include top-level result-capture lookupStatus');
assert(contains(drawer, 'lookupSource: resultCaptureSourceW462.lookupSource'), 'drawer troubleshoot export must include top-level result-capture lookupSource');
assert(contains(drawer, 'terminalNotFoundFailure: resultCaptureSourceW462.terminalNotFoundFailure'), 'drawer troubleshoot export must include top-level terminal not-found result-capture failure');
assert(contains(drawer, 'expectedProvenance: resultCaptureSourceW462.expectedProvenance'), 'drawer troubleshoot export must include top-level expected provenance');
assert(contains(drawer, 'Order -> Demand -> Buy Inputs -> Build Batch -> WIP Steps -> Finished Cases'), 'drawer must render compact WIP proof path copy instead of raw browser story text');
assert(!contains(drawer, 'Planned Operation ${escapeHtml(Number(item.operationIndex || index) + 1)} ${escapeHtml(name)}'), 'drawer must not duplicate planned operation prefixes');
assert(contains(drawer, 'Core records imported; review WIP diagnostic'), 'drawer ERP Story must truthfully describe WIP diagnostics');
assert(contains(drawer, 'idb-w415-cockpit-panel idb-w415-roi-panel'), 'drawer must keep ROI panel visible');
assert(contains(drawer, 'idb-w415-cockpit-panel idb-w415-competitive-panel'), 'drawer must keep competitive panel visible');

assert(contains(adapter, 'completedKeyedResultCaptureW455'), 'poll adapter must pass through keyed completed captures');
assert(contains(adapter, "status: keyedCompletedW455.status === 'completed_with_wip_diagnostic'"), 'poll adapter must return completed_with_wip_diagnostic terminal status');
assert(contains(adapter, 'safeSourceRequestIdFileTokenW455ResultStem'), 'poll adapter must search completed captures by sourceRequestId/request identity');
assert(contains(adapter, 'completed_keyed_result_capture_matches_current_safe_file_token'), 'poll adapter must allow terminal keyed safe-token captures without weakening stale guards');
assert(contains(adapter, 'customsearch_wms_atlas_bill_lookup_2'), 'poll adapter must use the FORGE SO lookup saved search when promoting delayed SO imports');
assert(contains(adapter, 'promoteCompletedKeyedSalesOrderW458'), 'poll adapter must promote completed keyed captures once the saved search sees the Sales Order');
assert(contains(adapter, 'forge_so_lookup_saved_search'), 'poll adapter Sales Order promotion must record the saved-search source');
assert(contains(adapter, 'sales_order_resolved_by_saved_search'), 'poll adapter must expose saved-search SO resolution in transactionResolution');
assert(contains(adapter, "status: 'runner_busy_inprogress'"), 'adapter must map scheduled task INPROGRESS to runner_busy_inprogress');
assert(contains(adapter, 'retryAfterMs: 45000'), 'adapter runner busy response must include retry guidance');
assert(contains(adapter, 'result_capture_not_found_after_wait'), 'adapter must return a terminal diagnostic when result capture is absent after max wait');
assert(contains(adapter, 'stale_result_capture_rejected_after_wait'), 'adapter must return a terminal diagnostic for stale captures after max wait');
assert(contains(adapter, 'latestRejectedFile'), 'adapter stale diagnostics must expose latest rejected file detail');
assert(contains(adapter, 'expectedProvenance'), 'adapter stale diagnostics must expose expected provenance');
assert(contains(adapter, 'mismatchReason'), 'adapter stale diagnostics must include mismatch reason');
assert(contains(adapter, 'pollAttemptFromCursor'), 'adapter polling must carry finite attempt state via cursor');
assert(contains(drawer, 'fetchWithTimeoutW461'), 'drawer adapter calls must use bounded request timeout');
assert(contains(drawer, 'result_capture_terminal_diagnostic'), 'drawer must normalize result-capture max-wait diagnostics without generic adapter failure');
assert(contains(drawer, 'w190_result_capture_terminal_diagnostic'), 'drawer poll state must expose terminal result-capture diagnostics');

const bannedInHealthAdeFixture = notContainsAny(
  [
    'Health-Ade Ginger Lemon Kombucha Case',
    'Health-Ade Ginger Lemon Kombucha Batch',
    'Organic Tea and Sugar Fermentation Base',
    'Ginger Lemon Flavor Blend',
    'Bottle and Case Packaging'
  ].join('\n'),
  ['Component A', 'Component B', 'Component C', 'Finished Good', 'Machine Unit', 'Core Material Input']
);
assert(!bannedInHealthAdeFixture.length, `Health-Ade fixture contains banned generic terms: ${bannedInHealthAdeFixture.join(', ')}`);

assert(
  pkg.scripts && pkg.scripts['harness:browser-proven-naming-routing-import-w455'] === 'node archive/tools/run_w455_browser_proven_naming_routing_import_harness.js',
  'package script harness:browser-proven-naming-routing-import-w455 is missing'
);

console.log(JSON.stringify({
  ok: true,
  harness: 'browser-proven-naming-routing-import-w455',
  assertions: 25,
  files: [
    'idb-drawer.user.js',
    'src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb_governed_runner_adapter_w144_suitelet.js',
    'src/FileCabinet/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js'
  ]
}, null, 2));
