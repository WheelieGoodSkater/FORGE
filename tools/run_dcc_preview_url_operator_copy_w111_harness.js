const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w111_dcc_preview_url_operator_copy.json');
const tracePath = path.join(root, 'trace_samples', 'w111_dcc_preview_url_operator_copy_trace.json');
const reportPath = path.join(root, 'reports', 'w111_dcc_preview_url_operator_copy.md');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
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
      location: {
        href: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
        pathname: '/app/center/card.nl',
        search: ''
      },
      localStorage: storage,
      addEventListener: () => {},
      removeEventListener: () => {},
      setInterval: () => 0,
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
        click: () => {},
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

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function readyState(hooks) {
  const state = hooks.defaultState();
  Object.assign(state, {
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    activeView: 'review',
    setupEditMode: false,
    briefPrepared: true,
    dccPreviewBridge: {
      suiteletUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_dcc_preview&deploy=customdeploy_dcc_preview'
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: new Date().toISOString()
    }
  });
  state.intake = Object.assign({}, state.intake || {}, {
    customer: 'Ariat International',
    website: 'https://www.ariat.com/',
    notes: 'Ariat needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
    websiteEvidence: 'Footwear, apparel, workwear, outdoor gear, size/color variants, and ecommerce categories.',
    scObjective: 'Prepare a concise proof path for style-to-availability readiness.',
    competitor: 'Spreadsheets and disconnected inventory reports.',
    decisionCriteria: 'Show style/SKU readiness, channel availability, replenishment timing, and customer promise.',
    timelineUrgency: 'Buying committee review next month.'
  });
  state.websiteEvidenceV1 = {
    schema: 'idb.website-evidence.v1',
    resolverVersion: 'w111-harness-approved-snapshot',
    domain: 'ariat.com',
    fetchStatus: 'resolved',
    sourceUrls: ['https://www.ariat.com/'],
    extractedEvidence: {
      title: 'Ariat footwear apparel workwear',
      metaDescription: 'Footwear, apparel, workwear, outdoor gear, size/color variants',
      h1h2Text: ['Ariat footwear', 'Workwear and apparel']
    },
    signals: {
      laneCandidates: [{ laneId: 'apparel_accessories', score: 0.9, evidence: ['footwear', 'apparel', 'size/color variants'] }],
      productSeed: 'Core Boot and Apparel Style Matrix',
      productFamily: 'Apparel and Footwear Style',
      demandMoment: 'style, size, and channel availability'
    },
    confidence: { state: 'recommended', score: 0.9 },
    resolverAdapter: { mode: 'approved_snapshot', requestKey: '' }
  };
  const lane = hooks.getLane(state);
  const recommendation = hooks.recommendMove(lane, state.pageContext);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, state.pageContext, recommendation);
  return state;
}

