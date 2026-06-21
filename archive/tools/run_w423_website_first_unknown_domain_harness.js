#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  loadHooks,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const drawerPath = path.join(root, 'idb-drawer.user.js');
const fileCabinetDrawerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
const runnerPath = path.join(root, 'netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const reportPath = path.join(root, 'archive', 'reports', 'w423_website_first_unknown_domain.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function requestKeyFor(website, evidence) {
  return ['websiteResolverServiceV1', website || '', String(evidence || '').slice(0, 160)].join('|').toLowerCase();
}

function unknownSnackState(hooks) {
  const website = 'https://www.northvalleysnacks.com';
  const state = hooks.defaultState();
  state.open = true;
  state.briefPrepared = true;
  state.selectedLaneId = 'products_cpg';
  state.laneSelectionSource = 'default';
  state.intake = {
    customer: 'North Valley Snacks test run two',
    website,
    notes: 'Ops said retailers ask for seasonal snack packs and the team promises before checking finished goods, packaging, and ingredient supply. They use spreadsheets and maybe QuickBooks. Need ROI around fewer promo misses and competitive handling around spreadsheet trust.',
    websiteEvidence: '',
    scObjective: '',
    competitor: 'spreadsheets maybe QuickBooks',
    decisionCriteria: '',
    timelineUrgency: ''
  };
  state.websiteResolverRuntime = Object.assign({}, state.websiteResolverRuntime || {}, {
    requestKey: requestKeyFor(website, ''),
    status: 'resolved'
  });
  state.websiteEvidenceV1 = {
    schema: 'idb.website-evidence.v1',
    domain: 'www.northvalleysnacks.com',
    fetchStatus: 'captured',
    confidence: { state: 'needs_confirmation', score: 0.44 },
    sourceUrls: [website],
    resolverAdapter: { requestKey: requestKeyFor(website, '') },
    extractedEvidence: {
      pageTitle: 'North Valley Snacks',
      metaDescription: 'Chips, pretzels, popcorn, packaged snack foods, and seasonal retail variety packs.',
      productNames: ['Sea Salt Kettle Chips', 'Honey Mustard Pretzels', 'Movie Night Popcorn'],
      productCategoryTerms: ['chips', 'pretzels', 'popcorn', 'snacks', 'packaged food', 'seasonal flavors', 'case pack'],
      navigationLabels: ['Products', 'Retailers', 'Seasonal Flavors', 'Where to Buy']
    },
    signals: {
      laneCandidates: [
        { laneId: 'parts_service', score: 0.61, evidence: ['bad runtime candidate from ambiguous word parts'] },
        { laneId: 'food_beverage', score: 0.39, evidence: ['snacks and packaged food'] }
      ]
    }
  };
  return state;
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);
  const runner = read(runnerPath);
  const pkg = JSON.parse(read(path.join(root, 'package.json')));

  const state = unknownSnackState(hooks);
  const profile = hooks.websiteSignalProfile(state);
  const recommended = hooks.suggestedLaneFromIntake(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext || { title: 'NetSuite Home', url: 'https://td3021666.app.netsuite.com/app/center/card.nl' };
  const recommendation = hooks.recommendMove(lane, page);
  const request = hooks.confirmedBuildRequestJsonV1(state, lane, page, recommendation);
  const activeFirstRead = JSON.stringify({
    profile: {
      authority: profile.authority,
      resolverSource: profile.resolverSource,
      laneId: profile.laneId,
      product: profile.product,
      productFamily: profile.productFamily,
      demandMoment: profile.demandMoment,
      notesOwnedFields: profile.notesOwnedFields
    },
    selectedLaneId: lane && lane.id,
    storyInputs: request.storyInputs,
    selectedToggles: request.selectedToggles
  });

  assertCase(results, 'w423-version-marker-advanced',
    drawer.includes('// @version      1.0.33') &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.33';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W424';"),
    'Drawer should show W424 / 1.0.33 while preserving W423 website-first behavior.');

  assertCase(results, 'w423-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root and FileCabinet userscript copies should match.');

  assertCase(results, 'w423-unknown-domain-website-category-chooses-lane',
    profile.laneId === 'food_beverage' &&
      profile.authority === 'website_evidence_v1_with_w423_website_first_category_guard' &&
      profile.product === 'Sea Salt Kettle Chips' &&
      /Packaged (snacks|Food and Beverage)/i.test(profile.productFamily),
    JSON.stringify(profile));

  assertCase(results, 'w423-bad-runtime-candidate-cannot-override-website-category',
    recommended && recommended.lane && recommended.lane.id === 'food_beverage' &&
      state.selectedLaneId === 'food_beverage' &&
      lane && lane.id === 'food_beverage',
    JSON.stringify({ recommended: recommended && recommended.lane && recommended.lane.id, selected: state.selectedLaneId, activeLane: lane && lane.id }));

  assertCase(results, 'w423-notes-augment-story-only',
    activeFirstRead.includes('Ops said retailers ask for seasonal snack packs') &&
      activeFirstRead.includes('spreadsheets') &&
      activeFirstRead.includes('QuickBooks') &&
      activeFirstRead.includes('notesOwnedFields') &&
      !/notesOverrideIdentityAllowed["']?\s*:\s*true/i.test(activeFirstRead),
    activeFirstRead.slice(0, 1400));

  assertCase(results, 'w423-default-build-toggles-remain-user-intent-only',
    request.selectedToggles &&
      request.selectedToggles.createNewHeroItem === false &&
      request.selectedToggles.enableManufacturing === false &&
      request.selectedToggles.enableWip === false,
    JSON.stringify(request.selectedToggles));

  assertCase(results, 'w423-first-read-does-not-leak-parts-service',
    !/parts_service|Work Order|Replacement Part|Service Kit|truck stock|technician|warranty exposure/i.test(activeFirstRead),
    activeFirstRead.slice(0, 1400));

  assertCase(results, 'w423-nllm-advisory-boundary-preserved',
    drawer.includes('cannotOverrideWebsiteEvidence') &&
      drawer.includes('conversationNotesUse') &&
      drawer.includes('Use notes for pain, ROI, competitive framing, objections, and run coaching only') &&
      drawer.includes('advisoryOnly: true'),
    'N/LLM should advise and enrich, not own lane, toggles, writes, or Open links.');

  assertCase(results, 'w423-runner-naming-still-canonicalizes-test-suffixes',
    runner.includes('function idbCanonicalProspectNameW422') &&
      runner.includes('times\\s+') &&
      runner.includes('idbCanonicalProspectNameW422(prospect, website)'),
    'Runner should continue stripping run/test suffixes before record naming.');

  assertCase(results, 'w423-package-script-registered',
    pkg.scripts &&
      pkg.scripts['harness:website-first-unknown-domain-w423'] === 'node archive/tools/run_w423_website_first_unknown_domain_harness.js',
    JSON.stringify(pkg.scripts && pkg.scripts['harness:website-first-unknown-domain-w423']));

  const report = `# W423 Website-First Unknown Domain Validation

## Summary
W423 removes the need for a one-off Herr's rescue pattern by validating the actual intended authority order on an unknown snack-company domain:
- Website/category evidence chooses the lane and product family.
- Conversation notes augment pain, ROI, competitive framing, objections, and run coaching.
- N/LLM remains advisory-only and cannot override website evidence, toggles, writes, or Open-link authority.

## Validation Scenario
- Prospect: North Valley Snacks test run two.
- Website: https://www.northvalleysnacks.com.
- Website evidence: chips, pretzels, popcorn, packaged snacks, seasonal flavors, retailers, case pack.
- Bad runtime candidate: Parts/Service wins the raw candidate list.
- Expected result: Food/Beverage from website/category evidence.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No source package or release package was mutated.
- No fake Open links were created.
- Completed-result import validation and Open-link authority remain intact.

## Recommendation
Install/deploy \`1.0.33 / W424\`, clear drawer state, and run one test using an unlisted-but-clear website category. The expected behavior is website-first lane choice, product-specific naming when website product names exist, notes-only value/story enrichment, and all build toggles off until the consultant chooses them.
`;
  fs.writeFileSync(reportPath, report);

  printResults('W423 website-first unknown domain harness', results);
}

main();
