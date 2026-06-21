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
const lanePacksPath = path.join(root, 'src', 'contracts', 'lanePacks.js');
const reportPath = path.join(root, 'archive', 'reports', 'w422_default_toggles_food_routing_naming.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function requestKeyFor(website, evidence) {
  return ['websiteResolverServiceV1', website || '', String(evidence || '').slice(0, 160)].join('|').toLowerCase();
}

function herrsState(hooks) {
  const website = 'https://www.herrs.com';
  const state = hooks.defaultState();
  state.open = true;
  state.briefPrepared = true;
  state.selectedLaneId = 'products_cpg';
  state.laneSelectionSource = 'default';
  state.intake = {
    customer: 'Herrs W421 times two',
    website,
    notes: 'They make chips, pretzels, popcorn, snack packs, and seasonal flavors through retailers and distributors. They need one trusted view of customer demand, ingredient availability, packaging and case pack readiness, and replenishment before making the customer promise.',
    websiteEvidence: '',
    scObjective: '',
    competitor: '',
    decisionCriteria: '',
    timelineUrgency: ''
  };
  state.websiteResolverRuntime = Object.assign({}, state.websiteResolverRuntime || {}, {
    requestKey: requestKeyFor(website, ''),
    status: 'resolved'
  });
  state.websiteEvidenceV1 = {
    schema: 'idb.website-evidence.v1',
    domain: 'www.herrs.com',
    fetchStatus: 'captured',
    confidence: { state: 'needs_confirmation', score: 0.41 },
    sourceUrls: [website],
    resolverAdapter: { requestKey: requestKeyFor(website, '') },
    extractedEvidence: {
      pageTitle: "Herr's",
      metaDescription: 'Chips, pretzels, popcorn, and packaged snack foods.',
      productCategoryTerms: ['chips', 'pretzels', 'popcorn', 'snacks']
    },
    signals: {
      laneCandidates: [
        { laneId: 'parts_service', score: 0.62, evidence: ['notes mentioned parts'] },
        { laneId: 'food_beverage', score: 0.4, evidence: ['snacks and packaged food'] }
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
  const lanePacksSource = read(lanePacksPath);
  const lanePacks = require(lanePacksPath);
  const pkg = JSON.parse(read(path.join(root, 'package.json')));

  assertCase(results, 'w422-version-marker-advanced',
    (drawer.includes('// @version      1.0.31') || drawer.includes('// @version      1.0.32') || drawer.includes('// @version      1.0.33')) &&
      (drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.31';") || drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.32';") || drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.33';")) &&
      (drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W422';") || drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W423';") || drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W424';")),
    'Drawer should show W422 or later for install/update clarity.');

  assertCase(results, 'w422-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root and FileCabinet userscript copies should match.');

  assertCase(results, 'w422-functional-setup-toggles-default-off',
    !/dccToggles:\s*\{[^}]*true/.test(drawer),
    'No lane setup contract should start with Create new item, Manufacturing, or WIP checked.');

  const fresh = hooks.defaultState();
  const toggleStates = hooks.CONTRACT.lanes.map((lane) => {
    fresh.selectedLaneId = lane.id;
    const page = fresh.pageContext || { title: 'NetSuite Home', url: 'https://td3021666.app.netsuite.com/app/center/card.nl' };
    const recommendation = hooks.recommendMove(lane, page);
    const packet = hooks.idbBuildPacketV1(fresh, lane, page, recommendation);
    return {
      laneId: lane.id,
      toggles: packet.dccToggles || {}
    };
  });
  assertCase(results, 'w422-build-packets-start-with-all-toggles-off',
    toggleStates.every((item) => item.toggles.createNewHeroItem !== true && item.toggles.enableManufacturing !== true && item.toggles.enableWip !== true),
    JSON.stringify(toggleStates));

  const state = herrsState(hooks);
  const profile = hooks.websiteSignalProfile(state);
  const recommended = hooks.suggestedLaneFromIntake(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext || { title: 'NetSuite Home', url: 'https://td3021666.app.netsuite.com/app/center/card.nl' };
  const recommendation = hooks.recommendMove(lane, page);
  const packet = hooks.idbBuildPacketV1(state, lane, page, recommendation);
  const request = hooks.confirmedBuildRequestJsonV1(state, lane, page, recommendation);
  const activeFirstRead = JSON.stringify({
    profile: {
      authority: profile.authority,
      laneId: profile.laneId,
      product: profile.product,
      productFamily: profile.productFamily,
      demandMoment: profile.demandMoment
    },
    recommendedLaneId: recommended && recommended.lane && recommended.lane.id,
    selectedLaneId: lane && lane.id,
    requestDemoPath: request.demoPath,
    selectedToggles: request.selectedToggles,
    proofNames: request.proofNames || null,
    story: packet.storySurface || packet.story || null
  });

  assertCase(results, 'w422-herrs-known-domain-overrides-bad-runtime-candidate',
    profile.laneId === 'food_beverage' &&
      /website_evidence_v1_with_w42[23]_/.test(profile.authority) &&
      profile.product === 'Snack Variety Pack',
    JSON.stringify(profile));

  assertCase(results, 'w422-herrs-one-click-recommendation-is-food-beverage',
    recommended && recommended.lane && recommended.lane.id === 'food_beverage' &&
      state.selectedLaneId === 'food_beverage' &&
      packet.stateAuthority && packet.stateAuthority.selectedLaneId === 'food_beverage',
    JSON.stringify({ recommended: recommended && recommended.lane && recommended.lane.id, selected: state.selectedLaneId, authority: packet.stateAuthority }));

  assertCase(results, 'w422-herrs-build-request-has-user-intent-toggles-off',
    request.selectedToggles &&
      request.selectedToggles.createNewHeroItem === false &&
      request.selectedToggles.enableManufacturing === false &&
      request.selectedToggles.enableWip === false,
    JSON.stringify(request.selectedToggles));

  assertCase(results, 'w422-herrs-first-read-does-not-leak-parts-service',
    !/parts_service|Work Order|Replacement Part|Service Kit|truck stock|technician|warranty exposure/i.test(activeFirstRead),
    activeFirstRead.slice(0, 1200));

  const packResolution = lanePacks.resolveLanePackFromEvidence({
    website: 'https://www.herrs.com',
    websiteText: 'Herr Foods chips pretzels popcorn packaged snack foods case pack retail replenishment'
  });
  assertCase(results, 'w422-shared-lane-pack-resolves-herrs-as-food-beverage',
    packResolution.lanePack &&
      packResolution.lanePack.laneId === 'food_beverage' &&
      packResolution.lanePack.packId === 'food-beverage-manufacturer',
    JSON.stringify(packResolution));

  assertCase(results, 'w422-runner-naming-sanitizes-test-suffixes',
    runner.includes('function idbCanonicalProspectNameW422') &&
      runner.includes("return 'Herr Foods';") &&
      runner.includes('times\\s+') &&
      runner.includes('idbCanonicalProspectNameW422(prospect, website)'),
    'Runner should canonicalize prospect names before customer/proof naming.');

  assertCase(results, 'w422-drawer-display-naming-sanitizes-test-suffixes',
    drawer.includes('function consultantCanonicalCustomerSeedW422') &&
      drawer.includes("return 'Herr Foods';") &&
      drawer.includes('times\\s+') &&
      drawer.includes("return consultantCanonicalCustomerSeedW422(customer || 'Prospect');"),
    'Drawer display/planning names should canonicalize prospect names before consultant-facing copy.');

  assertCase(results, 'w422-runner-food-nonmfg-names-avoid-service-parts',
    runner.includes("modeKey === 'food_replenishment'") &&
      runner.includes('Snack Product Availability SKU') &&
      runner.includes('Retail Replenishment Flow') &&
      runner.includes('Packaging Supply Support SKU'),
    'Food/Beverage with Manufacturing off should not fall through to Replacement Part or generic service names.');

  assertCase(results, 'w422-lane-pack-herrs-domain-and-food-terms-present',
    lanePacksSource.includes("'herrs.com'") &&
      /chips.*pretzels.*popcorn|pretzels.*popcorn.*chips/.test(lanePacksSource),
    'Shared lane pack should include Herrs and packaged snack terms.');

  assertCase(results, 'w422-open-link-and-import-authority-preserved',
    drawer.includes('validateDccFinalNamingImportPayload') &&
      drawer.includes('completedResultImportEligibilityFromDrawerGuardsW289') &&
      drawer.includes('noActiveOpenLinksWithoutRealUrls: true'),
    'W422 must not weaken completed result validation or Open-link authority.');

  assertCase(results, 'w422-w421-endpoint-repair-preserved',
    drawer.includes('w421_released_w144_endpoint_repaired_before_submit') &&
      drawer.includes("endpointSource: 'released_w144_adapter_profile'") &&
      drawer.includes('persistProductionBuildSavedAdminConfig(state)'),
    'W422 must preserve the W421 W144 endpoint repair path.');

  assertCase(results, 'w422-package-script-registered',
    pkg.scripts &&
      pkg.scripts['harness:default-toggles-food-routing-naming-w422'] === 'node archive/tools/run_w422_default_toggles_food_routing_naming_harness.js',
    JSON.stringify(pkg.scripts && pkg.scripts['harness:default-toggles-food-routing-naming-w422']));

  const report = `# W422 Default Toggles, Food Routing, and Naming Hardening

## Summary
W421 repaired the W144 endpoint, but the Herr's W421 run proved a separate product regression: known packaged-food website evidence could still render a Parts/Service cockpit, default setup toggles could start checked from lane contracts, and generated names could preserve test/run phrasing such as "W421 times two."

W422 restores the intended authority order:
- Website/domain/category evidence chooses lane and naming family.
- Conversation notes shape ROI, competitive, objections, and run coaching only.
- User-selected toggles are explicit intent; no toggles start checked.
- NetSuite proof names are canonicalized before runner record creation.

## Scoped Changes
- Advanced drawer to \`1.0.31 / W422\`.
- Set every lane setup contract toggle default to off.
- Added \`herrs.com\` and packaged snack signals as Food/Beverage website authority.
- Added a W422 known-food-domain guard when runtime resolver evidence is weak or contradictory.
- Added Herr Foods/test-suffix canonicalization in runner naming.
- Added food-safe non-manufacturing proof names so Food/Beverage with Manufacturing off does not become Replacement Part / Parts & Service.
- Preserved the W421 released W144 endpoint repair path.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No source package or release package was mutated.
- No runner transaction behavior changed beyond record naming text.
- Completed-result import validation and Open-link authority remain intact.
- N/LLM remains advisory-only.

## Recommendation
Install/deploy \`1.0.31 / W422\`, clear the current drawer session, and rerun Herr Foods with no toggles checked unless the use case truly needs a new item, Manufacturing, or WIP. The expected first-read cockpit should be Food/Beverage / packaged snacks, not Parts & Service.
`;
  fs.writeFileSync(reportPath, report);
  printResults('W422 default toggles, food routing, and naming harness', results);
}

main();
