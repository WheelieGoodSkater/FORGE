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
const fileCabinetRunnerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const reportPath = path.join(root, 'archive', 'reports', 'w424_forge_resurrection_hardening.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function requestKeyFor(website, evidence) {
  return ['websiteResolverServiceV1', website || '', String(evidence || '').slice(0, 160)].join('|').toLowerCase();
}

function capeCodState(hooks) {
  const website = 'https://www.capecodchips.com';
  const state = hooks.defaultState();
  state.open = true;
  state.briefPrepared = true;
  state.selectedLaneId = 'products_cpg';
  state.laneSelectionSource = 'default';
  state.intake = {
    customer: 'Cape Cod Chips',
    website,
    notes: 'Retailers ask about promos and the team needs one view of finished-good readiness, packaging case pack readiness, and replenishment before making the customer promise. Competitors maybe spreadsheets and QuickBooks.',
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
    domain: 'www.capecodchips.com',
    fetchStatus: 'captured',
    confidence: { state: 'needs_confirmation', score: 0.51 },
    sourceUrls: [website, `${website}/products`],
    resolverAdapter: { requestKey: requestKeyFor(website, '') },
    extractedEvidence: {
      pageTitle: 'Cape Cod Chips Products',
      metaDescription: 'Cape Cod kettle cooked potato chips and seasonal flavors.',
      productNames: [
        'Lemon Herb Butter',
        'Original',
        'Sea Salt & Vinegar',
        'Sweet & Spicy Jalapeno',
        'Sweet Mesquite Barbecue',
        'Original Lightly Salted',
        'Sea Salt & Cracked Pepper',
        'Dark Russet',
        'Sour Cream & Onion'
      ],
      imageAltText: ['Cape Cod Original Sea Salt Chips', 'Cape Cod Sea Salt & Vinegar Chips'],
      productCategoryTerms: ['chips', 'kettle cooked chips', 'snacks', 'packaged food', 'case pack'],
      navigationLabels: ['Products', 'Recipes', 'Where to Buy']
    },
    signals: {
      laneCandidates: [
        { laneId: 'food_beverage', score: 0.55, evidence: ['chips and packaged food product page'] },
        { laneId: 'industrial_distribution', score: 0.38, evidence: ['availability wording'] }
      ]
    }
  };
  return state;
}

