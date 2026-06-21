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
const runnerPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const fileCabinetRunnerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const reportPath = path.join(root, 'archive', 'reports', 'w420_optional_work_order_warning.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function drawerVersionAtLeast(source, minimumVersion, minimumBlock) {
  const userscriptVersion = source.match(/\/\/ @version\s+([0-9.]+)/);
  const runtimeVersion = source.match(/const DRAWER_USERSCRIPT_VERSION = '([0-9.]+)'/);
  const runtimeBlock = source.match(/const CURRENT_UX_BLOCK_W346 = 'W(\d+)'/);
  const compareVersion = (actual, minimum) => {
    const actualParts = String(actual || '').split('.').map((part) => Number(part) || 0);
    const minimumParts = String(minimum || '').split('.').map((part) => Number(part) || 0);
    const length = Math.max(actualParts.length, minimumParts.length);
    for (let index = 0; index < length; index += 1) {
      const actualPart = actualParts[index] || 0;
      const minimumPart = minimumParts[index] || 0;
      if (actualPart !== minimumPart) return actualPart > minimumPart;
    }
    return true;
  };
  return userscriptVersion &&
    runtimeVersion &&
    userscriptVersion[1] === runtimeVersion[1] &&
    compareVersion(runtimeVersion[1], minimumVersion) &&
    runtimeBlock &&
    Number(runtimeBlock[1]) >= minimumBlock;
}

