const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w138Path = path.join(root, 'data', 'w138_governed_dcc_runner_creation_result_capture.json');
const dataPath = path.join(root, 'data', 'w139_idb_governed_runner_integration_contract.json');
const tracePath = path.join(root, 'trace_samples', 'w139_idb_governed_runner_integration_trace.json');
const reportPath = path.join(root, 'reports', 'w139_idb_governed_runner_integration_contract.md');

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadHooks() {
  const storage = makeStorage();
  const sandbox = {
    console,
    Date,
    JSON,
    Math,
    RegExp,
    String,
    Number,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    URL,
    Blob: function Blob() {},
    globalThis: null,
    window: {
      self: null,
      top: null,
      location: {
        href: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
        pathname: '/app/center/card.nl',
        search: ''
      },
      localStorage: storage,
      addEventListener: () => {},
      removeEventListener: () => {},
      innerWidth: 1440
    },
    document: {
      title: 'NetSuite Home',
      readyState: 'loading',
      body: { innerText: '', classList: { add: () => {}, remove: () => {} } },
      documentElement: { style: { setProperty: () => {} } },
      head: { appendChild: () => {} },
      createElement: () => ({
        setAttribute: () => {},
        appendChild: () => {},
        addEventListener: () => {},
        remove: () => {},
        classList: { toggle: () => {}, add: () => {}, remove: () => {} },
        style: {}
      }),
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener: () => {}
    },
    __IDB_ENABLE_TEST_HOOKS__: true
  };
  sandbox.globalThis = sandbox;
  sandbox.window.self = sandbox.window;
  sandbox.window.top = sandbox.window;
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function ariatState() {
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    briefPrepared: true,
    activeView: 'review',
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and retail ecommerce categories.',
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.'
    },
    toggles: {},
    acceptedPacket: null,
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: new Date().toISOString()
    }
  };
}

function buildIdbRequest() {
  return {
    schema: 'idb.confirmed-build-request.v1',
    requestId: 'idb-build-ariat-style-ready-001',
    requestStatus: 'confirmed_ready_for_governed_runner',
    producedBy: 'idb_drawer',
    idbPrimarySurface: true,
    legacyDccSuiteletUi: {
      normalWorkflow: false,
      role: 'legacy_reference_only',
      replacement: 'IDB drawer prepares confirmed request; governed runner creates or resolves records.'
    },
    consultantConfirmation: {
      required: true,
      confirmed: true,
      source: 'acceptedPacket'
    },
    stateAuthority: {
      selectedLaneId: 'apparel_accessories',
      confirmedLaneId: 'apparel_accessories',
      exportedLaneId: 'apparel_accessories',
      handoffParityStatus: 'matched',
      noStateMismatch: true
    },
    prospect: {
      name: 'Ariat International',
      website: 'https://www.ariat.com/'
    },
    demoPath: {
      laneId: 'apparel_accessories',
      laneName: 'Apparel & Accessories',
      proofAnchor: 'Style / SKU Matrix',
      familyKey: 'apparelAccessories',
      scenario: 'Style-to-Availability Readiness',
      confirmed: true
    },
    storyInputs: {
      buyerNeed: 'Style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.'
    },
    runnerControls: {
      requestedMode: 'write_disabled_dry_run',
      sandboxWriteModeRequiresOperatorEnablement: true,
      writeAuthority: 'governed_internal_runner_only',
      drawerAuthority: 'prepare_confirm_export_import_only'
    },
    requiredRecords: [
      'customer',
      'demoTransaction',
      'heroItem',
      'matrixProofItem',
      'componentItem'
    ],
    noRegression: {
      noDrawerWrites: true,
      noSuiteScriptInvocationFromDrawer: true,
      noTransactionWritesFromDrawer: true,
      noActiveOpenLinksWithoutRealUrls: true
    }
  };
}

