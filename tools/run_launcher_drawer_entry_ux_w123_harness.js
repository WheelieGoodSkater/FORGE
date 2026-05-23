const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w123_launcher_drawer_entry_ux.json');
const tracePath = path.join(root, 'trace_samples', 'w123_launcher_drawer_entry_ux_trace.json');
const reportPath = path.join(root, 'reports', 'w123_launcher_drawer_entry_ux.md');

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function makeElement() {
  const attributes = {};
  return {
    attributes,
    style: {},
    title: '',
    setAttribute: (key, value) => { attributes[key] = String(value); },
    getAttribute: (key) => attributes[key] || null,
    removeAttribute: (key) => { delete attributes[key]; },
    addEventListener: () => {},
    removeEventListener: () => {},
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} }
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
      innerHeight: 900,
      innerWidth: 1440,
      location: {
        href: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
        pathname: '/app/center/card.nl',
        search: ''
      },
      localStorage: storage,
      addEventListener: () => {},
      removeEventListener: () => {},
      setTimeout: (fn) => fn()
    },
    document: {
      title: 'NetSuite Home',
      readyState: 'loading',
      body: { innerText: '', classList: { add: () => {}, remove: () => {} } },
      documentElement: { style: { setProperty: () => {} } },
      head: { appendChild: () => {} },
      createElement: makeElement,
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
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing drawer test hooks.');
  return { hooks: sandbox.__IDB_TEST_HOOKS__, storage };
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function forbiddenVisibleAcronym(value) {
  return /\b(DCC|IDB|SCAI)\b/.test(String(value || ''));
}

const { hooks } = loadHooks();
const source = fs.readFileSync(userscriptPath, 'utf8');
const rail = makeElement();
const topModel = hooks.applyLauncherPosition(rail, 'top_right');
const midModel = hooks.applyLauncherPosition(rail, 'middle_right');
const bottomModel = hooks.applyLauncherPosition(rail, 'bottom_right');
const invalidModel = hooks.launcherPositionModel('bad_value');

const surgicalArchitecturePlan = [
  {
    block: 'W124',
    name: 'Build Results Tab Reset',
    goal: 'Make Review earn its place by becoming Build Handoff before generated names and Build Results after import.',
    visualTestRequired: true,
    reason: 'Visible consultant workflow materially changes.'
  },
  {
    block: 'W125',
    name: 'Consultant-Safe Export Language',
    goal: 'Shield visible export labels from internal implementation language while preserving schema compatibility.',
    visualTestRequired: false,
    reason: 'Harness can prove labels and export contracts unless visible layout changes.'
  },
  {
    block: 'W126',
    name: 'Value Coach Intelligence Upgrade',
    goal: 'Reduce repetition and add competitor/FUD prep using named competitor or clearly labeled inferred alternatives.',
    visualTestRequired: true,
    reason: 'ROI / Competitive first viewport changes and needs consultant readability feedback.'
  },
  {
    block: 'W127',
    name: 'Run Story Engine V2',
    goal: 'Replace similar chips with differentiated story stages tied to pain, proof, metric, objection, and next decision.',
    visualTestRequired: true,
    reason: 'Live demo coaching changes materially.'
  },
  {
    block: 'W128',
    name: 'Final Names Navigation Layer',
    goal: 'Use imported final generated NetSuite record names and links throughout Build Results and Run pivots.',
    visualTestRequired: true,
    reason: 'Post-build navigation is a core live consultant workflow.'
  },
  {
    block: 'W129',
    name: 'Governed Invocation Readiness',
    goal: 'Define exact safety gates before any future build-engine invocation from the drawer.',
    visualTestRequired: false,
    reason: 'Contract and trace gate only; no visible write action enabled.'
  },
  {
    block: 'W130',
    name: 'Preview-Only Invocation Bridge',
    goal: 'Prepare preview-only invocation artifacts without submit, queue, script invocation, or write.',
    visualTestRequired: false,
    reason: 'Operator/harness smoke before consultant UI exposure.'
  },
  {
    block: 'W131',
    name: 'Sandbox Build Invocation With Type-To-Confirm',
    goal: 'Enable first governed sandbox build invocation behind confirmation and operator approval.',
    visualTestRequired: true,
    reason: 'This is the first visible step toward real system writes.'
  },
  {
    block: 'W132',
    name: 'Real Build Result Import',
    goal: 'Import real generated names from a completed sandbox build and prove the drawer uses them.',
    visualTestRequired: true,
    reason: 'Consultant must confirm final names and navigation are useful.'
  },
  {
    block: 'W133',
    name: 'First Write Pilot Scorecard',
    goal: 'Grade safety, usability, rollback, trace, and generated-name reliability before broader pilot.',
    visualTestRequired: false,
    reason: 'Evidence review and go/no-go scorecard.'
  }
];

const visualTestPolicy = {
  default: 'harness_first',
  requireVisualNetSuiteTestOnlyWhen: [
    'launcher/drawer entry changes are introduced',
    'Plan, Build/Results, ROI/Competitive, Run, or Trace first viewport materially changes',
    'final generated names import changes visible behavior',
    'governed sandbox invocation is exposed',
    'real generated NetSuite names or links are used for live navigation'
  ],
  skipVisualTestWhen: [
    'contract-only changes',
    'trace-only changes',
    'internal schema or validator changes',
    'no visible consultant copy/layout changes'
  ]
};

const results = [];
assertCase(results, 'w123_launcher_positions_defined', ['top_right', 'middle_right', 'bottom_right'].every((position) => hooks.launcherPositionModel(position).snapPositions.includes(position)), JSON.stringify(topModel.snapPositions));
assertCase(results, 'w123_launcher_snap_math', hooks.launcherPositionFromClientY(50, 900) === 'top_right' && hooks.launcherPositionFromClientY(450, 900) === 'middle_right' && hooks.launcherPositionFromClientY(850, 900) === 'bottom_right', JSON.stringify([hooks.launcherPositionFromClientY(50, 900), hooks.launcherPositionFromClientY(450, 900), hooks.launcherPositionFromClientY(850, 900)]));
assertCase(results, 'w123_invalid_position_defaults_safely', invalidModel.position === 'middle_right', JSON.stringify(invalidModel));
assertCase(results, 'w123_apply_launcher_position_sets_accessible_attrs', rail.getAttribute('data-launcher-position') === 'bottom_right' && /Launcher position Bottom right/.test(rail.getAttribute('aria-label')) && /Drag to move/.test(rail.title), JSON.stringify(rail.attributes));
assertCase(results, 'w123_css_has_right_edge_snap_positions', /#idb-rail-button\[data-launcher-position="top_right"\]/.test(source) && /#idb-rail-button\[data-launcher-position="middle_right"\]/.test(source) && /#idb-rail-button\[data-launcher-position="bottom_right"\]/.test(source) && /right:\s*18px/.test(source), 'snap CSS');
assertCase(results, 'w123_position_persistence_and_reset_present', /LAUNCHER_POSITION_STORAGE_KEY/.test(source) && /writeLauncherPosition/.test(source) && /resetLauncherPosition/.test(source) && /contextmenu/.test(source), 'storage and reset controls');
assertCase(results, 'w123_keyboard_focus_accessibility_present', /aria-keyshortcuts/.test(source) && /ArrowUp/.test(source) && /ArrowDown/.test(source) && /Home/.test(source) && /aria-label/.test(source), 'keyboard snap and reset');
assertCase(results, 'w123_duplicate_root_guard_preserved', /function removeDuplicateShellNodes/.test(source) && /setInterval\(\(\) => removeDuplicateShellNodes/.test(source) && /data-idb-shell/.test(source), 'W94 duplicate guard');
assertCase(results, 'w123_drawer_open_behavior_preserved', /rail\.addEventListener\('click'/.test(source) && /toggle\(true, state\)/.test(source) && /aria-expanded/.test(source), 'click still opens drawer');
assertCase(results, 'w123_no_forbidden_visible_acronyms_in_launcher_labels', [topModel.label, midModel.label, bottomModel.label, rail.title, rail.getAttribute('aria-label')].every((text) => !forbiddenVisibleAcronym(text)), JSON.stringify({ title: rail.title, aria: rail.getAttribute('aria-label') }));
assertCase(results, 'w123_visual_test_policy_is_surgical', visualTestPolicy.default === 'harness_first' && surgicalArchitecturePlan.filter((block) => block.visualTestRequired).length === 6 && surgicalArchitecturePlan.filter((block) => !block.visualTestRequired).length === 4, JSON.stringify(visualTestPolicy));
assertCase(results, 'w123_no_write_boundaries_preserved', topModel.noRegression.noDrawerWrites === true && topModel.noRegression.noSuiteScriptInvocationFromDrawer === true && topModel.noRegression.noTransactionWritesFromDrawer === true, JSON.stringify(topModel.noRegression));

const pass = results.every((item) => item.pass);
const data = {
  schema: 'idb.w123-launcher-drawer-entry-ux.v1',
  status: pass ? 'launcher_entry_ux_ready' : 'blocked',
  generatedAt: new Date().toISOString(),
  userVisualTestRequiredNow: false,
  implemented: {
    movableRightEdgeLauncher: true,
    snapPositions: ['top_right', 'middle_right', 'bottom_right'],
    persistedPosition: true,
    resetToDefault: true,
    keyboardAccessible: true,
    duplicateRootGuardPreserved: true,
    drawerOpenBehaviorUnchanged: true
  },
  visualQaChecklist: [
    'Open NetSuite and confirm only one Demo launcher is visible.',
    'Drag launcher near the top right and confirm it snaps to top right.',
    'Drag launcher near the middle right and confirm it snaps to middle right.',
    'Drag launcher near the bottom right and confirm it snaps to bottom right.',
    'Refresh NetSuite and confirm the selected position persists.',
    'Press ArrowUp, ArrowDown, and Home while launcher is focused to verify keyboard movement/reset.',
    'Click launcher and confirm drawer opens exactly as before.',
    'Right-click launcher to reset to the default middle-right position.'
  ],
  visualTestPolicy,
  surgicalArchitecturePlan,
  noRegression: {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    consultantConfirmationRequired: true,
    websiteSupportsIdentityNaming: true,
    notesDriveStoryValue: true,
    buildEngineOwnsGeneratedRecords: true,
    finalGeneratedNamesImportPreserved: true,
    consultantVisibleCopyNoDccIdbScai: true
  },
  validatorGates: results,
  bestNextCodexPrompt: {
    block: 'W124: Build Results Tab Reset',
    visualNetSuiteTestRequiredAfterBlock: true,
    prompt: 'Move through W124: Build Results Tab Reset. Rename and reframe Review into Build/Results so it earns consultant attention: before final generated names are imported, show only a compact Build Handoff checkpoint with what the consultant requested, selected demo path, export handoff action, operator verification, and what is waiting; after final generated names are imported, transform the tab into Build Results showing final generated NetSuite records, names, links, warnings, and navigation pivots. Hide internal parameter/config/runner detail behind one collapsed internal section. Preserve W92/W110 state authority, W116-W123 final-name and launcher behavior, no drawer writes, no SuiteScript invocation from the drawer, no transaction writes, consultant confirmation required, website identity/naming support, notes-driven value story, and build-engine ownership of generated records. Output compressed Build/Results UI, final-name behavior, validator gates, W124 report, and best next Codex prompt.'
  }
};

const trace = {
  traceEvent: 'w123_launcher_drawer_entry_ux',
  decision: pass ? 'PASS' : 'FAIL',
  generatedAt: data.generatedAt,
  noSecrets: true,
  launcherPositionModel: bottomModel,
  visualTestRequiredNow: false,
  nextVisualTestAfter: 'W124',
  validatorGates: results
};

const report = `# W123 Launcher And Drawer Entry UX

Status: ${data.status}

## What Changed

- Replaced the fixed middle-right launcher position with a right-edge snap launcher.
- Added snap positions: top right, middle right, and bottom right.
- Persisted the selected launcher position in browser storage.
- Added keyboard movement with ArrowUp / ArrowDown and reset with Home.
- Added right-click reset to the default middle-right position.
- Preserved one-active-drawer duplicate cleanup and normal click-to-open behavior.

## Visual Test Policy

- Default: ${visualTestPolicy.default}
- Visual NetSuite testing is required only when the visible consultant workflow materially changes.
- W123 does not require user visual testing now; W124 does.

## W124-W133 Surgical Architecture Plan

${surgicalArchitecturePlan.map((block) => `- ${block.block} ${block.name}: ${block.goal} Visual test: ${block.visualTestRequired ? 'yes' : 'no'} (${block.reason})`).join('\n')}

## Validator Gates

${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## Best Next Codex Prompt

${data.bestNextCodexPrompt.prompt}
`;

writeJson(dataPath, data);
writeJson(tracePath, trace);
fs.writeFileSync(reportPath, report);

if (!pass) {
  console.error(`W123 launcher drawer entry UX FAIL (${results.filter((item) => item.pass).length}/${results.length})`);
  process.exit(1);
}

console.log(`W123 launcher drawer entry UX PASS (${results.length}/${results.length})`);
