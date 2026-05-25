#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w249_lane_pack_expansion_qa_fixtures.json');
const reportPath = path.join(root, 'archive', 'reports', 'w261_post_install_smoke_evidence_capture.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w261_post_install_smoke_evidence_capture_trace.json');

function read(file) {
  return fs.readFileSync(file, 'utf8');
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
    fetch: () => Promise.reject(new Error('live fetch disabled in W261 harness')),
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
  vm.runInContext(read(userscriptPath), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function stateFor(fixture) {
  return {
    selectedLaneId: fixture.laneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: fixture.customer,
      website: fixture.website,
      notes: fixture.notes
    },
    toggles: {},
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  };
}

function record(raw) {
  return {
    role: raw.role,
    recordType: raw.recordType,
    type: raw.recordType,
    name: raw.name,
    internalId: raw.internalId,
    url: `https://YOUR_ACCOUNT_ID.app.netsuite.com${raw.path}?id=${raw.internalId}`
  };
}

function completedResult(fixture) {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: fixture.resolvedOperatingMode,
    records: fixture.records.map(record)
  };
}

function renderedFor(hooks, fixture) {
  const state = stateFor(fixture);
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  const result = completedResult(fixture);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    result,
    state,
    lane,
    page,
    recommendation
  );
  state.dccFinalNamingResult = result;
  state.selectedView = 'review';
  const story = normalized.consultantStorySurfaceW247;
  return {
    state,
    story,
    storyHtml: hooks.renderConsultantStorySurfaceW248(story),
    drawerHtml: hooks.renderDrawer(state),
    qa: hooks.receiptDrivenLaneExpansionQaW255(normalized.versionedLanePackW246.lanePack, story)
  };
}

function importedContextForWording(hooks) {
  const state = {
    selectedLaneId: 'industrial_distribution',
    selectedActionId: 'prove',
    laneSelectionSource: 'consultant_confirmed',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: 'Grainger',
      website: 'https://grainger.com',
      notes: 'Prove supplier risk, branch promise, and ROI.'
    },
    toggles: {},
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  };
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  const finalNaming = hooks.dccFinalNamingResultV1({
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'distribution_replenishment',
    records: [
      record({ role: 'customer', recordType: 'customer', name: 'Grainger Customer Account', internalId: '2001', path: '/app/common/entity/custjob.nl' }),
      record({ role: 'sales_order', recordType: 'salesorder', name: 'SO261', internalId: '3002', path: '/app/accounting/transactions/salesord.nl' }),
      record({ role: 'branch_or_product_sku', recordType: 'inventoryitem', name: 'Branch Fulfillment SKU', internalId: '4003', path: '/app/common/item/item.nl' }),
      record({ role: 'replenishment_or_availability_flow', recordType: 'inventoryitem', name: 'Branch Availability Flow', internalId: '4004', path: '/app/common/item/item.nl' })
    ]
  }, state, lane, page, recommendation);
  state.dccFinalNamingResult = finalNaming;
  return { state, lane, page, recommendation };
}

function allPassCapture(template) {
  return template.fields.reduce((capture, field) => {
    capture[field.id] = { pass: true, note: 'passed targeted smoke' };
    return capture;
  }, {});
}

