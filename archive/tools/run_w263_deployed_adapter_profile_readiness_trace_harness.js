#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w263_deployed_adapter_profile_readiness_trace.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w263_deployed_adapter_profile_readiness_trace.json');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function loadHooks() {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
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
    URLSearchParams,
    Promise,
    Blob: function Blob() {},
    fetch: () => Promise.reject(new Error('live fetch disabled in W263 harness')),
    globalThis: null,
    window: {
      self: null,
      top: null,
      location: {
        href: 'https://td3021666.app.netsuite.com/app/center/card.nl',
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
  vm.runInContext(read(userscriptPath), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function motionState(hooks, overrides = {}) {
  const state = Object.assign({
    selectedLaneId: 'industrial_distribution',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: 'Motion Industries',
      website: 'https://www.motion.com',
      notes: 'Buyer is the VP of Operations for a regional industrial distributor. They are trying to prove they can protect customer service levels when supplier lead times shift and branch inventory is uneven.'
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  }, overrides);
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const recommendation = hooks.recommendMove(lane, state.pageContext);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, state.pageContext, recommendation);
  hooks.reconcileStateAuthority(state);
  return state;
}

function ctx(hooks, state) {
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return { lane, page, recommendation };
}

function missingEndpointState(hooks) {
  return motionState(hooks, {
    integratedBuildAdapterConfig: {
      adapterProfileDisabled: true,
      adapterProfiles: [],
      selectedAdapterProfileId: '',
      endpointUrl: '',
      adapterApproved: true,
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['TD3021666'],
      productionBuildModeEnabled: true,
      mode: 'production_build_saved_admin_config'
    }
  });
}

function main() {
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const report = read(reportPath);
  const archivedTrace = JSON.parse(read(tracePath));
  const defaultProfile = hooks.releasedAdapterProfileW263();
  const swappedProfile = hooks.releasedAdapterProfileW263({ accountHost: 'https://newdataset.app.netsuite.com' });
  const profileConfig = hooks.applySelectedAdapterProfileToConfigW263({
    selectedAdapterProfileId: defaultProfile.profileId,
    adapterProfiles: [defaultProfile],
    endpointUrl: '',
    adapterApproved: true,
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['TD3021666'],
    productionBuildModeEnabled: true,
    mode: 'production_build_saved_admin_config'
  });
  const readyState = motionState(hooks, { integratedBuildAdapterConfig: profileConfig });
  const missingState = missingEndpointState(hooks);
  const readyCtx = ctx(hooks, readyState);
  const missingCtx = ctx(hooks, missingState);
  const readyTrace = hooks.deployedAdapterReadinessTraceW263(readyState, readyCtx.lane, readyCtx.page, readyCtx.recommendation);
  const missingTrace = hooks.deployedAdapterReadinessTraceW263(missingState, missingCtx.lane, missingCtx.page, missingCtx.recommendation, {
    previousBlockerWasMissingEndpoint: true
  });
  const readyHtml = hooks.renderIntegratedBuildRunnerReturnStatus(readyState, readyCtx.lane, readyCtx.page, readyCtx.recommendation);
  const traceHtml = hooks.renderTraceView(readyState, readyCtx.lane, readyCtx.page, readyCtx.recommendation);
  const results = [];

  assertCase(results, 'deployed-adapter-profile-model-exists',
    defaultProfile.schema === 'forge.w263.adapter-profile.v1' &&
      defaultProfile.profileId &&
      defaultProfile.profileLabel &&
      defaultProfile.fullEndpointUrl,
    JSON.stringify(defaultProfile));

  assertCase(results, 'released-w144-governed-runner-adapter-profile-represented',
    defaultProfile.scriptName === 'IDB W144 Customer Proof Pilot Suitelet' &&
      defaultProfile.title === 'IDB W24 Customer Proof Pilot Suitelet' &&
      defaultProfile.deploymentScriptId === 'customdeployidb_governed_runner_adapter' &&
      defaultProfile.deploymentStatus === 'Released' &&
      defaultProfile.deployed === true &&
      defaultProfile.executeAsRole === 'Current Role' &&
      defaultProfile.logLevel === 'Error',
    JSON.stringify(defaultProfile));

  assertCase(results, 'profile-path-uses-script-6702-deploy-2',
    defaultProfile.suiteletPath === '/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      defaultProfile.scriptId === '6702' &&
      defaultProfile.deploymentId === '2',
    defaultProfile.suiteletPath);

  assertCase(results, 'full-endpoint-derived-from-account-host-and-path',
    defaultProfile.fullEndpointUrl === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      hooks.adapterProfileEndpointW263(swappedProfile) === 'https://newdataset.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2',
    `${defaultProfile.fullEndpointUrl} | ${hooks.adapterProfileEndpointW263(swappedProfile)}`);

  assertCase(results, 'future-dataset-host-can-swap-without-runtime-logic-change',
    readyTrace.datasetSwitching.accountHostStoredPerProfile === true &&
      readyTrace.datasetSwitching.endpointDerivedFromAccountHostAndPath === true &&
      readyTrace.datasetSwitching.canSwapAccountHostWithoutRuntimeLogicChange === true,
    JSON.stringify(readyTrace.datasetSwitching));

  assertCase(results, 'missing-endpoint-produces-preview-only-readiness',
    missingTrace.w262ReadinessState === 'smoke_preview_only' &&
      missingTrace.blockers.includes('adapter profile not selected') &&
      missingTrace.blockers.includes('endpoint missing'),
    JSON.stringify(missingTrace));

  assertCase(results, 'saved-deployed-profile-produces-ready-to-build-records',
    readyTrace.w262ReadinessState === 'ready_to_build_records' &&
      readyTrace.endpointConfigured === true &&
      /Build records/.test(readyHtml) &&
      /data-idb-real-adapter-action="submit_w144_once"/.test(readyHtml),
    readyHtml.slice(0, 1400));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-admin-details',
    !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|approved W144|server flags|sandbox allowlist|operator gate/i.test(readyHtml) &&
      /Ready to create NetSuite records/.test(readyHtml),
    readyHtml.slice(0, 1400));

  assertCase(results, 'trace-view-and-export-surface-w262-readiness-and-profile',
    /Ready To Build Records|ready to build records/i.test(traceHtml) &&
      /TD3021666 released governed runner adapter/.test(traceHtml) &&
      userscript.includes('deployedAdapterReadinessTraceW263: deployedAdapterReadinessTraceW263'),
    traceHtml.slice(0, 1400));

  assertCase(results, 'motion-observations-captured-in-readiness-trace',
    readyTrace.motionRunObservations.prospect === 'Motion Industries' &&
      readyTrace.motionRunObservations.selectedLaneId === 'industrial_distribution' &&
      readyTrace.motionRunObservations.manufacturingEnabled === false &&
      readyTrace.motionRunObservations.wipEnabled === false &&
      missingTrace.motionRunObservations.previousBlockerWasMissingEndpoint === true &&
      missingTrace.motionRunObservations.runnerTaskCaptured === false &&
      missingTrace.motionRunObservations.completedResultImported === false,
    JSON.stringify({ ready: readyTrace.motionRunObservations, missing: missingTrace.motionRunObservations }));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    readyTrace.guardrails.noDrawerCreatedRecords === true &&
      readyTrace.guardrails.noDrawerTransactionWrites === true &&
      readyTrace.guardrails.recordCreationRequiresApprovedServerAdapterPath === true &&
      readyTrace.guardrails.noW144DeploymentUpdateInThisBlock === true,
    JSON.stringify(readyTrace.guardrails));

  assertCase(results, 'archived-report-and-trace-present',
    /W263 Deployed Adapter Profile/.test(report) &&
      archivedTrace.schema === 'forge.w263.deployed-adapter-profile-readiness-trace.v1' &&
      archivedTrace.deployedAdapterProfile.suiteletPath === '/app/site/hosting/scriptlet.nl?script=6702&deploy=2',
    JSON.stringify(archivedTrace));

  const failed = results.filter((item) => !item.pass);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}`);
    if (!item.pass && item.evidence) console.log(item.evidence);
  });
  console.log(`W263 deployed adapter profile readiness trace harness: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main();
