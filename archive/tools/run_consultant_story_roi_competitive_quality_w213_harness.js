const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w213_consultant_story_roi_competitive_quality.json');
const tracePath = path.join(root, 'trace_samples', 'w213_consultant_story_roi_competitive_quality_trace.json');
const reportPath = path.join(root, 'reports', 'w213_consultant_story_roi_competitive_quality.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W213 harness')),
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

function baseState(customer, website, notes, laneId, completedResultJson) {
  return {
    selectedLaneId: laneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    selectedMoveIndex: 0,
    briefPrepared: true,
    setupEditMode: false,
    dccFinalNamingResult: completedResultJson || null,
    dccFinalNamingImportedAt: completedResultJson ? '2026-05-18T12:00:00.000Z' : null,
    intake: {
      customer,
      website,
      notes
    },
    toggles: {
      [laneId]: {
        createNewHeroItem: true,
        enableManufacturing: false,
        enableWip: false
      }
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      capturedAt: '2026-05-18T12:00:00.000Z'
    }
  };
}

function completedResult(customer, names, laneId) {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    familyKey: laneId,
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    },
    records: {
      customer: {
        type: 'customer',
        name: `${customer} Customer Account`,
        internalId: '1722',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=1722'
      },
      demoTransaction: {
        type: 'salesorder',
        name: 'SO2679',
        internalId: '80828',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=80828'
      },
      heroItem: {
        type: 'inventoryitem',
        name: names.hero,
        internalId: '1865',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865'
      },
      matrixProofItem: {
        type: 'inventoryitem',
        name: names.matrix,
        internalId: '2545',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2545'
      },
      componentItem: {
        type: 'inventoryitem',
        name: names.component,
        internalId: '2546',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2546'
      }
    }
  };
}

