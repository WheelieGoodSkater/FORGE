const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w225DataPath = path.join(root, 'data', 'w225_forge_branding_targeted_live_header_smoke.json');
const w222DataPath = path.join(root, 'data', 'w222_live_operator_packet_export_copy_freeze.json');
const dataPath = path.join(root, 'data', 'w226_forge_header_install_cutover_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w226_forge_header_install_cutover_packet_trace.json');
const reportPath = path.join(root, 'reports', 'w226_forge_header_install_cutover_packet.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W226 harness')),
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
  const w225 = JSON.parse(fs.readFileSync(w225DataPath, 'utf8'));
  const w222 = JSON.parse(fs.readFileSync(w222DataPath, 'utf8'));
  const packet = packetFromW222Rows(w222.exportSummary.compactCaseRows);
  const cutover = hooks.forgeHeaderInstallCutoverPacketW226V1({
    w225SmokePacket: w225.smokePacket
  });
  const normalCopy = hooks.consultantExportButtonClipboardPacketW223V1(packet, {
    adminDebugEnabled: false,
    includeDiagnosticsAppendix: false
  });
  const w222Summary = hooks.exportableOperatorSummaryW222V1(packet, { adminDebug: false });
  const forbiddenPattern = /(W144|runnerTaskId|raw JSON|W151|semantic guard|mode contract|internal role arrays|stack trace|raw guard messages)/i;
  const results = [];

  assertCase(results, 'responsive_logo_css_uses_more_toolbar_width_than_w224',
    /\.idb-forge-brand\s*\{[\s\S]*width:\s*min\(420px,\s*calc\(100% - 72px\)\)/.test(userscript) &&
      /previousW224WidthPx:\s*286/.test(userscript) &&
      cutover.responsiveLogoPolish.usesMoreToolbarWidth === true,
    cutover.responsiveLogoPolish.responsiveWidthRule);
  assertCase(results, 'logo_has_constraints_and_cannot_overlap_close_button',
    /max-width:\s*calc\(100% - 72px\)/.test(userscript) &&
      /overflow:\s*hidden/.test(userscript) &&
      /object-fit:\s*contain/.test(userscript) &&
      cutover.responsiveLogoPolish.objectFit === 'contain' &&
      cutover.responsiveLogoPolish.closeButtonReservedSpacePx === 72,
    JSON.stringify(cutover.responsiveLogoPolish));
  assertCase(results, 'close_button_remains_accessible',
    /data-idb-close/.test(userscript) &&
      /title="Close drawer"/.test(userscript) &&
      cutover.expectedVisibleChanges.includes('Close button remains available.'),
    'close button retained');
  assertCase(results, 'cutover_packet_names_correct_script',
    cutover.scriptToInstallOrUpdate === 'idb-drawer.user.js',
    cutover.scriptToInstallOrUpdate);
  assertCase(results, 'expected_visible_changes_match_w225_plus_larger_logo',
    cutover.expectedVisibleChanges.includes('Header shows larger responsive FORGE image.') &&
      cutover.expectedVisibleChanges.includes('Rail button says FORGE.') &&
      cutover.expectedVisibleChanges.includes('FORGE rail label is not clipped.') &&
      cutover.smokeSummary.railText === 'FORGE' &&
      cutover.smokeSummary.headerUsesForgeLogo === true,
    JSON.stringify(cutover.expectedVisibleChanges));
  assertCase(results, 'forge_rail_font_fit_correction_included',
    /font:\s*800 10px\/1 var\(--rw-font-family-body\)/.test(userscript) &&
      cutover.noRegressionBoundarySummary.forgeRailFontFitCorrectionPreserved === true,
    'rail font locked at 10px');
  assertCase(results, 'quick_operator_confirmation_steps_compact_and_complete',
    cutover.quickOperatorConfirmationSteps.length === 8 &&
      cutover.quickOperatorConfirmationSteps.some((step) => /not clipped/.test(step)) &&
      cutover.quickOperatorConfirmationSteps.some((step) => /scales without overlapping/.test(step)) &&
      cutover.quickOperatorConfirmationSteps.some((step) => /Copy operator summary/.test(step)),
    cutover.quickOperatorConfirmationSteps.join(' | '));
  assertCase(results, 'install_guidance_is_tampermonkey_only',
    cutover.installGuidance.updateTampermonkeyDrawerScriptOnly === true &&
      cutover.installGuidance.noW144AdapterUpdate === true &&
      cutover.installGuidance.noRunnerUpdate === true &&
      cutover.installGuidance.noSuiteScriptDeploymentUpdate === true &&
      cutover.installGuidance.noImageLookupChange === true,
    JSON.stringify(cutover.installGuidance));
  assertCase(results, 'normal_cutover_note_hides_forbidden_internal_terms',
    cutover.normalCutoverNoteHidesForbiddenTerms === true &&
      !forbiddenPattern.test(cutover.normalCutoverNote),
    cutover.normalCutoverNote);
  assertCase(results, 'prior_w218_to_w225_contracts_remain_unchanged',
    normalCopy.clipboardText.indexOf('Build results are ready.') >= 0 &&
      normalCopy.clipboardText.indexOf('Food batch records are ready. WIP detail was not returned.') >= 0 &&
      normalCopy.clipboardText.indexOf('Paste the completed build result.') >= 0 &&
      normalCopy.clipboardText.indexOf('This result does not match the selected operating mode.') >= 0 &&
      normalCopy.w222NormalExportText === w222Summary.normalExportText &&
      normalCopy.ui.buttonLabel === 'Copy operator summary' &&
      cutover.smokeSummary.oldHeaderBrandingAbsent === true &&
      cutover.noRegressionBoundarySummary.targetedLiveHeaderSmokePreserved === true,
    'W218/W220/W222/W223/W224/W225 contracts preserved');
  assertCase(results, 'w214_to_w225_boundaries_preserved',
    cutover.noRegressionBoundarySummary.w151ImportGuardPreserved === true &&
      cutover.noRegressionBoundarySummary.semanticRoleMappingPreserved === true &&
      cutover.noRegressionBoundarySummary.modeAwareNamingGuardrailsPreserved === true &&
      cutover.noRegressionBoundarySummary.noDrawerCreatedRecords === true &&
      cutover.noRegressionBoundarySummary.noDrawerTransactionWrites === true &&
      cutover.noRegressionBoundarySummary.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      cutover.noRegressionBoundarySummary.runnerOwnsGeneratedRecords === true &&
      cutover.noRegressionBoundarySummary.imageLookupDisabledByDefault === true &&
      cutover.noRegressionBoundarySummary.nllmAdvisoryOnly === true,
    JSON.stringify(cutover.noRegressionBoundarySummary));

  const passCount = results.filter((item) => item.pass).length;
  const harnessSummary = {
    schema: 'idb.w226-forge-header-install-cutover-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    cutover
  };
  const trace = {
    schema: 'idb.w226-forge-header-install-cutover-trace.v1',
    responsiveLogoPolish: cutover.responsiveLogoPolish,
    scriptToInstallOrUpdate: cutover.scriptToInstallOrUpdate,
    expectedVisibleChanges: cutover.expectedVisibleChanges,
    quickOperatorConfirmationSteps: cutover.quickOperatorConfirmationSteps,
    installGuidance: cutover.installGuidance,
    normalCutoverNoteHidesForbiddenTerms: cutover.normalCutoverNoteHidesForbiddenTerms,
    visualTestingDecision: cutover.visualTestingDecision
  };
  writeJson(dataPath, harnessSummary);
  writeJson(tracePath, trace);
  const report = [
    '# W226 FORGE Header Responsive Logo Polish And Install Cutover Packet',
    '',
    `Status: ${harnessSummary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Responsive FORGE Header Logo Polish',
    `- Width rule: ${cutover.responsiveLogoPolish.responsiveWidthRule}`,
    `- Previous W224 width: ${cutover.responsiveLogoPolish.previousW224WidthPx}px`,
    `- W226 width: ${cutover.responsiveLogoPolish.largerThanW224WidthPx}px`,
    '- Close button reserved space: 72px',
    '- Object fit: contain',
    '',
    '## Install/Update Packet',
    `- Script: ${cutover.scriptToInstallOrUpdate}`,
    '- Install path: update Tampermonkey drawer script only.',
    '- No adapter, runner, SuiteScript deployment, or image lookup update requested.',
    '',
    '## Compact Operator Cutover Note',
    '```text',
    cutover.normalCutoverNote,
    '```',
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    '- trace_samples/w226_forge_header_install_cutover_packet_trace.json',
    '- data/w226_forge_header_install_cutover_packet.json',
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only if deploying W226.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W226.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run for W226. Responsive header logo polish and cutover copy are covered by harness assertions.',
    '',
    '## Best Next Codex Prompt',
    'Move through W227: FORGE Install Packet Final Packaging And Optional Operator Visual Check. Use W226 install/cutover packet to refresh the final upload packet and, if desired, perform only a targeted operator visual check of FORGE logo sizing and rail fit after install.',
    ''
  ].join('\n');
  writeText(reportPath, report);

  if (passCount !== results.length) {
    console.error(`W226 FORGE header install cutover: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W226 FORGE header install cutover: pass; ${passCount}/${results.length} checks`);
}

main();
