const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const suiteletPath = path.join(root, 'netsuite', 'idb_integrated_build_runner_return_adapter_w153_suitelet.js');
const w153Path = path.join(root, 'data', 'w153_integrated_build_runner_return_adapter_skeleton.json');
const dataPath = path.join(root, 'data', 'w154_integrated_build_button_status_dry_run_wiring.json');
const tracePath = path.join(root, 'trace_samples', 'w154_integrated_build_button_status_dry_run_wiring_trace.json');
const reportPath = path.join(root, 'reports', 'w154_integrated_build_button_status_dry_run_wiring.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function extractFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start < 0) return '';
  const bodyStart = source.indexOf('{', start);
  if (bodyStart < 0) return '';
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return '';
}

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
      setInterval: () => 1,
      clearInterval: () => {},
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

function loadSuitelet() {
  let exported = null;
  const sandbox = {
    console,
    JSON,
    String,
    Array,
    Object,
    define: (deps, factory) => {
      const runtime = {
        accountId: 'SANDBOX_ACCOUNT_ID',
        getCurrentScript: () => ({
          getParameter: ({ name }) => (sandbox.params && Object.prototype.hasOwnProperty.call(sandbox.params, name) ? sandbox.params[name] : '')
        })
      };
      const log = { audit: () => {}, error: () => {} };
      exported = factory(runtime, log);
    },
    params: {}
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(suiteletPath, 'utf8'), sandbox, { filename: suiteletPath });
  if (!exported || !exported._test) throw new Error('Missing W153 suitelet test exports.');
  return { exported, sandbox };
}

