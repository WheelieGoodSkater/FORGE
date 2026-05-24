const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w222DataPath = path.join(root, 'data', 'w222_live_operator_packet_export_copy_freeze.json');
const dataPath = path.join(root, 'data', 'w224_forge_header_branding_operator_summary_surface.json');
const tracePath = path.join(root, 'trace_samples', 'w224_forge_header_branding_operator_summary_surface_trace.json');
const reportPath = path.join(root, 'reports', 'w224_forge_header_branding_operator_summary_surface.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W224 harness')),
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
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
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
  const drawerHtml = hooks.renderDrawer(state);
  const traceHtml = hooks.renderTraceView(state, lane, page, recommendation);
  const adminState = Object.assign({}, state, { setupEditMode: true, includeOperatorSummaryDiagnostics: false });
  const adminTraceHtml = hooks.renderTraceView(adminState, lane, page, recommendation);
  const adminDiagnosticsState = Object.assign({}, state, { setupEditMode: true, includeOperatorSummaryDiagnostics: true });
  const adminDiagnosticsTraceHtml = hooks.renderTraceView(adminDiagnosticsState, lane, page, recommendation);
  const polish = hooks.forgeHeaderBrandingOperatorSummarySurfacePolishW224V1(state, lane, page, recommendation, {
    drawerHtml,
    traceHtml,
    adminTraceHtml,
    packet
  });
  const normalCopy = hooks.consultantExportButtonClipboardPacketW223V1(packet, {
    adminDebugEnabled: false,
    includeDiagnosticsAppendix: false
  });
  const adminDefaultCopy = hooks.consultantExportButtonClipboardPacketW223V1(packet, {
    adminDebugEnabled: true,
    includeDiagnosticsAppendix: false
  });
  const adminExplicitCopy = hooks.consultantExportButtonClipboardPacketW223V1(packet, {
    adminDebugEnabled: true,
    includeDiagnosticsAppendix: true
  });
  const w222Summary = hooks.exportableOperatorSummaryW222V1(packet, { adminDebug: false });
  const forbiddenPattern = /(W144|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages|Paste completed governed runner result JSON|Mode contract blocked|Naming blocked)/i;
  const results = [];

  assertCase(results, 'rendered_drawer_header_uses_forge_image_asset',
    drawerHtml.indexOf('idb-forge-logo') >= 0 &&
      drawerHtml.indexOf('data:image/png;base64,') >= 0 &&
      hooks.FORGE_BRAND_IMAGE_SRC.indexOf('data:image/png;base64,') === 0,
    `asset prefix=${hooks.FORGE_BRAND_IMAGE_SRC.slice(0, 22)}`);
  assertCase(results, 'old_header_text_removed_from_header',
    !/NetSuite companion|Intelligent Demo Builder/.test(drawerHtml),
    drawerHtml.slice(0, 900));
  assertCase(results, 'launcher_rail_button_renamed_to_forge',
    /rail\.textContent = 'FORGE'/.test(userscript) &&
      !/rail\.textContent = 'Demo'/.test(userscript),
    'rail text source locked to FORGE');
  assertCase(results, 'forge_image_alt_text_exact_and_close_button_accessible',
    drawerHtml.indexOf('alt="FORGE SC Demo Creation Tool"') >= 0 &&
      drawerHtml.indexOf('data-idb-close') >= 0 &&
      drawerHtml.indexOf('title="Close drawer"') >= 0,
    hooks.FORGE_BRAND_ALT_TEXT);
  assertCase(results, 'copy_action_in_operator_location',
    traceHtml.indexOf('data-idb-copy-operator-summary') >= 0 &&
      traceHtml.indexOf('Copy operator summary') >= 0,
    'trace surface contains compact copy action');
  assertCase(results, 'normal_consultant_feedback_copy_exact',
    normalCopy.ui.buttonLabel === 'Copy operator summary' &&
      normalCopy.ui.successCopy === 'Operator summary copied.' &&
      normalCopy.ui.failureCopy === 'Copy failed. Use export from admin/debug.',
    JSON.stringify(normalCopy.ui));
  assertCase(results, 'admin_debug_appendix_toggle_visible_only_in_admin_debug',
    traceHtml.indexOf('data-idb-operator-summary-diagnostics') < 0 &&
      adminTraceHtml.indexOf('data-idb-operator-summary-diagnostics') >= 0 &&
      adminDiagnosticsTraceHtml.indexOf('checked') >= 0,
    `normal=${traceHtml.indexOf('data-idb-operator-summary-diagnostics')}, admin=${adminTraceHtml.indexOf('data-idb-operator-summary-diagnostics')}`);
  assertCase(results, 'diagnostics_appendix_default_off',
    adminDefaultCopy.diagnosticsAppendixIncluded === false &&
      adminExplicitCopy.diagnosticsAppendixIncluded === true &&
      polish.operatorSummarySurface.diagnosticsAppendixDefaultOff === true,
    `default=${adminDefaultCopy.diagnosticsAppendixIncluded}, explicit=${adminExplicitCopy.diagnosticsAppendixIncluded}`);
  assertCase(results, 'normal_copy_export_hides_forbidden_internal_terms',
    normalCopy.normalCopyHidesForbiddenTerms === true &&
      !forbiddenPattern.test(normalCopy.clipboardText) &&
      !forbiddenPattern.test(traceHtml),
    normalCopy.clipboardText);
  assertCase(results, 'w218_w220_w222_copy_remains_unchanged',
    normalCopy.clipboardText.indexOf('Build results are ready.') >= 0 &&
      normalCopy.clipboardText.indexOf('Food batch records are ready. WIP detail was not returned.') >= 0 &&
      normalCopy.clipboardText.indexOf('Paste the completed build result.') >= 0 &&
      normalCopy.clipboardText.indexOf('This result does not match the selected operating mode.') >= 0 &&
      normalCopy.w222NormalExportText === w222Summary.normalExportText,
    'success, partial, recovery, and W222 rows preserved');
  assertCase(results, 'no_drawer_writes_transaction_writes_or_suitescript_calls_introduced',
    polish.noRegressionBoundarySummary.noDrawerCreatedRecords === true &&
      polish.noRegressionBoundarySummary.noDrawerTransactionWrites === true &&
      polish.noRegressionBoundarySummary.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      polish.noRegressionBoundarySummary.noDrawerWritesIntroduced === true &&
      polish.noRegressionBoundarySummary.noTransactionWritesIntroduced === true &&
      polish.noRegressionBoundarySummary.noSuiteScriptCallsIntroduced === true,
    JSON.stringify(polish.noRegressionBoundarySummary));

  const passCount = results.filter((item) => item.pass).length;
  const harnessSummary = {
    schema: 'idb.w224-forge-header-branding-operator-summary-surface-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    polish,
    normalCopySummary: {
      buttonLabel: normalCopy.ui.buttonLabel,
      successCopy: normalCopy.ui.successCopy,
      failureCopy: normalCopy.ui.failureCopy,
      normalCopyHidesForbiddenTerms: normalCopy.normalCopyHidesForbiddenTerms,
      diagnosticsAppendixIncluded: normalCopy.diagnosticsAppendixIncluded
    }
  };
  const trace = {
    schema: 'idb.w224-forge-header-branding-operator-summary-surface-trace.v1',
    branding: polish.branding,
    operatorSummarySurface: polish.operatorSummarySurface,
    copyFreeze: polish.copyFreeze,
    visualTestingDecision: polish.visualTestingDecision
  };
  writeJson(dataPath, harnessSummary);
  writeJson(tracePath, trace);
  const report = [
    '# W224 FORGE Header Branding And Operator Summary Surface Polish',
    '',
    `Status: ${harnessSummary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## FORGE Header Branding Implementation',
    '- Header brand text replaced with embedded FORGE image asset.',
    '- Image alt text: FORGE SC Demo Creation Tool',
    '- Launcher/rail button text: FORGE',
    '- Close button remains present with title: Close drawer',
    '',
    '## Admin/Debug Appendix Toggle Contract',
    '- Normal mode: diagnostics appendix toggle hidden.',
    '- Admin/debug mode: diagnostics appendix toggle visible.',
    '- Default: diagnostics appendix off.',
    '- Explicit admin/debug request: diagnostics appendix may be included.',
    '',
    '## UI Feedback Copy Freeze',
    '- Copy operator summary',
    '- Operator summary copied.',
    '- Copy failed. Use export from admin/debug.',
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    '- trace_samples/w224_forge_header_branding_operator_summary_surface_trace.json',
    '- data/w224_forge_header_branding_operator_summary_surface.json',
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only if deploying W224 branding and copy/export polish.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W224.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run for W224. Header branding and operator summary surfaces are covered by harness assertions.',
    '',
    '## Best Next Codex Prompt',
    'Move through W225: FORGE Branding Targeted Live Header Smoke. Use W224 FORGE header branding and operator-summary surface polish to run a targeted live drawer smoke that confirms the embedded FORGE logo, FORGE launcher label, close-button accessibility, and copy-summary feedback in the real rendered drawer without broad visual testing.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W224 FORGE header branding operator summary surface: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W224 FORGE header branding operator summary surface: pass; ${passCount}/${results.length} checks`);
}

main();
