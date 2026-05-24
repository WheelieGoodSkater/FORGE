const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w222DataPath = path.join(root, 'data', 'w222_live_operator_packet_export_copy_freeze.json');
const dataPath = path.join(root, 'data', 'w225_forge_branding_targeted_live_header_smoke.json');
const tracePath = path.join(root, 'trace_samples', 'w225_forge_branding_targeted_live_header_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w225_forge_branding_targeted_live_header_smoke.md');

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

class TestNode {
  constructor(tagName, ownerDocument) {
    this.tagName = String(tagName || '').toUpperCase();
    this.ownerDocument = ownerDocument || null;
    this.children = [];
    this.parentNode = null;
    this.attributes = {};
    this.style = { setProperty: (key, value) => { this.style[key] = value; } };
    this.classList = {
      add: (...names) => names.forEach((name) => this._toggleClass(name, true)),
      remove: (...names) => names.forEach((name) => this._toggleClass(name, false)),
      toggle: (name, force) => this._toggleClass(name, force === undefined ? !this._hasClass(name) : force),
      contains: (name) => this._hasClass(name)
    };
    this.eventListeners = {};
    this.innerHTML = '';
    this.textContent = '';
    this.title = '';
    this.type = '';
    this.id = '';
  }

  _hasClass(name) {
    return String(this.attributes.class || '').split(/\s+/).filter(Boolean).includes(name);
  }

  _toggleClass(name, force) {
    const classes = new Set(String(this.attributes.class || '').split(/\s+/).filter(Boolean));
    if (force) classes.add(name);
    else classes.delete(name);
    this.attributes.class = Array.from(classes).join(' ');
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'id') this.id = String(value);
    if (name === 'title') this.title = String(value);
  }

  getAttribute(name) {
    if (name === 'id') return this.id || this.attributes.id || null;
    if (name === 'title') return this.title || this.attributes.title || null;
    return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((item) => item !== this);
    this.parentNode = null;
  }

  addEventListener(type, handler) {
    this.eventListeners[type] = this.eventListeners[type] || [];
    this.eventListeners[type].push(handler);
  }

  removeEventListener(type, handler) {
    this.eventListeners[type] = (this.eventListeners[type] || []).filter((item) => item !== handler);
  }

  querySelectorAll(selector) {
    const matches = [];
    const selectors = String(selector || '').split(',').map((item) => item.trim()).filter(Boolean);
    const isMatch = (node, sel) => {
      if (!sel) return false;
      if (sel[0] === '#') return node.id === sel.slice(1);
      const attrMatch = sel.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
      if (attrMatch) {
        const value = node.getAttribute(attrMatch[1]);
        return attrMatch[2] === undefined ? value !== null : value === attrMatch[2];
      }
      const tagAttr = sel.match(/^([a-zA-Z]+)\[([^=\]]+)="([^"]*)"\]$/);
      if (tagAttr) {
        return node.tagName.toLowerCase() === tagAttr[1].toLowerCase() && node.getAttribute(tagAttr[2]) === tagAttr[3];
      }
      return node.tagName.toLowerCase() === sel.toLowerCase();
    };
    const walk = (node) => {
      node.children.forEach((child) => {
        if (selectors.some((sel) => isMatch(child, sel))) matches.push(child);
        walk(child);
      });
    };
    walk(this);
    return matches;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  getBoundingClientRect() {
    return { width: this.id === 'idb-drawer' ? 410 : 72, height: 80, top: 0, left: 0, right: 0, bottom: 0 };
  }
}

class TestDocument {
  constructor() {
    this.readyState = 'complete';
    this.title = 'NetSuite Home';
    this.documentElement = new TestNode('html', this);
    this.body = new TestNode('body', this);
    this.body.innerText = '';
    this.head = new TestNode('head', this);
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
  }

  createElement(tagName) {
    return new TestNode(tagName, this);
  }

