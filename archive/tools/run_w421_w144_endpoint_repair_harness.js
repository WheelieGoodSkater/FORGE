#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  loadHooks,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const drawerPath = path.join(root, 'idb-drawer.user.js');
const fileCabinetDrawerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
const tracePath = '/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1781970457051.json';
const reportPath = path.join(root, 'archive', 'reports', 'w421_w144_endpoint_repair.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function contextFor(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext || {
    title: 'NetSuite Home',
    url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page',
    contextId: 'generic_netsuite_page',
    confidence: 'low'
  };
  const recommendation = hooks.recommendMove(lane, page);
  return { lane, page, recommendation };
}

function loadTraceState(hooks) {
  const trace = JSON.parse(read(tracePath));
  const state = Object.assign(hooks.defaultState(), trace.state || {});
  state.pageContext = state.pageContext || {
    title: 'NetSuite Home',
    url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page',
    contextId: 'generic_netsuite_page',
    confidence: 'low'
  };
  return { trace, state };
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);
  const pkg = JSON.parse(read(path.join(root, 'package.json')));
  const { trace, state } = loadTraceState(hooks);

  const endpointBefore = state.integratedBuildAdapterConfig && state.integratedBuildAdapterConfig.endpointUrl || '';
  const { lane, page, recommendation } = contextFor(hooks, state);
  const preflight = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(state, lane, page, recommendation, {
    adapterConfig: state.integratedBuildAdapterConfig || {},
    operatorEvidence: state.integratedBuildOperatorApproval || {}
  });
  const repairedEndpoint = preflight.adapterRequestEnvelope && preflight.adapterRequestEnvelope.endpointUrl || '';

  assertCase(results, 'w421-version-marker-advanced',
    (drawer.includes('// @version      1.0.30') || drawer.includes('// @version      1.0.31') || drawer.includes('// @version      1.0.32') || drawer.includes('// @version      1.0.33')) &&
      (drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.30';") || drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.31';") || drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.32';") || drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.33';")) &&
      (drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W421';") || drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W422';") || drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W423';") || drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W424';")),
    'Drawer should show W421 or later for install/update clarity.');

  assertCase(results, 'w421-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root and FileCabinet userscript copies should match.');

  assertCase(results, 'w421-latest-trace-had-blank-endpoint',
    endpointBefore === '' &&
      (trace.events || []).some((event) => event.eventType === 'w189_w144_submit_blocked' && JSON.stringify(event).includes('approved_w144_endpoint')),
    'The user-provided trace should prove the old failure was a missing approved W144 endpoint.');

  assertCase(results, 'w421-saved-config-repairs-released-endpoint',
    repairedEndpoint === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2',
    `repairedEndpoint=${repairedEndpoint}`);

  assertCase(results, 'w421-preflight-ready-after-endpoint-repair',
    preflight.readyForOneCall === true &&
      Array.isArray(preflight.blockedReasons) && preflight.blockedReasons.length === 0 &&
      preflight.adapterRequestEnvelope && preflight.adapterRequestEnvelope.endpointUrl === repairedEndpoint,
    JSON.stringify({ ready: preflight.readyForOneCall, blocked: preflight.blockedReasons, endpoint: preflight.endpointUrl || (preflight.adapterRequestEnvelope && preflight.adapterRequestEnvelope.endpointUrl) }));

  assertCase(results, 'w421-submit-path-persists-endpoint-repair',
    drawer.includes('w421_released_w144_endpoint_repaired_before_submit') &&
      drawer.includes('persistProductionBuildSavedAdminConfig(state)') &&
      drawer.includes("endpointSource: 'released_w144_adapter_profile'"),
    'One-click submit path should persist repaired endpoint before preflight.');

  assertCase(results, 'w421-import-and-open-link-authority-preserved',
    drawer.includes('validateDccFinalNamingImportPayload') &&
      drawer.includes('completedResultImportEligibilityFromDrawerGuardsW289') &&
      drawer.includes('noActiveOpenLinksWithoutRealUrls: true'),
    'Endpoint repair must not bypass completed result validation or Open-link authority.');

  assertCase(results, 'w421-package-script-registered',
    pkg.scripts &&
      pkg.scripts['harness:w144-endpoint-repair-w421'] === 'node archive/tools/run_w421_w144_endpoint_repair_harness.js',
    JSON.stringify(pkg.scripts && pkg.scripts['harness:w144-endpoint-repair-w421']));

  const report = `# W421 W144 Endpoint Repair

## Summary
The latest Herr Foods trace did not submit the approved server adapter call. It blocked before record creation with \`blockedReasons: ["approved_w144_endpoint"]\` because saved admin config had a blank \`endpointUrl\`.

W421 makes the released W144 endpoint repair explicit and persistent before one-click submit.

## Evidence
- Trace reviewed: \`${tracePath}\`.
- Trace failure: \`w189_w144_submit_blocked\` / \`approved_w144_endpoint\`.
- Saved endpoint before repair: \`${endpointBefore || '(blank)'}\`.
- Endpoint after repair: \`${repairedEndpoint}\`.
- Submit preflight after repair: \`${preflight.readyForOneCall ? 'ready' : 'blocked'}\`.

## Boundaries
- No runner behavior changed in W421.
- No source-pack change.
- No adapter contract change.
- No completed-result import validation change.
- No fake Open links.
- W144 remains the only approved server adapter path.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Recommendation
Install/deploy \`1.0.30 / W421\`, then rerun Herr Foods. First confirm the drawer header says \`Drawer 1.0.30 / W421\`. If it does not, the browser is still running an older userscript and the smoke result is not valid for this fix.
`;
  fs.writeFileSync(reportPath, report);
  printResults('W421 W144 endpoint repair harness', results);
}

main();