function buildRunnerInputContract(idbBuildRequest) {
  return {
    schema: 'idb.governed-runner-input.v1',
    consumedBy: 'governed_dcc_runner_internal_build_engine',
    inputSource: 'confirmed_idb_build_request',
    idbBuildRequest,
    runModes: [
      'write_disabled_dry_run',
      'governed_sandbox_write'
    ],
    validationGates: [
      'confirmed request schema is valid',
      'sales request complete',
      'demo path confirmed',
      'handoff exported',
      'operator review ready',
      'consultant confirmation true',
      'state authority and handoff parity matched',
      'no state mismatch',
      'idempotency key present',
      'sandbox environment confirmed before writes',
      'runner write flag enabled before governed sandbox write',
      'no drawer invocation token accepted',
      'unsupported record paths rejected'
    ],
    idempotency: {
      required: true,
      key: 'idb-ariat-international-apparel-accessories-style-availability-v1'
    },
    recordPlan: [
      { role: 'customer', recordType: 'customer', createOrResolve: true },
      { role: 'demoTransaction', recordType: 'salesorder', createOrResolve: true },
      { role: 'heroItem', recordType: 'inventoryitem', createOrResolve: true },
      { role: 'matrixProofItem', recordType: 'matrixitem', createOrResolve: true },
      { role: 'componentItem', recordType: 'inventoryitem', createOrResolve: true }
    ],
    drawerForbiddenActions: [
      'record.create',
      'record.submitFields',
      'nlapiSubmitRecord',
      'N/https runner call from drawer',
      'transaction creation from drawer'
    ]
  };
}

function dryRunResult() {
  return {
    schema: 'idb.governed-runner-result.v1',
    runnerStatus: 'validated_not_submitted',
    runMode: 'write_disabled_dry_run',
    createsRecords: false,
    generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
    finalGeneratedNamesImport: {
      schema: 'idb.internal-build-engine.real-record-result.v1',
      runStatus: 'dry_run_validated_not_submitted',
      prospect: 'Ariat International',
      generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
      recordExistenceStatus: 'not_created_dry_run',
      customer: { name: 'Ariat International Outdoor Retail Account' },
      salesOrder: { name: 'Ariat Seasonal Footwear Availability Demo Order' },
      heroItem: { name: 'Ariat Terrain H2O Work Boot Hero Item' },
      matrixItem: { name: 'Ariat Core Boot Size Color Matrix' },
      componentItems: [{ name: 'Ariat Brown Leather Upper Component' }],
      warnings: ['Dry run did not submit; URLs are intentionally absent.'],
      errors: [],
      recoverableBlockers: []
    },
    noSubmitRollback: {
      supported: true,
      performed: true,
      behavior: 'No runner submit occurred; no records were created or resolved; drawer import may display names only with Link pending labels.'
    }
  };
}