  querySelectorAll(selector) {
    return this.documentElement.querySelectorAll(selector);
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  getElementById(id) {
    return this.querySelector(`#${id}`);
  }

  addEventListener() {}
}

function createSandbox(runInit) {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
  const document = new TestDocument();
  const window = {
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
    setTimeout: (fn) => { if (typeof fn === 'function') fn(); return 1; },
    innerWidth: 1440
  };
  window.self = window;
  window.top = window;
  window.window = window;
  window.document = document;
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
    navigator: { clipboard: { writeText: async () => undefined } },
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W225 harness')),
    globalThis: null,
    window,
    document,
    __IDB_ENABLE_TEST_HOOKS__: true
  };
  if (!runInit) document.readyState = 'loading';
  sandbox.globalThis = sandbox;
  window.globalThis = sandbox;
  return sandbox;
}

function loadHooksOnly() {
  const sandbox = createSandbox(false);
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function runLiveShell() {
  const sandbox = createSandbox(true);
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  const rail = sandbox.document.getElementById('idb-rail-button');
  const drawer = sandbox.document.getElementById('idb-drawer');
  return {
    sandbox,
    rail,
    drawer,
    drawerHtml: drawer ? drawer.innerHTML : '',
    railText: rail ? rail.textContent : '',
    railTitle: rail ? rail.title || rail.getAttribute('title') : ''
  };
}

function statusToCaseType(row) {
  if (row.status === 'Recovery') {
    if (/Blank/.test(row.scenarioLabel)) return 'blank_import_recovery';
    if (/Handoff/.test(row.scenarioLabel)) return 'handoff_json_recovery';
    if (/Invalid/.test(row.scenarioLabel)) return 'invalid_role_name_recovery';
    return 'missing_id_or_unsupported_url_recovery';
  }
  if (row.status === 'Partial') return 'partial_food_batch_wip';
  return /Manufacturing/.test(row.scenarioLabel) ? 'complete_manufacturing' : 'complete_non_manufacturing';
}

function packetFromW222Rows(rows) {
  return {
    schema: 'idb.w221-end-to-end-success-recovery-operator-packet.v1',
    status: 'end_to_end_operator_packet_ready',
    cases: rows.map((row) => ({
      scenarioLabel: row.scenarioLabel,
      caseType: statusToCaseType(row),
      resolvedOperatingMode: row.mode,
      consultantReviewHeadline: row.consultantHeadline,
      consultantRunOrRecoveryAction: row.nextAction,
      visibleRecordLabels: row.visibleLabels === 'No Open links yet' ? [] : row.visibleLabels.split(', '),
      visibleRecords: [],
      openLinkReadiness: {
        validImport: row.status !== 'Recovery',
        realOpenLinksReady: row.openLinkReadiness === 'Ready',
        noFakeOpenLinksBeforeValidImport: row.status !== 'Recovery' || row.openLinkReadiness === 'No Open links yet'
      },
      adminDebugDiagnosticsAvailability: row.adminDebugAvailability === 'Available',
      forbiddenNormalUiTermsCheck: true,
      normalPacketCopy: row.normalCopy || '',
      surface: row.status === 'Recovery' ? 'recovery' : 'success_or_partial_import'
    }))
  };
}

function main() {
  const hooks = loadHooksOnly();
  const live = runLiveShell();
  const w222 = JSON.parse(fs.readFileSync(w222DataPath, 'utf8'));
  const packet = packetFromW222Rows(w222.exportSummary.compactCaseRows);
  const state = hooks.defaultState();
  state.activeView = 'trace';
  state.setupEditMode = false;
  state.briefPrepared = true;
  state.intake = {
    customer: 'Northstar Trail Outfitters',
    website: 'https://www.rei.com',
    notes: 'Retail availability review.'
  };
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext || {
    title: 'NetSuite Home',
    url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page'
  };
  const recommendation = hooks.recommendMove(lane, page);
  const traceHtml = hooks.renderTraceView(state, lane, page, recommendation);
  const adminState = Object.assign({}, state, { setupEditMode: true, includeOperatorSummaryDiagnostics: false });
  const adminTraceHtml = hooks.renderTraceView(adminState, lane, page, recommendation);
  const normalCopy = hooks.consultantExportButtonClipboardPacketW223V1(packet, {
    adminDebugEnabled: false,
    includeDiagnosticsAppendix: false
  });
  const w222Summary = hooks.exportableOperatorSummaryW222V1(packet, { adminDebug: false });
  const forbiddenPattern = /(W144|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages|Paste completed governed runner result JSON|Mode contract blocked|Naming blocked)/i;
  const stripImageData = (html) => String(html || '').replace(/data:image\/png;base64,[^"')\s<]+/g, 'data:image/png;base64,[image]');
  const results = [];

  assertCase(results, 'live_rendered_shell_header_includes_forge_asset',
    live.drawerHtml.indexOf('idb-forge-logo') >= 0 &&
      live.drawerHtml.indexOf('data:image/png;base64,') >= 0 &&
      hooks.FORGE_BRAND_IMAGE_SRC.indexOf('data:image/png;base64,') === 0,
    `drawer=${Boolean(live.drawer)}, assetPrefix=${hooks.FORGE_BRAND_IMAGE_SRC.slice(0, 22)}`);
  assertCase(results, 'live_rendered_shell_has_forge_rail_label',
    live.railText === 'FORGE' &&
      /^Open FORGE\b/.test(live.railTitle) &&
      !/Intelligent Demo Builder/.test(live.railTitle),
    `text=${live.railText}, title=${live.railTitle}`);
  assertCase(results, 'old_visible_branding_absent_from_live_header',
    !/NetSuite companion|Intelligent Demo Builder/.test(live.drawerHtml),
    live.drawerHtml.slice(0, 800));
  assertCase(results, 'close_button_accessible_in_live_header',
    live.drawerHtml.indexOf('data-idb-close') >= 0 &&
      live.drawerHtml.indexOf('title="Close drawer"') >= 0,
    'close button title retained');
  assertCase(results, 'image_alt_text_exact_in_live_header',
    live.drawerHtml.indexOf('alt="FORGE SC Demo Creation Tool"') >= 0,
    hooks.FORGE_BRAND_ALT_TEXT);
  assertCase(results, 'operator_summary_copy_control_present',
    traceHtml.indexOf('data-idb-copy-operator-summary') >= 0 &&
      traceHtml.indexOf('Copy operator summary') >= 0,
    'trace import/status surface has copy action');
  assertCase(results, 'copy_summary_feedback_exact',
    normalCopy.ui.successCopy === 'Operator summary copied.' &&
      normalCopy.ui.failureCopy === 'Copy failed. Use export from admin/debug.',
    JSON.stringify(normalCopy.ui));
  assertCase(results, 'admin_debug_appendix_toggle_gating_correct',
    traceHtml.indexOf('data-idb-operator-summary-diagnostics') < 0 &&
      adminTraceHtml.indexOf('data-idb-operator-summary-diagnostics') >= 0,
    `normal=${traceHtml.indexOf('data-idb-operator-summary-diagnostics')}, admin=${adminTraceHtml.indexOf('data-idb-operator-summary-diagnostics')}`);
  assertCase(results, 'normal_rendered_html_hides_forbidden_terms',
    !forbiddenPattern.test(stripImageData(live.drawerHtml)) &&
      !forbiddenPattern.test(traceHtml) &&
      normalCopy.normalCopyHidesForbiddenTerms === true,
    'normal shell and trace surfaces hide internal terms');
  assertCase(results, 'w218_w220_w222_w223_w224_remain_unchanged',
    normalCopy.clipboardText.indexOf('Build results are ready.') >= 0 &&
      normalCopy.clipboardText.indexOf('Food batch records are ready. WIP detail was not returned.') >= 0 &&
      normalCopy.clipboardText.indexOf('Paste the completed build result.') >= 0 &&
      normalCopy.clipboardText.indexOf('This result does not match the selected operating mode.') >= 0 &&
      normalCopy.w222NormalExportText === w222Summary.normalExportText &&
      normalCopy.ui.buttonLabel === 'Copy operator summary' &&
      live.railText === 'FORGE',
    'frozen success/recovery/export/copy/branding preserved');
  assertCase(results, 'targeted_only_no_runner_suitescript_or_drawer_writes',
    normalCopy.noRegressionBoundarySummary.noDrawerCreatedRecords === true &&
      normalCopy.noRegressionBoundarySummary.noDrawerTransactionWrites === true &&
      normalCopy.noRegressionBoundarySummary.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      normalCopy.noRegressionBoundarySummary.noDrawerWritesIntroduced === true &&
      normalCopy.noRegressionBoundarySummary.noTransactionWritesIntroduced === true &&
      normalCopy.noRegressionBoundarySummary.noSuiteScriptCallsIntroduced === true,
    JSON.stringify(normalCopy.noRegressionBoundarySummary));

  const passCount = results.filter((item) => item.pass).length;
  const harnessSummary = {
    schema: 'idb.w225-forge-branding-targeted-live-header-smoke-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    smokePacket: {
      schema: 'idb.w225-targeted-live-forge-header-smoke-packet.v1',
      railText: live.railText,
      railTitle: live.railTitle,
      headerUsesForgeLogo: live.drawerHtml.indexOf('idb-forge-logo') >= 0,
      oldHeaderBrandingAbsent: !/NetSuite companion|Intelligent Demo Builder/.test(live.drawerHtml),
      closeButtonAccessible: live.drawerHtml.indexOf('title="Close drawer"') >= 0,
      copyOperatorSummaryPresent: traceHtml.indexOf('Copy operator summary') >= 0,
      diagnosticsToggleNormalHidden: traceHtml.indexOf('data-idb-operator-summary-diagnostics') < 0,
      diagnosticsToggleAdminVisible: adminTraceHtml.indexOf('data-idb-operator-summary-diagnostics') >= 0
    }
  };
  const trace = {
    schema: 'idb.w225-forge-branding-targeted-live-header-smoke-trace.v1',
    railText: live.railText,
    railTitle: live.railTitle,
    header: {
      forgeLogoClassPresent: live.drawerHtml.indexOf('idb-forge-logo') >= 0,
      forgeAltTextPresent: live.drawerHtml.indexOf('alt="FORGE SC Demo Creation Tool"') >= 0,
      oldBrandingAbsent: !/NetSuite companion|Intelligent Demo Builder/.test(live.drawerHtml),
      closeButtonAccessible: live.drawerHtml.indexOf('title="Close drawer"') >= 0
    },
    operatorSummary: {
      copyControlPresent: traceHtml.indexOf('Copy operator summary') >= 0,
      successCopy: normalCopy.ui.successCopy,
      failureCopy: normalCopy.ui.failureCopy,
      adminDebugToggleGated: traceHtml.indexOf('data-idb-operator-summary-diagnostics') < 0 && adminTraceHtml.indexOf('data-idb-operator-summary-diagnostics') >= 0
    },
    visualTestingDecision: 'No broad visual testing for W225; targeted live-rendered shell smoke only.'
  };
  writeJson(dataPath, harnessSummary);
  writeJson(tracePath, trace);
  const report = [
    '# W225 FORGE Branding Targeted Live Header Smoke',
    '',
    `Status: ${harnessSummary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Targeted Live FORGE Header Smoke Packet',
    `- Rail text: ${live.railText}`,
    `- Rail title: ${live.railTitle}`,
    '- Header logo: embedded FORGE image present',
    '- Header alt text: FORGE SC Demo Creation Tool',
    '- Old visible branding: absent from live header',
    '- Close button: present with accessible title',
    '',
    '## Operator Summary Surface Smoke Assertions',
    '- Copy operator summary control remains present near the operator import/status surface.',
    '- Operator summary copied.',
    '- Copy failed. Use export from admin/debug.',
    '- Admin/debug diagnostics appendix toggle is hidden in normal mode and visible in admin/debug mode.',
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    '- trace_samples/w225_forge_branding_targeted_live_header_smoke_trace.json',
    '- data/w225_forge_branding_targeted_live_header_smoke.json',
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only if deploying through W225.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W225.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run for W225. This block used a targeted live-rendered shell/header smoke only.',
    '',
    '## Best Next Codex Prompt',
    'Move through W226: FORGE Header Install Packet And Operator Cutover Note. Use W225 targeted live header smoke to produce the final install/update packet and compact operator cutover note for replacing the Tampermonkey drawer with the FORGE-branded script while preserving W214-W225 boundaries and no broad visual testing.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W225 FORGE branding targeted live header smoke: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W225 FORGE branding targeted live header smoke: pass; ${passCount}/${results.length} checks`);
}

main();
