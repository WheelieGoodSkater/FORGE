#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const results = [];

function assertCase(id, pass, detail) {
  results.push({ id, pass: !!pass, detail: detail || '' });
}

const adapter = read('netsuite/idb_governed_runner_adapter_w144_suitelet.js');
const adapterSrc = read('src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb_governed_runner_adapter_w144_suitelet.js');
const runner = read('netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const runnerSrc = read('src/FileCabinet/SuiteScripts/Intelligent Demo Builder/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const drawer = read('idb-drawer.user.js');
const drawerSrc = read('src/FileCabinet/SuiteScripts/Intelligent Demo Builder/idb-drawer.user.js');

const fellowProducts = [
  'Stagg EKG Electric Kettle',
  'Stagg EKG Pro',
  'Carter Move Mug',
  'Opus Conical Burr Grinder'
];
const soloProducts = ['Bonfire', 'Yukon', 'Ranger', 'Mesa'];
const blockedGenericLabels = [
  'Building Materials',
  'Contractor Job Order',
  'Dealer Hardgoods',
  'Dealer Channel Availability',
  'Catalog Product',
  'Product\\s*(?:\\\\/?\\s*)?SKU'
];

assertCase(
  'w464_fellow_public_products_seeded',
  fellowProducts.every((name) => adapter.includes(name)),
  'Fellow website evidence must seed real public product/product-line names.'
);
assertCase(
  'w464_solo_public_products_seeded',
  soloProducts.every((name) => adapter.includes(name)),
  'Solo Stove website evidence must seed real public product/product-line names.'
);
assertCase(
  'w464_generic_lane_labels_blocked_by_ranker',
  blockedGenericLabels.every((term) => new RegExp(term, 'i').test(adapter)) &&
    /channel fulfillment/.test(adapter) &&
    /project fulfillment/.test(adapter) &&
    /readiness/.test(adapter) &&
    /fulfillment/.test(adapter),
  'Lane/workflow labels must be rejected or demoted before selectedCatalogCandidate.'
);
assertCase(
  'w464_fallback_truth_keeps_null_selection_when_no_candidate',
  /const selectedCatalogCandidate = rankedCatalogCandidates\[0\] \|\| null/.test(adapter) &&
    /const fallbackUsed = !selectedCatalogCandidate/.test(adapter) &&
    /selectedProductName: selectedCatalogCandidate \? product : null/.test(adapter) &&
    /missingEvidence: fallbackReason \? \['website catalog product candidate', 'real public product\/product-line evidence'\] : \[\]/.test(adapter),
  'Fallback remains explicit only when no ranked website catalog candidate exists.'
);
assertCase(
  'w464_runner_fallback_resolves_fellow_and_solo_domains',
  fellowProducts.slice(0, 2).every((name) => runner.includes(name)) &&
    soloProducts.every((name) => runner.includes(name)),
  'Runner deterministic fallback must not return generic hardgoods labels for Fellow or Solo Stove.'
);
assertCase(
  'w464_work_order_create_gated_by_effective_wip',
  /if \(effectiveEnableWip\) \{\s*try \{\s*woId = createWorkOrder/s.test(runner) &&
    /status: 'not_requested_wip_disabled'/.test(runner) &&
    /buildWipDisabledWorkOrderTelemetryW463/.test(runner) &&
    /source: 'wip_disabled_work_order_gate_w463'/.test(runner) &&
    /Work Order create, lookup, reuse, and links were not requested/.test(runner),
  'Manufacturing ON plus WIP OFF must not create or reuse Work Orders.'
);
assertCase(
  'w464_work_order_and_routing_rows_hidden_when_wip_disabled',
  /if \(args\.enableWip && args\.woId\)/.test(runner) &&
    /else if \(args\.enableWip && args\.workOrderTelemetry/.test(runner) &&
    /const routingOperations = args\.enableWip \? operationPlanRowsW453/.test(runner),
  'WIP OFF result capture must not surface Work Order, routing, or routing operation rows.'
);
assertCase(
  'w464_sidecar_pending_validation_truth_exported',
  /sidecarImportValidationW464/.test(drawer) &&
    /terminal_capture_found_import_validation_pending/.test(drawer) &&
    /sourceFileId: firstNonBlank/.test(drawer) &&
    /resultCaptureCursor: firstNonBlank/.test(drawer),
  'Drawer export must expose terminal capture source and validation state when import is pending.'
);
assertCase(
  'w464_filecabinet_copies_synced',
  adapter === adapterSrc && runner === runnerSrc && drawer === drawerSrc,
  'Root NetSuite scripts and SuiteCloud FileCabinet copies must remain byte-for-byte synced.'
);

const failed = results.filter((item) => !item.pass);
results.forEach((item) => {
  console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}${item.detail ? ` - ${item.detail}` : ''}`);
});
if (failed.length) {
  console.error(`W464 hardening harness failed: ${failed.map((item) => item.id).join(', ')}`);
  process.exit(1);
}
console.log('W464 website product / WIP OFF / sidecar truth hardening harness passed.');