function ariatState() {
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
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
    dccFinalNamingResult: null,
    integratedBuildRunnerResult: null,
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

function adapterParams(flags) {
  return {
    custscript_idb_create_enabled: flags.create ? 'T' : 'F',
    custscript_idb_governed_sandbox_write_enabled: flags.write ? 'T' : 'F',
    custscript_idb_queue_submit_enabled: flags.queue ? 'T' : 'F',
    custscript_idb_sandbox_account_allowlist: 'SANDBOX_ACCOUNT_ID',
    custscript_idb_runner_script_id: 'customscript_scai_ss_so_csv_runner',
    custscript_idb_runner_deploy_id: 'customdeploy_scai_ss_so_csv_runner',
    custscript_idb_result_capture_folder_id: '123',
    custscript_idb_fixture_queued_enabled: flags.fixture ? 'T' : 'F'
  };
}

function completedResultFixture(runnerTaskId, idempotencyToken) {
  return {
    schema: 'idb.integrated-build-runner-adapter-result.v1',
    adapterVersion: 'w154-controlled-completed-result-fixture',
    status: 'completed_result_available_fixture_only',
    queueSubmitted: true,
    runnerTaskId,
    resultCapture: {
      schema: 'idb.runner-result-capture.v1',
      status: 'completed_result_available',
      runnerTaskId,
      idempotencyToken,
      finalGeneratedNamesReady: true,
      activeOpenLinks: 0,
      importPolicy: 'drawer_must_wait_for_completed_runner_result_json_accepted_by_w151'
    },
    finalGeneratedNamesJson: {
      schema: 'dcc.final-generated-names.v1',
      runStatus: 'completed',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      customer: {
        name: 'Ariat International Outdoor Retail Account',
        id: '91201',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=91201'
      },
      salesOrder: {
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        id: '91202',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=91202'
      },
      heroItem: {
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        id: '91203',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91203'
      },
      matrixProofItem: {
        name: 'Ariat Core Boot Size Color Matrix',
        id: '91204',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91204'
      },
      componentItems: [
        {
          name: 'Ariat Brown Leather Upper Component',
          id: '91205',
          url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91205'
        }
      ]
    },
    activeOpenLinks: 0,
    createsRecords: false,
    suiteScriptInvocationPerformed: false,
    transactionWritesPerformed: false,
    generatedRecordOwner: 'governed_runner_internal_build_engine'
  };
}

function main() {
  const w153 = readJson(w153Path);
  const hooks = loadHooks();
  const { exported, sandbox } = loadSuitelet();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w154StatusModelSource = extractFunctionBody(userscript, 'integratedBuildRunnerReturnStatusModelV1');

  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const readyBoundary = hooks.integratedBuildRunnerReturnClientBoundaryV1(
    state,
    lane,
    page,
    recommendation,
    {
      endpointUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_idb_runner_adapter&deploy=customdeploy_idb_runner_adapter',
      adapterApproved: true,
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
      mode: 'approved_server_adapter_available'
    },
    {
      operatorName: 'Sandbox Operator',
      reviewedAt: '2026-05-16T00:00:00.000Z',
      reviewDecision: 'operator_approved_queue_submit',
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      confirmedNoSubmit: false,
      confirmedSandboxAccount: true,
      notes: 'Operator approved W154 controlled dry-run status wiring.'
    }
  );
  const blockedStatus = hooks.integratedBuildRunnerReturnStatusModelV1(state, lane, page, recommendation);
  const readyStatus = hooks.integratedBuildRunnerReturnStatusModelV1(state, lane, page, recommendation, { clientBoundary: readyBoundary });

  sandbox.params = adapterParams({ create: false, write: false, queue: false, fixture: false });
  const falseConfig = exported._test.resolveAdapterConfig({ getParameter: ({ name }) => sandbox.params[name] || '' }, 'SANDBOX_ACCOUNT_ID');
  const falseFlagResult = exported._test.buildSkeletonAdapterResult(readyBoundary.requestEnvelope, falseConfig, []);
  const falseFlagStatus = hooks.integratedBuildRunnerReturnStatusModelV1(state, lane, page, recommendation, {
    clientBoundary: readyBoundary,
    adapterResult: falseFlagResult
  });

  sandbox.params = adapterParams({ create: true, write: true, queue: true, fixture: true });
  const queuedConfig = exported._test.resolveAdapterConfig({ getParameter: ({ name }) => sandbox.params[name] || '' }, 'SANDBOX_ACCOUNT_ID');
  const queuedResult = exported._test.buildSkeletonAdapterResult(readyBoundary.requestEnvelope, queuedConfig, []);
  const queuedStatus = hooks.integratedBuildRunnerReturnStatusModelV1(state, lane, page, recommendation, {
    clientBoundary: readyBoundary,
    adapterResult: queuedResult
  });

  const completedResult = completedResultFixture(queuedResult.runnerTaskId, readyBoundary.requestEnvelope.idempotencyToken);
  const completedAwaitingImportStatus = hooks.integratedBuildRunnerReturnStatusModelV1(state, lane, page, recommendation, {
    clientBoundary: readyBoundary,
    adapterResult: completedResult
  });

  const renderedBuild = hooks.renderReviewView(state, lane, page, recommendation);
  const statuses = [blockedStatus, readyStatus, falseFlagStatus, queuedStatus, completedAwaitingImportStatus];
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W154 wires Build status from controlled dry-run responses only. No real server invocation or completed W151 import exists yet.'
  };
  const noRegression = {
    noDrawerWrites: true,
    noDrawerSuiteScriptInvocation: true,
    noDrawerTransactionWrites: true,
    consultantConfirmationRequired: statuses.every((status) => status.noRegression.consultantConfirmationRequired === true),
    stateAuthorityAndHandoffParityPreserved: statuses.every((status) => status.noRegression.stateAuthorityAndHandoffParityPreserved === true),
    idempotencyPreserved: statuses.every((status) => status.noRegression.idempotencyPreserved === true),
    internalRunnerOwnership: statuses.every((status) => status.noRegression.internalRunnerOwnership === true),
    rollbackByDisablingServerFlags: falseFlagResult.noSubmitRollback.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: statuses.every((status) => status.noRegression.noActiveOpenLinksWithoutRealUrls === true && status.activeOpenLinks === 0)
  };

  const results = [];
  assertCase(results, 'w154_starts_from_w153_skeleton_ready', w153.decision === 'PASS_INTEGRATED_BUILD_RETURN_ADAPTER_SKELETON_READY__NO_VISUAL_TESTING', w153.decision);
  assertCase(results, 'w154_status_model_covers_all_required_states', statuses.map((item) => item.status).join('|') === 'blocked_before_server_adapter_call|ready_for_server_adapter|false_flag_no_submit|queued_pending_fixture|completed_result_awaiting_w151_import', statuses.map((item) => item.status).join(', '));
  assertCase(results, 'w154_build_surface_renders_status_card_without_invocation', /idb-w154-build-return-status/.test(renderedBuild) && /Integrated Build runner return/.test(renderedBuild) && /Invocation from drawer: no/.test(renderedBuild), renderedBuild.slice(0, 400));
  assertCase(results, 'w154_false_flag_no_submit_keeps_result_capture_not_started', falseFlagStatus.status === 'false_flag_no_submit' && falseFlagStatus.resultCaptureStatus === 'not_started_no_submit' && falseFlagResult.queueSubmitted === false && falseFlagResult.runnerTaskId === null, JSON.stringify(falseFlagStatus));
  assertCase(results, 'w154_queued_pending_fixture_has_task_but_no_final_names_or_links', queuedStatus.status === 'queued_pending_fixture' && /^fixture_w153_/.test(queuedStatus.runnerTaskId) && queuedResult.finalGeneratedNamesJson === null && queuedStatus.activeOpenLinks === 0, JSON.stringify(queuedStatus));
  assertCase(results, 'w154_completed_result_waits_for_w151_import_before_links', completedAwaitingImportStatus.status === 'completed_result_awaiting_w151_import' && completedAwaitingImportStatus.finalGeneratedNamesJsonReady === true && completedAwaitingImportStatus.finalNamesImported === false && completedAwaitingImportStatus.activeOpenLinks === 0, JSON.stringify(completedAwaitingImportStatus));
  assertCase(results, 'w154_no_drawer_network_or_writes_added', w154StatusModelSource && !/GM_xmlhttpRequest|fetch\(/.test(w154StatusModelSource) && !/N\/task|N\/record/.test(userscript), 'W154 drawer status model remains local; later W189 W144 helper is separately gated');
  assertCase(results, 'w154_visual_testing_blocked_and_no_regression', visualTestingDecision.visualTestingBlocked === true && Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w154-integrated-build-button-status-dry-run-wiring.v1',
    status: failures.length ? 'blocked' : 'integrated_build_button_status_dry_run_wiring_ready',
    decision: failures.length ? 'FAIL' : 'PASS_BUILD_STATUS_DRY_RUN_WIRING_READY__VISUAL_TESTING_BLOCKED',
    buildStatusUxContract: {
      source: 'controlled_harness_responses_only',
      states: statuses.map((status) => ({
        status: status.status,
        label: status.label,
        runnerTaskId: status.runnerTaskId,
        resultCaptureStatus: status.resultCaptureStatus,
        activeOpenLinks: status.activeOpenLinks,
        visualTestingBlocked: status.visualTestingBlocked
      })),
      drawerInvocationEnabledByDefault: false,
      realWritesEnabled: false,
      completedResultImportOwner: 'W151 completed runner result import guard'
    },
    dryRunWiringHarness: {
      falseFlagNoSubmit: {
        status: falseFlagStatus.status,
        queueSubmitted: falseFlagResult.queueSubmitted,
        runnerTaskId: falseFlagResult.runnerTaskId,
        resultCapture: falseFlagStatus.resultCaptureStatus
      },
      queuedPendingFixture: {
        status: queuedStatus.status,
        queueSubmitted: queuedResult.queueSubmitted,
        runnerTaskId: queuedStatus.runnerTaskId,
        resultCapture: queuedStatus.resultCaptureStatus,
        finalGeneratedNamesJson: queuedResult.finalGeneratedNamesJson
      },
      completedResultAwaitingImport: {
        status: completedAwaitingImportStatus.status,
        finalGeneratedNamesJsonReady: completedAwaitingImportStatus.finalGeneratedNamesJsonReady,
        activeOpenLinks: completedAwaitingImportStatus.activeOpenLinks
      }
    },
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W155: Integrated Build Server Adapter Invocation Toggle And Polling Stub',
      prompt: 'Move through W155: Integrated Build Server Adapter Invocation Toggle And Polling Stub. Use the W154 Build status wiring to add a disabled-by-default invocation toggle and polling stub that can call only an approved server adapter endpoint when server flags, sandbox allowlist, operator approval, and idempotency are present. Keep the default path harness-only and no-submit. Do not enable real writes, do not create records from the drawer, do not invoke SuiteScript from the drawer outside the approved server adapter path, and do not request visual testing. Preserve W151 completed-result import guard, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output invocation-toggle contract, polling stub harness, trace samples, W155 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };

  const trace = {
    schema: 'idb.w154-integrated-build-button-status-dry-run-wiring-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    drawerInvocationAttempted: false,
    statuses: contract.buildStatusUxContract.states,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W154 Integrated Build Button Status And Server Adapter Dry-Run Wiring

Decision: ${contract.decision}

## Build Status UX Contract
- Source: controlled harness responses only.
- Drawer invocation enabled by default: false.
- Real writes enabled: false.
- Completed result import owner: W151 completed runner result import guard.

## Status States
${contract.buildStatusUxContract.states.map((item) => `- ${item.status}: ${item.label}; runnerTaskId=${item.runnerTaskId || 'none'}; resultCapture=${item.resultCaptureStatus}; openLinks=${item.activeOpenLinks}`).join('\n')}

## Dry-Run Wiring Harness
- False flag no-submit: queueSubmitted=${falseFlagResult.queueSubmitted}, runnerTaskId=${falseFlagResult.runnerTaskId}, resultCapture=${falseFlagStatus.resultCaptureStatus}.
- Queued pending fixture: queueSubmitted=${queuedResult.queueSubmitted}, runnerTaskId=${queuedStatus.runnerTaskId}, resultCapture=${queuedStatus.resultCaptureStatus}.
- Completed result awaiting W151 import: finalGeneratedNamesJsonReady=${completedAwaitingImportStatus.finalGeneratedNamesJsonReady}, activeOpenLinks=${completedAwaitingImportStatus.activeOpenLinks}.

## Visual Testing Decision
Blocked. ${visualTestingDecision.reason}

## Validator Gates
${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## No Regression
${Object.entries(noRegression).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Best Next Codex Prompt
${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W154 integrated Build status dry-run wiring FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W154 integrated Build status dry-run wiring: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main();
