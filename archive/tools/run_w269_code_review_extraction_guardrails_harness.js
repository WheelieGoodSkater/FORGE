#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w269_code_review_extraction_guardrails.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w269_code_review_extraction_guardrails_trace.json');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function loadHooks() {
  const storage = new Map();
  const localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key)
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
    fetch: () => Promise.reject(new Error('live fetch disabled in W269 harness')),
    globalThis: null,
    window: {
      self: null,
      top: null,
      location: {
        href: 'https://td3021666.app.netsuite.com/app/center/card.nl',
        pathname: '/app/center/card.nl',
        search: ''
      },
      localStorage,
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

function main() {
  const hooks = loadHooks();
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const inventory = hooks.codeReviewPrepInventoryW268();
  const findings = hooks.codeReviewFindingsReportW269({ inventory });
  const plan = hooks.extractionPlanW269();
  const guardrails = hooks.optimizationGuardrailPacketW269();
  const releaseTemplate = hooks.installedDrawerLiveEvidenceIntakeTemplateW268();
  const releasePacketAvailable = typeof hooks.releaseKeepPacketV100W268 === 'function';
  const requiredRiskCategories = [
    'behavior/regression risk',
    'maintainability risk',
    'test/harness duplication risk',
    'future lane-pack expansion risk',
    'UX trust/readability risk'
  ];
  const requiredPhaseIds = [
    'phase_1_shared_archived_harness_fixture_utilities',
    'phase_2_adapter_profile_readiness_contract_extraction',
    'phase_3_live_evidence_signoff_packet_contract_extraction',
    'phase_4_story_surface_receipt_script_sequence_contract_extraction',
    'phase_5_lane_pack_authoring_expansion_workflow_cleanup'
  ];
  const results = [];

  assertCase(results, 'code-review-findings-include-all-risk-categories',
    findings.schema === 'forge.w269.code-review-findings-report.v1' &&
      requiredRiskCategories.every((category) => findings.findings.some((finding) => finding.riskCategory === category)) &&
      findings.findings.every((finding) => finding.id && finding.severity && finding.recommendation),
    JSON.stringify(findings.findings));

  assertCase(results, 'extraction-plan-includes-five-phases-with-parity-and-rollback',
    plan.schema === 'forge.w269.low-risk-extraction-plan.v1' &&
      requiredPhaseIds.every((id) => plan.phases.some((phase) => phase.id === id)) &&
      plan.phases.every((phase) =>
        phase.sourceHelperArea &&
        phase.proposedTargetModule &&
        Array.isArray(phase.behaviorSurfacesThatMustStayIdentical) &&
        phase.behaviorSurfacesThatMustStayIdentical.length > 0 &&
        Array.isArray(phase.parityHarnesses) &&
        phase.parityHarnesses.length > 0 &&
        phase.rollbackBoundary
      ),
    JSON.stringify(plan.phases));

  assertCase(results, 'optimization-guardrail-preserves-w218-w220-w245-w262-through-w268',
    guardrails.schema === 'forge.w269.optimization-guardrail-packet.v1' &&
      /W218/.test(guardrails.preservedBehaviorSurfaces.join(' ')) &&
      /W220/.test(guardrails.preservedBehaviorSurfaces.join(' ')) &&
      /W245/.test(guardrails.preservedBehaviorSurfaces.join(' ')) &&
      /W262/.test(guardrails.preservedBehaviorSurfaces.join(' ')) &&
      /W268/.test(guardrails.preservedBehaviorSurfaces.join(' ')) &&
      guardrails.guardrails.noDrawerCreatedRecords === true &&
      guardrails.guardrails.noDrawerTransactionWrites === true &&
      guardrails.guardrails.approvedW144AdapterOnlyRecordCreation === true,
    JSON.stringify(guardrails));

  assertCase(results, 'review-artifacts-introduce-no-external-actions',
    findings.reviewOnlyPolicy.networkCallAllowed === false &&
      plan.reviewOnlyPolicy.externalUploadAllowed === false &&
      guardrails.reviewOnlyPolicy.trackingAllowed === false &&
      guardrails.reviewOnlyPolicy.localStorageWriteAllowed === false &&
      guardrails.reviewOnlyPolicy.installActionAllowed === false &&
      guardrails.reviewOnlyPolicy.runtimeDependencyAdded === false,
    JSON.stringify({ findings: findings.reviewOnlyPolicy, plan: plan.reviewOnlyPolicy, guardrails: guardrails.reviewOnlyPolicy }));

  assertCase(results, 'w268-release-keep-packet-remains-available',
    releaseTemplate.schema === 'forge.w268.installed-drawer-live-evidence-intake-template.v1' &&
      releasePacketAvailable === true &&
      inventory.schema === 'forge.w268.code-review-prep-inventory.v1',
    JSON.stringify({ releaseTemplate: releaseTemplate.schema, releasePacketAvailable, inventory: inventory.schema }));

  assertCase(results, 'w264-through-w268-continuity-harnesses-listed',
    guardrails.requiredParityHarnesses.some((cmd) => /w264/.test(cmd)) &&
      guardrails.requiredParityHarnesses.some((cmd) => /w265/.test(cmd)) &&
      guardrails.requiredParityHarnesses.some((cmd) => /w266/.test(cmd)) &&
      guardrails.requiredParityHarnesses.some((cmd) => /w267/.test(cmd)) &&
      guardrails.requiredParityHarnesses.some((cmd) => /w268/.test(cmd)),
    guardrails.requiredParityHarnesses.join(' | '));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    guardrails.authorityBoundaries.some((item) => /no drawer-created records/.test(item)) &&
      guardrails.authorityBoundaries.some((item) => /no drawer transaction writes/.test(item)) &&
      guardrails.authorityBoundaries.some((item) => /approved W144/.test(item)),
    JSON.stringify(guardrails.authorityBoundaries));

  assertCase(results, 'report-and-trace-archived',
    /W269 Code Review Findings/.test(report) &&
      trace.schema === 'forge.w269.code-review-extraction-guardrails.trace.v1' &&
      trace.extractionPlan.phaseCount === 5 &&
      trace.guardrails.noDrawerCreatedRecords === true,
    JSON.stringify(trace));

  const failed = results.filter((item) => !item.pass);
  results.forEach((item) => {
    console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.id}`);
    if (!item.pass && item.evidence) console.log(item.evidence);
  });
  console.log(`W269 code review extraction guardrails harness: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main();