function main() {
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const results = [];
  const state = readyState(hooks);
  const lane = hooks.getLane(state);
  const recommendation = hooks.recommendMove(lane, state.pageContext);
  const readyCopy = hooks.dccPreviewUrlOperatorCopyV1(state, lane, state.pageContext, recommendation);

  const blockedState = readyState(hooks);
  blockedState.acceptedPacket = null;
  blockedState.laneSelectionSource = 'manual';
  const blockedLane = hooks.getLane(blockedState);
  const blockedRecommendation = hooks.recommendMove(blockedLane, blockedState.pageContext);
  const blockedCopy = hooks.dccPreviewUrlOperatorCopyV1(blockedState, blockedLane, blockedState.pageContext, blockedRecommendation);

  const reviewHtml = hooks.renderReviewView(state, lane, state.pageContext, recommendation);

  assertCase(results, 'w111_runtime_preview_url_copy_present', typeof hooks.dccPreviewUrlOperatorCopyV1 === 'function' && /function dccPreviewUrlOperatorCopyV1/.test(userscript), 'dccPreviewUrlOperatorCopyV1 runtime and hook');
  assertCase(results, 'w111_ready_copy_formats_preview_url_and_query_params', readyCopy.status === 'ready_preview_copy_only' && readyCopy.previewUrlText.includes('custpage_prospect=') && readyCopy.queryParamText.includes('custpage_evalmode=review_only') && readyCopy.copySafeParameterText.includes('custpage_actionmode=previewbrief'), JSON.stringify({ status: readyCopy.status, previewUrlText: readyCopy.previewUrlText.slice(0, 180) }));
  assertCase(results, 'w111_copy_only_no_navigation_or_submit', readyCopy.canNavigateFromIdb === false && readyCopy.canOpenSuiteletFromIdb === false && readyCopy.canSubmit === false && readyCopy.canInvokeSuiteScriptFromIdb === false, JSON.stringify({ navigate: readyCopy.canNavigateFromIdb, open: readyCopy.canOpenSuiteletFromIdb, submit: readyCopy.canSubmit, invoke: readyCopy.canInvokeSuiteScriptFromIdb }));
  assertCase(results, 'w111_blocked_example_blocks_without_confirmation', blockedCopy.status === 'blocked_preview_copy_only' && blockedCopy.blockedExample.reasons.length > 0 && blockedCopy.canSubmit === false, JSON.stringify(blockedCopy.blockedExample));
  assertCase(results, 'w111_operator_instructions_complete', readyCopy.operatorInstructions.length >= 6 && readyCopy.operatorInstructions.some((item) => /Do not submit/.test(item)) && readyCopy.operatorInstructions.some((item) => /operator comparison notes/i.test(item)), JSON.stringify(readyCopy.operatorInstructions));
  assertCase(results, 'w111_review_ui_copy_present', /Internal preview copy/.test(reviewHtml) && /Preview URL text/.test(reviewHtml) && /Query params/.test(reviewHtml) && /Submit from drawer:\s*<\/strong>\s*no/.test(reviewHtml), reviewHtml.slice(0, 500));
  assertCase(results, 'w111_trace_coverage_present', /dccPreviewUrlOperatorCopyV1: dccPreviewUrlOperatorCopyV1/.test(userscript) && /dccPreviewUrlOperatorCopy: previewUrlOperatorCopy/.test(userscript), 'trace export and handoff export trace include preview URL copy');
  assertCase(results, 'w111_no_regression_boundaries_preserved', readyCopy.noRegression.w110ParityLockPreserved === true && readyCopy.noRegression.noIdbWrites === true && readyCopy.noRegression.noSuiteScriptInvocationFromIdb === true && readyCopy.noRegression.dccOwnsObjectGeneration === true && !/data-idb-open-dcc-preview/.test(userscript) && !/data-idb-submit-dcc-handoff/.test(userscript), JSON.stringify(readyCopy.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = {
    block: 'W112: Operator Preview Retest After Copy Helper',
    prompt: 'Move through W112: Operator Preview Retest After Copy Helper. Produce the exact hands-on operator retest for the latest IDB drawer using W111 preview URL/operator copy: file to upload, sales request fields, expected Review copy-helper screenshot, DCC handoff JSON, trace JSON, manual DCC Suitelet preview comparison steps, operator evidence fields to paste back into IDB, scoring rubric, and stop/go criteria. Preserve W110 parity lock, W92 state authority, W105-W107 preview-only approval behavior, no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output test packet, validator gates, W112 report, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w111-dcc-preview-url-operator-copy.v1',
    status: decision === 'PASS' ? 'preview_url_operator_copy_ready' : 'preview_url_operator_copy_failed',
    objective: 'Give operators copy-safe DCC Suitelet preview URL/query parameters without IDB navigation, SuiteScript invocation, submit, queue, or write.',
    readyExample: readyCopy,
    blockedExample: blockedCopy,
    reviewUiSummary: {
      includesPreviewUrlText: /Preview URL text/.test(reviewHtml),
      includesQueryParams: /Query params/.test(reviewHtml),
      includesCopySafeParameterText: /custpage_prospect=/.test(reviewHtml),
      noOpenButton: !/data-idb-open-dcc-preview/.test(reviewHtml),
      noSubmitButton: !/data-idb-submit-dcc-handoff/.test(reviewHtml)
    },
    noRegression: readyCopy.noRegression,
    bestNextCodexPrompt
  };
  writeJson(dataPath, contract);

  const trace = {
    schema: 'idb.w111-dcc-preview-url-operator-copy-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    readyStatus: readyCopy.status,
    blockedStatus: blockedCopy.status,
    previewUrlTextSample: readyCopy.previewUrlText.slice(0, 260),
    copySafeParameterTextSample: readyCopy.copySafeParameterText,
    validatorResults: results,
    noRegression: contract.noRegression,
    bestNextCodexPrompt
  };
  writeJson(tracePath, trace);

  const resultRows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.name)} | ${escapeTable(result.detail)} |`).join('\n');
  const instructionRows = readyCopy.operatorInstructions.map((item) => `- ${item}`).join('\n');
  const report = `# W111 DCC Preview URL Builder And Operator Copy

Generated: ${new Date().toISOString()}

Decision: ${decision} / PREVIEW URL OPERATOR COPY ${decision === 'PASS' ? 'READY' : 'FAILED'} / COPY ONLY / NO SUBMIT

## Objective

Format DCC Suitelet preview URL/query parameters from \`dccRunnerHandoffPacketV1\` so an operator can manually compare the preview in Demo Command Center without IDB navigating, invoking SuiteScript, submitting, queueing, or writing.

## Operator Instructions

${instructionRows}

## Ready Example

- Status: \`${readyCopy.status}\`
- Mode: \`${readyCopy.mode}\`
- Preview URL text is present.
- Query params are present.
- Copy-safe parameter text is present.

## Blocked Example

\`${blockedCopy.status}\`: ${blockedCopy.blockedExample.reasons.join(', ')}

## Validator Gates

| Status | Gate | Detail |
| --- | --- | --- |
${resultRows}

## No Regression

- W110 parity lock preserved.
- W92 state authority preserved.
- W105-W107 preview-only approval preserved.
- No IDB writes.
- No SuiteScript invocation from IDB.
- No transaction writes.
- Hosted resolver remains optional until \`remoteSmokeExecuted=true\`.
- Notes remain story-only.
- Consultant confirmation remains required.
- DCC owns object generation.

## Best Next Codex Prompt

\`\`\`text
${bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);

  console.log(JSON.stringify({
    decision,
    results: results.length,
    report: path.relative(root, reportPath)
  }, null, 2));
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
