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

assert(contains(drawer, '// @version      1.0.61'), 'drawer @version must be 1.0.61');
assert(contains(drawer, "const DRAWER_USERSCRIPT_VERSION = '1.0.61';"), 'drawer userscript constant must be 1.0.61');
assert(contains(drawer, "const CURRENT_UX_BLOCK_W346 = 'W455';"), 'drawer block marker must be W455');

assert(contains(adapter, 'createNamingPackFile(request, config, idempotencyToken)'), 'approved adapter must create a naming pack before runner submit');
assert(contains(adapter, 'custscript_scai_runner_naming_file_id'), 'approved adapter must pass custscript_scai_runner_naming_file_id');
assert(contains(adapter, 'scai_naming_${safeFileToken(idempotencyToken)}.json'), 'approved adapter must write discoverable scai_naming_<extId>.json files');
assert(contains(adapter, 'buildCatalogCandidatesW457(request, website, namingAuthority)'), 'adapter must build catalog candidates before naming pack creation');
assert(contains(adapter, 'request.websiteEvidence'), 'adapter must wire request-carried website evidence into catalog candidate selection');
assert(contains(adapter, 'request.finalNamingAdvisory'), 'adapter must wire LLM/final naming advisory into catalog candidate selection');
assert(contains(adapter, 'sourceKindForEvidencePathW457'), 'adapter must classify candidate evidence sources');
assert(contains(adapter, "source === 'llm_naming_advisory'"), 'adapter must recognize LLM naming advisory candidates');
assert(contains(adapter, 'domainCatalogCandidatesW457'), 'adapter must seed resolver catalog candidates when request evidence is sparse');
assert(contains(adapter, 'catalogCandidates: rankedCatalogCandidates'), 'adapter must emit catalogCandidates');
assert(contains(adapter, 'selectedCatalogCandidate'), 'adapter must emit selectedCatalogCandidate');
assert(contains(adapter, 'selectedCatalogCandidateSource'), 'adapter must emit selectedCatalogCandidateSource');
assert(contains(adapter, 'selectedCatalogCandidateReasons'), 'adapter must emit selectedCatalogCandidateReasons');
assert(contains(adapter, 'websiteCatalogEvidenceUsed'), 'adapter must emit websiteCatalogEvidenceUsed');
assert(contains(adapter, 'llmCatalogInterpretationUsed'), 'adapter must emit llmCatalogInterpretationUsed');
assert(contains(adapter, 'deterministicCatalogRankerUsed'), 'adapter must emit deterministicCatalogRankerUsed');
assert(contains(adapter, 'fallbackUsed'), 'adapter must emit fallbackUsed');
assert(contains(adapter, 'prospectNameUsedAsFallbackOnly: true'), 'adapter must treat prospect name as fallback context only');
assert(contains(adapter, 'namingEvidenceSource'), 'adapter must emit namingEvidenceSource telemetry');
assert(contains(adapter, 'namingConfidence'), 'adapter must emit namingConfidence telemetry');
assert(contains(adapter, 'productSignalsUsed'), 'adapter must emit productSignalsUsed telemetry');
assert(contains(adapter, 'flavorSignalsUsed'), 'adapter must emit flavorSignalsUsed telemetry');
assert(contains(adapter, 'packSignalsUsed'), 'adapter must emit packSignalsUsed telemetry');
assert(contains(adapter, 'llmNamingAdvisoryUsed'), 'adapter must emit llmNamingAdvisoryUsed telemetry');
assert(contains(adapter, 'fallbackReason'), 'adapter must emit explicit fallbackReason telemetry');
assert(contains(adapter, 'scenarioText'), 'adapter may use notes/scenario only as business context');
assert(!contains(adapter, 'const signal = `${prospect} ${website} ${notes}`'), 'adapter must not use prospect+notes as the primary product naming signal');
assert(contains(runner, 'namingPayloadFound'), 'runner must keep namingPayloadFound telemetry');
assert(contains(runner, 'namingPayloadParsed'), 'runner must keep namingPayloadParsed telemetry');
assert(contains(runner, 'namingPayloadApplied'), 'runner must keep namingPayloadApplied telemetry');
assert(contains(runner, 'namingEvidenceSource'), 'runner must pass through namingEvidenceSource telemetry');
assert(contains(runner, 'catalogCandidates'), 'runner must pass through catalogCandidates telemetry');
assert(contains(runner, 'selectedCatalogCandidate'), 'runner must pass through selectedCatalogCandidate telemetry');
assert(contains(runner, 'websiteCatalogEvidenceUsed'), 'runner must pass through websiteCatalogEvidenceUsed telemetry');
assert(contains(runner, 'llmCatalogInterpretationUsed'), 'runner must pass through llmCatalogInterpretationUsed telemetry');
assert(contains(runner, 'deterministicCatalogRankerUsed'), 'runner must pass through deterministicCatalogRankerUsed telemetry');
assert(contains(runner, 'fallbackUsed'), 'runner must pass through fallbackUsed telemetry');
assert(contains(runner, 'flavorSignalsUsed'), 'runner must pass through flavorSignalsUsed telemetry');
assert(contains(runner, 'selectedProductName'), 'runner must pass through selectedProductName telemetry');

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
assert(contains(runner, 'staleRoutingDetected'), 'runner must detect stale routing');
assert(contains(runner, 'stale_product_name_without_assembly_bom_proof'), 'runner must reject stale BBQ/Cookie/Sauce routes without exact safe proof');
assert(contains(runner, 'poppi|bbq|cookie|sauce'), 'runner must treat stale Poppi/BBQ/Cookie/Sauce names as renameable only after exact BOM proof');
assert(contains(runner, 'Existing WIP stack naming applied W456'), 'runner must explicitly log assembly/BOM/BOM revision rename attempts');

