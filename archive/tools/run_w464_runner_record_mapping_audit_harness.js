#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const runnerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const runnerCopyPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const packagePath = path.join(root, 'package.json');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function sliceFunction(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start < 0) return '';
  const next = source.indexOf('\n  function ', start + 1);
  return source.slice(start, next > start ? next : source.length);
}

function allPresent(source, needles) {
  return needles.every((needle) => source.indexOf(needle) !== -1);
}

function main() {
  const runner = read(runnerPath);
  const runnerCopy = read(runnerCopyPath);
  const pkg = JSON.parse(read(packagePath));
  const results = [];

  const loadNamingPack = sliceFunction(runner, 'loadPrecomputedNamingPack');
  const applyNames = sliceFunction(runner, 'applyNamingToAnchors');
  const writeSidecar = sliceFunction(runner, 'writeIdbSidecarResultCaptureW453');
  const buildSoCsv = sliceFunction(runner, 'buildSoCsv');
  const buildResolvedSalesOrder = sliceFunction(runner, 'buildResolvedSalesOrderRecordW458');
  const buildPlan = sliceFunction(runner, 'buildProductBuildPlanFromNamesW453');

  assertCase(results, 'w464-runner-copy-synced',
    runnerCopy === runner,
    'The upload runner copy must stay byte-identical to the FileCabinet runner source.');

  assertCase(results, 'w464-naming-payload-consumed-before-record-naming',
    runner.indexOf('const namingPayload = loadPrecomputedNamingPack') < runner.indexOf('applyNamingToAnchors(ids, names') &&
      runner.includes("['custscript_v3_runner_naming_file_id', 'custscript_scai_runner_naming_file_id']") &&
      allPresent(loadNamingPack, [
        'const deterministic = generateNamingPack({ prospect, website, signalText })',
        'const out = Object.assign({}, deterministic, parsed || {})',
        'out.hero_item_name = trimLen(out.hero_item_name, 60)',
        'out.assembly_name = trimLen(out.assembly_name, 60)',
        'out.component_names = out.component_names.map(n => trimLen(n, 60))',
        'out.bom_name = trimLen(out.bom_name, 80)',
        'out.bom_revision_name = trimLen(out.bom_revision_name, 80)',
        'applied: true'
      ]),
    'Runner must consume the approved naming payload and normalize product-line record names before applying them.');

  assertCase(results, 'w464-created-record-names-use-selected-product-line',
    allPresent(applyNames, [
      'buildDifferentiatedNames(names.hero_item_name, extId)',
      'submitFieldsTrackedW457(\'inventoryitem\', Number(ids.heroItemId), heroValues, \'heroItem\')',
      'const asmNameBase = names.assembly_name || names.hero_item_name',
      'submitFieldsTrackedW457(\'assemblyitem\', Number(ids.assemblyId)',
      '{ id: ids.comp1Id, name: names.component_names[0] }',
      '{ id: ids.comp2Id, name: names.component_names[1] }',
      '{ id: ids.comp3Id, name: names.component_names[2] }',
      'buildDifferentiatedNames(c.name, extId)',
      'buildDifferentiatedNames(names.bom_name, extId)',
      'buildDifferentiatedNames(names.bom_revision_name, extId)'
    ]),
    'Hero, assembly, BOM, BOM revision, and component submitFields calls must use naming-pack product names.');

  assertCase(results, 'w464-sidecar-record-display-names-use-selected-product-line',
    allPresent(writeSidecar, [
      'name: names.hero_item_name || `${args.prospect} Finished Good`',
      'name: names.assembly_name || names.hero_item_name || `${args.prospect} Assembly`',
      'name: names.bom_name || `BOM - ${args.prospect}`',
      'name: names.bom_revision_name || `Revision 1 - ${args.prospect}`',
      '{ id: ids.comp1Id, name: names.component_names && names.component_names[0] }',
      '{ id: ids.comp2Id, name: names.component_names && names.component_names[1] }',
      '{ id: ids.comp3Id, name: names.component_names && names.component_names[2] }'
    ]),
    'Result capture display records must mirror the same naming-pack product-line names.');

  assertCase(results, 'w464-sales-order-stays-sales-order',
    allPresent(buildResolvedSalesOrder, [
      "role: 'sales_order'",
      "type: 'salesorder'",
      "label: 'Sales Order'",
      'name: tranid',
      "expectedRole: 'sales_order'"
    ]) &&
      allPresent(writeSidecar, [
        'records.salesOrder = resolvedSalesOrderW458',
        'salesOrder: records.demoTransaction',
        "demandRecordRolePolicy: 'sales_order_only_never_work_order'",
        "blockedLinkRole: 'work_order'"
      ]),
    'Sales Order mapping must remain Sales Order only and must not be satisfied by Work Order demand links.');

  assertCase(results, 'w464-demand-lines-reference-resolved-finished-good',
    runner.includes('const soCsv = buildSoCsv({ extId, prospect, website, agenda, locationId, itemKey: ids.heroItemCsvKey || ids.heroItemExternalId || ANCHORS.heroItem })') &&
      allPresent(buildSoCsv, [
        'const itemKeyResolved = String(itemKey || ANCHORS.heroItem)',
        'itemKeyResolved, loc, \'6\'',
        'itemKeyResolved, loc, \'9\'',
        'itemKeyResolved, loc, \'14\''
      ]),
    'Sales Order CSV demand lines must reference the resolved hero/finished-good item key on every line.');

  assertCase(results, 'w464-product-build-plan-exposes-selection-truth',
    allPresent(buildPlan, [
      'primaryProductCandidate: names.primary_product_candidate || names.hero_item_name || args.prospect || \'\'',
      'catalogCandidates: names.catalogCandidates || []',
      'selectedCatalogCandidate: names.selectedCatalogCandidate || null',
      'selectedProductName: names.selectedProductName || names.primary_product_candidate || \'\'',
      'fallbackUsed: names.fallbackUsed === true',
      'fallbackReason: names.fallbackReason || \'\''
    ]),
    'Product Build Plan must expose selected product-line truth and explicit fallback truth.');

  assertCase(results, 'w464-package-script-registered',
    pkg.scripts && pkg.scripts['harness:runner-record-mapping-audit-w464'] === 'node archive/tools/run_w464_runner_record_mapping_audit_harness.js',
    'Package script should expose this focused runner mapping audit harness.');

  printResults('W464 runner record mapping audit harness', results);
}

main();