function main() {
  const hooks = loadHooks();
  const fixtures = JSON.parse(read(fixturePath)).fixtures;
  const userscript = read(userscriptPath);
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const sample = renderedFor(hooks, fixtures[0]);
  const template = hooks.postInstallSmokeEvidenceCaptureTemplateW261();
  const signoffPass = hooks.releaseSignoffFromEvidenceW261(allPassCapture(template));
  const missingCapture = allPassCapture(template);
  delete missingCapture.live_proof_cta_visible;
  const signoffMissing = hooks.releaseSignoffFromEvidenceW261(missingCapture);
  const failedCapture = allPassCapture(template);
  failedCapture.feedback_placeholder_noop = { pass: false, note: 'button behavior needs review' };
  const signoffFailed = hooks.releaseSignoffFromEvidenceW261(failedCapture);
  const rollbackCapture = allPassCapture(template);
  rollbackCapture.install_target_drawer_only = { pass: false, note: 'wrong install target' };
  const signoffRollback = hooks.releaseSignoffFromEvidenceW261(rollbackCapture);
  const w260Packet = hooks.installReadyReleasePacketW260();
  const feedbackContract = hooks.feedbackPlaceholderContractW259();
  const feedbackAction = hooks.feedbackPlaceholderActionW259();
  const wordingContext = importedContextForWording(hooks);
  const wordingReviewHtml = hooks.renderReviewView(wordingContext.state, wordingContext.lane, wordingContext.page, wordingContext.recommendation);
  const wordingRunHtml = hooks.renderRunView(wordingContext.state, wordingContext.lane, wordingContext.page, wordingContext.recommendation, wordingContext.recommendation.move, { id: 'prove' }, 'W261 wording smoke');
  const results = [];

  assertCase(results, 'post-install-template-includes-required-pass-fail-note-fields',
    template.schema === 'forge.w261.post-install-smoke-evidence-capture-template.v1' &&
      template.captureMode === 'pass_fail_note' &&
      ['install_target_drawer_only', 'protected_surfaces_not_updated', 'runtime_authority_unchanged', 'launcher_opens_drawer', 'compact_header_visible', 'feedback_placeholder_noop', 'pre_import_fake_links_blocked', 'valid_import_story_ready', 'live_proof_cta_visible', 'coaching_receipt_expandable', 'weak_evidence_confirmation', 'rollback_decision_recorded'].every((id) =>
        template.fields.some((field) => field.id === id && field.capture === 'pass_fail_note' && field.required === true) &&
        trace.fieldIds.includes(id)
      ),
    JSON.stringify(template.fields.map((field) => field.id)));

  assertCase(results, 'release-signoff-ready-to-keep-when-required-fields-pass',
    signoffPass.schema === 'forge.w261.release-signoff.v1' &&
      signoffPass.status === 'ready_to_keep' &&
      signoffPass.requiredPassed === true &&
      signoffPass.rollbackRecommended === false,
    JSON.stringify(signoffPass));

  assertCase(results, 'release-signoff-needs-attention-when-required-field-missing',
    signoffMissing.status === 'needs_attention' &&
      signoffMissing.missingRequired.includes('live_proof_cta_visible') &&
      signoffMissing.rollbackRecommended === false,
    JSON.stringify(signoffMissing));

  assertCase(results, 'release-signoff-needs-attention-when-noncritical-field-fails',
    signoffFailed.status === 'needs_attention' &&
      signoffFailed.failedRequired.includes('feedback_placeholder_noop') &&
      signoffFailed.rollbackRecommended === false,
    JSON.stringify(signoffFailed));

  assertCase(results, 'release-signoff-rollback-recommended-when-boundary-fails',
    signoffRollback.status === 'rollback_recommended' &&
      signoffRollback.rollbackRecommended === true &&
      signoffRollback.rollbackCriticalFailures.includes('install_target_drawer_only'),
    JSON.stringify(signoffRollback));

  assertCase(results, 'template-and-signoff-have-no-external-actions-or-runtime-dependency',
    template.externalUrl === '' &&
      template.networkAllowed === false &&
      template.trackingAllowed === false &&
      template.localStorageWriteAllowed === false &&
      template.installActionAllowed === false &&
      template.runtimeAuthorityChanged === false &&
      [signoffPass, signoffMissing, signoffFailed, signoffRollback].every((signoff) =>
        signoff.externalUrl === '' &&
        signoff.networkAllowed === false &&
        signoff.trackingAllowed === false &&
        signoff.localStorageWriteAllowed === false &&
        signoff.installActionAllowed === false &&
        signoff.runtimeAuthorityChanged === false
      ) &&
      !/function postInstallSmokeEvidenceCaptureTemplateW261\(\)[\s\S]{0,2400}(window\.open|fetch\(|localStorage\.setItem|XMLHttpRequest|navigator\.sendBeacon|data-idb-install)/i.test(userscript) &&
      !/function releaseSignoffFromEvidenceW261\([\s\S]{0,3200}(window\.open|fetch\(|localStorage\.setItem|XMLHttpRequest|navigator\.sendBeacon|data-idb-install)/i.test(userscript),
    'W261 is local/review-only with no external action path');

  assertCase(results, 'w260-release-packet-remains-available-and-install-only',
    w260Packet.schema === 'forge.w260.install-ready-release-packet.v1' &&
      w260Packet.installTarget === 'idb-drawer.user.js' &&
      w260Packet.updateOnly.length === 1 &&
      w260Packet.updateOnly[0] === 'idb-drawer.user.js' &&
      template.sourceReleasePacketSchema === w260Packet.schema &&
      /Update\/install `idb-drawer\.user\.js` only\./.test(report),
    JSON.stringify({ w260: w260Packet.updateOnly, template: template.updateOnly }));

  assertCase(results, 'w259-feedback-placeholder-remains-noop',
    feedbackContract.futureUrlConfigured === false &&
      feedbackContract.externalUrl === '' &&
      feedbackContract.networkAllowed === false &&
      feedbackContract.trackingAllowed === false &&
      feedbackContract.localStorageWriteAllowed === false &&
      feedbackContract.installActionAllowed === false &&
      feedbackAction.status === 'no_op' &&
      feedbackAction.externalUrlOpened === false &&
      feedbackAction.networkCalled === false &&
      feedbackAction.localStorageWritten === false &&
      !/data-idb-feedback-placeholder[\s\S]{0,500}(href=|window\.open|fetch\(|localStorage\.setItem|data-idb-install|Install lane pack)/i.test(sample.drawerHtml),
    'feedback placeholder remains no-op with no URL/network/storage/install path');

  assertCase(results, 'w258-first-glance-story-remains-compact-after-valid-import',
    /Live proof CTA/.test(sample.storyHtml) &&
      /Open [^<]+/.test(sample.storyHtml) &&
      /Proof action/.test(sample.storyHtml) &&
      /Safe claim/.test(sample.storyHtml) &&
      /Stop/.test(sample.storyHtml) &&
      /Evidence confidence:/.test(sample.storyHtml),
    sample.storyHtml.slice(0, 1800));

  assertCase(results, 'w218-w220-wording-preserved',
    /Build results are ready\./.test(wordingReviewHtml) &&
      /Build results are ready\./.test(wordingRunHtml) &&
      /latest completed runner result/i.test(hooks.importRecoveryUiSurfaceW220V1({ dccFinalNamingResult: null }, sample.state.selectedLaneId, null).consultant.nextAction),
    'W218 success wording and W220 recovery wording are still present');

  assertCase(results, 'normal-ui-hides-diagnostics-and-admin-review',
    !/raw JSON|stack trace|runnerTaskId|schema:|hardLimits|writeAuthority|idb-w252-lane-pack-review|data-idb-install|Install lane pack/i.test(sample.storyHtml) &&
      !/raw JSON|stack trace|runnerTaskId|schema:|hardLimits|writeAuthority|idb-w252-lane-pack-review|data-idb-install|Install lane pack/i.test(sample.drawerHtml),
    sample.storyHtml.slice(0, 1800));

  assertCase(results, 'w255-receipt-driven-qa-remains-available',
    sample.qa.status === 'pass',
    JSON.stringify(sample.qa));

  const weakState = stateFor(fixtures[0]);
  weakState.intake.website = 'https://unknown-example.com';
  weakState.intake.notes = 'Conflicting evidence across manufacturing, distribution, and retail.';
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, { displayReadyRecords: [] });
  const weakHtml = hooks.renderConsultantStorySurfaceW248(weakStory);
  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-gated',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      /Evidence confidence: Low/.test(weakHtml),
    weakHtml.slice(0, 1800));

  assertCase(results, 'report-and-trace-archived',
    /W261/.test(report) &&
      /ready_to_keep/.test(report) &&
      trace.schema === 'forge.w261.post-install-smoke-evidence-capture.trace.v1' &&
      trace.signoffStatuses.includes('rollback_recommended'),
    trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW261 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW261 harness passed ${results.length}/${results.length} cases.`);
}

main();
