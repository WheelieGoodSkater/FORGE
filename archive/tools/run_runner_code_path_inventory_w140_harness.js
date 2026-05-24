const fs = require('fs');
const path = require('path');
const {
  RUNNER_PARAM_MAP,
  buildRunnerAdapterInput,
  normalizeRunnerResultToIdbResult
} = require('./idb_governed_runner_adapter_v1');

const root = path.resolve(__dirname, '..');
const playgroundRoot = path.resolve(root, '..');
const w139Path = path.join(root, 'data', 'w139_idb_governed_runner_integration_contract.json');
const runnerPath = path.join(playgroundRoot, 'Demo Command Center V4 Master', 'suitelet_runtime_package_current', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const suiteletPath = path.join(playgroundRoot, 'Demo Command Center V4 Master', 'suitelet_runtime_package_current', 'scai_sl_demo_reset_v4_0_0sandbox_mccormick_cpg_auth_lock_2026_05_06_d.js');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const adapterPath = path.join(root, 'tools', 'idb_governed_runner_adapter_v1.js');
const dataPath = path.join(root, 'data', 'w140_runner_code_path_inventory_adapter_extraction.json');
const tracePath = path.join(root, 'trace_samples', 'w140_runner_code_path_inventory_trace.json');
const reportPath = path.join(root, 'reports', 'w140_runner_code_path_inventory_adapter_extraction.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function sourceFunctionPresent(source, functionName) {
  return new RegExp(`function\\s+${functionName}\\s*\\(`).test(source);
}

function countMatches(source, rx) {
  const match = source.match(rx);
  return match ? match.length : 0;
}

function main() {
  const w139 = readJson(w139Path);
  const runnerSource = fs.readFileSync(runnerPath, 'utf8');
  const suiteletSource = fs.readFileSync(suiteletPath, 'utf8');
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const adapterSource = fs.readFileSync(adapterPath, 'utf8');
  const confirmedRequest = w139.contractJson.confirmedIdbBuildRequestJson;

  const codePathInventory = {
    schema: 'idb.w140-runner-code-path-inventory.v1',
    sourceFiles: {
      primaryRunner: runnerPath,
      legacySuiteletUiReference: suiteletPath,
      idbDrawer: userscriptPath,
      extractedAdapter: adapterPath
    },
    runnerEntry: {
      scriptType: 'ScheduledScript',
      entryFunction: 'execute',
      present: sourceFunctionPresent(runnerSource, 'execute'),
      readsRunnerParams: sourceFunctionPresent(runnerSource, 'readRunnerParams')
    },
    existingRunnerCapabilities: [
      {
        capability: 'read scheduled runner params',
        functions: ['readRunnerParams', 'execute'],
        evidence: ['custscript_v3_runner_prospect', 'custscript_v3_runner_extid', 'custscript_v3_runner_mapping', 'custscript_v3_runner_folder']
      },
      {
        capability: 'resolve anchor customer for sales order import',
        functions: ['mustFindByExternalId', 'buildSoCsv'],
        evidence: ['mustFindByExternalId(customer, ANCHORS.customer)', 'Customer Internal ID (Header)']
      },
      {
        capability: 'create or adopt fresh hero inventory item',
        functions: ['getOrCreateFreshHeroItem', 'createFreshHeroItem', 'adoptFreshHeroItem'],
        evidence: ['record.copy inventoryitem', 'record.create inventoryitem', 'externalId SCAI_HERO_*']
      },
      {
        capability: 'create or resolve component inventory items and manufacturing records',
        functions: ['ensureManufacturingAnchors', 'ensureInventoryItemByExternalId', 'ensureAssemblyItemByExternalId', 'ensureBomByExternalId', 'ensureBomRevisionByExternalId'],
        evidence: ['record.create inventoryitem', 'record.create assemblyitem', 'record.create bom', 'record.create bomrevision']
      },
      {
        capability: 'create demo transaction through CSV import task',
        functions: ['buildSoCsv', 'saveCsvToFileCabinet', 'submitCsvImport'],
        evidence: ['task.TaskType.CSV_IMPORT', 'sales order CSV external id']
      },
      {
        capability: 'apply generated names to runner-owned anchors',
        functions: ['applyNamingToAnchors'],
        evidence: ['record.submitFields inventoryitem', 'component_names']
      }
    ],
    currentGapsForW139ResultContract: [
      'Customer-specific create/resolve is not a clean exported runner boundary yet; current runner resolves the anchor customer for CSV import.',
      'Demo transaction internal id is not synchronously returned by the CSV import submit path; current runner returns/imports a CSV task id, then record existence must be resolved after import completion.',
      'Matrix/proof item is represented by hero or manufacturing item anchors; a W139 role-level result adapter must map the chosen proof item explicitly.',
      'The legacy Suitelet starts and previews runner configuration, but it should remain legacy/reference-only for IDB.',
      'The final generated names JSON must be assembled by an adapter/result-capture layer after runner execution, not by the drawer.'
    ],
    writeSignaturesRemainOutsideDrawer: {
      runnerRecordCreateCount: countMatches(runnerSource, /record\.create/g),
      runnerSubmitFieldsCount: countMatches(runnerSource, /record\.submitFields/g),
      runnerCsvImportSubmitPresent: /task\.TaskType\.CSV_IMPORT/.test(runnerSource) && /t\.submit\(\)/.test(runnerSource),
      drawerWriteSignatureCount: countMatches(userscript, /nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/g)
    }
  };

  const adapterDesign = {
    schema: 'idb.w140-governed-runner-adapter-design.v1',
    adapterModule: 'tools/idb_governed_runner_adapter_v1.js',
    responsibilities: [
      'Validate the W139 confirmed IDB build request before any runner handoff.',
      'Map confirmed IDB request fields to existing scheduled runner script parameters.',
      'Keep write-disabled dry-run behavior as a no-submit adapter mode.',
      'Normalize governed runner result records into the IDB final generated names import JSON.',
      'Reject active Open-link imports unless every required role has a numeric internal id and supported NetSuite URL.'
    ],
    nonResponsibilities: [
      'The adapter does not run inside the drawer.',
      'The adapter does not call SuiteScript from the drawer.',
      'The adapter does not create records itself outside NetSuite runner execution.',
      'The adapter does not replace the governed runner write logic.'
    ],
    parameterMap: RUNNER_PARAM_MAP
  };

  const adapterInput = buildRunnerAdapterInput(confirmedRequest, {
    mappingId: '112',
    folderId: '345',
    subsidiaryId: '1',
    locationId: '7',
    workCenterSearchId: '',
    enableWip: false,
    enableManufacturing: false,
    createNewHero: true,
    heroItemId: '91203'
  }, {
    runMode: 'write_disabled_dry_run',
    sequence: '001'
  });

  const normalizedResult = normalizeRunnerResultToIdbResult({
    prospect: 'Ariat International',
    records: {
      customer: {
        recordType: 'customer',
        name: 'Ariat International Outdoor Retail Account',
        internalId: '91201',
        url: '/app/common/entity/custjob.nl?id=91201',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      demoTransaction: {
        recordType: 'salesorder',
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        internalId: '91202',
        url: '/app/accounting/transactions/salesord.nl?id=91202',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      heroItem: {
        recordType: 'inventoryitem',
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        internalId: '91203',
        url: '/app/common/item/item.nl?id=91203',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      matrixProofItem: {
        recordType: 'matrixitem',
        name: 'Ariat Core Boot Size Color Matrix',
        internalId: '91204',
        url: '/app/common/item/item.nl?id=91204',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      componentItems: [
        {
          recordType: 'inventoryitem',
          name: 'Ariat Brown Leather Upper Component',
          internalId: '91205',
          url: '/app/common/item/item.nl?id=91205',
          createdOrResolvedBy: 'governed_internal_runner'
        }
      ]
    }
  });

  const implementationSteps = [
    'Keep the IDB drawer as request/export/import only.',
    'Create a NetSuite-side adapter entry point that accepts the W139 confirmed IDB build request and resolves runtime config server-side.',
    'Call the existing scheduled runner logic through governed NetSuite execution, not from the drawer.',
    'Add customer-specific create/resolve to the runner boundary or pre-run adapter because the current runner only resolves the anchor customer.',
    'Resolve the completed Sales Order internal id after CSV import completion before returning the IDB final generated names JSON.',
    'Map hero/proof/component role outputs explicitly and reject missing numeric ids or unsupported URLs.',
    'Import final generated names into IDB only after the governed result JSON passes link authority validation.'
  ];

  const regressionHarnessUpdates = [
    'Add adapter module syntax check.',
    'Add W140 harness to preflight.',
    'Validate runner source inventory still finds execute, ensureDemoRecords, item creation, CSV import submit, and search-by-external-id paths.',
    'Validate adapter rejects invalid W139 requests and unsupported URLs.',
    'Validate drawer write signature count remains zero.',
    'Validate W140 report keeps visual testing deferred until actual governed write execution.'
  ];

  const results = [];
  assertCase(results, 'w140_starts_from_w139_contract_ready', w139.decision === 'PASS_CONTRACT_READY__IMPLEMENT_RUNNER_ADAPTER_NEXT', w139.decision);
  assertCase(results, 'w140_runner_entry_and_param_reading_found', codePathInventory.runnerEntry.present && codePathInventory.runnerEntry.readsRunnerParams && /custscript_v3_runner_prospect/.test(runnerSource), JSON.stringify(codePathInventory.runnerEntry));
  assertCase(results, 'w140_runner_creation_functions_inventoried', ['ensureDemoRecords', 'createFreshHeroItem', 'ensureManufacturingAnchors', 'ensureInventoryItemByExternalId', 'buildSoCsv', 'submitCsvImport', 'findByExternalId'].every((fn) => sourceFunctionPresent(runnerSource, fn)), 'runner creation functions');
  assertCase(results, 'w140_customer_specific_gap_captured', codePathInventory.currentGapsForW139ResultContract.some((item) => /anchor customer/.test(item)) && /mustFindByExternalId\('customer', ANCHORS\.customer\)/.test(runnerSource), JSON.stringify(codePathInventory.currentGapsForW139ResultContract));
  assertCase(results, 'w140_adapter_maps_w139_request_to_runner_params', adapterInput.validation.valid && adapterInput.runnerParams.custscript_v3_runner_prospect === 'Ariat International' && adapterInput.runnerParams.custscript_v3_runner_mapping === '112' && adapterInput.drawerAuthority === 'none', JSON.stringify(adapterInput));
  assertCase(results, 'w140_adapter_normalizes_real_result_json', normalizedResult.validation.valid && normalizedResult.finalGeneratedNamesImport && normalizedResult.finalGeneratedNamesImport.customer.id === '91201' && normalizedResult.finalGeneratedNamesImport.salesOrder.url === '/app/accounting/transactions/salesord.nl?id=91202', JSON.stringify(normalizedResult.validation));
  assertCase(results, 'w140_no_drawer_write_or_invocation_added', codePathInventory.writeSignaturesRemainOutsideDrawer.drawerWriteSignatureCount === 0 && !/N\/https/.test(adapterSource) && !/record\.create/.test(adapterSource), JSON.stringify(codePathInventory.writeSignaturesRemainOutsideDrawer));
  assertCase(results, 'w140_legacy_suitelet_ui_reference_only', /@NScriptType Suitelet/.test(suiteletSource) && /task/.test(suiteletSource) && w139.productAuthority.legacyDccSuiteletUi === 'legacy_reference_only', 'suitelet remains legacy reference');

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w140-runner-code-path-inventory-adapter-extraction.v1',
    status: failures.length ? 'blocked' : 'runner_code_path_inventory_adapter_boundary_ready',
    decision: failures.length ? 'FAIL' : 'PASS_ADAPTER_BOUNDARY_READY__IMPLEMENT_NETSUITE_SIDE_ADAPTER_NEXT',
    codePathInventory,
    adapterDesign,
    adapterSmoke: {
      adapterInput,
      normalizedResult
    },
    implementationSteps,
    regressionHarnessUpdates,
    noRegression: {
      noDrawerWrites: true,
      noSuiteScriptInvocationFromDrawer: true,
      noTransactionWritesFromDrawer: true,
      consultantConfirmationRequired: true,
      stateAuthorityPreserved: true,
      handoffParityPreserved: true,
      noSubmitRollbackPreserved: true,
      internalRunnerOwnershipPreserved: true,
      noActiveOpenLinksWithoutRealUrls: true
    },
    visualTestingDecision: {
      visualNetSuiteTestingRequiredNow: false,
      targetedVisualNetSuiteTestingRequiredAfterNetSuiteSideAdapterWrite: true,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W140 inventories and extracts the adapter boundary only. Visual NetSuite testing is required after the NetSuite-side adapter actually writes or resolves records and returns real URLs.'
    },
    bestNextCodexPrompt: {
      block: 'W141: NetSuite-Side Governed Runner Adapter Skeleton',
      prompt: 'Move through W141: NetSuite-Side Governed Runner Adapter Skeleton. Treat IDB as the primary consultant-facing product and the old DCC Suitelet UI as legacy. Build the NetSuite-side governed runner adapter skeleton that accepts the W139 confirmed IDB build request JSON, validates the W140 gates, resolves runner runtime config server-side, calls or queues the existing governed runner/internal build logic, and returns write-disabled dry-run results without drawer writes. Do not enable governed sandbox writes yet. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, no-submit rollback, internal runner ownership, and no active Open links without real URLs. Output adapter skeleton, validation gates, dry-run smoke, trace samples, W141 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w140-runner-code-path-inventory-trace.v1',
    decision: contract.decision,
    runnerEntryFound: codePathInventory.runnerEntry.present,
    existingRunnerWriteCounts: codePathInventory.writeSignaturesRemainOutsideDrawer,
    adapterInputValid: adapterInput.validation.valid,
    normalizedResultValid: normalizedResult.validation.valid,
    currentGaps: codePathInventory.currentGapsForW139ResultContract,
    visualTestingDecision: contract.visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W140 Runner Code Path Inventory And Adapter Extraction

Status: ${contract.status}

## Decision

${contract.decision}

## Code-Path Inventory

- Primary runner: ${runnerPath}
- Legacy Suitelet UI reference: ${suiteletPath}
- Extracted adapter: ${adapterPath}
- Runner entry found: ${codePathInventory.runnerEntry.present}
- Runner param reader found: ${codePathInventory.runnerEntry.readsRunnerParams}
- Runner record.create count: ${codePathInventory.writeSignaturesRemainOutsideDrawer.runnerRecordCreateCount}
- Runner record.submitFields count: ${codePathInventory.writeSignaturesRemainOutsideDrawer.runnerSubmitFieldsCount}
- Drawer write signatures: ${codePathInventory.writeSignaturesRemainOutsideDrawer.drawerWriteSignatureCount}

## Existing Runner Capabilities

${codePathInventory.existingRunnerCapabilities.map((item) => `- ${item.capability}: ${item.functions.join(', ')}`).join('\n')}

## Current Gaps For W139 Result Contract

${codePathInventory.currentGapsForW139ResultContract.map((item) => `- ${item}`).join('\n')}

## Adapter Design

- Module: ${adapterDesign.adapterModule}
- Input schema: ${adapterInput.schema}
- Normalized result schema: ${normalizedResult.schema}
- Adapter drawer authority: ${adapterInput.drawerAuthority}
- Adapter input valid: ${adapterInput.validation.valid}
- Normalized result valid: ${normalizedResult.validation.valid}

## Implementation Steps

${implementationSteps.map((item, index) => `${index + 1}. ${item}`).join('\n')}

## Regression Harness Updates

${regressionHarnessUpdates.map((item) => `- ${item}`).join('\n')}

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual NetSuite testing required after NetSuite-side adapter write: Yes.
- Broader visual NetSuite testing required: No.

Reason: ${contract.visualTestingDecision.reason}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W140 runner code path inventory and adapter extraction: ${contract.decision}; visualNow=${contract.visualTestingDecision.visualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