function genericCompletedState(hooks) {
  const state = capeCodState(hooks);
  state.briefPrepared = true;
  state.confirmedLaneId = 'food_beverage';
  state.acceptedPacket = {
    selectedLaneId: 'food_beverage',
    selectedLane: 'Food / Beverage CPG Manufacturing',
    proofAnchor: 'Finished Good',
    productSeed: 'Sea Salt & Vinegar Chips',
    productFamily: 'Packaged snacks',
    demandMoment: 'Retail availability and replenishment confidence'
  };
  state.dccFinalNamingResult = {
    status: 'completed',
    runStatus: 'completed',
    prospect: 'Cape Cod Chips',
    familyKey: 'food_beverage',
    records: {
      customer: { role: 'customer', type: 'customer', name: 'Cape Cod Chips Customer Account', id: '4201', url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=4201' },
      salesOrder: { role: 'sales_order', type: 'salesorder', name: 'SO2720', id: '2720', url: 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=2720' },
      heroItem: { role: 'finished_good_item', type: 'inventoryitem', name: 'Cape Cod Product Availability SKU', id: '6501', url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6501' },
      matrixProofItem: { role: 'availability_flow', type: 'inventoryitem', name: 'Cape Cod Branch Availability / Replenishment Flow', id: '6502', url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6502' },
      componentItems: [
        { role: 'supporting_sku', type: 'inventoryitem', name: 'Cape Cod Safe Substitute Fulfillment Support SKU', id: '6503', url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6503' }
      ]
    }
  };
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  return state;
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);
  const runner = read(runnerPath);
  const fileCabinetRunner = read(fileCabinetRunnerPath);
  const pkg = JSON.parse(read(path.join(root, 'package.json')));

  const capeState = capeCodState(hooks);
  const productCandidates = hooks.websiteProductEvidenceCandidatesW424(capeState.websiteEvidenceV1, capeState.intake);
  const profile = hooks.websiteSignalProfile(capeState);
  hooks.reconcileStateAuthority(capeState);
  const lane = hooks.getLane(capeState);
  const page = { title: 'NetSuite Home', url: 'https://td3021666.app.netsuite.com/app/center/card.nl', pageType: 'NetSuite page', confidence: 'low' };
  const recommendation = hooks.recommendMove(lane, page);
  const request = hooks.confirmedBuildRequestJsonV1(capeState, lane, page, recommendation);
  const completedState = genericCompletedState(hooks);
  const completedLane = hooks.getLane(completedState);
  const completedRecommendation = hooks.recommendMove(completedLane, page);
  const stage = hooks.consultantDayInLifeStageW416(completedState, completedLane, page, completedRecommendation);
  const dayInLifeHtml = hooks.renderW416ConsultantDayInLife(completedState, completedLane, page, completedRecommendation, completedLane.moves[0], { id: 'prove', label: 'Prove' }, '');

  assertCase(results, 'w424-version-marker-advanced',
    drawer.includes('// @version      1.0.34') &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.34';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W426';"),
    'Drawer should show W426 / 1.0.34 for install/update clarity while preserving W424 behavior.');

  assertCase(results, 'w424-filecabinet-copies-synced',
    drawer === fileCabinetDrawer && runner === fileCabinetRunner,
    'Root and FileCabinet drawer/runner copies should match.');

  assertCase(results, 'w424-website-product-name-candidates-extracted-generically',
    productCandidates.productSeed === 'Lemon Herb Butter Chips' &&
      productCandidates.productCandidates.includes('Sea Salt & Vinegar Chips') &&
      productCandidates.productFamily === 'Packaged snacks',
    JSON.stringify(productCandidates));

  assertCase(results, 'w424-website-first-food-beverage-lane-preserved',
    profile.laneId === 'food_beverage' &&
      lane.id === 'food_beverage' &&
      /Lemon Herb Butter Chips|Sea Salt & Vinegar Chips|Sweet Mesquite Barbecue Chips/.test(JSON.stringify(profile)),
    JSON.stringify({ profile, lane: lane.id }));

  assertCase(results, 'w424-confirmed-request-carries-product-authority',
    request.identity &&
      request.identity.productSeed &&
      request.demoPath &&
      request.demoPath.productSeed === request.identity.productSeed &&
      request.identity.productAuthority === 'website_evidence_first_notes_story_only_nllm_advisory',
    JSON.stringify({ identity: request.identity, demoPath: request.demoPath }));

  assertCase(results, 'w424-notes-story-only-boundary-preserved',
    request.storyInputs &&
      /Retailers ask about promos/.test(request.storyInputs.conversationNotes || '') &&
      request.identity.productSeed === profile.product &&
      !/notesOverrideIdentityAllowed["']?\s*:\s*true/i.test(JSON.stringify(request)),
    JSON.stringify({ identity: request.identity, storyInputs: request.storyInputs }));

  assertCase(results, 'w424-runner-food-mfg-off-prefers-replenishment-not-formula',
    runner.includes("else if (/food_batch_manufacturing|food|beverage|cpg|snack|chips|pretzel|popcorn|packaged/.test(text)) modeKey = enableManufacturing ? 'food_ingredient_manufacturing' : 'food_replenishment';") &&
      runner.includes('matrixProofItemName: trimLen(`${prospect} ${productSeed} Replenishment`, 60)') &&
      runner.includes('componentItemName: trimLen(`${prospect} ${productSeed} Packaging / Case Pack`, 60)'),
    'Food/Beverage MFG-off should avoid formula/batch and branch-generic naming.');

  assertCase(results, 'w424-runner-food-mfg-on-still-supports-formula-batch',
    runner.includes('matrixProofItemName: trimLen(`${prospect} ${productSeed} Formula / Batch`, 60)') &&
      runner.includes('componentItemName: trimLen(`${prospect} ${productSeed} Ingredient / Packaging`, 60)'),
    'Food/Beverage MFG-on should preserve formula/batch and ingredient/packaging language.');

  assertCase(results, 'w424-sidecar-items-use-location-and-setup-diagnostics',
    !/ensureIdbProofItemForResult[\s\S]{0,700}locationId:\s*null/.test(runner) &&
      !/ensureIdbComponentItemForResult[\s\S]{0,700}locationId:\s*null/.test(runner) &&
      runner.includes('applyGeneratedInventoryItemSetupPersistence') &&
      runner.includes('forge.w424.generated-inventory-item-setup-diagnostics.v1') &&
      runner.includes('planningAutoCalcFields'),
    'Sidecar proof/component items should not skip location/setup persistence.');

  assertCase(results, 'w424-clone-planning-trace-does-not-count-as-copy',
    runner.includes("validation.push({\n            source: 'leadtime-trace'") &&
      runner.includes("return copied.some(item => item && item.source !== 'leadtime-trace') || !!locationSublistCopied || !!itemLocationConfigCopied;"),
    'Lead-time diagnostic trace should not masquerade as a successful planning copy.');

  assertCase(results, 'w424-cockpit-gates-generic-names-as-review',
    stage.stage === 'proof_needs_review' &&
      /Proof needs review/.test(dayInLifeHtml) &&
      /One or more returned record names is still generic|Naming\/setup check/.test(dayInLifeHtml),
    JSON.stringify({ stage, html: dayInLifeHtml.slice(0, 1200) }));

  assertCase(results, 'w424-no-live-smoke-or-upload-boundary',
    !/live smoke executed|upload performed|deployment performed/i.test(drawer + runner) &&
      pkg.scripts['harness:forge-resurrection-hardening-w424'] === 'node archive/tools/run_w424_forge_resurrection_hardening_harness.js',
    JSON.stringify(pkg.scripts['harness:forge-resurrection-hardening-w424']));

  const report = `# W424 FORGE Resurrection Hardening

## Summary
W424 restores the executable consultant path after the Cape Cod regression:
- website evidence owns lane and product identity;
- notes shape story, ROI, and competitive handling only;
- N/LLM remains advisory-only;
- Food/Beverage naming is toggle-aware;
- generated sidecar proof items run item setup diagnostics;
- the cockpit shows proof needs review when returned records are not demo-clean.

## Cape Cod Regression Finding
The W423 run selected the correct broad Food/Beverage lane, but generic names and uneven item setup made the proof feel templated. W424 adds a generic product candidate extractor from visible product names, product-card text, image alt text, headings, links, and category evidence. It does not hardcode Cape Cod.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No release/readiness package was mutated.
- No fake Open links were introduced.
- Completed-result import validation and Open-link authority remain intact.

## Recommendation
Lock W424 if the harness passes, then rerun one controlled Cape Cod-style Food/Beverage smoke. If setup diagnostics still mark proof weak, patch the specific runner setup field rather than adding more UI or lanes.
`;
  fs.writeFileSync(reportPath, report);

  printResults('W424 FORGE resurrection hardening harness', results);
}

main();
