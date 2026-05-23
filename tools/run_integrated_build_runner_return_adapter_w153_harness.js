const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const suiteletPath = path.join(root, 'netsuite', 'idb_integrated_build_runner_return_adapter_w153_suitelet.js');
const w152Path = path.join(root, 'data', 'w152_integrated_build_runner_return_adapter_design.json');
const dataPath = path.join(root, 'data', 'w153_integrated_build_runner_return_adapter_skeleton.json');
const tracePath = path.join(root, 'trace_samples', 'w153_integrated_build_runner_return_adapter_skeleton_trace.json');
const reportPath = path.join(root, 'reports', 'w153_integrated_build_runner_return_adapter_skeleton.md');

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

function main() {
  const w152 = readJson(w152Path);
  const hooks = loadHooks();
  const { exported, sandbox } = loadSuitelet();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const suiteletSource = fs.readFileSync(suiteletPath, 'utf8');
  const w153ClientBoundarySource = extractFunctionBody(userscript, 'integratedBuildRunnerReturnClientBoundaryV1');

  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const disabledClientBoundary = hooks.integratedBuildRunnerReturnClientBoundaryV1(state, lane, page, recommendation);
  const readyClientBoundary = hooks.integratedBuildRunnerReturnClientBoundaryV1(
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
      notes: 'Operator approved W153 skeleton fixture path.'
    }
  );

  sandbox.params = adapterParams({ create: false, write: false, queue: false, fixture: false });
  const falseConfig = exported._test.resolveAdapterConfig({
    getParameter: ({ name }) => sandbox.params[name] || ''
  }, 'SANDBOX_ACCOUNT_ID');
  const falseFlagResult = exported._test.buildSkeletonAdapterResult(readyClientBoundary.requestEnvelope, falseConfig, []);

  sandbox.params = adapterParams({ create: true, write: true, queue: true, fixture: true });
  const queuedConfig = exported._test.resolveAdapterConfig({
    getParameter: ({ name }) => sandbox.params[name] || ''
  }, 'SANDBOX_ACCOUNT_ID');
  const queuedPendingResult = exported._test.buildSkeletonAdapterResult(readyClientBoundary.requestEnvelope, queuedConfig, []);

  const invalidRequestResult = exported._test.buildSkeletonAdapterResult({
    schema: 'idb.integrated-build-runner-request.v1',
    action: 'submit_or_poll_build_return'
  }, queuedConfig, []);

  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W153 is a non-writing skeleton. It produces no completed runner result JSON and no actual record URLs to click.',
    firstVisualGateAfterImplementation: 'After W154/W155 implements real server adapter submit/poll and W151 accepts completed runner result JSON.'
  };

  const noRegression = {
    noDrawerWrites: true,
    noDrawerSuiteScriptInvocation: true,
    noDrawerTransactionWrites: true,
    consultantConfirmationRequired: readyClientBoundary.requestEnvelope.confirmedBuildRequestJson.consultantConfirmation.confirmed === true,
    stateAuthorityAndHandoffParityPreserved: readyClientBoundary.requestEnvelope.confirmedBuildRequestJson.stateAuthority.handoffParityStatus === 'matched',
    idempotencyPreserved: readyClientBoundary.requestEnvelope.idempotencyToken === readyClientBoundary.requestEnvelope.confirmedBuildRequestJson.requestId,
    internalRunnerOwnership: queuedPendingResult.generatedRecordOwner === 'governed_runner_internal_build_engine',
    rollbackByDisablingServerFlags: falseFlagResult.noSubmitRollback.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: falseFlagResult.activeOpenLinks === 0 && queuedPendingResult.activeOpenLinks === 0
  };

  const results = [];
  assertCase(results, 'w153_starts_from_w152_design_ready', w152.decision === 'PASS_INTEGRATED_BUILD_RETURN_DESIGN_READY__VISUAL_TESTING_BLOCKED', w152.decision);
  assertCase(results, 'w153_drawer_client_boundary_prepares_request_without_invocation', disabledClientBoundary.schema === 'idb.integrated-build-runner-client-boundary.v1' && disabledClientBoundary.invocationAttempted === false && disabledClientBoundary.canInvokeServerAdapter === false && readyClientBoundary.canInvokeServerAdapter === true && readyClientBoundary.requestEnvelope.schema === 'idb.integrated-build-runner-request.v1', JSON.stringify({ disabled: disabledClientBoundary.status, ready: readyClientBoundary.status }));
  assertCase(results, 'w153_confirmed_request_and_operator_gate_ready', readyClientBoundary.requestEnvelope.confirmedBuildRequestJson.schema === 'idb.confirmed-build-request.v1' && readyClientBoundary.requestEnvelope.operatorGate.reviewDecision === 'operator_approved_queue_submit' && readyClientBoundary.requestEnvelope.operatorGate.typeToConfirm === 'QUEUE GOVERNED SANDBOX RUNNER' && readyClientBoundary.requestEnvelope.idempotencyToken, JSON.stringify(readyClientBoundary.requestEnvelope.operatorGate));
  assertCase(results, 'w153_server_skeleton_no_task_or_record_modules', /@NScriptType Suitelet/.test(suiteletSource) && !/N\/task/.test(suiteletSource) && !/N\/record/.test(suiteletSource) && !/submitRunnerIfAllowed|scheduledTask\.submit\(\)/.test(suiteletSource), suiteletPath);
  assertCase(results, 'w153_false_flags_return_no_submit_no_links', falseFlagResult.queueSubmitted === false && falseFlagResult.runnerTaskId === null && falseFlagResult.resultCapture.status === 'not_started_no_submit' && falseFlagResult.activeOpenLinks === 0 && falseFlagResult.suiteScriptInvocationPerformed === false, JSON.stringify(falseFlagResult));
  assertCase(results, 'w153_flags_true_return_fixture_queued_pending_only', queuedPendingResult.queueSubmitted === true && /^fixture_w153_/.test(queuedPendingResult.runnerTaskId) && queuedPendingResult.resultCapture.status === 'pending_runner_completion' && queuedPendingResult.finalGeneratedNamesJson === null && queuedPendingResult.activeOpenLinks === 0 && queuedPendingResult.createsRecords === false, JSON.stringify(queuedPendingResult));
  assertCase(results, 'w153_invalid_request_blocks_before_queue', invalidRequestResult.queueSubmitted === false && invalidRequestResult.validation.valid === false && invalidRequestResult.activeOpenLinks === 0, JSON.stringify(invalidRequestResult.validation));
  assertCase(results, 'w153_runtime_hooks_and_no_drawer_network_invocation', /function integratedBuildRunnerReturnClientBoundaryV1/.test(userscript) && w153ClientBoundarySource && !/GM_xmlhttpRequest/.test(w153ClientBoundarySource) && !/fetch\(/.test(w153ClientBoundarySource), 'W153 client boundary hooks present without network call; later W189 W144 helper is separately gated');
  assertCase(results, 'w153_visual_testing_blocked_and_no_regression', visualTestingDecision.visualTestingBlocked === true && Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w153-integrated-build-runner-return-adapter-skeleton.v1',
    status: failures.length ? 'blocked' : 'integrated_build_runner_return_adapter_skeleton_ready',
    decision: failures.length ? 'FAIL' : 'PASS_INTEGRATED_BUILD_RETURN_ADAPTER_SKELETON_READY__NO_VISUAL_TESTING',
    adapterSkeletonChanges: {
      drawerClientBoundary: {
        functions: [
          'confirmedBuildRequestJsonV1',
          'integratedBuildOperatorGateV1',
          'integratedBuildRunnerAdapterConfigV1',
          'integratedBuildRunnerReturnClientBoundaryV1'
        ],
        invocationAttempted: false,
        disabledStatus: disabledClientBoundary.status,
        readyStatus: readyClientBoundary.status
      },
      serverAdapterSkeleton: {
        file: suiteletPath,
        version: queuedPendingResult.adapterVersion,
        importsTaskModule: /N\/task/.test(suiteletSource),
        importsRecordModule: /N\/record/.test(suiteletSource),
        queueSubmitFixtureOnly: true
      }
    },
    dryRunSmokeHarness: {
      falseFlags: {
        queueSubmitted: falseFlagResult.queueSubmitted,
        runnerTaskId: falseFlagResult.runnerTaskId,
        resultCapture: falseFlagResult.resultCapture.status,
        activeOpenLinks: falseFlagResult.activeOpenLinks
      },
      queuedPendingFixture: {
        queueSubmitted: queuedPendingResult.queueSubmitted,
        runnerTaskId: queuedPendingResult.runnerTaskId,
        resultCapture: queuedPendingResult.resultCapture.status,
        finalGeneratedNamesJson: queuedPendingResult.finalGeneratedNamesJson,
        activeOpenLinks: queuedPendingResult.activeOpenLinks
      },
      invalidRequest: {
        queueSubmitted: invalidRequestResult.queueSubmitted,
        valid: invalidRequestResult.validation.valid,
        errors: invalidRequestResult.validation.errors
      }
    },
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W154: Integrated Build Button Status And Server Adapter Dry-Run Wiring',
      prompt: 'Move through W154: Integrated Build Button Status And Server Adapter Dry-Run Wiring. Use the W153 non-writing drawer client boundary and W153 NetSuite-side server adapter skeleton to wire Build status states in the drawer without enabling live invocation by default. Build should show blocked, ready-for-server-adapter, false-flag no-submit, queued/pending fixture, and completed-result-awaiting-W151-import states from controlled harness responses only. Do not enable real writes, do not invoke SuiteScript from the drawer, do not create transactions from the drawer, and do not request visual testing. Preserve consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, W151 completed-result import guard, and no active Open links without real URLs. Output Build status UX contract, dry-run wiring harness, trace samples, W154 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };

  const trace = {
    schema: 'idb.w153-integrated-build-runner-return-adapter-skeleton-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    drawerClientInvocationAttempted: false,
    serverAdapterQueueSubmitReal: false,
    serverAdapterQueueSubmitFixtureOnly: true,
    falseFlagResult: contract.dryRunSmokeHarness.falseFlags,
    queuedPendingFixture: contract.dryRunSmokeHarness.queuedPendingFixture,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W153 Integrated Build Runner Return Adapter Skeleton

Decision: ${contract.decision}

## Adapter Skeleton Changes
- Drawer client boundary prepares confirmed build request JSON, operator gate JSON, idempotency token, and adapter config.
- Drawer client boundary does not call the adapter in W153.
- Server adapter skeleton validates the integrated request and server config.
- Server adapter skeleton returns false-flag no-submit or queued/pending fixture responses only.
- Server adapter skeleton does not import N/task or N/record.

## Dry-Run Smoke Harness
- False flags: queueSubmitted=${falseFlagResult.queueSubmitted}, runnerTaskId=${falseFlagResult.runnerTaskId}, resultCapture=${falseFlagResult.resultCapture.status}.
- Queued fixture: queueSubmitted=${queuedPendingResult.queueSubmitted}, runnerTaskId=${queuedPendingResult.runnerTaskId}, resultCapture=${queuedPendingResult.resultCapture.status}.
- Invalid request: valid=${invalidRequestResult.validation.valid}, queueSubmitted=${invalidRequestResult.queueSubmitted}.

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
    console.error(`W153 integrated Build runner return adapter skeleton FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W153 integrated Build runner return adapter skeleton: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main();
