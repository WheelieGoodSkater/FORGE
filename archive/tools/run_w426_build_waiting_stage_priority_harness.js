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
const reportPath = path.join(root, 'archive', 'reports', 'w426_build_waiting_stage_priority.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);

  const state = hooks.defaultState();
  state.open = true;
  state.briefPrepared = true;
  state.selectedLaneId = 'food_beverage';
  state.confirmedLaneId = 'food_beverage';
  state.laneSelectionSource = 'consultant_confirmed';
  state.intake = {
    customer: 'Kettle Brand Snacks',
    website: 'https://www.kettlebrand.com',
    notes: 'They sell packaged snacks and need finished-good availability before retail commitments.',
    websiteEvidence: '',
    scObjective: '',
    competitor: '',
    decisionCriteria: '',
    timelineUrgency: ''
  };
  state.acceptedPacket = {
    selectedLaneId: 'food_beverage',
    selectedLane: 'Food / Beverage CPG Manufacturing',
    confirmed: true,
    proofAnchor: 'Finished Good',
    productSeed: 'Kettle Brand Snacks',
    productFamily: 'Packaged snacks',
    demandMoment: 'Retail replenishment readiness'
  };
  state.integratedBuildAdapterConfig = Object.assign({}, state.integratedBuildAdapterConfig || {}, {
    productionBuildModeEnabled: true,
    mode: 'production_build_saved_admin_config',
    endpointUrl: 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2',
    adapterApproved: true,
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['TD3021666']
  });
  state.integratedBuildOperatorApproval = {
    approved: true,
    phrase: 'approved',
    timestamp: '2026-06-23T12:00:00.000Z'
  };
  state.integratedBuildRunnerResult = {
    status: 'submitted',
    runnerTaskId: 'CSVIMPORT_123456',
    resultImportGuard: {
      completedResultPresent: true,
      importReady: false,
      completedResultStatus: 'blocked_stale_guard'
    }
  };
  state.dccFinalNamingResult = null;

  const lane = hooks.getLane(state);
  const page = { title: 'NetSuite Home', url: 'https://td3021666.app.netsuite.com/app/center/card.nl', pageType: 'NetSuite page', confidence: 'low' };
  const recommendation = hooks.recommendMove(lane, page);
  const stage = hooks.consultantDayInLifeStageW416(state, lane, page, recommendation);

  assertCase(results, 'w426-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root and FileCabinet drawer copies should match.');

  assertCase(results, 'w426-waiting-priority-code-present',
    drawer.includes('const activeBuildWaiting = runnerTaskCaptured && !completedResultReady') &&
      drawer.includes("else if (activeBuildWaiting) stage = 'waiting_for_records';"),
    'Active build waiting should be prioritized before fix-build states.');

  assertCase(results, 'w426-active-runner-task-does-not-show-fix-build',
    stage.stage === 'waiting_for_records' &&
      stage.label &&
      stage.label.title === 'FORGE is building records',
    JSON.stringify(stage));

  assertCase(results, 'w426-no-proof-or-run-claims-before-import',
    stage.finalNamesImported === false &&
      stage.runCanUseImportedFinalNames === false &&
      stage.label.next === 'Refresh build status',
    JSON.stringify(stage));

  const report = `# W426 Build Waiting Stage Priority

## Summary
W426 fixes a cockpit state-priority regression where the day-in-life header could say "Fix the build setup" while the build panel said the runner was still waiting for records.

## Fix
The drawer now treats an active runner task with no imported final records as \`waiting_for_records\` before considering stale blocked/fix-build signals.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No runner, adapter, source-pack, Open-link, or import-validation behavior was changed.

## Recommendation
Lock W426, reinstall the drawer, and refresh the active build. If records are still waiting, the top surface should now say FORGE is building records rather than fix the build setup.
`;
  fs.writeFileSync(reportPath, report);

  printResults('W426 build waiting stage priority harness', results);
}

main();
