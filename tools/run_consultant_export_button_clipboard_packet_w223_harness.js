const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w222DataPath = path.join(root, 'data', 'w222_live_operator_packet_export_copy_freeze.json');
const dataPath = path.join(root, 'data', 'w223_consultant_export_button_clipboard_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w223_consultant_export_button_clipboard_packet_trace.json');
const reportPath = path.join(root, 'reports', 'w223_consultant_export_button_clipboard_packet.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W223 harness')),
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
    })),
    noRegression: {
      w151ImportGuardPreserved: true,
      semanticRoleMappingPreserved: true,
      modeAwareNamingGuardrailsPreserved: true,
      dynamicRecordDisplayPreserved: true,
      consultantPartialResultLanguagePreserved: true,
      operatorReadableSmokePacketPreserved: true,
      frozenReviewRunWordingPreserved: true,
      importFailureRecoveryCopyPreserved: true,
      recoveryUiSurfaceWiringPreserved: true,
      endToEndOperatorPacketPreserved: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true,
      noDirectSuiteScriptOutsideApprovedW144AdapterPath: true,
      runnerOwnsGeneratedRecords: true,
      imageLookupDisabledByDefault: true,
      nllmAdvisoryOnly: true
    }
  };
}

function main() {
  const hooks = loadHooks();
  const w222 = JSON.parse(fs.readFileSync(w222DataPath, 'utf8'));
  const w222Summary = w222.exportSummary;
  const packet = packetFromW222Rows(w222Summary.compactCaseRows);
  const copyModel = hooks.consultantExportButtonClipboardPacketW223V1(packet, {
    adminDebugEnabled: false,
    includeDiagnosticsAppendix: false
  });
  const adminCopyModel = hooks.consultantExportButtonClipboardPacketW223V1(packet, {
    adminDebugEnabled: true,
    includeDiagnosticsAppendix: true
  });
  const blockedAdminCopyModel = hooks.consultantExportButtonClipboardPacketW223V1(packet, {
    adminDebugEnabled: false,
    includeDiagnosticsAppendix: true
  });
  const renderState = hooks.defaultState();
  renderState.activeView = 'trace';
  renderState.setupEditMode = false;
  renderState.briefPrepared = true;
  renderState.intake = {
    customer: 'Northstar Trail Outfitters',
    website: 'https://www.rei.com',
    notes: 'Retail availability review.'
  };
  hooks.ensureWebsiteEvidenceRuntime(renderState);
  hooks.reconcileStateAuthority(renderState);
  const lane = hooks.getLane(renderState);
  const page = renderState.pageContext || {
    title: 'NetSuite Home',
    url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page'
  };
  const recommendation = hooks.recommendMove(lane, page);
  const traceHtml = hooks.renderTraceView(renderState, lane, page, recommendation);
  const forbiddenPattern = /(W144|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages|Paste completed governed runner result JSON|Mode contract blocked|Naming blocked)/i;
  const results = [];

  assertCase(results, 'copy_export_model_returns_w222_normal_export_text',
    copyModel.w222NormalExportText === w222Summary.normalExportText &&
      copyModel.clipboardText.indexOf(w222Summary.normalExportText) >= 0,
    `${copyModel.w222NormalExportText.length} copied row chars`);
  assertCase(results, 'export_content_includes_required_summary_sections',
    copyModel.exportContentIncludes.summaryTitle === true &&
      copyModel.exportContentIncludes.generatedTimestamp === true &&
      copyModel.exportContentIncludes.caseCounts === true &&
      copyModel.exportContentIncludes.compactCaseRows === true &&
      copyModel.exportContentIncludes.noRegressionBoundarySummary === true &&
      copyModel.exportContentIncludes.visualTestingDecision === true,
    JSON.stringify(copyModel.exportContentIncludes));
  assertCase(results, 'normal_copy_hides_forbidden_internal_terms',
    copyModel.normalCopyHidesForbiddenTerms === true &&
      !forbiddenPattern.test(copyModel.clipboardText),
    copyModel.clipboardText);
  assertCase(results, 'admin_debug_appendix_excluded_unless_explicitly_requested',
    copyModel.diagnosticsAppendixIncluded === false &&
      blockedAdminCopyModel.diagnosticsAppendixIncluded === false &&
      adminCopyModel.diagnosticsAppendixIncluded === true,
    `normal=${copyModel.diagnosticsAppendixIncluded}, blocked=${blockedAdminCopyModel.diagnosticsAppendixIncluded}, admin=${adminCopyModel.diagnosticsAppendixIncluded}`);
  assertCase(results, 'ui_labels_and_status_copy_are_exact',
    copyModel.ui.buttonLabel === 'Copy operator summary' &&
      copyModel.ui.successCopy === 'Operator summary copied.' &&
      copyModel.ui.failureCopy === 'Copy failed. Use export from admin/debug.' &&
      traceHtml.indexOf('Copy operator summary') >= 0,
    JSON.stringify(copyModel.ui));
  assertCase(results, 'no_drawer_writes_or_suitescript_calls_introduced',
    copyModel.noRegressionBoundarySummary.noDrawerWritesIntroduced === true &&
      copyModel.noRegressionBoundarySummary.noTransactionWritesIntroduced === true &&
      copyModel.noRegressionBoundarySummary.noSuiteScriptCallsIntroduced === true &&
      copyModel.rawJsonShownInNormalUi === false,
    JSON.stringify(copyModel.noRegressionBoundarySummary));
  assertCase(results, 'w218_success_and_w220_recovery_wording_unchanged',
    copyModel.clipboardText.indexOf('Build results are ready.') >= 0 &&
      copyModel.clipboardText.indexOf('Food batch records are ready. WIP detail was not returned.') >= 0 &&
      copyModel.clipboardText.indexOf('Paste the completed build result.') >= 0 &&
      copyModel.clipboardText.indexOf('This result does not match the selected operating mode.') >= 0 &&
      copyModel.clipboardText.indexOf('Ask the runner to return real NetSuite links.') >= 0 &&
      copyModel.clipboardText.indexOf('Use available records only after import succeeds.') >= 0,
    'frozen success and recovery copy present');
  assertCase(results, 'normal_rendered_trace_copy_hides_internal_terms',
    traceHtml.indexOf('Copy operator summary') >= 0 &&
      !/(raw JSON|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages)/i.test(traceHtml),
    traceHtml.slice(0, 800));

  const passCount = results.filter((item) => item.pass).length;
  const harnessSummary = {
    schema: 'idb.w223-consultant-export-button-clipboard-packet-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    copyModel,
    adminCopyModel
  };
  const trace = {
    schema: 'idb.w223-consultant-export-button-clipboard-packet-trace.v1',
    ui: copyModel.ui,
    diagnosticsAppendixIncluded: copyModel.diagnosticsAppendixIncluded,
    adminDiagnosticsAppendixIncluded: adminCopyModel.diagnosticsAppendixIncluded,
    exportContentIncludes: copyModel.exportContentIncludes,
    normalCopyHidesForbiddenTerms: copyModel.normalCopyHidesForbiddenTerms,
    caseRows: w222Summary.compactCaseRows.map((row) => ({
      scenarioLabel: row.scenarioLabel,
      status: row.status,
      headline: row.consultantHeadline,
      nextAction: row.nextAction
    }))
  };
  writeJson(dataPath, harnessSummary);
  writeJson(tracePath, trace);
  const report = [
    '# W223 Consultant Export Button And Clipboard Packet Wiring',
    '',
    `Status: ${harnessSummary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Copy/Export Action Model',
    `- Button: ${copyModel.ui.buttonLabel}`,
    `- Success: ${copyModel.ui.successCopy}`,
    `- Failure: ${copyModel.ui.failureCopy}`,
    `- Diagnostics appendix in normal export: ${copyModel.diagnosticsAppendixIncluded ? 'yes' : 'no'}`,
    `- Diagnostics appendix in admin/debug explicit export: ${adminCopyModel.diagnosticsAppendixIncluded ? 'yes' : 'no'}`,
    '',
    '## UI Copy Freeze',
    '- Copy operator summary',
    '- Operator summary copied.',
    '- Copy failed. Use export from admin/debug.',
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    '- trace_samples/w223_consultant_export_button_clipboard_packet_trace.json',
    '- data/w223_consultant_export_button_clipboard_packet.json',
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only if deploying W223 copy/export wiring.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W223.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run for W223. Clipboard/export behavior is covered by the W223 harness and W222 fixture copy freeze.',
    '',
    '## Best Next Codex Prompt',
    'Move through W224: Operator Summary Export Live Surface Polish. Use W223 copy/export wiring to polish the live drawer placement, state feedback, and admin/debug appendix toggle for the operator summary while preserving frozen W218/W220/W222 copy, W151, real Open links, no drawer writes, and no broad visual testing.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W223 consultant export button clipboard packet: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W223 consultant export button clipboard packet: pass; ${passCount}/${results.length} checks`);
}

main();