function governedSandboxResult() {
  return {
    schema: 'idb.governed-runner-result.v1',
    runnerStatus: 'complete',
    runMode: 'governed_sandbox_write',
    runnerRunId: 'IDB-RUNNER-ARIAT-STYLE-READY-001',
    createsRecords: true,
    runnerEnvironment: 'NetSuite sandbox',
    generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
    drawerImportTarget: 'dccFinalNamingResultV1',
    records: {
      customer: {
        role: 'customer',
        recordType: 'customer',
        name: 'Ariat International Outdoor Retail Account',
        internalId: '91201',
        url: '/app/common/entity/custjob.nl?id=91201',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      demoTransaction: {
        role: 'demoTransaction',
        recordType: 'salesorder',
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        internalId: '91202',
        url: '/app/accounting/transactions/salesord.nl?id=91202',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      heroItem: {
        role: 'heroItem',
        recordType: 'inventoryitem',
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        internalId: '91203',
        url: '/app/common/item/item.nl?id=91203',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      matrixProofItem: {
        role: 'matrixProofItem',
        recordType: 'matrixitem',
        name: 'Ariat Core Boot Size Color Matrix',
        internalId: '91204',
        url: '/app/common/item/item.nl?id=91204',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      componentItems: [
        {
          role: 'componentItem',
          recordType: 'inventoryitem',
          name: 'Ariat Brown Leather Upper Component',
          internalId: '91205',
          url: '/app/common/item/item.nl?id=91205',
          createdOrResolvedBy: 'governed_internal_runner'
        }
      ]
    },
    finalGeneratedNamesImport: {
      schema: 'idb.internal-build-engine.real-record-result.v1',
      runStatus: 'run_complete',
      prospect: 'Ariat International',
      familyKey: 'apparelAccessories',
      scenario: 'Style-to-Availability Readiness',
      generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
      recordExistenceStatus: 'runner_created_or_resolved_targeted_visual_required',
      customer: {
        name: 'Ariat International Outdoor Retail Account',
        id: '91201',
        url: '/app/common/entity/custjob.nl?id=91201'
      },
      salesOrder: {
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        id: '91202',
        url: '/app/accounting/transactions/salesord.nl?id=91202'
      },
      heroItem: {
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        id: '91203',
        url: '/app/common/item/item.nl?id=91203'
      },
      matrixItem: {
        name: 'Ariat Core Boot Size Color Matrix',
        id: '91204',
        url: '/app/common/item/item.nl?id=91204'
      },
      componentItems: [
        {
          name: 'Ariat Brown Leather Upper Component',
          id: '91205',
          url: '/app/common/item/item.nl?id=91205'
        }
      ],
      warnings: [],
      errors: [],
      recoverableBlockers: []
    },
    noSubmitRollback: {
      supported: true,
      behavior: 'If validation fails before submit, the runner returns blocked status and no record plan is promoted.'
    }
  };
}

function smokeImport(hooks, result) {
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  state.dccFinalNamingResult = hooks.dccFinalNamingResultV1(result.finalGeneratedNamesImport, state, lane, page, recommendation);
  const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const reviewHtml = compact(hooks.renderReviewView(state, lane, page, recommendation));
  const runHtml = compact(hooks.renderRunView(state, lane, page, recommendation, 'Customer Record', { id: 'prove' }, {}));
  const links = navigation.reviewObjects.map((item) => ({
    label: item.label,
    role: item.role,
    name: item.name,
    id: item.id,
    url: item.url,
    status: item.linkAuthority.status,
    openable: item.linkAuthority.openable,
    openableUrl: item.openableUrl
  }));
  return {
    navigationStatus: navigation.status,
    reviewHtml,
    runHtml,
    links,
    openAnchorCount: (reviewHtml.match(/idb-inline-link/g) || []).length + (runHtml.match(/idb-inline-link/g) || []).length,
    linkPendingCount: (reviewHtml.match(/Link pending/g) || []).length + (runHtml.match(/Link pending/g) || []).length,
    missingUrlCount: links.filter((item) => item.status === 'missing_url').length,
    activeOpenLinksWithoutRealUrls: links.filter((item) => item.openable && !/\/app\/(common\/entity\/custjob|accounting\/transactions\/salesord|common\/item\/item)\.nl\?id=\d+$/.test(item.url || '')).length,
    buildResultsUseImportedNames: /Ariat International Outdoor Retail Account/.test(reviewHtml) && /Ariat Seasonal Footwear Availability Demo Order/.test(reviewHtml),
    runUsesImportedNames: /Ariat International Outdoor Retail Account/.test(runHtml) && /Ariat Seasonal Footwear Availability Demo Order/.test(runHtml)
  };
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w138 = readJson(w138Path);
  const idbBuildRequest = buildIdbRequest();
  const runnerInputContract = buildRunnerInputContract(idbBuildRequest);
  const writeDisabledDryRunBehavior = dryRunResult();
  const governedSandboxWriteBehavior = {
    mode: 'governed_sandbox_write',
    createsRecords: true,
    enabledOnlyWhen: [
      'NetSuite runtime is sandbox',
      'operator review ready',
      'runner write flag enabled',
      'confirmed IDB request passes parity gates'
    ],
    recordCreationAuthority: 'governed_internal_runner_only',
    drawerAuthority: 'import_result_only_after_runner_result'
  };
  const runnerResultJson = governedSandboxResult();
  const dryRunSmoke = smokeImport(hooks, writeDisabledDryRunBehavior);
  const governedWriteSmoke = smokeImport(hooks, runnerResultJson);
  const recordEntries = [
    runnerResultJson.records.customer,
    runnerResultJson.records.demoTransaction,
    runnerResultJson.records.heroItem,
    runnerResultJson.records.matrixProofItem,
    ...runnerResultJson.records.componentItems
  ];
  const allRunnerOwnedRecords = recordEntries.every((record) => record.createdOrResolvedBy === 'governed_internal_runner' && /^\d+$/.test(record.internalId) && /\/app\/(common\/entity\/custjob|accounting\/transactions\/salesord|common\/item\/item)\.nl\?id=\d+$/.test(record.url));

  const results = [];
  assertCase(results, 'w139_starts_from_w138_runner_capture_ready', w138.decision === 'PASS_CONTRACT_READY__RUNNER_EXECUTION_REQUIRED', w138.decision);
  assertCase(results, 'w139_idb_is_primary_and_dcc_ui_is_legacy', idbBuildRequest.idbPrimarySurface === true && idbBuildRequest.legacyDccSuiteletUi.normalWorkflow === false && idbBuildRequest.legacyDccSuiteletUi.role === 'legacy_reference_only', JSON.stringify(idbBuildRequest.legacyDccSuiteletUi));
  assertCase(results, 'w139_confirmed_idb_request_ready_for_runner', idbBuildRequest.requestStatus === 'confirmed_ready_for_governed_runner' && idbBuildRequest.consultantConfirmation.confirmed === true && idbBuildRequest.stateAuthority.handoffParityStatus === 'matched' && idbBuildRequest.requiredRecords.length === 5, JSON.stringify(idbBuildRequest));
  assertCase(results, 'w139_runner_input_gates_define_write_boundary', runnerInputContract.consumedBy === 'governed_dcc_runner_internal_build_engine' && runnerInputContract.validationGates.includes('sandbox environment confirmed before writes') && runnerInputContract.validationGates.includes('no drawer invocation token accepted') && runnerInputContract.drawerForbiddenActions.includes('transaction creation from drawer'), JSON.stringify(runnerInputContract.validationGates));
  assertCase(results, 'w139_write_disabled_dry_run_has_no_open_links', writeDisabledDryRunBehavior.createsRecords === false && dryRunSmoke.openAnchorCount === 0 && (dryRunSmoke.linkPendingCount + dryRunSmoke.missingUrlCount) >= 5 && dryRunSmoke.activeOpenLinksWithoutRealUrls === 0, JSON.stringify(dryRunSmoke.links));
  assertCase(results, 'w139_governed_sandbox_result_shape_has_real_urls_only', runnerResultJson.createsRecords === true && runnerResultJson.runnerStatus === 'complete' && allRunnerOwnedRecords && governedWriteSmoke.openAnchorCount >= 8 && governedWriteSmoke.linkPendingCount === 0 && governedWriteSmoke.activeOpenLinksWithoutRealUrls === 0, JSON.stringify(recordEntries));
  assertCase(results, 'w139_drawer_keeps_no_write_no_invocation_boundary', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'no drawer write/invocation signatures present');

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w139-idb-governed-runner-integration-contract.v1',
    status: failures.length ? 'blocked' : 'idb_governed_runner_integration_contract_ready',
    decision: failures.length ? 'FAIL' : 'PASS_CONTRACT_READY__IMPLEMENT_RUNNER_ADAPTER_NEXT',
    productAuthority: {
      primaryConsultantProduct: 'Intelligent Demo Builder drawer',
      legacyDccSuiteletUi: 'legacy_reference_only',
      recordCreationEngine: 'governed_dcc_runner_internal_build_engine',
      normalOperatorPath: 'IDB confirmed request -> governed runner adapter -> runner result JSON -> IDB import'
    },
    contractJson: {
      confirmedIdbBuildRequestJson: idbBuildRequest,
      runnerInputContract,
      writeDisabledDryRunBehavior,
      governedSandboxWriteBehavior,
      runnerResultJson
    },
    importSmokeHarness: {
      dryRunImportSmoke: dryRunSmoke,
      governedSandboxResultImportSmoke: governedWriteSmoke
    },
    traceSamples: {
      requestAccepted: {
        event: 'idb_confirmed_build_request_exported',
        requestId: idbBuildRequest.requestId,
        handoffParityStatus: idbBuildRequest.stateAuthority.handoffParityStatus,
        writeAuthority: idbBuildRequest.runnerControls.writeAuthority
      },
      dryRunNoSubmitRollback: {
        event: 'runner_dry_run_validated_not_submitted',
        createsRecords: false,
        openAnchorCount: dryRunSmoke.openAnchorCount,
        linkPendingCount: dryRunSmoke.linkPendingCount,
        missingUrlCount: dryRunSmoke.missingUrlCount
      },
      governedResultImport: {
        event: 'governed_runner_result_imported',
        runnerRunId: runnerResultJson.runnerRunId,
        verifiedOpenableCount: governedWriteSmoke.links.filter((item) => item.status === 'verified_openable').length,
        generatedRecordOwner: runnerResultJson.generatedRecordOwner
      }
    },
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
      targetedVisualNetSuiteTestingRequiredAfterGovernedWrite: true,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W139 is a contract and harness layer. Targeted visual NetSuite testing becomes required only after the governed runner adapter executes sandbox writes and returns actual record URLs.'
    },
    bestNextCodexPrompt: {
      block: 'W140: Runner Code Path Inventory And Adapter Extraction',
      prompt: 'Move through W140: Runner Code Path Inventory And Adapter Extraction. Treat IDB as the primary consultant-facing product and the old DCC Suitelet UI as legacy. Inventory the governed DCC runner/internal build logic that currently creates or resolves Customer, demo transaction, hero item, matrix/proof item, and component item records. Extract the reusable runner adapter boundary that can consume the W139 confirmed IDB build request JSON and produce the W139 governed runner result JSON. Do not wire drawer writes, do not invoke SuiteScript from the drawer, and do not create transactions from the drawer. Preserve consultant confirmation, state authority and handoff parity, no-submit rollback, internal runner ownership, and no active Open links without real URLs. Output code-path inventory, adapter design, implementation steps, regression harness updates, W140 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w139-idb-governed-runner-integration-trace.v1',
    decision: contract.decision,
    productAuthority: contract.productAuthority,
    dryRun: {
      createsRecords: writeDisabledDryRunBehavior.createsRecords,
      openAnchorCount: dryRunSmoke.openAnchorCount,
      linkPendingCount: dryRunSmoke.linkPendingCount,
      missingUrlCount: dryRunSmoke.missingUrlCount
    },
    governedSandboxResult: {
      createsRecords: runnerResultJson.createsRecords,
      openAnchorCount: governedWriteSmoke.openAnchorCount,
      linkPendingCount: governedWriteSmoke.linkPendingCount,
      verifiedOpenableCount: governedWriteSmoke.links.filter((item) => item.status === 'verified_openable').length
    },
    recordExistenceProvenInThisHarness: false,
    visualTestingDecision: contract.visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W139 IDB Governed Runner Integration Contract

Status: ${contract.status}

## Decision

${contract.decision}

## Product Authority

- Primary consultant product: ${contract.productAuthority.primaryConsultantProduct}
- Legacy DCC Suitelet UI: ${contract.productAuthority.legacyDccSuiteletUi}
- Record creation engine: ${contract.productAuthority.recordCreationEngine}
- Normal operator path: ${contract.productAuthority.normalOperatorPath}

## Contract JSON

- Confirmed IDB request schema: ${idbBuildRequest.schema}
- Runner input schema: ${runnerInputContract.schema}
- Dry-run result schema: ${writeDisabledDryRunBehavior.schema}
- Governed runner result schema: ${runnerResultJson.schema}
- Required records: ${idbBuildRequest.requiredRecords.join(', ')}

## Runner Validation Gates

${runnerInputContract.validationGates.map((item) => `- ${item}`).join('\n')}

## Dry-Run Smoke

- Creates records: ${writeDisabledDryRunBehavior.createsRecords}
- Open anchors: ${dryRunSmoke.openAnchorCount}
- Link pending labels: ${dryRunSmoke.linkPendingCount}
- Missing URL records: ${dryRunSmoke.missingUrlCount}
- Active Open links without real URLs: ${dryRunSmoke.activeOpenLinksWithoutRealUrls}

## Governed Sandbox Result Smoke

- Creates records: ${runnerResultJson.createsRecords}
- Runner owner: ${runnerResultJson.generatedRecordOwner}
- Open anchors from real URL shape: ${governedWriteSmoke.openAnchorCount}
- Link pending labels: ${governedWriteSmoke.linkPendingCount}
- Active Open links without real URLs: ${governedWriteSmoke.activeOpenLinksWithoutRealUrls}

## No-Regression Boundaries

- No drawer writes: ${contract.noRegression.noDrawerWrites}
- No SuiteScript invocation from drawer: ${contract.noRegression.noSuiteScriptInvocationFromDrawer}
- No transaction writes from drawer: ${contract.noRegression.noTransactionWritesFromDrawer}
- Consultant confirmation required: ${contract.noRegression.consultantConfirmationRequired}
- State authority and handoff parity preserved: ${contract.noRegression.stateAuthorityPreserved && contract.noRegression.handoffParityPreserved}
- No-submit rollback preserved: ${contract.noRegression.noSubmitRollbackPreserved}
- Internal runner ownership preserved: ${contract.noRegression.internalRunnerOwnershipPreserved}
- No active Open links without real URLs: ${contract.noRegression.noActiveOpenLinksWithoutRealUrls}

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual NetSuite testing required after governed write: Yes.
- Broader visual NetSuite testing required: No.

Reason: ${contract.visualTestingDecision.reason}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W139 IDB governed runner integration contract: ${contract.decision}; visualNow=${contract.visualTestingDecision.visualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
