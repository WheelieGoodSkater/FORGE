#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..', '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const fixturePath = path.join(root, 'archive', 'fixtures', 'w251_lane_pack_diff_review_fixture.json');
const reportPath = path.join(root, 'archive', 'reports', 'w251_lane_pack_authoring_diff_review.md');
const tracePath = path.join(root, 'archive', 'trace_samples', 'w251_lane_pack_authoring_diff_review_trace.json');
const lanePacksPath = path.join(root, 'src', 'contracts', 'lanePacks.js');
const lanePacks = require(lanePacksPath);

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function hash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
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
    fetch: () => Promise.reject(new Error('live fetch disabled in W251 harness')),
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

function unsafeProposalFrom(proposal) {
  const clone = JSON.parse(JSON.stringify(proposal));
  clone.autoInstall = true;
  clone.candidatePack.liveDemo.roiSoWhat = 'This will increase margin with guaranteed measured ROI.';
  clone.candidatePack.nllmAdvisory.writeAuthority = 'write';
  clone.candidatePack.nllmAdvisory.creationAllowed = true;
  clone.candidatePack.nllmAdvisory.uncertaintyPolicy = 'hide_uncertainty';
  clone.candidatePack.nllmAdvisory.hardLimits = clone.candidatePack.nllmAdvisory.hardLimits.filter((limit) => limit !== 'cannotHideUncertainty');
  return clone;
}

function hasAreas(diff, areas) {
  return areas.every((area) => diff.changes.some((change) => change.area === area));
}

function main() {
  const hooks = loadHooks();
  const fixture = JSON.parse(read(fixturePath));
  const report = read(reportPath);
  const trace = JSON.parse(read(tracePath));
  const userscript = read(userscriptPath);
  const beforeHash = hash(lanePacksPath);
  const results = [];

  const sourceReview = lanePacks.reviewProposedLanePackChange(fixture);
  const drawerReview = hooks.reviewProposedLanePackChangeW247(fixture);
  assertCase(results, 'source-safe-proposal-review-ready-not-installable', sourceReview.status === 'review_ready' && sourceReview.installAllowed === false && sourceReview.humanReviewRequired === true, JSON.stringify(sourceReview.reviewCopy));
  assertCase(results, 'drawer-safe-proposal-review-ready-not-installable', drawerReview.status === 'review_ready' && drawerReview.installAllowed === false && drawerReview.nllmAdvisoryOnly === true, JSON.stringify(drawerReview.reviewCopy));
  assertCase(results, 'proposal-diff-visible-across-required-areas', hasAreas(sourceReview.proposedChangeDiff, ['websiteSignals', 'recordRoles', 'vocabulary', 'liveDemo']) && sourceReview.proposedChangeDiff.changes.length >= 5, JSON.stringify(sourceReview.proposedChangeDiff));
  assertCase(results, 'drawer-diff-visible-and-aligned', hasAreas(drawerReview.proposedChangeDiff, ['websiteSignals', 'recordRoles', 'vocabulary', 'liveDemo']) && drawerReview.proposedChangeDiff.changes.length === sourceReview.proposedChangeDiff.changes.length, JSON.stringify(drawerReview.proposedChangeDiff));
  assertCase(results, 'review-copy-explains-human-confirmation', /human confirmation|Do not install/i.test(`${drawerReview.reviewCopy.summary} ${drawerReview.reviewCopy.installGuidance}`), JSON.stringify(drawerReview.reviewCopy));

  const unsafe = hooks.reviewProposedLanePackChangeW247(unsafeProposalFrom(fixture));
  assertCase(results, 'unsafe-nllm-proposal-rejected', unsafe.status === 'rejected' && unsafe.errors.some((error) => /write authority|creation|autoInstall|uncertainty|ROI/i.test(error)), JSON.stringify(unsafe.errors));
  assertCase(results, 'proposal-review-does-not-mutate-source-contract', beforeHash === hash(lanePacksPath), beforeHash);

  const weakStory = hooks.consultantStorySurfaceFromLanePackW247({
    selectedLaneId: 'products_cpg',
    laneSelectionSource: 'consultant_confirmed',
    intake: { customer: 'Unknown', website: 'https://unknown-example.com', notes: 'Conflicting evidence.' }
  }, null, { displayReadyRecords: [] });
  assertCase(results, 'weak-evidence-remains-confirmation-gated', weakStory.status === 'needs_lane_confirmation' && /Confirm lane before opening proof records/.test(weakStory.openTarget), JSON.stringify(weakStory));

  assertCase(results, 'launcher-icon-visibility-polish-preserves-click-target', /#idb-rail-button\s*\{[\s\S]*width:\s*48px;[\s\S]*height:\s*48px;/.test(userscript) && /width:\s*118%;/.test(userscript) && /background:\s*#eef6ff;/.test(userscript) && /filter:\s*saturate\(1\.14\) brightness\(1\.12\) contrast\(1\.08\);/.test(userscript), '48px click target with brighter background and scaled icon');
  assertCase(results, 'icon-runtime-pattern-remains-repo-local-embedded', hooks.FORGE_ICON_IMAGE_SRC.startsWith('data:image/png;base64,') && userscript.includes('assets/forge-icon.png') === false && !userscript.includes('/Users/aaronsunshine/Downloads'), 'embedded icon data URL without Downloads runtime path');
  assertCase(results, 'report-fixture-trace-archived', /W251/.test(report) && fixture.schema === 'forge.lane-pack-authoring-proposal.v1' && trace.schema === 'forge.w251.lane-pack-authoring-diff-review.trace.v1', trace.schema);

  const failed = results.filter((result) => !result.pass);
  results.forEach((result) => {
    console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.id} ${result.evidence}`);
  });
  if (failed.length) {
    console.error(`\nW251 harness failed ${failed.length}/${results.length} cases.`);
    process.exit(1);
  }
  console.log(`\nW251 harness passed ${results.length}/${results.length} cases.`);
}

main();
