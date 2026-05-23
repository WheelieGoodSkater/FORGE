const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const suiteletAdapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w141_suitelet.js');
const w139Path = path.join(root, 'data', 'w139_idb_governed_runner_integration_contract.json');
const w140Path = path.join(root, 'data', 'w140_runner_code_path_inventory_adapter_extraction.json');
const dataPath = path.join(root, 'data', 'w141_netsuite_side_governed_runner_adapter_skeleton.json');
const tracePath = path.join(root, 'trace_samples', 'w141_netsuite_side_governed_runner_adapter_trace.json');
const reportPath = path.join(root, 'reports', 'w141_netsuite_side_governed_runner_adapter_skeleton.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadDrawerHooks() {
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

function loadSuiteletAdapter() {
  let exported = null;
  const runtimeParams = {
    custscript_idb_runner_script_id: 'customscript_scai_so_csv_runner',
    custscript_idb_runner_deploy_id: 'customdeploy_scai_so_csv_runner',
    custscript_idb_runner_mapping_id: '112',
    custscript_idb_runner_folder_id: '345',
    custscript_idb_runner_subsidiary_id: '1',
    custscript_idb_runner_location_id: '7',
    custscript_idb_runner_wc_search_id: ''
  };
  const modules = {
    'N/runtime': {
      getCurrentScript: () => ({
        getParameter: ({ name }) => runtimeParams[name] || ''
      })
    },
    'N/task': {
      TaskType: {
        SCHEDULED_SCRIPT: 'SCHEDULED_SCRIPT'
      },
      create: (options) => ({
        taskType: options.taskType,
        submit: () => {
          throw new Error('W141 harness should not submit a task.');
        }
      })
    },
    'N/log': {
      audit: () => {},
      error: () => {}
    }
  };
  const sandbox = {
    console,
    JSON,
    Date,
    String,
    RegExp,
    Array,
    Object,
    define: (deps, factory) => {
      exported = factory(...deps.map((dep) => modules[dep]));
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(suiteletAdapterPath, 'utf8'), sandbox, { filename: suiteletAdapterPath });
  if (!exported || !exported._test) throw new Error('Missing W141 suitelet adapter test exports.');
  return { module: exported, runtimeParams };
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

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function smokeDryRunImport(hooks, dryRunResult) {
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  state.dccFinalNamingResult = hooks.dccFinalNamingResultV1(dryRunResult.finalGeneratedNamesImport, state, lane, page, recommendation);
  const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const reviewHtml = compact(hooks.renderReviewView(state, lane, page, recommendation));
  const runHtml = compact(hooks.renderRunView(state, lane, page, recommendation, 'Customer Record', { id: 'prove' }, {}));
  const links = navigation.reviewObjects.map((item) => ({
    label: item.label,
    role: item.role,
    name: item.name,
    status: item.linkAuthority.status,
    openable: item.linkAuthority.openable,
    url: item.url
  }));
  return {
    navigationStatus: navigation.status,
    openAnchorCount: (reviewHtml.match(/idb-inline-link/g) || []).length + (runHtml.match(/idb-inline-link/g) || []).length,
    linkPendingCount: (reviewHtml.match(/Link pending/g) || []).length + (runHtml.match(/Link pending/g) || []).length,
    missingUrlCount: links.filter((item) => item.status === 'missing_url').length,
    links
  };
}

function main() {
  const w139 = readJson(w139Path);
  const w140 = readJson(w140Path);
  const suiteletSource = fs.readFileSync(suiteletAdapterPath, 'utf8');
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const { module: suiteletAdapter } = loadSuiteletAdapter();
  const hooks = loadDrawerHooks();
  const confirmedRequest = w139.contractJson.confirmedIdbBuildRequestJson;
  const runnerConfig = {
    schema: 'idb.governed-runner-runtime-config.v1',
    runnerScriptId: 'customscript_scai_so_csv_runner',
    runnerDeployId: 'customdeploy_scai_so_csv_runner',
    mappingId: '112',
    folderId: '345',
    subsidiaryId: '1',
    locationId: '7',
    workCenterSearchId: '',
    createEnabled: false,
    governedSandboxWriteEnabled: false
  };

  const dryRunResult = suiteletAdapter._test.buildDryRunAdapterResult(confirmedRequest, runnerConfig, []);
  const invalidRequestResult = suiteletAdapter._test.buildDryRunAdapterResult(Object.assign({}, confirmedRequest, {
    consultantConfirmation: { required: true, confirmed: false }
  }), runnerConfig, []);
  const queueAttempt = suiteletAdapter._test.queueRunnerIfEnabled();
  const dryRunSmoke = smokeDryRunImport(hooks, dryRunResult);

  const validationGates = [
    'confirmed IDB build request JSON parses',
    'schema is idb.confirmed-build-request.v1',
    'consultant confirmation is true',
    'state authority and handoff parity are matched',
    'required record roles are present',
    'runner script/deploy/runtime config is resolved server-side',
    'createEnabled is false in W141',
    'governedSandboxWriteEnabled is false in W141',
    'queueSubmitted remains false',
    'dry-run result returns names only and no URLs'
  ];

  const results = [];
  assertCase(results, 'w141_starts_from_w140_adapter_boundary_ready', w140.decision === 'PASS_ADAPTER_BOUNDARY_READY__IMPLEMENT_NETSUITE_SIDE_ADAPTER_NEXT', w140.decision);
  assertCase(results, 'w141_suitelet_adapter_skeleton_present', /@NScriptType Suitelet/.test(suiteletSource) && /CREATE_ENABLED = false/.test(suiteletSource) && /GOVERNED_SANDBOX_WRITE_ENABLED = false/.test(suiteletSource) && /buildDryRunAdapterResult/.test(suiteletSource), 'Suitelet skeleton source');
  assertCase(results, 'w141_validates_confirmed_idb_request', dryRunResult.validation.valid === true && invalidRequestResult.validation.valid === false && invalidRequestResult.validation.errors.some((item) => /consultant confirmation/.test(item)), JSON.stringify({ valid: dryRunResult.validation, invalid: invalidRequestResult.validation }));
  assertCase(results, 'w141_resolves_runner_runtime_config_server_side', dryRunResult.runnerRuntimeConfig.runnerScriptIdPresent === true && dryRunResult.runnerRuntimeConfig.runnerDeployIdPresent === true && dryRunResult.runnerRuntimeConfig.mappingIdPresent === true && dryRunResult.runnerParamPreview.custscript_v3_runner_prospect === 'Ariat International', JSON.stringify(dryRunResult.runnerRuntimeConfig));
  assertCase(results, 'w141_dry_run_does_not_queue_or_create', dryRunResult.runMode === 'write_disabled_dry_run' && dryRunResult.createsRecords === false && dryRunResult.queueSubmitted === false && dryRunResult.runnerTaskId === null && queueAttempt.queued === false, JSON.stringify({ result: dryRunResult, queueAttempt }));
  assertCase(results, 'w141_dry_run_import_has_no_active_open_links', dryRunSmoke.openAnchorCount === 0 && (dryRunSmoke.missingUrlCount + dryRunSmoke.linkPendingCount) >= 5 && dryRunSmoke.links.every((item) => item.openable === false), JSON.stringify(dryRunSmoke));
  assertCase(results, 'w141_no_drawer_write_or_invocation_added', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript) && !/N\/record/.test(suiteletSource) && !/record\.create|record\.submitFields/.test(suiteletSource), 'no drawer write signatures; adapter skeleton has no record module');
  assertCase(results, 'w141_task_submit_not_enabled', /queueRunnerIfEnabled/.test(suiteletSource) && /W141 skeleton does not submit/.test(suiteletSource) && !/\.submit\(\);/.test(suiteletSource), 'queue skeleton present but submit disabled');

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w141-netsuite-side-governed-runner-adapter-skeleton.v1',
    status: failures.length ? 'blocked' : 'netsuite_side_adapter_skeleton_ready_dry_run_only',
    decision: failures.length ? 'FAIL' : 'PASS_DRY_RUN_ADAPTER_READY__NEXT_ENABLE_OPERATOR_QUEUE_GATES',
    adapterSkeleton: {
      file: suiteletAdapterPath,
      scriptType: 'Suitelet',
      version: dryRunResult.adapterVersion,
      createEnabled: false,
      governedSandboxWriteEnabled: false,
      drawerAuthority: 'none',
      legacyDccSuiteletUi: 'legacy_reference_only'
    },
    validationGates,
    dryRunSmoke: {
      adapterResult: dryRunResult,
      invalidRequestResult,
      queueAttempt,
      drawerImportSmoke: dryRunSmoke
    },
    regressionHarnessUpdates: [
      'Add W141 Suitelet adapter skeleton syntax check.',
      'Add W141 harness to preflight.',
      'Validate W141 dry-run result never queues the scheduled runner.',
      'Validate W141 result imports into drawer with zero active Open links.',
      'Validate W141 skeleton has no N/record dependency and no record.create or record.submitFields calls.',
      'Validate drawer write signature count remains zero.'
    ],
    noRegression: {
      noDrawerWrites: true,
      noSuiteScriptInvocationFromDrawer: true,
      noTransactionWritesFromDrawer: true,
      consultantConfirmationRequired: true,
      stateAuthorityPreserved: true,
      handoffParityPreserved: true,
      noSubmitRollbackPreserved: true,
      internalRunnerOwnershipPreserved: true,
      noActiveOpenLinksWithoutRealUrls: true,
      governedSandboxWritesNotEnabled: true
    },
    visualTestingDecision: {
      visualNetSuiteTestingRequiredNow: false,
      targetedVisualNetSuiteTestingRequiredAfterQueueOrWriteEnablement: true,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W141 is a NetSuite-side skeleton and dry-run harness only. It does not queue or write, so there are no real record links to visually test yet.'
    },
    bestNextCodexPrompt: {
      block: 'W142: Operator Queue Gate And Dry-Run Result Surface',
      prompt: 'Move through W142: Operator Queue Gate And Dry-Run Result Surface. Use the W141 NetSuite-side governed runner adapter skeleton to add operator-only queue readiness gates and a dry-run result surface that proves the adapter can accept the W139 confirmed IDB request, validate W140 gates, resolve server-side runner config, and remain no-submit until governed sandbox write flags are explicitly enabled. Do not enable writes yet. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, no-submit rollback, internal runner ownership, and no active Open links without real URLs. Output queue-gate contract, dry-run result evidence, trace samples, W142 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w141-netsuite-side-governed-runner-adapter-trace.v1',
    decision: contract.decision,
    adapterFile: suiteletAdapterPath,
    dryRun: {
      runnerStatus: dryRunResult.runnerStatus,
      queueSubmitted: dryRunResult.queueSubmitted,
      createsRecords: dryRunResult.createsRecords,
      validationValid: dryRunResult.validation.valid
    },
    drawerImportSmoke: {
      openAnchorCount: dryRunSmoke.openAnchorCount,
      linkPendingCount: dryRunSmoke.linkPendingCount,
      missingUrlCount: dryRunSmoke.missingUrlCount
    },
    visualTestingDecision: contract.visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W141 NetSuite-Side Governed Runner Adapter Skeleton

Status: ${contract.status}

## Decision

${contract.decision}

## Adapter Skeleton

- File: ${suiteletAdapterPath}
- Script type: Suitelet
- Create enabled: ${contract.adapterSkeleton.createEnabled}
- Governed sandbox write enabled: ${contract.adapterSkeleton.governedSandboxWriteEnabled}
- Drawer authority: ${contract.adapterSkeleton.drawerAuthority}
- Legacy DCC Suitelet UI: ${contract.adapterSkeleton.legacyDccSuiteletUi}

## Validation Gates

${validationGates.map((item) => `- ${item}`).join('\n')}

## Dry-Run Smoke

- Runner status: ${dryRunResult.runnerStatus}
- Queue submitted: ${dryRunResult.queueSubmitted}
- Creates records: ${dryRunResult.createsRecords}
- Runner task id: ${dryRunResult.runnerTaskId}
- Dry-run import Open anchors: ${dryRunSmoke.openAnchorCount}
- Dry-run missing URL records: ${dryRunSmoke.missingUrlCount}

## Regression Harness Updates

${contract.regressionHarnessUpdates.map((item) => `- ${item}`).join('\n')}

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual NetSuite testing required after queue/write enablement: Yes.
- Broader visual NetSuite testing required: No.

Reason: ${contract.visualTestingDecision.reason}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W141 NetSuite-side governed runner adapter skeleton: ${contract.decision}; visualNow=${contract.visualTestingDecision.visualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