function stripTags(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
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

function herrFoodsState(hooks, overrides = {}) {
  const state = Object.assign(hooks.defaultState(), {
    selectedLaneId: 'food_beverage',
    laneSelectionSource: 'website_evidence',
    setupEditMode: false,
    briefPrepared: true,
    acceptedPacket: {
      schema: 'idb.accepted-packet-context.v1',
      requestStatus: 'confirmed_ready_for_governed_runner'
    },
    intake: {
      customer: 'Herr Foods Reduced',
      website: 'https://www.herrs.com',
      notes: 'They make chips, pretzels, popcorn, snack packs, and seasonal flavors. Operations needs one trusted view before the customer promise is made. Prove finished-good readiness, packaging availability, and promo replenishment confidence.',
      websiteEvidence: '',
      scObjective: '',
      competitor: '',
      decisionCriteria: '',
      timelineUrgency: ''
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: true,
      enableWip: false
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    },
    integratedBuildAdapterConfig: {
      adapterApproved: true,
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['TD3021666'],
      productionBuildModeEnabled: true,
      mode: 'production_build_saved_admin_config'
    },
    integratedBuildOperatorApproval: {
      endpointConfirmed: true,
      confirmedSandboxAccount: true,
      currentSandboxAccount: 'TD3021666',
      reviewDecision: 'operator_approved_queue_submit'
    }
  }, overrides);
  contextFor(hooks, state);
  return state;
}

function runnerTaskWithNonFatalWarningState(hooks) {
  return herrFoodsState(hooks, {
    integratedBuildRunnerResult: {
      status: 'adapter_error',
      errorMessage: 'Work Order seed best-effort warning: could not set assembly item',
      runnerTaskId: 'SCHEDULED_SCRIPT_TASK_123',
      resultCapture: {
        runnerTaskId: 'SCHEDULED_SCRIPT_TASK_123',
        status: 'polling_pending'
      }
    }
  });
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);
  const runner = read(runnerPath);
  const fileCabinetRunner = read(fileCabinetRunnerPath);
  const pkg = JSON.parse(read(path.join(root, 'package.json')));

  const warningState = runnerTaskWithNonFatalWarningState(hooks);
  const { lane, page, recommendation } = contextFor(hooks, warningState);
  const stage = hooks.consultantDayInLifeStageW416(warningState, lane, page, recommendation);
  const html = hooks.renderDrawer(warningState);
  const visible = stripTags(html);

  assertCase(results, 'w420-version-marker-advanced',
    drawerVersionAtLeast(drawer, '1.0.29', 420),
    'Drawer should show W420 or later for install/update clarity while preserving optional Work Order warning recovery.');

  assertCase(results, 'w420-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root and FileCabinet userscript copies should match.');

  assertCase(results, 'w420-filecabinet-runner-synced',
    runner === fileCabinetRunner,
    'Root and FileCabinet runner copies should match.');

  assertCase(results, 'w420-work-order-warning-not-error-log',
    runner.includes('Work Order seed best-effort warning') &&
      !runner.includes('Work Order seed FAILED') &&
      !/log\.error\(\{\s*title:\s*`Work Order seed/.test(runner),
    'Optional Work Order seed failures should not create NetSuite Error log rows.');

  assertCase(results, 'w420-work-order-warning-preserves-diagnostics',
    runner.includes("status: 'best_effort_failed'") &&
      runner.includes('nonFatal: true') &&
      runner.includes('coreBuildContinues: true') &&
      runner.includes('work_order_diagnostics.json'),
    'Optional Work Order failures should remain visible in diagnostics and manufacturing signoff.');

  assertCase(results, 'w420-runner-task-warning-does-not-force-fix-build',
    stage.stage === 'waiting_for_records' &&
      stage.label.title === 'FORGE is building records' &&
      !visible.includes('Fix the build setup'),
    `stage=${stage.stage}; visible=${visible.slice(0, 1200)}`);

  assertCase(results, 'w420-build-readiness-keeps-refresh-action',
    visible.includes('Build and proof readiness') &&
      visible.includes('Refresh build status') &&
      visible.includes('FORGE submitted') &&
      visible.includes('waiting for valid returned records'),
    visible.slice(0, 1800));

  assertCase(results, 'w420-completed-result-import-guard-preserved',
    drawer.includes('validateDccFinalNamingImportPayload') &&
      drawer.includes('completedResultImportEligibilityFromDrawerGuardsW289') &&
      drawer.includes('No Open links yet') &&
      drawer.includes('supported NetSuite URLs'),
    'W151 completed-result import validation and Open-link authority should remain in place.');

  assertCase(results, 'w420-package-script-registered',
    pkg.scripts &&
      pkg.scripts['harness:optional-work-order-warning-w420'] === 'node archive/tools/run_w420_optional_work_order_warning_harness.js',
    JSON.stringify(pkg.scripts && pkg.scripts['harness:optional-work-order-warning-w420']));

  const report = `# W420 Optional Work Order Warning Recovery

## Summary
W420 fixes the failure shape seen in the Herr Foods Reduced run: the one-click build submitted correctly and the runner reached \`Runner COMPLETE\`, but an optional Manufacturing Work Order seed problem surfaced as a NetSuite Error row and pushed the consultant drawer into \`Fix the build setup\`.

The fix keeps optional Work Order creation diagnostic, but no longer treats it as a build-stopping execution-log error when the core record build can continue.

## What Changed
- Advanced the drawer marker to \`1.0.29 / W420\`.
- Changed optional Work Order seed failures from \`log.error\` to an audit-level \`Work Order seed best-effort warning\`.
- Added explicit nonfatal telemetry: \`status: best_effort_failed\`, \`nonFatal: true\`, and \`coreBuildContinues: true\`.
- Updated the consultant stage priority so a captured runner task remains in \`FORGE is building records\` unless a completed result is actually rejected by the import guard.

## Boundaries
- No new runner write paths.
- No adapter contract change.
- No source-pack change.
- No completed-result import validation change.
- No fake Open links.
- Optional Work Order diagnostics remain visible for admin review.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Recommendation
Lock W420 as the optional Work Order warning recovery patch. Deploy the updated runner and drawer, then rerun the Herr Foods smoke with Create new item and Manufacturing enabled, WIP disabled. The expected consultant flow is: one-click Build records, Refresh build status, Finish build when W151-valid completed records return, then Demo Cockpit with verified Open links.
`;
  fs.writeFileSync(reportPath, report);
  printResults('W420 optional Work Order warning harness', results);
}

main();
