const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w94_visual_qa_duplicate_drawer_cleanup.json');
const tracePath = path.join(root, 'trace_samples', 'w94_visual_qa_duplicate_drawer_cleanup_trace.json');
const reportPath = path.join(root, 'reports', 'w94_visual_qa_duplicate_drawer_cleanup.md');

class FakeNode {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.children = [];
    this.attributes = {};
    this.style = {};
    this.innerHTML = '';
    this.textContent = '';
    this.title = '';
    this.type = '';
    this.id = '';
    this.classList = {
      add: () => {},
      remove: () => {},
      toggle: () => {}
    };
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'id') this.id = String(value);
    if (name === 'title') this.title = String(value);
  }

  getAttribute(name) {
    if (name === 'id') return this.id;
    if (name === 'title') return this.title;
    return this.attributes[name] || null;
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  removeChild(node) {
    this.children = this.children.filter((item) => item !== node);
    node.parentNode = null;
    return node;
  }

  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  addEventListener() {}
  removeEventListener() {}
  querySelectorAll() { return []; }
  querySelector() { return null; }
  getBoundingClientRect() { return { width: 410, height: 800 }; }
}

function matchesSelector(node, selector) {
  if (!node) return false;
  if (selector === '#idb-drawer') return node.id === 'idb-drawer';
  if (selector === '#idb-rail-button') return node.id === 'idb-rail-button';
  if (selector === '#idb-drawer-style') return node.id === 'idb-drawer-style';
  if (selector === 'aside[aria-label="Intelligent Demo Builder drawer"]') return node.tagName === 'ASIDE' && node.getAttribute('aria-label') === 'Intelligent Demo Builder drawer';
  if (selector === 'button[title="Open Intelligent Demo Builder"]') return node.tagName === 'BUTTON' && node.title === 'Open Intelligent Demo Builder';
  if (selector === '[data-idb-shell]') return Boolean(node.getAttribute('data-idb-shell'));
  if (selector === '[data-idb-shell="drawer"]') return node.getAttribute('data-idb-shell') === 'drawer';
  if (selector === '[data-idb-shell="rail"]') return node.getAttribute('data-idb-shell') === 'rail';
  if (selector === 'style[data-idb-shell="style"]') return node.tagName === 'STYLE' && node.getAttribute('data-idb-shell') === 'style';
  return false;
}

function makeDocument() {
  const document = {
    title: 'NetSuite Home',
    readyState: 'complete',
    documentElement: { style: { setProperty: () => {} } },
    body: null,
    head: null,
    createElement(tagName) {
      return new FakeNode(tagName, document);
    },
    addEventListener() {},
    getElementById(id) {
      return document.querySelectorAll(`#${id}`)[0] || null;
    },
    querySelectorAll(selectorText) {
      const selectors = selectorText.split(',').map((item) => item.trim()).filter(Boolean);
      const all = [];
      function visit(node) {
        if (!node) return;
        all.push(node);
        node.children.forEach(visit);
      }
      visit(document.head);
      visit(document.body);
      return all.filter((node, index, values) => selectors.some((selector) => matchesSelector(node, selector)) && values.indexOf(node) === index);
    }
  };
  document.body = new FakeNode('body', document);
  document.body.innerText = '';
  document.body.classList = { add: () => {}, remove: () => {}, toggle: () => {} };
  document.head = new FakeNode('head', document);
  return document;
}

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadRuntime() {
  const document = makeDocument();
  const storage = makeStorage();
  const intervals = [];
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
      setInterval: (fn) => {
        intervals.push(fn);
        return intervals.length;
      },
      clearInterval: () => {},
      innerWidth: 1440
    },
    document,
    __IDB_ENABLE_TEST_HOOKS__: true
  };
  sandbox.globalThis = sandbox;
  sandbox.window.self = sandbox.window;
  sandbox.window.top = sandbox.window;
  sandbox.window.window = sandbox.window;
  sandbox.window.document = document;
  sandbox.window.globalThis = sandbox;
  sandbox.setInterval = sandbox.window.setInterval;
  sandbox.clearInterval = sandbox.window.clearInterval;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return { sandbox, document, intervals, hooks: sandbox.__IDB_TEST_HOOKS__ };
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function addStaleDuplicate(document) {
  const staleRail = document.createElement('button');
  staleRail.id = 'idb-rail-button';
  staleRail.title = 'Open Intelligent Demo Builder';
  staleRail.setAttribute('data-idb-shell', 'rail');
  staleRail.setAttribute('data-idb-instance', 'stale');
  const staleDrawer = document.createElement('aside');
  staleDrawer.id = 'idb-drawer';
  staleDrawer.setAttribute('aria-label', 'Intelligent Demo Builder drawer');
  staleDrawer.setAttribute('data-idb-shell', 'drawer');
  staleDrawer.setAttribute('data-idb-instance', 'stale');
  const staleStyle = document.createElement('style');
  staleStyle.id = 'idb-drawer-style';
  staleStyle.setAttribute('data-idb-shell', 'style');
  staleStyle.setAttribute('data-idb-instance', 'stale');
  document.body.appendChild(staleRail);
  document.body.appendChild(staleDrawer);
  document.head.appendChild(staleStyle);
}

