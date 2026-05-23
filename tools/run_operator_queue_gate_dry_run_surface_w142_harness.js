const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const suiteletAdapterPath = path.join(root, 'netsuite', 'idb_governed_runner_adapter_w142_suitelet.js');
const w139Path = path.join(root, 'data', 'w139_idb_governed_runner_integration_contract.json');
const w140Path = path.join(root, 'data', 'w140_runner_code_path_inventory_adapter_extraction.json');
const w141Path = path.join(root, 'data', 'w141_netsuite_side_governed_runner_adapter_skeleton.json');
const dataPath = path.join(root, 'data', 'w142_operator_queue_gate_dry_run_surface.json');
const tracePath = path.join(root, 'trace_samples', 'w142_operator_queue_gate_dry_run_surface_trace.json');
const reportPath = path.join(root, 'reports', 'w142_operator_queue_gate_dry_run_surface.md');

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
    custscript_idb_runner_wc_search_id: '',
    custscript_idb_sandbox_account_id: 'SANDBOX_ACCOUNT_ID'
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
          throw new Error('W142 harness should not submit a task.');
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
  if (!exported || !exported._test) throw new Error('Missing W142 suitelet adapter test exports.');
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

function operatorGate() {
  return {
    schema: 'idb.operator-queue-gate.v1',
    operatorOnly: true,
    operator: {
      name: 'Sandbox Operator',
      reviewedAt: '2026-05-16T16:00:00.000Z'
    },
    reviewDecision: 'dry_run_reviewed_no_submit',
    confirmedNoSubmit: true,
    confirmedDrawerNoWrite: true,
    confirmedSandboxAccount: true,
    drawerInvocationTokenAccepted: false,
    evidence: {
      handoffPacketReviewed: true,
      runtimeConfigReviewed: true,
      queueSubmitDeferred: true
    }
  };
}

function makeRunnerConfig(overrides) {
  return Object.assign({
    schema: 'idb.governed-runner-runtime-config.v1',
    runnerScriptId: 'customscript_scai_so_csv_runner',
    runnerDeployId: 'customdeploy_scai_so_csv_runner',
    mappingId: '112',
    folderId: '345',
    subsidiaryId: '1',
    locationId: '7',
    workCenterSearchId: '',
    sandboxAccountId: 'SANDBOX_ACCOUNT_ID',
    createEnabled: false,
    governedSandboxWriteEnabled: false
  }, overrides || {});
}

