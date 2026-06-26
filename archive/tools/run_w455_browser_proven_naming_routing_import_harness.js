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
assert(contains(runner, 'namingPayloadFound'), 'runner must keep namingPayloadFound telemetry');
assert(contains(runner, 'namingPayloadParsed'), 'runner must keep namingPayloadParsed telemetry');
assert(contains(runner, 'namingPayloadApplied'), 'runner must keep namingPayloadApplied telemetry');

[
  'Health-Ade Kombucha Variety Pack Case',
  'Health-Ade Kombucha Batch',
  'Organic Tea and Sugar Fermentation Base',
  'Ginger Lemon Flavor Blend',
  'Bottle and Case Packaging',
  'BOM - Health-Ade Kombucha Variety Pack',
  'Revision 1 - Health-Ade Kombucha Variety Pack',
  'Routing - Health-Ade Kombucha Batch',
  'Brew and Ferment Kombucha Base',
  'Flavor, Bottle, and Case Pack',
  'QC and Release Finished Cases'
].forEach((term) => {
  assert(contains(adapter, term) || contains(runner, term), `Health-Ade naming fixture missing ${term}`);
});

assert(contains(runner, 'genericFallbackBlockedTerms'), 'runner must expose genericFallbackBlockedTerms');
assert(!/addStep\(40|addStep\(50|operation_names_by_seq:\s*\{[\s\S]*'40'/.test(runner), 'W455 runner must not default to five WIP operations');

assert(contains(runner, 'verifyAssemblyBomContextW455'), 'runner must verify assembly BOM context before routing');
assert(contains(runner, 'routingBomFieldSkippedBecauseAssemblyBomVerified'), 'runner must return BOM field skip telemetry');
assert(contains(runner, 'skippedBecauseAssemblyBomVerified = true'), 'runner must continue when billofmaterials rejects and assembly BOM is verified');
assert(contains(runner, 'No routing operation lines were accepted'), 'runner must return exact diagnostic when all operation rows fail');
assert(contains(runner, 'attachDefaultVerification'), 'runner must return attach/default verification');
assert(contains(runner, 'staleRoutingDetected'), 'runner must detect stale routing');
assert(contains(runner, 'superseded-with-new-product-routing'), 'runner must report stale routing supersede result');

assert(contains(runner, 'displayReadyRecords'), 'runner result capture must emit displayReadyRecords');
assert(contains(runner, 'recordsArray'), 'runner result capture must emit recordsArray for older import paths');
assert(contains(runner, 'records.routingDiagnostic'), 'runner result capture must preserve keyed routingDiagnostic');
assert(contains(runner, 'records[`operation${index + 1}`]'), 'runner result capture must keep keyed operation detail');

assert(contains(drawer, 'parseMaybeJsonObjectW455'), 'drawer must normalize object-or-string completed JSON');
assert(contains(drawer, 'completedResultJson'), 'drawer must inspect completedResultJson');
assert(contains(drawer, 'generatedNamesJson'), 'drawer must inspect generatedNamesJson');
assert(contains(drawer, 'sidecarGeneratedNamesJson'), 'drawer must inspect sidecarGeneratedNamesJson');
assert(contains(drawer, 'partialGeneratedNamesJson'), 'drawer must inspect partialGeneratedNamesJson');
assert(contains(adapter, 'completed_with_wip_diagnostic'), 'adapter must treat completed_with_wip_diagnostic as terminal');
assert(contains(drawer, 'componentItem1') && contains(drawer, 'componentItem2') && contains(drawer, 'componentItem3'), 'drawer must import keyed component records');
assert(contains(drawer, "linkAuthorityStatus: plannedOperation ? 'planned_operation_not_record_link'"), 'drawer must keep planned operations as detail rows, not missing-link rows');
assert(contains(drawer, 'Routing diagnostic') && contains(drawer, 'Work Order diagnostic'), 'drawer WIP flow must show diagnostic nodes');

assert(contains(adapter, 'completedKeyedResultCaptureW455'), 'poll adapter must pass through keyed completed captures');
assert(contains(adapter, "status: keyedCompletedW455.status === 'completed_with_wip_diagnostic'"), 'poll adapter must return completed_with_wip_diagnostic terminal status');

const bannedInHealthAdeFixture = notContainsAny(
  [
    'Health-Ade Kombucha Variety Pack Case',
    'Health-Ade Kombucha Batch',
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
  assertions: 10,
  files: [
    'idb-drawer.user.js',
    'src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb_governed_runner_adapter_w144_suitelet.js',
    'src/FileCabinet/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js'
  ]
}, null, 2));