function contextFromState(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function includesAll(text, terms) {
  const value = String(text || '').toLowerCase();
  return terms.every((term) => value.includes(String(term).toLowerCase()));
}

function forbiddenText(value) {
  return /\b(finished\s+good|ingredient(?:\s+blend)?|production\s+line|bom|assembly|work\s+order|routing|wip|manufacturing\s+line)\b/i.test(String(value || ''));
}

function main() {
  const hooks = loadHooks();
  const summitResult = completedResult('Summit Outdoor Supply', {
    hero: 'Summit Outdoor Supply Channel Availability SKU',
    matrix: 'Summit Outdoor Supply Dealer Replenishment Flow',
    component: 'Summit Outdoor Supply Allocation Support SKU'
  }, 'dealer_hardgoods');
  const ariatResult = completedResult('Ariat International', {
    hero: 'Ariat International Style SKU',
    matrix: 'Ariat International Omnichannel Availability Flow',
    component: 'Ariat International Size / Color Variant'
  }, 'apparel_accessories');
  const badSummitResult = completedResult('Summit Outdoor Supply', {
    hero: 'Summit Outdoor Supply Finished Good',
    matrix: 'Summit Outdoor Supply Production Line',
    component: 'Summit Outdoor Supply Ingredient Blend'
  }, 'dealer_hardgoods');

  const summit = contextFromState(hooks, baseState(
    'Summit Outdoor Supply',
    'https://www.summitoutdoorsupply.com',
    'Regional outdoor gear distributor is struggling to keep seasonal inventory aligned across retail, ecommerce, and wholesale channels. Buyers need better visibility into item availability, replenishment timing, and channel demand before committing to large seasonal orders.',
    'dealer_hardgoods',
    summitResult
  ));
  const ariat = contextFromState(hooks, baseState(
    'Ariat International',
    'https://www.ariat.com',
    'Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
    'apparel_accessories',
    ariatResult
  ));
  const yerbaNotes = [
    'Buyer is the VP of Operations and Finance at Yerba Madre, formerly Guayaki Yerba Mate. They sell ready-to-drink yerba mate beverages and traditional yerba mate products across retail, wholesale, and ecommerce channels.',
    'The team needs a demo that proves food batch manufacturing readiness, ingredient traceability, lot-aware availability, and clean handoff from customer demand into production planning.',
    'Current pain: operations can see demand building in retail and direct channels, but finance and supply planning do not always have the same view of what is available, what is committed, and what needs to be produced next. Ingredient availability, batch timing, lot context, and customer commitments need to tell one story.',
    'ROI angle: reduce manual reconciliation between sales demand, inventory, ingredient planning, and production; improve confidence in available-to-promise; reduce avoidable stockouts or overproduction; protect service levels during promotion or seasonal demand spikes.',
    'Competitive angle: show that FORGE can create a food and beverage proof path grounded in website evidence and selected toggles, not generic manufacturing names.'
  ].join('\n\n');
  const yerbaState = baseState(
    'Yerba Madre',
    'https://yerbamadre.com',
    yerbaNotes,
    'food_beverage',
    null
  );
  yerbaState.toggles.food_beverage = {
    createNewHeroItem: true,
    enableManufacturing: true,
    enableWip: true
  };
  const yerba = contextFromState(hooks, yerbaState);

  const summitCoach = hooks.consultantStoryRoiCompetitiveQualityPassW213V1(
    summit.state,
    summit.lane,
    summit.page,
    summit.recommendation,
    { completedResultJson: summitResult }
  );
  const ariatCoach = hooks.consultantStoryRoiCompetitiveQualityPassW213V1(
    ariat.state,
    ariat.lane,
    ariat.page,
    ariat.recommendation,
    { completedResultJson: ariatResult }
  );
  const yerbaCoach = hooks.consultantStoryRoiCompetitiveQualityPassW213V1(
    yerba.state,
    yerba.lane,
    yerba.page,
    yerba.recommendation
  );
  const summitValue = hooks.valueReviewPacket(summit.state, summit.lane, summit.page, summit.recommendation);
  const ariatValue = hooks.valueReviewPacket(ariat.state, ariat.lane, ariat.page, ariat.recommendation);
  const summitRun = hooks.runSelectorTraceModel(summit.state, summit.lane, summit.page, summit.recommendation).scriptPreview;
  const ariatRun = hooks.runSelectorTraceModel(ariat.state, ariat.lane, ariat.page, ariat.recommendation).scriptPreview;
  const badGuard = hooks.validateDccFinalNamingImportPayload(badSummitResult, summit.state, summit.lane, summit.page, summit.recommendation);

  const summitCopy = summitCoach.updatedConsultantCopyModel;
  const ariatCopy = ariatCoach.updatedConsultantCopyModel;
  const yerbaCopy = yerbaCoach.updatedConsultantCopyModel;
  const yerbaDigest = hooks.consultantNotesDigestV1(yerba.state, yerba.lane);
  const results = [];

  assertCase(results, 'w213_hook_and_w212_baseline_present',
    summitCoach.status === 'consultant_story_roi_competitive_ready' &&
      summitCoach.orchestrationBaseline === 'idb.w212-website-grounded-story-roi-competitive-naming-orchestration.v1',
    summitCoach.orchestrationBaseline);
  assertCase(results, 'website_and_notes_roles_are_separated',
    summitCoach.storyRoiCompetitiveCoachingContract.websiteAnchorsIndustryAndProductContext === true &&
      summitCoach.storyRoiCompetitiveCoachingContract.notesShapePainRoiCompetitiveAndObjectionsOnly === true,
    JSON.stringify(summitCoach.storyRoiCompetitiveCoachingContract));
  assertCase(results, 'netsuite_is_positioned_as_winning_operating_system',
    /NetSuite wins/i.test(summitCopy.competitiveAnswer) &&
      /one operating path/i.test(summitCopy.competitiveAnswer) &&
      /NetSuite/i.test(summitCopy.talkTrack),
    summitCopy.competitiveAnswer);
  assertCase(results, 'roi_copy_requires_baseline_before_savings',
    /baseline/i.test(summitCopy.roiAnswer) &&
      /before/i.test(summitCopy.roiAnswer) &&
      /savings/i.test(summitCopy.roiAnswer),
    summitCopy.roiAnswer);
  assertCase(results, 'summit_copy_uses_dealer_channel_replenishment_language',
    includesAll(`${summitCopy.talkTrack} ${summitCopy.proofMove} ${summitCopy.runCoaching.prove.say}`, ['dealer', 'availability', 'replenishment']) &&
      !forbiddenText(`${summitCopy.talkTrack} ${summitCopy.proofMove} ${summitCopy.runCoaching.prove.say}`),
    summitCopy.talkTrack);
  assertCase(results, 'ariat_copy_uses_style_sku_language',
    includesAll(`${ariatCopy.talkTrack} ${ariatCopy.proofMove} ${ariatCopy.runCoaching.prove.say}`, ['style', 'size', 'color']) &&
      !forbiddenText(`${ariatCopy.talkTrack} ${ariatCopy.proofMove} ${ariatCopy.runCoaching.prove.say}`),
    ariatCopy.talkTrack);
  assertCase(results, 'objection_handling_returns_to_proof_without_unsupported_claims',
    /acknowledge|doubt|ask/i.test(ariatCopy.objectionAnswer) &&
      /prove|NetSuite|path/i.test(ariatCopy.objectionAnswer) &&
      !/guarantee|always|eliminate all/i.test(ariatCopy.objectionAnswer),
    ariatCopy.objectionAnswer);
  assertCase(results, 'run_coaching_has_four_consultant_actions',
    ['open', 'prove', 'handle_objection', 'close_value'].every((key) => summitCopy.runCoaching[key] && summitCopy.runCoaching[key].say && summitCopy.runCoaching[key].show),
    Object.keys(summitCopy.runCoaching).join(', '));
  assertCase(results, 'value_review_packet_uses_w213_copy',
    summitValue.talkTrackLead === summitCopy.talkTrack &&
      summitValue.discoveryQuestions[0] === summitCopy.discoveryQuestion &&
      summitValue.groundedCompetitiveSummary === summitCopy.competitiveAnswer,
    summitValue.discoveryQuestions[0]);
  assertCase(results, 'long_notes_are_distilled_not_echoed_in_consultant_copy',
    yerbaDigest.consultantBrief.length === 4 &&
      yerbaCopy.talkTrack.length < 430 &&
      yerbaCopy.runCoaching.open.say.length < 360 &&
      !/ROI angle:|Competitive angle:|They sell ready-to-drink/i.test(`${yerbaCopy.talkTrack} ${yerbaCopy.runCoaching.open.say}`),
    `${yerbaCopy.talkTrack} :: ${yerbaCopy.runCoaching.open.say}`);
  assertCase(results, 'run_script_uses_w213_copy_and_imported_names',
    /Prove the NetSuite path/i.test(summitRun.title) &&
      /Build results are ready|Customer:/i.test(summitRun.show) &&
      /SO2679/.test(summitRun.show) &&
      !/W144|runnerTaskId|raw JSON|W151|semantic guard|mode contract/i.test(`${summitRun.title} ${summitRun.show}`),
    `${summitRun.title}; ${summitRun.show}`);
  assertCase(results, 'w151_still_rejects_forbidden_naming_results',
    badGuard.valid === false && badGuard.status === 'toggle_vocabulary_guardrail_failed',
    badGuard.message);
  assertCase(results, 'no_regression_boundaries_preserved',
    summitCoach.noRegression.noDrawerWrites === true &&
      summitCoach.noRegression.noDrawerCreatedRecords === true &&
      summitCoach.noRegression.noDrawerTransactionWrites === true &&
      summitCoach.noRegression.openLinksOnlyAfterRealRecordsExist === true,
    JSON.stringify(summitCoach.noRegression));

  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w213-consultant-story-roi-competitive-quality-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    storyRoiCompetitiveCoachingContract: summitCoach.storyRoiCompetitiveCoachingContract,
    fixtures: {
      summit: {
        laneId: summit.lane.id,
        modeKey: summitCoach.layers.toggleAwareOperatingModel.modeKey,
        copyModel: summitCopy,
        runPreview: summitRun
      },
      ariat: {
        laneId: ariat.lane.id,
        modeKey: ariatCoach.layers.toggleAwareOperatingModel.modeKey,
        copyModel: ariatCopy,
        runPreview: ariatRun
      },
      yerbaMadre: {
        laneId: yerba.lane.id,
        modeKey: yerbaCoach.layers.toggleAwareOperatingModel.modeKey,
        digest: yerbaDigest,
        copyModel: yerbaCopy
      }
    },
    badGuard
  };

  writeJson(dataPath, summary);
  writeJson(tracePath, {
    schema: 'idb.w213-trace-samples.v1',
    samples: [
      {
        event: 'w213.story_roi_competitive_copy_ready',
        customer: 'Summit Outdoor Supply',
        modeKey: summitCoach.layers.toggleAwareOperatingModel.modeKey,
        talkTrack: summitCopy.talkTrack,
        roiAnswer: summitCopy.roiAnswer,
        competitiveAnswer: summitCopy.competitiveAnswer
      },
      {
        event: 'w213.run_coaching_uses_imported_final_names',
        customer: 'Summit Outdoor Supply',
        title: summitRun.title,
        show: summitRun.show
      },
      {
        event: 'w213.apparel_story_copy_ready',
        customer: 'Ariat International',
        modeKey: ariatCoach.layers.toggleAwareOperatingModel.modeKey,
        proofMove: ariatCopy.proofMove,
        objectionAnswer: ariatCopy.objectionAnswer
      },
      {
        event: 'w213.long_notes_distilled_for_yerba_madre',
        customer: 'Yerba Madre',
        modeKey: yerbaCoach.layers.toggleAwareOperatingModel.modeKey,
        consultantBrief: yerbaDigest.consultantBrief,
        talkTrack: yerbaCopy.talkTrack
      },
      {
        event: 'w213.w151_forbidden_naming_guard_preserved',
        status: badGuard.status,
        message: badGuard.message
      }
    ]
  });

  const lines = [
    '# W213 Consultant Story ROI Competitive Quality Pass',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Contract',
    '- Website evidence anchors industry and product context.',
    '- Consultant toggles preserve the operating-model vocabulary from W211/W212.',
    '- Notes shape pain, ROI, competitive framing, objections, and Run coaching only.',
    '- NetSuite is positioned as the winning operating system, without unsupported claims or savings without baseline evidence.',
    '- N/LLM remains advisory only and has no record creation or toggle authority.',
    '',
    '## Fixtures',
    '- Summit Outdoor Supply: dealer hardgoods, non-manufacturing, channel availability and replenishment story.',
    '- Ariat International: apparel/style matrix, non-manufacturing, style/size/color availability story.',
    '',
    '## Results',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Visual Testing Decision',
    'No broad visual NetSuite testing is required for W213. This is a copy/orchestration and regression-harness pass; targeted visual testing remains reserved for real link or record-landing changes.'
  ];
  writeText(reportPath, `${lines.join('\n')}\n`);

  if (summary.status !== 'pass') {
    console.error(`W213 consultant story ROI competitive quality: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W213 consultant story ROI competitive quality: pass; ${passCount}/${results.length} checks`);
}

main();