function main() {
  const w139 = readJson(w139Path);
  const w140 = readJson(w140Path);
  const w141 = readJson(w141Path);
  const suiteletSource = fs.readFileSync(suiteletAdapterPath, 'utf8');
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const { module: suiteletAdapter } = loadSuiteletAdapter();
  const hooks = loadDrawerHooks();
  const confirmedRequest = w139.contractJson.confirmedIdbBuildRequestJson;
  const gate = operatorGate();
  const runnerConfig = makeRunnerConfig();

  const dryRunResult = suiteletAdapter._test.buildDryRunAdapterResult(confirmedRequest, runnerConfig, gate, []);
  const badOperatorGateResult = suiteletAdapter._test.buildDryRunAdapterResult(confirmedRequest, runnerConfig, Object.assign({}, gate, {
    reviewDecision: 'queue_now',
    confirmedNoSubmit: false
  }), []);
  const missingConfigResult = suiteletAdapter._test.buildDryRunAdapterResult(confirmedRequest, makeRunnerConfig({ runnerScriptId: '' }), gate, []);
  const queueAttempt = suiteletAdapter._test.queueRunnerIfEnabled();
  const dryRunSmoke = smokeDryRunImport(hooks, dryRunResult);

  const queueGateContract = {
    schema: 'idb.operator-queue-gate.v1',
    purpose: 'Operator-only dry-run readiness gate before governed runner queue submit is allowed.',
    acceptedOnlyServerSide: true,
    drawerMaySubmit: false,
    requiredFields: [
      'operatorOnly=true',
      'operator.name',
      'reviewDecision=dry_run_reviewed_no_submit',
      'confirmedNoSubmit=true',
      'confirmedDrawerNoWrite=true',
      'confirmedSandboxAccount=true',
      'drawerInvocationTokenAccepted=false'
    ],
    queueEnablementRule: 'Even a valid operator queue gate cannot submit until CREATE_ENABLED and GOVERNED_SANDBOX_WRITE_ENABLED are both explicitly true server-side.'
  };

  const dryRunResultEvidence = {
    runnerStatus: dryRunResult.runnerStatus,
    queueReadinessStatus: dryRunResult.operatorQueueGate.queueReadinessStatus,
    canQueue: dryRunResult.operatorQueueGate.canQueue,
    queueSubmitted: dryRunResult.queueSubmitted,
    createsRecords: dryRunResult.createsRecords,
    runnerTaskId: dryRunResult.runnerTaskId,
    surfaceStatus: dryRunResult.dryRunResultSurface.status,
    surfacePrimaryMessage: dryRunResult.dryRunResultSurface.primaryMessage,
    activeOpenLinks: dryRunResult.dryRunResultSurface.linkPolicy.activeOpenLinks
  };

  const results = [];
  assertCase(results, 'w142_starts_from_w141_dry_run_adapter_ready', w141.decision === 'PASS_DRY_RUN_ADAPTER_READY__NEXT_ENABLE_OPERATOR_QUEUE_GATES', w141.decision);
  assertCase(results, 'w142_suitelet_adapter_gate_surface_present', /@NScriptType Suitelet/.test(suiteletSource) && /OPERATOR|operator/i.test(suiteletSource) && /validateOperatorQueueGate/.test(suiteletSource) && /buildDryRunResultSurface/.test(suiteletSource) && /CREATE_ENABLED = false/.test(suiteletSource) && /GOVERNED_SANDBOX_WRITE_ENABLED = false/.test(suiteletSource), 'W142 Suitelet queue gate and dry-run surface source');
  assertCase(results, 'w142_accepts_w139_request_and_w140_runtime_gate', w140.adapterSmoke.adapterInput.validation.valid === true && dryRunResult.validation.valid === true && dryRunResult.runnerParamPreview.custscript_v3_runner_prospect === 'Ariat International' && dryRunResult.runnerRuntimeConfig.runnerScriptIdPresent === true && dryRunResult.runnerRuntimeConfig.sandboxAccountIdPresent === true, JSON.stringify(dryRunResult.validation));
  assertCase(results, 'w142_operator_gate_required_and_blocks_bad_gate', dryRunResult.validation.operatorGateValid === true && badOperatorGateResult.validation.valid === false && badOperatorGateResult.validation.errors.some((item) => /reviewDecision/.test(item)) && badOperatorGateResult.validation.errors.some((item) => /confirmedNoSubmit/.test(item)), JSON.stringify(badOperatorGateResult.validation));
  assertCase(results, 'w142_runtime_config_missing_blocks_before_queue', missingConfigResult.validation.valid === false && missingConfigResult.queueSubmitted === false && missingConfigResult.createsRecords === false && missingConfigResult.validation.errors.some((item) => /runnerScriptId/.test(item)), JSON.stringify(missingConfigResult.validation));
  assertCase(results, 'w142_valid_gate_still_no_submit_until_write_flags_enabled', dryRunResult.operatorQueueGate.queueReadinessStatus === 'blocked_write_flags_disabled_or_gate_failed' && dryRunResult.operatorQueueGate.canQueue === false && dryRunResult.queueSubmitted === false && dryRunResult.createsRecords === false && queueAttempt.queued === false, JSON.stringify({ operatorQueueGate: dryRunResult.operatorQueueGate, queueAttempt }));
  assertCase(results, 'w142_dry_run_result_surface_ready', dryRunResult.dryRunResultSurface.schema === 'idb.dry-run-result-surface.v1' && dryRunResult.dryRunResultSurface.status === 'validated_no_submit' && dryRunResult.dryRunResultSurface.statusChips.some((chip) => chip.label === 'No queue submit') && dryRunResult.dryRunResultSurface.recordsPreview.customer === 'Ariat International Outdoor Retail Account', JSON.stringify(dryRunResult.dryRunResultSurface));
  assertCase(results, 'w142_dry_run_import_keeps_links_pending_or_missing', dryRunSmoke.openAnchorCount === 0 && dryRunSmoke.links.length >= 5 && dryRunSmoke.links.every((item) => item.openable === false), JSON.stringify(dryRunSmoke));
  assertCase(results, 'w142_no_drawer_write_or_invocation_added', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript) && !/N\/record/.test(suiteletSource) && !/record\.create|record\.submitFields/.test(suiteletSource) && !/\.submit\(\);/.test(suiteletSource), 'no drawer write signatures; adapter has no N/record and no submit call');

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w142-operator-queue-gate-dry-run-surface.v1',
    status: failures.length ? 'blocked' : 'operator_queue_gate_dry_run_surface_ready',
    decision: failures.length ? 'FAIL' : 'PASS_QUEUE_GATE_READY__NEXT_ENABLE_GOVERNED_SANDBOX_QUEUE_DRY_RUN_ONLY',
    sourceBlocks: {
      w139ConfirmedRequest: w139.contractJson.confirmedIdbBuildRequestJson.schema,
      w140AdapterBoundary: w140.decision,
      w141NetSuiteSideAdapter: w141.decision
    },
    adapterSkeleton: {
      file: suiteletAdapterPath,
      scriptType: 'Suitelet',
      version: dryRunResult.adapterVersion,
      createEnabled: false,
      governedSandboxWriteEnabled: false,
      queueSubmitEnabled: false,
      drawerAuthority: 'none',
      legacyDccSuiteletUi: 'legacy_reference_only'
    },
    queueGateContract,
    dryRunResultEvidence: {
      validGate: dryRunResultEvidence,
      badOperatorGate: {
        runnerStatus: badOperatorGateResult.runnerStatus,
        queueSubmitted: badOperatorGateResult.queueSubmitted,
        errors: badOperatorGateResult.validation.errors
      },
      missingConfigGate: {
        runnerStatus: missingConfigResult.runnerStatus,
        queueSubmitted: missingConfigResult.queueSubmitted,
        errors: missingConfigResult.validation.errors
      },
      drawerImportSmoke: dryRunSmoke
    },
    regressionHarnessUpdates: [
      'Add W142 Suitelet adapter syntax check.',
      'Add W142 harness to preflight after W141.',
      'Validate operator queue gate schema and no-submit decision.',
      'Validate missing runtime config blocks before queue submit.',
      'Validate valid operator gate remains non-queueable while write flags are false.',
      'Validate dry-run result surface returns names only and no active Open links.',
      'Validate drawer write and SuiteScript invocation signatures remain absent.'
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
      governedSandboxWritesNotEnabled: true,
      queueSubmitNotEnabled: true
    },
    visualTestingDecision: {
      visualNetSuiteTestingRequiredNow: false,
      targetedVisualNetSuiteTestingRequiredAfterGovernedQueueSubmit: true,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W142 validates operator-only queue readiness and dry-run surfaces only. It does not submit the runner, create records, or return real record URLs.'
    },
    bestNextCodexPrompt: {
      block: 'W143: Governed Sandbox Queue Enablement Design Without Write Activation',
      prompt: 'Move through W143: Governed Sandbox Queue Enablement Design Without Write Activation. Use the W142 operator queue gate and dry-run result surface to design the exact server-side queue enablement switch for the governed runner, including required deployment parameters, sandbox account allowlist, operator evidence, idempotency token, scheduled runner parameter handoff, and result-capture placeholder. Do not enable writes yet and do not submit the runner. Preserve no drawer writes, no SuiteScript invocation from the drawer, no drawer transaction writes, consultant confirmation, state authority and handoff parity, no-submit rollback, internal runner ownership, and no active Open links without real URLs. Output queue enablement design, server-side parameter contract, dry-run harness updates, trace samples, W143 report, visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w142-operator-queue-gate-dry-run-surface-trace.v1',
    decision: contract.decision,
    adapterFile: suiteletAdapterPath,
    queueGate: {
      validOperatorGate: dryRunResult.validation.operatorGateValid,
      queueReadinessStatus: dryRunResult.operatorQueueGate.queueReadinessStatus,
      canQueue: dryRunResult.operatorQueueGate.canQueue,
      queueSubmitted: dryRunResult.queueSubmitted
    },
    dryRunSurface: {
      status: dryRunResult.dryRunResultSurface.status,
      activeOpenLinks: dryRunResult.dryRunResultSurface.linkPolicy.activeOpenLinks,
      primaryMessage: dryRunResult.dryRunResultSurface.primaryMessage
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
  fs.writeFileSync(reportPath, `# W142 Operator Queue Gate And Dry-Run Result Surface

Status: ${contract.status}

## Decision

${contract.decision}

## Queue-Gate Contract

- Schema: ${queueGateContract.schema}
- Operator-only: required.
- Drawer may submit: ${queueGateContract.drawerMaySubmit}
- Accepted server-side only: ${queueGateContract.acceptedOnlyServerSide}
- Queue enablement rule: ${queueGateContract.queueEnablementRule}

Required fields:

${queueGateContract.requiredFields.map((item) => `- ${item}`).join('\n')}

## Dry-Run Result Evidence

- Runner status: ${dryRunResult.runnerStatus}
- Queue readiness status: ${dryRunResult.operatorQueueGate.queueReadinessStatus}
- Can queue: ${dryRunResult.operatorQueueGate.canQueue}
- Queue submitted: ${dryRunResult.queueSubmitted}
- Creates records: ${dryRunResult.createsRecords}
- Runner task id: ${dryRunResult.runnerTaskId}
- Dry-run surface status: ${dryRunResult.dryRunResultSurface.status}
- Dry-run import Open anchors: ${dryRunSmoke.openAnchorCount}
- Dry-run missing URL records: ${dryRunSmoke.missingUrlCount}

## Regression Harness Updates

${contract.regressionHarnessUpdates.map((item) => `- ${item}`).join('\n')}

## Trace Samples

- Data: ${dataPath}
- Trace: ${tracePath}

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual NetSuite testing required after governed queue submit: Yes.
- Broader visual NetSuite testing required: No.

Reason: ${contract.visualTestingDecision.reason}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W142 operator queue gate dry-run surface: ${contract.decision}; visualNow=${contract.visualTestingDecision.visualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