function main() {
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const contract = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const { document, intervals, hooks } = loadRuntime();
  const results = [];

  const initialDiagnostics = hooks.shellDiagnostics();
  addStaleDuplicate(document);
  const duplicateDiagnostics = hooks.shellDiagnostics();
  intervals.forEach((fn) => fn());
  const cleanedDiagnostics = hooks.shellDiagnostics();
  const planHtml = hooks.renderPlanView(hooks.defaultState(), hooks.getLane(hooks.defaultState()), { pageType: 'NetSuite page', confidence: 'low' }, { moveIndex: 0, move: 'Customer Record' });

  assertCase(results, 'w94_runtime_shell_diagnostics_exposed', typeof hooks.shellDiagnostics === 'function' && typeof hooks.removeDuplicateShellNodes === 'function', 'diagnostic hooks');
  assertCase(results, 'w94_initial_one_active_shell', initialDiagnostics.oneActiveRoot === true && initialDiagnostics.drawerCount === 1 && initialDiagnostics.railCount === 1 && initialDiagnostics.styleCount === 1, JSON.stringify(initialDiagnostics));
  assertCase(results, 'w94_duplicate_detected_before_watchdog', duplicateDiagnostics.duplicateDetected === true && duplicateDiagnostics.drawerCount > 1 && duplicateDiagnostics.railCount > 1, JSON.stringify(duplicateDiagnostics));
  assertCase(results, 'w94_watchdog_restores_one_active_shell', cleanedDiagnostics.oneActiveRoot === true && cleanedDiagnostics.duplicateDetected === false && cleanedDiagnostics.ownedDrawerCount === 1 && cleanedDiagnostics.ownedRailCount === 1, JSON.stringify(cleanedDiagnostics));
  assertCase(results, 'w94_shell_markers_and_cleanup_selectors_present', /data-idb-shell/.test(userscript) && /data-idb-instance/.test(userscript) && /aside\[aria-label="Intelligent Demo Builder drawer"\]/.test(userscript) && /button\[title="Open Intelligent Demo Builder"\]/.test(userscript), 'owned shell markers and stale install selectors');
  assertCase(results, 'w94_width_and_position_constraints_present', /--idb-drawer-width: min\(410px, calc\(100vw - 24px\)\)/.test(userscript) && /right: 0;/.test(userscript) && /height: 100vh;/.test(userscript), 'drawer width/position constraints');
  assertCase(results, 'w94_plan_first_viewport_compressed', /30-second plan/.test(planHtml) && /Demo path|Build demo plan/.test(planHtml) && !/STORY BAR/.test(planHtml) && !/LIVE QUESTION/.test(planHtml), 'Plan first viewport compression');
  assertCase(results, 'w94_no_regression_guards_present', /noSuiteScriptInvocationFromIdb/.test(userscript) && /noIdbTransactionWrite/.test(userscript) && /dccOwnsObjectGeneration/.test(userscript) && /notesRole: 'story_only'/.test(userscript), 'no-write, advisory-only, DCC ownership');

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = contract.bestNextCodexPrompt;
  contract.status = decision === 'PASS' ? 'visual_qa_duplicate_cleanup_ready' : 'visual_qa_duplicate_cleanup_failed';
  contract.validatorResults = results;

  const trace = {
    schema: 'idb.w94-visual-qa-duplicate-drawer-cleanup-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    initialDiagnostics,
    duplicateDiagnostics,
    cleanedDiagnostics,
    screenshotChecklist: contract.visualQaChecklist,
    noRegression: contract.noRegression,
    validatorResults: results,
    bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const report = [
    '# W94 Visual QA And Duplicate Drawer Cleanup',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / ONE ACTIVE DRAWER GUARANTEE READY`,
    '',
    '## Visual QA Results',
    '',
    `- Initial shell: drawers=${initialDiagnostics.drawerCount}, rails=${initialDiagnostics.railCount}, styles=${initialDiagnostics.styleCount}.`,
    `- Duplicate injected smoke: duplicateDetected=${duplicateDiagnostics.duplicateDetected}.`,
    `- Cleanup result: oneActiveRoot=${cleanedDiagnostics.oneActiveRoot}, duplicateDetected=${cleanedDiagnostics.duplicateDetected}.`,
    '- Drawer width remains constrained by `--idb-drawer-width: min(410px, calc(100vw - 24px))`.',
    '- W93 compressed Plan/Review/Run/Trace surfaces remain the expected first-viewport contract.',
    '',
    '## Screenshots Checklist',
    '',
    contract.visualQaChecklist.map((item) => `- ${item}`).join('\n'),
    '',
    '## Validator Gates',
    '',
    '| Gate | Result | Detail |',
    '| --- | --- | --- |',
    ...results.map((result) => `| ${escapeTable(result.name)} | ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    bestNextCodexPrompt.prompt
  ].join('\n');

  fs.writeFileSync(reportPath, `${report}\n`);

  if (failures.length) {
    console.error(report);
    process.exit(1);
  }
  console.log(report);
}

main();