assert(contains(runner, 'displayReadyRecords'), 'runner result capture must emit displayReadyRecords');
assert(contains(runner, 'recordsArray'), 'runner result capture must emit recordsArray for older import paths');
assert(contains(runner, 'records.routingDiagnostic'), 'runner result capture must preserve keyed routingDiagnostic');
assert(contains(runner, 'routingOperations'), 'runner result capture must keep routing operation detail');
assert(!contains(runner, 'records[`operation${index + 1}`]'), 'runner result capture must not emit operations as keyed display records');
assert(contains(runner, 'routingTemplateSearchDisabled'), 'runner must block global template routing reuse');
assert(contains(runner, 'ROUTING_TEMPLATE_REUSE_BLOCKED'), 'runner must return a diagnostic when only template routings are available');
assert(!contains(runner, "record.copy({ type: 'manufacturingrouting'"), 'runner must not copy global manufacturing routing templates');
assert(!contains(runner, "record.create({ type: 'manufacturingrouting'"), 'runner must not create manufacturing routing in W456 exact-BOM reuse repair');
assert(!contains(runner, 'findRoutingCopyTemplateW455'), 'runner must not keep the old global routing template-copy path');
assert(contains(runner, 'No reusable routing exists with BOM'), 'runner must return the explicit correct-BOM seed/create nextFixHint');
assert(contains(runner, "decision: 'reused-existing-routing-renamed-operations'"), 'runner must return reused routing success only from an accepted context');

[
  "return 'Blue Bottle'",
  "'Coffee & Tea'",
  "'Craft Matcha'",
  "'NOLA'",
  "'Kyoto Style Espresso'",
  "'Vanilla Chicory Syrup'",
  'Coffee Concentrate',
  'Milk and Flavor Blend',
  'Milk and Chicory Blend',
  'Can and Case Packaging',
  'routing_name:',
  '`Routing - ${brandProduct} Batch`',
  'Prepare Coffee Concentrate',
  'Blend ${modifier}',
  'QC and Release Finished Cases'
].forEach((term) => {
  assert(contains(adapter, term) || contains(runner, term), `Blue Bottle cold-brew naming fixture missing ${term}`);
});
assert(!contains(adapter, 'Blue Bottle Draft Latte'), 'Blue Bottle naming must stay cold-brew, not Draft Latte');
assert(!contains(adapter, "? 'Cold Brew Coffee Variety Pack'"), 'Blue Bottle cold-brew naming must not collapse immediately to generic variety pack');
assert(contains(adapter, 'penalized generic product term'), 'generic cold brew/variety pack terms must be penalized');
assert(contains(adapter, 'concrete website product name'), 'concrete website product names must outrank generic terms');
assert(contains(adapter, 'No website, resolver, product-list, page-text, or LLM naming advisory catalog candidate was available'), 'generic fallback must only be explicit no-candidate fallback');

assert(contains(drawer, 'parseMaybeJsonObjectW455'), 'drawer must normalize object-or-string completed JSON');
assert(contains(drawer, 'completedResultJson'), 'drawer must inspect completedResultJson');
assert(contains(drawer, 'generatedNamesJson'), 'drawer must inspect generatedNamesJson');
assert(contains(drawer, 'sidecarGeneratedNamesJson'), 'drawer must inspect sidecarGeneratedNamesJson');
assert(contains(drawer, 'partialGeneratedNamesJson'), 'drawer must inspect partialGeneratedNamesJson');
assert(contains(adapter, 'completed_with_wip_diagnostic'), 'adapter must treat completed_with_wip_diagnostic as terminal');
assert(contains(drawer, 'componentItem1') && contains(drawer, 'componentItem2') && contains(drawer, 'componentItem3'), 'drawer must import keyed component records');
assert(contains(drawer, "linkAuthorityStatus: plannedOperation ? 'planned_operation_not_record_link'"), 'drawer must keep planned operations as detail rows, not missing-link rows');
assert(contains(drawer, 'isOperationLinkRecordW455'), 'drawer must filter operation-style rows from primary record links');
assert(contains(drawer, 'Routing diagnostic') && contains(drawer, 'Work Order diagnostic'), 'drawer WIP flow must show diagnostic nodes');
assert(contains(drawer, 'erpBuildStoryModelW456'), 'drawer must build a compact ERP Story model');
assert(contains(drawer, 'renderErpBuildStoryW456'), 'drawer must render the compact ERP/Build Story');
assert(contains(drawer, 'idb-w456-erp-build-story'), 'drawer must include scoped ERP Story styling');
assert(contains(drawer, 'recordOpenAuthorityW446(item)'), 'drawer ERP Story links must use verified record authority');
assert(contains(drawer, 'Core records imported; review WIP diagnostic'), 'drawer ERP Story must truthfully describe WIP diagnostics');
assert(contains(drawer, 'idb-w415-cockpit-panel idb-w415-roi-panel'), 'drawer must keep ROI panel visible');
assert(contains(drawer, 'idb-w415-cockpit-panel idb-w415-competitive-panel'), 'drawer must keep competitive panel visible');

assert(contains(adapter, 'completedKeyedResultCaptureW455'), 'poll adapter must pass through keyed completed captures');
assert(contains(adapter, "status: keyedCompletedW455.status === 'completed_with_wip_diagnostic'"), 'poll adapter must return completed_with_wip_diagnostic terminal status');

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
  assertions: 14,
  files: [
    'idb-drawer.user.js',
    'src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb_governed_runner_adapter_w144_suitelet.js',
    'src/FileCabinet/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js'
  ]
}, null, 2));
