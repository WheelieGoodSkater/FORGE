/**
 * SCAI SO CSV Runner v4.0.0-runner-sandbox
 * Intelligent Industry Packs compatibility release.
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/log', 'N/search', 'N/record', 'N/https', 'N/task', 'N/file', 'N/encode', './resolved_demo_contract', './industry_play_library', './play_selector'],
  (runtime, log, search, record, https, task, file, encode, resolvedDemoContractCore, playLibraryCore, playSelectorCore) => {

  /**
   * Version Control
   *
* v4.0.0-runner-sandbox
* - Flat files-cabinet deployment layout for SuiteScripts > SANDBOX TESTING.
* - Promotes the play-first contract refactor into the renamed v4.0.0 runner file.
* - Keeps the v15.1.2 backend-truth and export behavior intact while matching the new deployed module paths.
*
* v15.1.2-backend-truth-closure-runner-sandbox
* - Carries authoritative-vs-raw family diagnostics through runner artifacts for backend truth closure review.
* - Prefers authoritative family key and lock source metadata when packaging canonical flow and review artifacts.
* - Preserves the existing work-order attempt-chain telemetry and manufacturing fallback ladder while improving backend-truth debugging.
*
 * v14.5-runner-sandbox
* - Promotes the runner to the v14.5 release-hardening cut.
* - Adds structured work-order attempt-chain telemetry, explicit failure typing, line-materialization verification, and BOM-repair verification for manufacturing runtime gating.
* - Keeps the deep v14.2C fallback ladder intact while making the winning path and terminal failure path observable enough for release review.
*
 * v14.2C-runner-sandbox
* - Adds a deeper work-order stabilization path, including default-values creation and standard-mode line seeding for forms that do not materialize a transaction line from body fields alone.
* - Keeps the V14.2B item-line fallback while widening the fallback path to standard-mode and default-values work-order creation.
*
* v14.2B-runner-sandbox
* - Adds an item-sublist fallback for stubborn work-order forms that still require a materialized line after body fields and BOM defaults are set.
* - Preserves V14.2 hardgoods/apparel naming separation while aligning metadata to the new stabilization cut.
*
* v14.2-runner-sandbox
* - Version-aligned runner pair for the next-phase family separation hardening pass.
* - Tightens deterministic retail naming so branded hardgoods such as YETI stop drifting toward apparel-safe naming packs.
* - Preserves the V14.1C work-order retry hardening and equipment-commerce protection while aligning artifact metadata to the new release.
*
* v14.1C-runner-sandbox
* - Version-aligned runner pair for the V14.1C hardening pass.
* - Adds work-order save retry hardening plus equipment-commerce naming protection while preserving runner packaging and asset behavior.
*
* v13.4.2-sandbox
* - Version-aligned major release pair for the Suitelet's advisor-story artifact architecture and read-only refresh behavior.
* - Runner logic is intentionally unchanged in this cut so packaging, links, and image-chip readiness remain stable while provenance advances with the Suitelet.
*
* v13.2.8-sandbox
* - Version-aligned pair for the v13.2.8 refresh-stability cut; no runner logic changes in this stamp.
*
* v13.2.7-sandbox
* - Version-aligned pair for the v13.2.7 Suitelet cleanup cut; no runner logic changes in this stamp.
*
* v13.2.6-sandbox
* - Adds canonical flow contract packaging so runner artifacts now persist Distribution / Inventory, Manufacturing, and Manufacturing + WIP as first-class flow states.
* - Reads shared-engine-aligned flow metadata from the naming payload when available and falls back safely when older payloads are still on disk.
* - Extends summary logs, canonical_story_seed.json, cockpit_mode_manifest.json, asset_summary.json, and pack_resolution_audit.json with explicit flow and mode metadata for demo-command-center hardening.
   * v11.5.0-sandbox
* - Adds normalization-intelligence metadata so runner-side summary logs and packaged artifacts can track candidate promotion, normalized scenario output, and final validation state.
* - Persists pack_resolution_audit.json alongside canonical story and cockpit mode artifacts for faster downstream troubleshooting.
* - Keeps reset, CSV import, manufacturing, routing, and enrichment mechanics stable while aligning release metadata to the normalization-intelligence rail.
   * v7.1.0-sandbox
   * - Tracks the Phase 1 hardening cut so release notes line up with the Suitelet's mode-locked vocabulary pass and canonical story propagation.
   * - Keeps canonical_story_seed.json and cockpit_mode_manifest.json as the runner-side source of truth for downstream UI mode alignment.
   * - Preserves honest asset packaging behavior: asset evidence can be detected and reported without pretending preview URLs exist.
   * v7.0.0-sandbox
   * - Implements the Phase 1 runner baseline for canonical story pack packaging, hard suppression seed metadata, and mode-native cockpit artifacts.
   * - Persists canonical_story_seed.json and cockpit_mode_manifest.json into the asset package so downstream UI rails can align on the same operating mode and note-first story spine.
   * - Extends asset_summary.json with storyPackReady, suppressionProfile, and cockpitMode markers for stronger cross-script release tracking.
   * v3.0.21-sandbox
   * - Hardens website intelligence by adding domain cache read/write helpers, source tracking, and a strict fetch budget so live enrichment stops blocking the reset path.
   * - Shifts website signal discovery to homepage-first with at most one secondary page when the homepage signal is weak.
   * - Emits structured website diagnostics including signalSource, fetch count, redirect count, cache status, and elapsed milliseconds for cleaner troubleshooting.
   *
   * v3.0.20-sandbox
   * - Synchronizes the active runner constant and manifest metadata to the v3.0.20 sandbox branch.
   * - Adds explicit heroSameAsAssembly and preview source flags in asset_summary.json so downstream Suitelet/UI logic can tell when manufacturing reused the hero image.
   * - Keeps preview-first enrichment behavior intact for logo, hero, and assembly assets while tightening branch-level reporting.
   *
   * v3.0.19-sandbox
   * - Adds assembly image preview packaging when manufacturing is enabled, using the same preview-first enrichment approach as logo and hero.
   * - Adds asset_summary.json so downstream Suitelet/UI work has one clean artifact describing logo/hero/assembly readiness and asset URLs.
   * - Keeps all enrichment non-blocking and reuses hero imagery for assembly when no better finished-good candidate is available.
   *
   * v3.0.18-sandbox
   * - Improves hero image ranking so package/product imagery is favored ahead of generic site chrome, logos, and tiny assets.
   * - Expands hero discovery to inspect JSON-LD image fields and additional product/gallery-style URL patterns.
   * - Keeps preview-first enrichment strategy intact so hero_preview.html is the primary success path.
   *
   * v3.0.17-sandbox
   * - Treats logo_preview.html as the primary deliverable for logo enrichment so the working preview path is the official success path.
   * - Keeps raw raster logo saves as optional diagnostics only and no longer lets them define enrichment success.
   * - Keeps hero product image preview packaging active so the runner can move forward into product image discovery.
   *
   * v3.0.16-sandbox
   * - Adds browser-safe raster diagnostics by saving a data-URI HTML viewer for discovered PNG/JPG/GIF logos.
   * - Keeps the direct File Cabinet raster save attempt, but now packages a guaranteed renderable logo_image_datauri.html artifact for validation.
   * - Cleans the active notes to the current v3.x sandbox branch only.
   *
   * v3.0.15-sandbox
   * - Replaces UTF-8 raster conversion with binary-string base64 encoding for PNG/JPG/GIF saves.
   * - Adds raster save diagnostics for body length, output base64 length, and save mode.
   * - Keeps logo preview and image enrichment fully non-blocking.
   *
   * v3.0.14-sandbox
   * - Adds first-pass raster logo persistence for png/jpg/jpeg/gif using base64 conversion.
   * - Saves raw raster fetch diagnostics and a text fallback when raster save is skipped or fails.
   * - Keeps image enrichment fully non-blocking and hero discovery separate from the core reset flow.
   *
   * v3.0.13-sandbox
   * - Adds hero product image discovery and File Cabinet packaging artifacts.
   * - Saves hero_candidates.json, hero_manifest.json, hero_url.txt, and hero_preview.html.
   *
   * v3.0.12-sandbox
   * - Expands homepage logo discovery to inspect broader candidate attributes and icon/meta patterns.
   * - Adds logo_candidates.json to improve diagnostics when no logo URL is found.
   *
   * v3.0.11-sandbox
   * - Cleans runner version notes to the active v3.x sandbox branch only.
   * - Hardens logo persistence with explicit fetch diagnostics and SVG-text save support.
   * - Saves logo_fetch_diagnostics.json for each website attempt so skipped logo saves are explainable.
   * - Keeps image enrichment non-blocking for the core reset flow.
   */
  const VERSION = 'v4.0.0-runner-sandbox';
  const RELEASE_TRAIN = 'v4.0.0';
  const RELEASE_TRANCHE = 'w450-llm-naming-real-wip-routing';
  const W449_WORK_CENTER_SEARCH = {
    id: 5005,
    scriptId: 'customsearch_scai_ss_wc_wip',
    title: 'Work Center List Reset Engine'
  };
  const W449_WORK_CENTER_FAMILIES = {
    receiving: [1630],
    mixing: [1439, 1450, 1394],
    production: [1686, 1438, 1398],
    fill: [1397, 1439],
    qc: [1650, 1395],
    packing: [1437, 1396, 1451]
  };
  const W450_GENERIC_NAMING_HARD_STOP_TERMS = [
    'Machine Unit',
    'Core Material Input',
    'Primary Material Input',
    'Product 12-Count Case Pack',
    'Product Seasoning Blend',
    'Build Product',
    'Prepare Materials',
    'Final Assembly Unit',
    'Finished Assembly Unit',
    'Generic Product',
    'Component Input'
  ];
  const PACK_ENGINE_VERSION = 'v13.0.0-intelligent-industry-packs';

  const ANCHORS = {
    customer: 'SCAI_ANCHOR_CUSTOMER',
    vendor:   'SCAI_ANCHOR_VENDOR',
    heroItem: 'SCAI_ANCHOR_ITEM',

    assembly: 'SCAI_ANCHOR_ASSEMBLY',
    comp1:    'SCAI_COMP_1',
    comp2:    'SCAI_COMP_2',
    comp3:    'SCAI_COMP_3',

    bom:      'SCAI_ANCHOR_BOM',
    bomrev:   'SCAI_ANCHOR_BOMREV'
  };

  // Planning auto-calc fields (hero + components)
  const HERO_AUTOCALC_FIELDS = [
    // Known body-level planning auto-calc fields used in this account
    'autopreferredstocklevel',
    'autoleadtime',
    'autoreorderpoint',
    // Legacy / alternate variants seen across item setups
    'preferredstocklevelautocalc',
    'leadtimeautocalc',
    'reorderpointautocalc',
    'autocalcpreferredstocklevel',
    'autocalcpurchaseleadtime',
    'autocalcreorderpoint',
    'purchaseleadtimeautocalc'
  ];

  const COMPONENT_AUTOCALC_FIELDS = [
    'autopreferredstocklevel',
    'autoleadtime',
    'autoreorderpoint'
  ];



  function readRunnerParams() {
    const s = runtime.getCurrentScript();
    return {
      prospect: str(s.getParameter({ name: 'custscript_v3_runner_prospect' })),
      website: str(s.getParameter({ name: 'custscript_v3_runner_website' })),
      notes: str(s.getParameter({ name: 'custscript_v3_runner_notes' })),
      agenda: str(s.getParameter({ name: 'custscript_v3_runner_agenda' })),
      extId: str(s.getParameter({ name: 'custscript_v3_runner_extid' })),
      confirmedBuildRequestJson: parseEmbeddedJson(s.getParameter({ name: 'custscript_v3_runner_idb_request_json' })) || null,
      resultCaptureFolderId: toIntOrNull(
        s.getParameter({ name: 'custscript_v3_runner_result_capture_folder' }) ||
        s.getParameter({ name: 'custscript_idb_result_capture_folder_id' })
      ),
      enableImageEnrichment: normalizeBool(
        s.getParameter({ name: 'custscript_v3_runner_enable_image_enrichment' }) ||
        s.getParameter({ name: 'custscript_idb_enable_image_enrichment' }) ||
        'F'
      )
    };
  }
  function readScenarioPayload(names, opts) {
    const truthExport = buildTruthExportSource(names, opts || {});
    return {
      initialScenarioLabel: truthExport.initialScenarioLabel,
      normalizedScenarioLabel: truthExport.normalizedScenarioLabel,
      initialIndustryCategory: truthExport.initialIndustryCategory,
      normalizedIndustryCategory: truthExport.normalizedIndustryCategory,
      flowLabel: truthExport.flowLabel,
      canonicalFlowLabel: truthExport.canonicalFlowLabel,
      canonicalFlowKey: truthExport.canonicalFlowKey,
      flowMode: truthExport.flowMode,
      flowDetailLabel: truthExport.flowDetailLabel,
      finalScenarioSource: truthExport.finalScenarioSource,
      normalizationActions: names && Array.isArray(names._normalizationActions) ? names._normalizationActions : [],
      strippedForbiddenTerms: names && Array.isArray(names._strippedForbiddenTerms) ? names._strippedForbiddenTerms : [],
      authoritativeTruth: truthExport.truth,
      authoritativeTruthExport: truthExport
    };
  }
  function parseEmbeddedJson(value) {
    if (!value) return null;
    if (typeof value === 'object') return value;
    const raw = str(value);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
  function readEmbeddedResolvedDemoContract(names) {
    const source = Object.assign({}, names || {});
    const candidates = [
      source.resolvedDemoContract,
      source._resolvedDemoContract,
      source.resolved_demo_contract,
      source._resolved_demo_contract
    ];
    for (let i = 0; i < candidates.length; i += 1) {
      const parsed = parseEmbeddedJson(candidates[i]);
      if (parsed && typeof parsed === 'object') return parsed;
    }
    return null;
  }
  function inferRunnerSpikeShow(title, index) {
    const text = str(title).trim();
    const lower = text.toLowerCase();
    if (!text) return 'Show the operating decision and proof path implied by the selected industry play.';
    if (/ingredient/.test(lower)) return 'Show ingredient readiness, packaging timing, and line continuity before downstream fulfillment detail.';
    if (/finished[- ]goods|service protection/.test(lower)) return 'Show how ingredient, packaging, and line signals protect finished-goods service and retailer commitments.';
    if (/engineered-order|promise confidence/.test(lower)) return 'Show the order moving from demand through parts readiness, assembly visibility, and shipment confidence.';
    if (/supply-to-build/.test(lower)) return 'Show procurement and component readiness tied directly to assembly timing and execution control.';
    if (/style|size|color|assortment/.test(lower)) return 'Show one style moving through allocation, sourcing, and fulfillment readiness with size and color context intact.';
    if (/sell-through|shelf confidence/.test(lower)) return 'Show how readiness signals protect in-stock position, service levels, and customer promise confidence.';
    if (/validation|lot|release/.test(lower)) return 'Show regulated lot readiness, traceability, and release confidence before downstream shipment detail.';
    if (/regulated execution/.test(lower)) return 'Show one lot or instrument moving through validation, traceability, and release gates.';
    if (/promotion-to-shelf|replenishment/.test(lower)) return 'Show demand, packaging, and replenishment signals tied to shelf availability and service-level confidence.';
    if (index === 0) return 'Show the buyer\'s operating truth first so the demo starts from the real business risk.';
    if (index === 1) return 'Show the one operating decision NetSuite improves when demand and execution have to stay aligned.';
    return 'Show the business outcome the buyer cares about and tie it back to operational evidence.';
  }
  function normalizeRunnerSpikeRows(rows) {
    return (Array.isArray(rows) ? rows : []).slice(0, 3).map(function (row, index) {
      if (row && typeof row === 'object') {
        const title = str(row.title || row.name || row.label || ('Spike ' + (index + 1)));
        const show = str(row.whatToShow || row.show || row.proves || row.say || '').trim();
        const why = str(row.whyItMatters || row.whyItHits || row.why || '').trim();
        return {
          title: title,
          show: show || inferRunnerSpikeShow(title, index),
          whatToShow: show || inferRunnerSpikeShow(title, index),
          whyItMatters: why
        };
      }
      const title = str(row || ('Spike ' + (index + 1)));
      const show = inferRunnerSpikeShow(title, index);
      return {
        title: title,
        show: show,
        whatToShow: show,
        whyItMatters: ''
      };
    });
  }
  function selectRunnerPlay(names, opts, flowState) {
    const source = Object.assign({}, names || {});
    const selectionCtx = {
      prospect: str(source.prospect_name || source.prospect || ''),
      website: str(source.website || source.company_website || ''),
      notes: str(source.memo || source.notes || ''),
      playId: str(source._winningPlayId || source.winningPlayId || ''),
      authoritativeFamilyKey: str(source._authoritativeFamilyKey || source._uiLockFamily || source._sharedEngineFamily || source._packFamily || ''),
      authoritativeFamily: str(source._normalizedIndustryCategory || source.industry_category || ''),
      authoritativeScenario: str(source._normalizedScenarioLabel || source.scenario_label || source.scenario_name || ''),
      authoritativeFlowLabel: str(flowState && flowState.label || ''),
      authoritativePlayFamilyKey: str(source._authoritativePlayFamilyKey || source._playFamilyKey || ''),
      authoritativePlayFlowLabel: str(source._authoritativePlayFlowLabel || source._flowLabel || ''),
      visibleFamilyKey: str(source._authoritativeFamilyKey || source._packFamily || ''),
      visibleScenario: str(source._normalizedScenarioLabel || source.scenario_label || source.scenario_name || ''),
      visibleFlowLabel: str(flowState && flowState.label || ''),
      executionFamilyKey: str(source._authoritativeFamilyKey || source._sharedEngineFamily || source._packFamily || ''),
      executionFamily: str(source._normalizedIndustryCategory || source.industry_category || ''),
      executionScenario: str(source._normalizedScenarioLabel || source.scenario_label || source.scenario_name || ''),
      winningPackId: str(source._packId || ''),
      packFamily: str(source._authoritativePackFamily || source._packFamily || ''),
      industryCategory: str(source._normalizedIndustryCategory || source.industry_category || ''),
      scenarioLabel: str(source._normalizedScenarioLabel || source.scenario_label || source.scenario_name || ''),
      winningBucket: str(source._packFamily || ''),
      enableManufacturing: !!(opts && opts.enableManufacturing),
      enableWip: !!(opts && opts.enableWip)
    };
    const selection = playSelectorCore && playSelectorCore.selectWinningPlay
      ? playSelectorCore.selectWinningPlay(selectionCtx)
      : null;
    const play = selection && selection.winner && selection.winner.play
      ? selection.winner.play
      : (playLibraryCore && playLibraryCore.getPlayByPackId
        ? (playLibraryCore.getPlayById(selectionCtx.playId)
          || playLibraryCore.getPlayByPackId(selectionCtx.winningPackId)
          || playLibraryCore.getPlayByFamilyKey(selectionCtx.authoritativePlayFamilyKey || selectionCtx.authoritativeFamilyKey)
          || null)
        : null);
    const guidance = (play && play.consultantGuidance) || {};
    const story = (play && play.story) || {};
    const classification = (play && play.classification) || {};
    const competition = guidance.competition || {};
    return {
      play: play ? {
        playId: str(play.playId || ''),
        familyKey: str(classification.familyKey || ''),
        displayIndustry: str(classification.displayIndustry || story.operatingModelLabel || ''),
        sourcePackId: str((play.source || {}).sourcePackId || ''),
        source: 'industry_play_library',
        mode: playLibraryCore && playLibraryCore.inferMode
          ? playLibraryCore.inferMode(!!(opts && opts.enableManufacturing), !!(opts && opts.enableWip))
          : '',
        flowLabel: str((story && story.operatingMotion) || ((play && play.selection) || {}).flowLabel || ''),
        selectionReason: str(selection && selection.reasonSummary || ''),
        score: Number(selection && selection.winner ? selection.winner.score || 0 : 0),
        scoreGap: Number(selection && selection.scoreGap || 0),
        scenarioCandidates: Array.isArray((play.selection || {}).scenarioCandidates) ? (play.selection || {}).scenarioCandidates.slice(0) : [],
        supportedModes: Array.isArray(classification.supportedModes) ? classification.supportedModes.slice(0) : []
      } : null,
      consultantBrief: {
        primaryFocus: str(story.primaryFocus || ''),
        recommendedStoryline: str(story.recommendedStoryline || ''),
        operatingMotion: str(story.operatingMotion || ''),
        openWith: str(((guidance.presenterStrip || {}).open) || ''),
        whatToProve: str(((guidance.presenterStrip || {}).show) || ''),
        transition: str(((guidance.presenterStrip || {}).transition) || ''),
        close: str(((guidance.presenterStrip || {}).close) || ''),
        whyThisWins: str(competition.cleanLine || ''),
        questionsToSurface: Array.isArray(guidance.questionsToSurface) ? guidance.questionsToSurface.slice(0) : [],
        topDemoSpikes: normalizeRunnerSpikeRows(guidance.topDemoSpikes),
        proofMap: Array.isArray(((guidance.proofMap || {}).records)) ? (guidance.proofMap || {}).records.slice(0) : []
      },
      competitionBrief: {
        likelyBias: str(competition.likelyBias || ''),
        bias: str(competition.likelyBias || ''),
        fragmentedMiss: str(competition.fragmentedMiss || ''),
        competitivePattern: str(competition.fragmentedMiss || ''),
        cleanLine: str(competition.cleanLine || ''),
        bridgeLine: str(competition.cleanLine || ''),
        targets: Array.isArray(competition.targets) ? competition.targets.slice(0) : [],
        likelyCompetitors: Array.isArray(competition.targets) ? competition.targets.slice(0) : []
      },
      advisorMode: {
        authority: 'industry_play_contract',
        trustedAdvisorPosition: str(story.fallbackBaseline || story.operatingMotion || ''),
        doNotSay: Array.isArray(((guidance.presenterStrip || {}).doNotSay)) ? ((guidance.presenterStrip || {}).doNotSay).slice(0) : []
      }
    };
  }
  function buildAuthoritativeTruthContract(names, opts) {
    const out = Object.assign({}, names || {});
    const embeddedContract = readEmbeddedResolvedDemoContract(out);
    if (embeddedContract && resolvedDemoContractCore && resolvedDemoContractCore.buildResolvedDemoContract) {
      const normalizedEmbedded = resolvedDemoContractCore.buildResolvedDemoContract(embeddedContract, {
        source: 'runner-embedded',
        contractVersion: VERSION,
        schemaVersion: resolvedDemoContractCore.SCHEMA_VERSION
      });
      return Object.assign({}, embeddedContract, {
        resolvedDemoContract: normalizedEmbedded,
        resolvedDemoContractDebug: resolvedDemoContractCore.summarizeResolvedDemoContract
          ? resolvedDemoContractCore.summarizeResolvedDemoContract(normalizedEmbedded)
          : null
      });
    }
    const normalizedScenarioLabel = str(out._normalizedScenarioLabel || out.scenario_label || out.scenario_name || '');
    const normalizedIndustryCategory = str(out._normalizedIndustryCategory || out.industry_category || '');
    const baseFlowState = deriveCanonicalFlowState({
      _canonicalFlowKey: str(out._canonicalFlowKey || ''),
      _flowMode: str(out._flowMode || ''),
      _canonicalFlowLabel: str(out._canonicalFlowLabel || ''),
      _flowLabel: str(out._flowLabel || ''),
      _flowDetailLabel: str(out._flowDetailLabel || ''),
      _authoritativeFamilyKey: str(out._authoritativeFamilyKey || out._uiLockFamily || out._sharedEngineFamily || out._packFamily || ''),
      _uiLockFamily: str(out._uiLockFamily || ''),
      _sharedEngineFamily: str(out._sharedEngineFamily || ''),
      _packFamily: str(out._packFamily || ''),
      industry_category: normalizedIndustryCategory,
      _normalizedScenarioLabel: normalizedScenarioLabel,
      scenario_label: str(out.scenario_label || out.scenario_name || '')
    }, !!(opts && opts.enableManufacturing), !!(opts && opts.enableWip));
    const playNarrative = selectRunnerPlay(out, opts || {}, baseFlowState);
    const play = playNarrative && playNarrative.play ? playNarrative.play : null;
    const resolvedIndustryCategory = str((play && play.displayIndustry) || normalizedIndustryCategory || '');
    const authoritativeFamilyKey = str(
      (play && play.familyKey)
      || out._authoritativeFamilyKey
      || out._uiLockFamily
      || out._sharedEngineFamily
      || out._packFamily
      || ''
    );
    const rawWinningPackFamily = str(out._rawPackFamily || out._packFamily || '');
    const authoritativePackFamily = str((play && play.familyKey) || out._authoritativePackFamily || out._packFamily || '');
    const playFlowLabel = str((play && play.flowLabel) || '');
    const enrichedForFlow = Object.assign({}, out, {
      _authoritativeFamilyKey: authoritativeFamilyKey,
      _authoritativePackFamily: authoritativePackFamily,
      _authoritativePlayFamilyKey: str((play && play.familyKey) || ''),
      _authoritativePlayMode: str((play && play.mode) || ''),
      _authoritativePlayFlowLabel: playFlowLabel,
      _winningPlayId: str((playNarrative && playNarrative.play && playNarrative.play.playId) || (play && play.playId) || out._winningPlayId || out.winningPlayId || ''),
      _normalizedIndustryCategory: resolvedIndustryCategory,
      _normalizedScenarioLabel: normalizedScenarioLabel
    });
    const flowState = deriveCanonicalFlowState(
      enrichedForFlow,
      !!(opts && opts.enableManufacturing),
      !!(opts && opts.enableWip),
      play
    );
    const contract = {
      winningPlayId: str((playNarrative && playNarrative.play && playNarrative.play.playId) || (play && play.playId) || out._winningPlayId || out.winningPlayId || ''),
      winningPackId: str(out._packId || ''),
      winningPackFamily: authoritativePackFamily || str(out._packFamily || ''),
      rawWinningPackFamily: rawWinningPackFamily,
      authoritativePackFamily: authoritativePackFamily,
      authoritativeFamilyKey: authoritativeFamilyKey,
      authoritativePlayFamilyKey: str((play && play.familyKey) || ''),
      authoritativePlayFlowLabel: playFlowLabel,
      rawScorerWinnerFamily: str(out._rawScorerWinnerFamily || ''),
      runnerUpFamily: str(out._runnerUpPackFamily || ''),
      exclusionReason: str(out._exclusionReason || ''),
      finalLockedFamilySource: str(out._finalLockedFamilySource || ''),
      packConfidence: Number(out._packConfidence || 0),
      packValidationPassed: out._packValidationPassed !== false,
      packValidationFailures: Array.isArray(out._packValidationFailures) ? out._packValidationFailures.slice(0) : [],
      candidatePromotionUsed: !!out._candidatePromotionUsed,
      candidatePromotionReason: str(out._candidatePromotionReason || ''),
      finalScenarioSource: str(out._finalScenarioSource || ''),
      initialScenarioLabel: str(out.scenario_label || out.scenario_name || ''),
      normalizedScenarioLabel: normalizedScenarioLabel,
      initialIndustryCategory: str(out.industry_category || ''),
      normalizedIndustryCategory: resolvedIndustryCategory,
      flowLabel: flowState.label,
      canonicalFlowLabel: flowState.label,
      canonicalFlowKey: flowState.key,
      flowMode: flowState.mode,
      flowDetailLabel: flowState.detailLabel,
      flowState: flowState,
      visible: {
        familyKey: authoritativeFamilyKey,
        family: resolvedIndustryCategory,
        scenario: normalizedScenarioLabel,
        flowKey: flowState.key,
        flowLabel: flowState.label,
        packId: str(out._packId || ''),
        packFamilyKey: authoritativePackFamily || str(out._packFamily || ''),
        packFamily: resolvedIndustryCategory
      },
      execution: {
        familyKey: authoritativeFamilyKey,
        family: resolvedIndustryCategory,
        scenario: normalizedScenarioLabel,
        flowKey: flowState.key,
        flowLabel: flowState.label,
        packId: str(out._packId || ''),
        packFamilyKey: authoritativePackFamily || str(out._packFamily || ''),
        packFamily: resolvedIndustryCategory
      },
      diagnostics: {
        authoritativeFamilyKey: authoritativeFamilyKey,
        rawScorerWinnerFamily: str(out._rawScorerWinnerFamily || ''),
        runnerUpFamily: str(out._runnerUpPackFamily || ''),
        finalLockedFamilySource: str(out._finalLockedFamilySource || ''),
        exclusionReason: str(out._exclusionReason || ''),
        confidenceBand: str(out._confidenceBand || ''),
        executionRailMode: flowState.mode
      }
    };
    contract.play = play;
    contract.consultantBrief = playNarrative && playNarrative.consultantBrief ? playNarrative.consultantBrief : {};
    contract.competitionBrief = playNarrative && playNarrative.competitionBrief ? playNarrative.competitionBrief : {};
    contract.advisorMode = playNarrative && playNarrative.advisorMode ? playNarrative.advisorMode : {};
    if (resolvedDemoContractCore && resolvedDemoContractCore.buildResolvedDemoContract) {
      const resolvedDemoContract = resolvedDemoContractCore.buildResolvedDemoContract(contract, {
        source: 'runner',
        contractVersion: VERSION,
        schemaVersion: resolvedDemoContractCore.SCHEMA_VERSION
      });
      contract.resolvedDemoContract = resolvedDemoContract;
      contract.resolvedDemoContractDebug = resolvedDemoContractCore.summarizeResolvedDemoContract
        ? resolvedDemoContractCore.summarizeResolvedDemoContract(resolvedDemoContract)
        : null;
    }
    return contract;
  }
  function buildTruthExportSource(names, opts) {
    const truth = buildAuthoritativeTruthContract(names, opts || {});
    return {
      truth: truth,
      resolvedDemoContract: truth.resolvedDemoContract || null,
      resolvedDemoContractDebug: truth.resolvedDemoContractDebug || null,
      winningPlayId: truth.winningPlayId || '',
      play: truth.play || null,
      consultantBrief: truth.consultantBrief || {},
      competitionBrief: truth.competitionBrief || {},
      advisorMode: truth.advisorMode || {},
      winningPackId: truth.winningPackId,
      winningPackFamily: truth.winningPackFamily,
      rawWinningPackFamily: truth.rawWinningPackFamily,
      authoritativePackFamily: truth.authoritativePackFamily,
      authoritativeFamilyKey: truth.authoritativeFamilyKey,
      authoritativePlayFamilyKey: truth.authoritativePlayFamilyKey,
      authoritativePlayFlowLabel: truth.authoritativePlayFlowLabel,
      rawScorerWinnerFamily: truth.rawScorerWinnerFamily,
      runnerUpFamily: truth.runnerUpFamily,
      exclusionReason: truth.exclusionReason,
      finalLockedFamilySource: truth.finalLockedFamilySource,
      packConfidence: truth.packConfidence,
      packValidationPassed: truth.packValidationPassed,
      packValidationFailures: truth.packValidationFailures,
      candidatePromotionUsed: truth.candidatePromotionUsed,
      candidatePromotionReason: truth.candidatePromotionReason,
      finalScenarioSource: truth.finalScenarioSource,
      initialScenarioLabel: truth.initialScenarioLabel,
      normalizedScenarioLabel: truth.normalizedScenarioLabel,
      initialIndustryCategory: truth.initialIndustryCategory,
      normalizedIndustryCategory: truth.normalizedIndustryCategory,
      flowLabel: truth.flowLabel,
      canonicalFlowLabel: truth.canonicalFlowLabel,
      canonicalFlowKey: truth.canonicalFlowKey,
      flowMode: truth.flowMode,
      flowDetailLabel: truth.flowDetailLabel
    };
  }
  function buildCanonicalFlowState(key, rawFlowLabel) {
    const normalizedKey = str(key || 'distribution');
    const mode = normalizedKey === 'manufacturingWip'
      ? 'wip'
      : (normalizedKey === 'manufacturing' ? 'manufacturing' : 'inventory');
    const label = normalizedKey === 'manufacturingWip'
      ? 'Manufacturing + WIP'
      : (normalizedKey === 'manufacturing' ? 'Manufacturing' : 'Distribution / Inventory');
    return {
      key: normalizedKey,
      mode: mode,
      label: label,
      detailLabel: str(rawFlowLabel || '')
    };
  }
  function deriveCanonicalFlowState(names, enableManufacturing, enableWip, play) {
    const explicitKey = str(names && names._canonicalFlowKey || '');
    const explicitMode = str(names && names._flowMode || '').toLowerCase();
    const explicitLabel = str(names && (names._canonicalFlowLabel || names._flowLabel) || '');
    const detailLabel = str(names && names._flowDetailLabel || '');
    const playMode = str((play && play.mode) || (names && names._authoritativePlayMode) || '').toLowerCase();
    const playFlowLabel = str((names && names._authoritativePlayFlowLabel) || (play && play.flowLabel) || '').toLowerCase();
    const playFlowSignals = str(
      [
        playFlowLabel,
        str(play && play.displayIndustry || ''),
        str(play && play.familyKey || ''),
        str((play && play.story && play.story.operatingMotion) || ''),
        str((play && play.selection && play.selection.flowLabel) || '')
      ].join(' ')
    ).toLowerCase();
    if (explicitKey) return buildCanonicalFlowState(explicitKey, detailLabel || explicitLabel);
    if (explicitMode === 'wip') return buildCanonicalFlowState('manufacturingWip', detailLabel || explicitLabel);
    if (explicitMode === 'manufacturing') return buildCanonicalFlowState('manufacturing', detailLabel || explicitLabel);
    if (explicitMode === 'inventory') return buildCanonicalFlowState('distribution', detailLabel || explicitLabel);
    if (playMode === 'wip_on' || playMode === 'wip') {
      return buildCanonicalFlowState('manufacturingWip', detailLabel || explicitLabel || playFlowLabel);
    }
    if (playMode === 'mfg_on_no_wip' || playMode === 'manufacturing') {
      return buildCanonicalFlowState('manufacturing', detailLabel || explicitLabel || playFlowLabel);
    }
    if (/manufacturing\s*\+\s*wip|wip\b|work[\s-]?order|routing/.test(playFlowSignals)) {
      return buildCanonicalFlowState('manufacturingWip', detailLabel || explicitLabel || playFlowLabel);
    }
    if (/manufacturing|controlled build|assembly|ingredient|packaging|validation/.test(playFlowSignals)) {
      return buildCanonicalFlowState('manufacturing', detailLabel || explicitLabel || playFlowLabel);
    }

    const familyKey = str(names && (names._authoritativeFamilyKey || names._uiLockFamily || names._sharedEngineFamily || names._packFamily) || '').replace(/\s+/g, '').toLowerCase();
    const hay = [
      explicitLabel,
      detailLabel,
      names && names._authoritativeFamilyKey,
      names && names._uiLockFamily,
      names && names._sharedEngineFamily,
      names && names._packFamily,
      names && names._authoritativePlayFamilyKey,
      names && names.industry_category,
      names && (names._normalizedScenarioLabel || names.scenario_label || names.scenario_name)
    ].map(str).join(' ').toLowerCase();
    if (familyKey === 'servicesfield' || familyKey === 'retailomnichannel' || familyKey === 'distribution' || familyKey === 'software' || familyKey === 'apparelfootwearaccessoriesmanufacturing' || familyKey === 'cpgproductsmanufacturing') {
      return buildCanonicalFlowState('distribution', detailLabel || explicitLabel);
    }
    if (familyKey === 'lifesciencesmanufacturing' || familyKey === 'foodmanufacturing' || familyKey === 'cpgproductsmanufacturing' || familyKey === 'apparelfootwearaccessoriesmanufacturing' || familyKey === 'precisionassembly' || familyKey === 'industrialequipment' || familyKey === 'industrialmanufacturing') {
      if (/manufacturing\s*\+\s*wip|food manufacturing\s*\+\s*wip|wip\b|work[\s-]?order|routing/.test(hay)) {
        return buildCanonicalFlowState('manufacturingWip', detailLabel || explicitLabel);
      }
      if (/manufacturing|controlled build|assembly|build fulfillment|production|ingredient|validation/.test(hay)) {
        return buildCanonicalFlowState('manufacturing', detailLabel || explicitLabel);
      }
      return buildCanonicalFlowState(enableManufacturing ? (enableWip ? 'manufacturingWip' : 'manufacturing') : 'distribution', detailLabel || explicitLabel);
    }
    if (/field service|retail|omnichannel|distribution|inventory|fulfillment|warehouse|replenishment|procurement|branch/.test(hay)) {
      return buildCanonicalFlowState('distribution', detailLabel || explicitLabel);
    }
    if (/manufacturing\s*\+\s*wip|food manufacturing\s*\+\s*wip|wip\b|work[\s-]?order|routing/.test(hay)) {
      return buildCanonicalFlowState('manufacturingWip', detailLabel || explicitLabel);
    }
    if (/manufacturing|controlled build|assembly|build fulfillment|production|ingredient/.test(hay)) {
      return buildCanonicalFlowState('manufacturing', detailLabel || explicitLabel);
    }
    if (enableManufacturing && enableWip) return buildCanonicalFlowState('manufacturingWip', detailLabel || explicitLabel);
    if (enableManufacturing) return buildCanonicalFlowState('manufacturing', detailLabel || explicitLabel);
    return buildCanonicalFlowState('distribution', detailLabel || explicitLabel);
  }
  function readPackResolutionPayload(names, opts) {
    const truthExport = buildTruthExportSource(names, opts || {});
    return {
      authoritativeTruth: truthExport.truth,
      authoritativeTruthExport: truthExport,
      winningPackId: truthExport.winningPackId,
      winningPackFamily: truthExport.winningPackFamily,
      rawWinningPackFamily: truthExport.rawWinningPackFamily,
      authoritativeFamilyKey: truthExport.authoritativeFamilyKey,
      authoritativePackFamily: truthExport.authoritativePackFamily,
      authoritativePlayFamilyKey: truthExport.authoritativePlayFamilyKey,
      authoritativePlayFlowLabel: truthExport.authoritativePlayFlowLabel,
      rawScorerWinnerFamily: truthExport.rawScorerWinnerFamily,
      runnerUpFamily: truthExport.runnerUpFamily,
      exclusionReason: truthExport.exclusionReason,
      finalLockedFamilySource: truthExport.finalLockedFamilySource,
      packConfidence: truthExport.packConfidence,
      candidate1: names && names._candidate1 ? names._candidate1 : '',
      candidate1Failures: names && names._candidate1Failures ? names._candidate1Failures : [],
      candidate2: names && names._candidate2 ? names._candidate2 : '',
      candidate2Failures: names && names._candidate2Failures ? names._candidate2Failures : [],
      candidatePromotionUsed: truthExport.candidatePromotionUsed,
      candidatePromotionReason: truthExport.candidatePromotionReason,
      finalValidationPassed: truthExport.packValidationPassed,
      finalValidationFailures: truthExport.packValidationFailures
    };
  }
  function firstDefinedValue(values) {
    for (const v of values || []) {
      if (v !== undefined && v !== null && String(v) !== '') return v;
    }
    return '';
  }

  function hasExplicitBoolValue(v) {
    const s = String(v == null ? '' : v).trim().toLowerCase();
    return ['t','f','true','false','yes','no','y','n','1','0','on','off'].includes(s);
  }

  function inferManufacturingFromText(notes, agenda) {
    const txt = String((notes || '') + ' ' + (agenda || '')).toLowerCase();
    if (!txt) return false;
    return /(manufactur|assembly|bom|bill of materials|work order|routing|wip|production setup|build execution)/.test(txt);
  }

  function normalizeHeroMode(v) {
    const s = String(v || '').trim().toLowerCase();
    if (s === 'fresh' || s === 'new' || s === 'create') return 'fresh';
    if (s === 'anchor' || s === 'reuse' || s === 'existing') return 'anchor';
    return '';
  }

  function deriveManufacturingTargetMode(enableManufacturing, createNewHeroItem) {
    if (!enableManufacturing) return 'disabled';
    return createNewHeroItem ? 'fresh-hero' : 'anchor-hero';
  }

  function normalizeWipTargetMode(v) {
    const s = String(v || '').trim().toLowerCase();
    if (s === 'anchor-hero' || s === 'fresh-hero' || s === 'disabled' || s === 'manufacturing-disabled') return s;
    return '';
  }

  function deriveWipTargetMode(enableWip, enableManufacturing, createNewHeroItem) {
    if (!enableManufacturing) return 'manufacturing-disabled';
    if (!enableWip) return 'disabled';
    return createNewHeroItem ? 'fresh-hero' : 'anchor-hero';
  }

  function confirmedBuildToggleValueW440(request, names) {
    const selected = request && request.selectedToggles || {};
    const demoPathToggles = request && request.demoPath && request.demoPath.selectedToggles || {};
    const runnerControls = request && request.runnerControls && request.runnerControls.selectedToggles || {};
    const legacy = request && request.toggles || {};
    const buckets = [selected, demoPathToggles, runnerControls, legacy];
    const keys = names || [];
    for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
      const bucket = buckets[bucketIndex] || {};
      for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
        const key = keys[keyIndex];
        if (Object.prototype.hasOwnProperty.call(bucket, key) && hasExplicitBoolValue(bucket[key])) {
          return bucket[key];
        }
      }
    }
    return '';
  }

  function execute() {
    const s = runtime.getCurrentScript();
    const runnerParams = readRunnerParams();

    const prospect = runnerParams.prospect;
    const website  = runnerParams.website;
    const notes    = runnerParams.notes;
    const agenda   = runnerParams.agenda;
    const extId    = runnerParams.extId;
    const confirmedBuildRequestJson = runnerParams.confirmedBuildRequestJson || null;
    const runUniqueSuffix = buildRunUniquenessToken(extId);
    const explicitResultCaptureFolderId = runnerParams.resultCaptureFolderId;
    const enableImageEnrichment = runnerParams.enableImageEnrichment === true;

    const soMappingId = toIntOrNull(s.getParameter({ name: 'custscript_v3_runner_mapping' }));
    const soFolderId  = toIntOrNull(s.getParameter({ name: 'custscript_v3_runner_folder' }));
    const resultCaptureFolderId = explicitResultCaptureFolderId || (/^IDB-/i.test(extId) ? soFolderId : null);
    const resultCaptureFolderSource = explicitResultCaptureFolderId
      ? 'explicit_runner_result_capture_param'
      : (resultCaptureFolderId ? 'idb_extid_fallback_to_runner_folder' : 'not_configured');
    const namingFileId = null;

    const subsidiaryId = toIntOrNull(s.getParameter({ name: 'custscript_v3_runner_subsidiary' }));
    const locationId   = toIntOrNull(s.getParameter({ name: 'custscript_v3_runner_location' }));
    const workCenterSearchIdRaw = str(
      s.getParameter({ name: 'custscript_v3_runner_wc_search' }) ||
      s.getParameter({ name: 'custscript_v3_runner_wc_search' })
    ).trim();
    const workCenterSearchId = /^\d+$/.test(workCenterSearchIdRaw)
      ? Number(workCenterSearchIdRaw)
      : workCenterSearchIdRaw;

    const confirmedCreateNewHeroRaw = confirmedBuildToggleValueW440(confirmedBuildRequestJson, ['createNewHeroItem', 'createNewItem']);
    const confirmedEnableManufacturingRaw = confirmedBuildToggleValueW440(confirmedBuildRequestJson, ['enableManufacturing', 'manufacturing']);
    const confirmedEnableWipRaw = confirmedBuildToggleValueW440(confirmedBuildRequestJson, ['enableWip', 'enableWIP', 'wip']);

    // WIP flag (confirmed request owns the consultant-selected mode; Suitelet params remain a compatibility path)
    const enableWipCandidates = {
      confirmed_build_request: confirmedEnableWipRaw,
      custscript_v3_runner_enable_wip: s.getParameter({ name: 'custscript_v3_runner_enable_wip' })
    };
    const enableWipRaw = firstDefinedValue(Object.values(enableWipCandidates));
    const enableWip = normalizeBool(enableWipRaw);

    const createNewHeroCandidates = {
      confirmed_build_request: confirmedCreateNewHeroRaw,
      custscript_v3_runner_create_new_hero: s.getParameter({ name: 'custscript_v3_runner_create_new_hero' })
    };
    const createNewHeroRaw = firstDefinedValue(Object.values(createNewHeroCandidates));
    const createNewHeroItem = normalizeBool(createNewHeroRaw);

    const enableManufacturingCandidates = {
      confirmed_build_request: confirmedEnableManufacturingRaw,
      custscript_v3_runner_enable_mfg: s.getParameter({ name: 'custscript_v3_runner_enable_mfg' })
    };
    const enableManufacturingRaw = firstDefinedValue(Object.values(enableManufacturingCandidates));
    const enableManufacturingExplicit = hasExplicitBoolValue(enableManufacturingRaw);
    const enableManufacturingParam = normalizeBool(enableManufacturingRaw);
    const enableManufacturingTextFallback = (!enableManufacturingExplicit && enableWip)
      ? inferManufacturingFromText(notes, agenda)
      : false;
    const finalEnableManufacturing = enableManufacturingExplicit
      ? enableManufacturingParam
      : (enableManufacturingParam || enableManufacturingTextFallback);

    log.audit({
      title: `Manufacturing flag resolution [${VERSION}]`,
      details: JSON.stringify({
        candidates: enableManufacturingCandidates,
        enableWipCandidates,
        createNewHeroCandidates,
        enableManufacturingRaw,
        enableManufacturingExplicit,
        enableManufacturingParam,
        enableManufacturingTextFallback,
        confirmedSelectedToggles: confirmedBuildRequestJson && confirmedBuildRequestJson.selectedToggles || null,
        notesLen: String(notes || '').length,
        agendaLen: String(agenda || '').length,
        resolvedEnableManufacturing: finalEnableManufacturing
      })
    });
    log.audit({
      title: `Runner item uniqueness token [${VERSION}]`,
      details: JSON.stringify({
        extId,
        runUniqueSuffix,
        policy: 'fresh generated item names include a per-run suffix'
      })
    });

    const requestedHeroMode = createNewHeroItem ? 'fresh' : 'anchor';

    const passedHeroItemIdRaw = s.getParameter({ name: 'custscript_v3_runner_hero_item' }) || '';
    const passedHeroItemIdParam = toIntOrNull(passedHeroItemIdRaw);

    const anchorHeroItemId = mustFindByExternalId('inventoryitem', ANCHORS.heroItem);
    const heroModeRaw = requestedHeroMode;
    const requestedWipTargetModeRaw = '';
    const anchorHeroItemIdRaw = '';
    const anchorHeroItemIdParam = null;

    let inferredFreshHeroItemId = null;
    let passedHeroItemId = null;
    let handshakeAction = 'accepted';
    let effectiveCreateNewHeroItem = requestedHeroMode === 'fresh';

    if (requestedHeroMode === 'anchor') {
      if (passedHeroItemIdParam) {
        handshakeAction = 'anchor-mode-cleared-passed-hero';
      } else {
        handshakeAction = 'anchor-mode-confirmed';
      }
      effectiveCreateNewHeroItem = false;
      passedHeroItemId = null;
    } else {
      inferredFreshHeroItemId = inferFreshHeroItemIdByExt(extId);
      if (passedHeroItemIdParam) {
        passedHeroItemId = passedHeroItemIdParam;
        handshakeAction = 'fresh-mode-explicit-pass';
      } else if (inferredFreshHeroItemId) {
        passedHeroItemId = inferredFreshHeroItemId;
        handshakeAction = 'fresh-mode-fallback-to-inferred';
      } else {
        passedHeroItemId = null;
        handshakeAction = 'fresh-mode-runner-create';
      }
      effectiveCreateNewHeroItem = true;
    }

    const requestedManufacturingTargetMode = deriveManufacturingTargetMode(finalEnableManufacturing, requestedHeroMode === 'fresh');
    const manufacturingTargetMode = deriveManufacturingTargetMode(finalEnableManufacturing, effectiveCreateNewHeroItem);
    const manufacturingHandshakeAction = requestedManufacturingTargetMode === manufacturingTargetMode
      ? 'manufacturing-target-confirmed'
      : 'manufacturing-target-rebased-to-effective-hero';

    const effectiveEnableWip = finalEnableManufacturing ? enableWip : false;

    const requestedWipTargetMode = deriveWipTargetMode(enableWip, finalEnableManufacturing, requestedHeroMode === 'fresh');
    const wipTargetMode = deriveWipTargetMode(effectiveEnableWip, finalEnableManufacturing, effectiveCreateNewHeroItem);
    const wipHandshakeAction = requestedWipTargetMode === wipTargetMode
      ? 'wip-target-confirmed'
      : 'wip-target-rebased-to-effective-state';

    if (!prospect) throw new Error('Missing required param: custscript_v3_runner_prospect');
    if (!extId) throw new Error('Missing required param: custscript_v3_runner_extid');
    if (!soMappingId) throw new Error('Missing required param: custscript_v3_runner_mapping');
    if (!soFolderId) throw new Error('Missing required param: custscript_v3_runner_folder');
    if (!subsidiaryId) throw new Error('Missing required param: custscript_v3_runner_subsidiary');

    log.audit({
      title: `Runner START [${VERSION}]`,
      details: JSON.stringify({
        prospect,
        website,
        notesLen: notes.length,
        agendaLen: agenda.length,
        extId,
        soMappingId,
        soFolderId,
        subsidiaryId,
        locationId,
        workCenterSearchIdRaw,
        workCenterSearchId,
        resultCaptureFolderId,
        resultCaptureFolderSource,
        enableWipRaw,
        enableWip,
        createNewHeroRaw,
        createNewHeroItem,
        heroModeRaw,
        requestedHeroMode,
        effectiveCreateNewHeroItem,
        enableManufacturingRaw,
        enableManufacturing: finalEnableManufacturing,
        effectiveEnableWip,
        requestedWipTargetModeRaw,
        requestedWipTargetMode,
        wipTargetMode,
        wipHandshakeAction,
        anchorHeroItemIdRaw,
        anchorHeroItemIdParam,
        anchorHeroItemId,
        passedHeroItemIdRaw,
        passedHeroItemIdParam,
        inferredFreshHeroItemId,
        passedHeroItemId,
        handshakeAction
      })
    });

    log.audit({
      title: `WIP saved search param [${VERSION}]`,
      details: JSON.stringify({
        raw: workCenterSearchIdRaw,
        normalized: workCenterSearchId,
        type: typeof workCenterSearchId
      })
    });

    log.audit({
      title: `Hero handshake summary [${VERSION}]`,
      details: JSON.stringify({
        heroModeRaw,
        requestedHeroMode,
        createNewHeroRaw,
        createNewHeroItem,
        effectiveCreateNewHeroItem,
        anchorHeroItemIdRaw,
        anchorHeroItemIdParam,
        anchorHeroItemId,
        passedHeroItemIdRaw,
        passedHeroItemIdParam,
        inferredFreshHeroItemId,
        passedHeroItemId,
        handshakeAction
      })
    });

    // 1) Ensure hero / manufacturing records based on mode flags
    log.audit({
      title: `Manufacturing final gate [${VERSION}]`,
      details: JSON.stringify({
        enableManufacturingExplicit,
        enableManufacturingRaw,
        enableManufacturingParam,
        enableManufacturingTextFallback,
        finalEnableManufacturing
      })
    });

    log.audit({
      title: `Manufacturing target resolution [${VERSION}]`,
      details: JSON.stringify({
        requestedHeroMode,
        effectiveHeroMode: effectiveCreateNewHeroItem ? 'fresh' : 'anchor',
        requestedManufacturingTargetMode,
        manufacturingTargetMode,
        manufacturingHandshakeAction,
        enableManufacturingRequested: finalEnableManufacturing,
        finalEnableManufacturing,
        effectiveEnableWip
      })
    });

    log.audit({
      title: `WIP target resolution [${VERSION}]`,
      details: JSON.stringify({
        requestedWipTargetModeRaw,
        requestedWipTargetMode,
        wipTargetMode,
        wipHandshakeAction,
        enableWipRequested: enableWip,
        effectiveEnableWip,
        finalEnableManufacturing,
        effectiveHeroMode: effectiveCreateNewHeroItem ? 'fresh' : 'anchor'
      })
    });

    const ids = ensureDemoRecords({
      subsidiaryId,
      locationId,
      createNewHeroItem: effectiveCreateNewHeroItem,
      enableManufacturing: finalEnableManufacturing,
      extId,
      prospect,
      passedHeroItemId,
      runUniqueSuffix
    });
    log.audit({ title: `Demo records ensured [${VERSION}]`, details: JSON.stringify(ids) });

    // 2) Planning auto-calc OFF for Hero + Components (when present)
    if (finalEnableManufacturing && ids.comp1Id && ids.comp2Id && ids.comp3Id) {
      forcePlanningAutoCalcOffForItems({
        vendorId: mustFindByExternalId('vendor', ANCHORS.vendor),
        heroItemId: ids.heroItemId,
        compIds: [ids.comp1Id, ids.comp2Id, ids.comp3Id]
      });
    } else {
      safeTry(() => forcePlanningAutoCalcOffForItems({
        vendorId: mustFindByExternalId('vendor', ANCHORS.vendor),
        heroItemId: ids.heroItemId,
        compIds: []
      }));
    }

    // 3) Website signal + naming pack (industry-agnostic fallback)
    const websiteSignalResult = safeGetWebsiteSignal({ website: website, prospect: prospect, extId: extId, folderId: soFolderId });
    const signal = websiteSignalResult.signal || { domain: extractDomain(website), text: `Domain: ${extractDomain(website) || ''}. Infer industry from the company name and notes.` };
    log.audit({ title: `Website signal [${VERSION}]`, details: JSON.stringify({ status: websiteSignalResult.status, domain: signal.domain, len: (signal.text || '').length, errorName: websiteSignalResult.errorName || '', fallbackUsed: !!websiteSignalResult.fallbackUsed, signalSource: websiteSignalResult.signalSource || 'deterministic', diagnostics: websiteSignalResult.diagnostics || null }) });

    const namingPayload = loadPrecomputedNamingPack({ fileId: namingFileId, extId, prospect, website, signalText: signal.text });
    const names = applyToggleAwareNamingGuardrails(namingPayload.payload, {
      enableManufacturing: finalEnableManufacturing,
      enableWip: effectiveEnableWip,
      prospect,
      website,
      notes,
      agenda,
      extId,
      confirmedBuildRequestJson
    });
    log.audit({ title: `Naming pack selected [${VERSION}]`, details: JSON.stringify({ source: namingPayload.source || names._source || 'deterministic', signalLen: names._signalLen || 0, industry_category: names.industry_category || '', namingFileId: namingPayload.fileId || namingFileId || null, namingPayloadFound: !!namingPayload.found, namingPayloadParsed: !!namingPayload.parsed, namingPayloadApplied: !!namingPayload.applied, namingDiscoveryMode: namingPayload.discoveryMode || 'none' }) });
    if (names._toggleAwareNamingGuardrail && names._toggleAwareNamingGuardrail.rewrites && names._toggleAwareNamingGuardrail.rewrites.length) {
      log.audit({
        title: `IDB toggle-aware naming guardrail rewrites [${VERSION}]`,
        details: JSON.stringify(names._toggleAwareNamingGuardrail)
      });
    }

    const truthExport = buildTruthExportSource(names, {
      enableManufacturing: finalEnableManufacturing,
      enableWip: effectiveEnableWip
    });
    const authoritativeTruth = truthExport.truth;
    const canonicalStorySeed = buildCanonicalStorySeedAsset({
      extId,
      prospect,
      website,
      names,
      notes,
      agenda,
      enableWip: effectiveEnableWip,
      enableManufacturing: finalEnableManufacturing
    });

    const imageEnrichment = enableImageEnrichment
      ? safeTryReturn(() => runImageEnrichmentPhase1({
        extId,
        prospect,
        website,
        signal,
        names,
        notes,
        agenda,
        enableWip: effectiveEnableWip,
        enableManufacturing: finalEnableManufacturing
      })) || {
        status: 'not-attempted',
        rootFolderId: null,
        assetFolderId: null,
        logoUrl: '',
        files: []
      }
      : {
      status: 'skipped-admin-enrichment-disabled',
      rootFolderId: null,
      assetFolderId: null,
      logoUrl: '',
      heroUrl: '',
      assemblyUrl: '',
      files: [],
      nonBlocking: true,
      reason: 'Image lookup is disabled by default for IDB production builds.'
    };
    if (!enableImageEnrichment) {
      log.audit({
        title: `Image enrichment skipped [${VERSION}]`,
        details: JSON.stringify({
          extId,
          status: imageEnrichment.status,
          reason: imageEnrichment.reason,
          recordCreationBlocked: false,
          resultCaptureBlocked: false
        })
      });
    }

    // 4) Apply naming + one-line sales/purchase descriptions
    applyNamingToAnchors(ids, names, { enableManufacturing: finalEnableManufacturing, enableWip: effectiveEnableWip, createNewHeroItem: effectiveCreateNewHeroItem, extId, prospect, runUniqueSuffix });

    // 5) Base prices
    setBaseSalesPrice('inventoryitem', ids.heroItemId, 5.00);
    if (finalEnableManufacturing && ids.assemblyId) setBaseSalesPrice('assemblyitem', ids.assemblyId, 25.00);

    // 6) Manufacturing-only setup
    let woId = null;
    let assemblyBomTelemetry = null;
    let manufacturingEligibilityPreflightW446 = null;
    let workOrderTelemetry = { status: 'not-attempted', finalLabel: '', attemptsTried: [], errorMessage: '' };
    if (finalEnableManufacturing && ids.assemblyId && ids.bomId) {
      assemblyBomTelemetry = attachBomToAssembly({
        assemblyId: ids.assemblyId,
        bomId: ids.bomId,
        bomRevId: ids.bomRevId,
        locationId
      });
      manufacturingEligibilityPreflightW446 = buildManufacturingEligibilityPreflightW446({
        assemblyId: ids.assemblyId,
        bomId: ids.bomId,
        bomRevId: ids.bomRevId,
        subsidiaryId,
        locationId,
        enableWip: effectiveEnableWip,
        assemblyBomTelemetry,
        workCenterSearchId
      });

      try {
        const workOrderResult = createWorkOrder({
          assemblyId: ids.assemblyId,
          subsidiaryId,
          locationId,
          quantity: 10,
          memo: `SCAI Demo Reset: ${extId} | ${prospect} | ${(names._productBuildPlanW432 && names._productBuildPlanW432.workOrderName) || 'WO seeded'}`,
          bomId: ids.bomId,
          bomRevId: ids.bomRevId
        });
        woId = Number((workOrderResult && workOrderResult.woId) || 0) || null;
        workOrderTelemetry = Object.assign({}, workOrderTelemetry, (workOrderResult && workOrderResult.saveTelemetry) || {});
        if (woId) {
          workOrderTelemetry.woId = Number(woId);
          workOrderTelemetry.workOrderId = Number(woId);
        }
        log.audit({ title: `Work Order seeded [${VERSION}]`, details: JSON.stringify({ woId, extId }) });
      } catch (e) {
        log.audit({
          title: `Work Order seed best-effort warning [${VERSION}]`,
          details: JSON.stringify({
            extId,
            assemblyId: Number(ids.assemblyId || 0),
            bomId: Number(ids.bomId || 0),
            bomRevId: Number(ids.bomRevId || 0),
            subsidiaryId: Number(subsidiaryId || 0),
            locationId: Number(locationId || 0),
            nonFatal: true,
            coreBuildContinues: true,
            errorName: e && e.name ? String(e.name) : '',
            errorMessage: e && e.message ? String(e.message) : String(e || '')
          })
        });
        workOrderTelemetry = Object.assign({}, workOrderTelemetry, (e && e.workOrderDiagnostics) || {}, {
          status: 'best_effort_failed',
          nonFatal: true,
          coreBuildContinues: true,
          errorMessage: e && e.message ? String(e.message) : String(e || '')
        });
        woId = null;
      }
      if (imageEnrichment && imageEnrichment.assetFolderId) {
        safeTry(() => saveTextArtifact({
          folderId: imageEnrichment.assetFolderId,
          name: 'work_order_diagnostics.json',
          contents: JSON.stringify(Object.assign({
            version: VERSION,
            releaseTrain: RELEASE_TRAIN,
            releaseTranche: RELEASE_TRANCHE,
            extId: extId,
            workOrderId: Number(woId || 0) || null
          }, workOrderTelemetry || {}), null, 2)
        }));
      }
    } else {
      log.audit({ title: `Manufacturing flow disabled [${VERSION}]`, details: JSON.stringify({ enableManufacturing: finalEnableManufacturing, extId, heroItemId: ids.heroItemId }) });
    }

    // 8) Optional WIP routing create + attach
    let routingResult = null;
    let routingId = null;
    if (effectiveEnableWip && finalEnableManufacturing && ids.assemblyId && ids.bomId) {
      routingResult = createAndAttachRoutingIfPossible({
        subsidiaryId,
        locationId,
        bomId: ids.bomId,
        assemblyId: ids.assemblyId,
        extId,
        prospect,
        signalText: signal.text,
        workCenterSearchId,
        names,
        imageEnrichment
      });
      routingId = routingResult && routingResult.routingId ? Number(routingResult.routingId) : null;
      if (names && names._productBuildPlanW432 && routingResult && routingResult.w449) {
        names._productBuildPlanW432.w449RoutingTelemetry = compactRoutingTelemetryForCaptureW450(routingResult.w449);
      }
    } else {
      log.audit({ title: `WIP not enabled (skipping routing) [${VERSION}]`, details: JSON.stringify({ enableWipRaw, enableWip, effectiveEnableWip, enableManufacturing: finalEnableManufacturing, requestedWipTargetMode, wipTargetMode, wipHandshakeAction }) });
    }

    const manufacturingSignoffSummary = buildManufacturingSignoffSummary({
      extId,
      prospect,
      enableManufacturing: finalEnableManufacturing,
      enableWip: effectiveEnableWip,
      ids,
      woId,
      assemblyBomTelemetry,
      manufacturingEligibilityPreflightW446,
      workOrderTelemetry,
      routingResult,
      imageEnrichment,
      flowState: authoritativeTruth.flowState || canonicalStorySeed.flowState
    });

    log.audit({
      title: `Manufacturing signoff summary [${VERSION}]`,
      details: JSON.stringify(manufacturingSignoffSummary)
    });

    if (imageEnrichment && imageEnrichment.assetFolderId) {
      safeTry(() => saveTextArtifact({
        folderId: imageEnrichment.assetFolderId,
        name: 'manufacturing_signoff_summary.json',
        contents: JSON.stringify(manufacturingSignoffSummary, null, 2)
      }));
    }

    // 9) Seed SOs via the proven CSV/import path. IDB result capture is a
    // sidecar and must not create the demo transaction directly.
    let soFileId = null;
    let soTaskId = null;
    const soCsv = buildSoCsv({ extId, prospect, website, notes, agenda, locationId, itemKey: ids.heroItemCsvKey || ids.heroItemExternalId || ANCHORS.heroItem });
    soFileId = saveCsvToFileCabinet({ folderId: soFolderId, filename: `scai_so_${extId}.csv`, contents: soCsv });
    soTaskId = submitCsvImport({ mappingId: soMappingId, fileId: soFileId });

    log.audit({
      title: resultCaptureFolderId
        ? `SO CSV Import SUBMITTED for IDB transaction resolution [${VERSION}]`
        : `SO CSV Import SUBMITTED [${VERSION}]`,
      details: JSON.stringify({ extId, fileId: soFileId, csvImportTaskId: soTaskId, resultCaptureFolderId: resultCaptureFolderId || null })
    });

    let idbRunnerResultCapture = null;
    if (resultCaptureFolderId) {
      idbRunnerResultCapture = writeIdbSidecarResultCaptureV1({
        folderId: resultCaptureFolderId,
        extId,
        prospect,
        website,
        notes,
        agenda,
        subsidiaryId,
        locationId,
        names,
        ids,
        runUniqueSuffix,
        enableManufacturing: finalEnableManufacturing,
        enableWip: effectiveEnableWip,
        woId,
        assemblyBomTelemetry,
        workOrderTelemetry,
        manufacturingEligibilityPreflightW446,
        routingId,
        routingResult,
        confirmedBuildRequestJson,
        flowState: authoritativeTruth.flowState || canonicalStorySeed.flowState,
        csvImport: {
          status: 'submitted',
          fileId: soFileId,
          taskId: soTaskId,
          mappingId: soMappingId,
          folderId: soFolderId
        }
      });
      log.audit({
        title: `IDB sidecar result capture pending transaction resolution [${VERSION}]`,
        details: JSON.stringify(idbRunnerResultCapture)
      });
      log.audit({
        title: `IDB W341 prospect proof naming marker [${VERSION}]`,
        details: JSON.stringify(idbRunnerResultCapture.runnerLaneVocabularyPolicy && idbRunnerResultCapture.runnerLaneVocabularyPolicy.prospectSpecificProofNamingMarker || {
          schema: 'idb.runner-prospect-specific-proof-naming-marker.w341.v1',
          marker: 'W341 prospect-specific proof naming marker missing',
          active: false
        })
      });
    }

    const flowState = authoritativeTruth.flowState || canonicalStorySeed.flowState;

    log.audit({
      title: `Runner SUMMARY [${VERSION}]`,
      details: JSON.stringify({
        extId,
        enableWip: effectiveEnableWip,
        createNewHeroItem: effectiveCreateNewHeroItem,
        enableManufacturing: finalEnableManufacturing,
        flowLabel: flowState.label,
        canonicalFlowLabel: flowState.label,
        canonicalFlowKey: flowState.key,
        flowMode: flowState.mode,
        flowDetailLabel: flowState.detailLabel,
        heroItemId: ids.heroItemId,
        heroItemCsvKey: ids.heroItemCsvKey || '',
        requestedWipTargetMode,
        wipTargetMode,
        wipHandshakeAction,
        routingDecision: routingResult ? routingResult.decision : (enableWip ? 'requested-no-result' : 'wip-disabled'),
        routingId,
        existingRoutingId: routingResult ? routingResult.existingRoutingId : null,
        attachResult: routingResult ? routingResult.attachResult : (enableWip ? 'not-returned' : 'not-attempted'),
        chosenCenters: routingResult && routingResult.chosen ? routingResult.chosen.centers : [],
        chosenTemplates: routingResult && routingResult.chosen ? routingResult.chosen.templates : [],
        manufacturingSignoff: manufacturingSignoffSummary,
        namingFileId: namingFileId || null,
        namingSourceUsed: namingPayload.source || names._source || 'deterministic',
        namingPayloadFound: !!namingPayload.found,
        websiteSignalDiagnostics: websiteSignalResult.diagnostics || null,
        websiteSignalSource: websiteSignalResult.signalSource || 'deterministic',
        imageEnrichment,
        winningPackId: authoritativeTruth.winningPackId,
        winningPackFamily: authoritativeTruth.winningPackFamily,
        rawWinningPackFamily: authoritativeTruth.rawWinningPackFamily,
        authoritativeFamilyKey: authoritativeTruth.authoritativeFamilyKey,
        authoritativePackFamily: authoritativeTruth.authoritativePackFamily,
        rawScorerWinnerFamily: authoritativeTruth.rawScorerWinnerFamily,
        runnerUpFamily: authoritativeTruth.runnerUpFamily,
        exclusionReason: authoritativeTruth.exclusionReason,
        finalLockedFamilySource: authoritativeTruth.finalLockedFamilySource,
        packConfidence: authoritativeTruth.packConfidence,
        packValidationPassed: authoritativeTruth.packValidationPassed,
        packValidationFailures: authoritativeTruth.packValidationFailures,
        normalizedScenarioLabel: authoritativeTruth.normalizedScenarioLabel,
        normalizedIndustryCategory: authoritativeTruth.normalizedIndustryCategory,
        candidatePromotionUsed: authoritativeTruth.candidatePromotionUsed,
        candidatePromotionReason: authoritativeTruth.candidatePromotionReason,
        normalizationActions: names._normalizationActions || [],
        finalScenarioSource: authoritativeTruth.finalScenarioSource,
        uiSourceFlowLabel: names._uiSourceFlowLabel || '',
        uiSourcePrimaryFocus: names._uiSourcePrimaryFocus || '',
        uiSourceRecommendedStoryline: names._uiSourceRecommendedStoryline || '',
        uiSourcePresenterStrip: names._uiSourcePresenterStrip || '',
        uiSourceQuestions: names._uiSourceQuestions || '',
        uiSourceTopDemoSpikes: names._uiSourceTopDemoSpikes || '',
        runnerUpPackId: names._runnerUpPackId || '',
        runnerUpPackFamily: authoritativeTruth.runnerUpFamily,
        runnerUpScore: names._runnerUpScore || 0,
        scoreGap: names._scoreGap || 0,
        winnerReasonSummary: names._winnerReasonSummary || '',
        runnerUpReasonSummary: names._runnerUpReasonSummary || '',
        domainPriorMatched: !!names._domainPriorMatched,
        domainPriorReason: names._domainPriorReason || '',
        domainPriorWeight: names._domainPriorWeight || 0,
        requiredEvidencePassed: names._requiredEvidencePassed !== false,
        requiredEvidenceHits: names._requiredEvidenceHits || 0,
        requiredEvidenceMin: names._requiredEvidenceMin || 0,
        contradictionPenaltyTriggered: !!names._contradictionPenaltyTriggered,
        contradictionPenaltyReason: names._contradictionPenaltyReason || '',
        contradictionPenaltyWeight: names._contradictionPenaltyWeight || 0,
        familyDefaultUsed: !!names._familyDefaultUsed,
        familyDefaultReason: names._familyDefaultReason || '',
        finalPackValidationPassed: authoritativeTruth.packValidationPassed
      })
    });

    log.audit({
      title: `Runner final branch summary [${VERSION}]`,
      details: JSON.stringify({
        extId,
        effectiveHeroMode: effectiveCreateNewHeroItem ? 'fresh' : 'anchor',
        resolvedHeroItemId: Number(ids.heroItemId || 0),
        heroItemExternalId: ids.heroItemExternalId || '',
        finalEnableManufacturing,
        manufacturingTargetMode,
        effectiveEnableWip,
        flowLabel: flowState.label,
        canonicalFlowKey: flowState.key,
        flowMode: flowState.mode,
        wipTargetMode,
        routingId: routingId || null,
        winningPackId: authoritativeTruth.winningPackId,
        winningPackFamily: authoritativeTruth.winningPackFamily,
        rawWinningPackFamily: authoritativeTruth.rawWinningPackFamily,
        authoritativeFamilyKey: authoritativeTruth.authoritativeFamilyKey,
        authoritativePackFamily: authoritativeTruth.authoritativePackFamily,
        rawScorerWinnerFamily: authoritativeTruth.rawScorerWinnerFamily,
        runnerUpFamily: authoritativeTruth.runnerUpFamily,
        exclusionReason: authoritativeTruth.exclusionReason,
        finalLockedFamilySource: authoritativeTruth.finalLockedFamilySource,
        normalizedScenarioLabel: authoritativeTruth.normalizedScenarioLabel,
        candidatePromotionUsed: authoritativeTruth.candidatePromotionUsed,
        finalStatus: 'completed'
      })
    });

    log.audit({
      title: `Runner COMPLETE [${VERSION}]`,
      details: JSON.stringify({
        extId,
        soFileId,
        soTaskId,
        idbRunnerResultCapture,
        woId,
        routingId,
        routingResult,
        mfg: ids,
        authoritativeTruth,
        truthExport,
        names,
        imageEnrichment
      })
    });
  }

  // ----------------------------
  // WIP Routing (create + attach)
  // ----------------------------
  function normalizeRoutingTermW443(value) {
    return str(value)
      .replace(/í/g, 'i')
      .replace(/Í/g, 'I')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      .toLowerCase();
  }

  function routingProductTermsW443(productBuildPlan) {
    const source = [
      productBuildPlan && productBuildPlan.productName,
      productBuildPlan && productBuildPlan.productFamily,
      productBuildPlan && productBuildPlan.routingName,
      productBuildPlan && productBuildPlan.industryNativeManufacturedItemName
    ].join(' ');
    const words = normalizeRoutingTermW443(source).split(/[^a-z0-9]+/).filter(function (word) {
      return word && word.length > 3 && ['routing', 'siete', 'kettle', 'brand', 'foods', 'chips', 'case', 'pack', 'production', 'batch'].indexOf(word) < 0;
    });
    const seen = {};
    return words.filter(function (word) {
      if (seen[word]) return false;
      seen[word] = true;
      return true;
    }).slice(0, 8);
  }

  function validateRoutingForProductPlanW443(routingCandidate, productBuildPlan, context) {
    const candidate = routingCandidate || {};
    const expectedRoutingName = str(productBuildPlan && productBuildPlan.routingName) || str(context && context.expectedRoutingName) || '';
    const actualRoutingName = str(candidate.name || candidate.routingName || candidate.actualRoutingName || '');
    const actualRoutingId = Number(candidate.id || candidate.routingId || candidate.actualRoutingId || 0) || null;
    const actualText = normalizeRoutingTermW443([actualRoutingName, candidate.memo || ''].join(' '));
    const productTerms = routingProductTermsW443(productBuildPlan);
    const productTermsMatched = productTerms.filter(function (term) { return actualText.indexOf(term) >= 0; });
    const productTermsMissing = productTerms.filter(function (term) { return actualText.indexOf(term) < 0; });
    const staleCookieProductionLine = /\bcookie\s+production\s+line\b/i.test(actualRoutingName);
    const staleName = staleCookieProductionLine || /\b(cookie|parfait|fudge|baking|dough)\b/i.test(actualRoutingName);
    const valid = !!actualRoutingName && !staleName && (!productTerms.length || productTermsMatched.length >= Math.min(2, productTerms.length));
    return {
      schema: 'idb.w443-routing-product-validation.v1',
      valid,
      reason: valid ? 'routing_matches_product_plan' : (staleCookieProductionLine ? 'stale_cookie_production_line_rejected' : (staleName ? 'stale_routing_name_from_prior_product' : 'routing_name_missing_current_product_terms')),
      expectedRoutingName,
      actualRoutingName,
      actualRoutingId,
      stale: !valid,
      staleCookieProductionLine,
      productTermsMatched,
      productTermsMissing
    };
  }

  function buildRoutingDiagnosticRecordW443({ resultNames, productPlan, routingResult, ids }) {
    const diagnostic = routingResult && (routingResult.routingFailure || routingResult.diagnostics || routingResult.routingValidation) || {};
    const expectedRoutingName = str(diagnostic.expectedRoutingName) || str(productPlan && productPlan.routingName) || str(resultNames && resultNames.routing_name) || 'Routing';
    return {
      role: 'routingDiagnostic',
      label: 'Routing Diagnostic',
      type: 'manufacturingrouting_diagnostic',
      recordType: 'manufacturingrouting_diagnostic',
      name: `Routing Diagnostic - ${expectedRoutingName}`,
      internalId: '',
      id: '',
      url: '',
      requestedWip: true,
      effectiveWip: true,
      expectedRoutingName,
      staleRoutingName: diagnostic.actualRoutingName || diagnostic.staleRoutingName || '',
      staleRoutingId: diagnostic.actualRoutingId || diagnostic.staleRoutingId || null,
      failureType: diagnostic.failureType || '',
      nextFixHint: diagnostic.nextFixHint || diagnostic.recommendedOperatorNextStep || '',
      assemblyId: Number(ids && ids.assemblyId || diagnostic.assemblyId || 0) || null,
      bomId: Number(ids && ids.bomId || diagnostic.bomId || 0) || null,
      bomRevisionId: Number(ids && ids.bomRevId || diagnostic.bomRevisionId || 0) || null,
      attemptedOperationNames: productPlan && productPlan.operationNames || [],
      reason: diagnostic.reason || diagnostic.failureStage || 'routing_not_created_or_not_product_specific',
      errorName: diagnostic.errorName || '',
      errorMessage: diagnostic.errorMessage || '',
      operationRows: routingResult && routingResult.operationRows || diagnostic.operationRows || [],
      w449: routingResult && routingResult.w449 ? routingResult.w449 : (diagnostic && diagnostic.w449 ? diagnostic.w449 : null)
    };
  }

  function authoritativeWipWorkCenterSearchIdW449(searchId) {
    const raw = str(searchId).trim();
    return {
      schema: 'idb.w449-authoritative-wip-work-center-search.v1',
      requested: raw || null,
      authoritativeScriptId: W449_WORK_CENTER_SEARCH.scriptId,
      authoritativeNumericId: W449_WORK_CENTER_SEARCH.id,
      chosenSearchId: W449_WORK_CENTER_SEARCH.scriptId,
      numericFallbackId: W449_WORK_CENTER_SEARCH.id,
      overrideApplied: raw && raw !== W449_WORK_CENTER_SEARCH.scriptId && raw !== String(W449_WORK_CENTER_SEARCH.id)
    };
  }

  function workCenterRankProfileW449(operationName, seq, productPlan) {
    const hay = normalizeRoutingTermW443([
      operationName,
      seq,
      productPlan && productPlan.productName,
      productPlan && productPlan.productFamily,
      productPlan && productPlan.brandName,
      productPlan && productPlan.industryNativeManufacturedItemName
    ].join(' '));
    if (Number(seq) === 10 && /receiv|dock|stage|staging|material|input|prep/.test(hay)) {
      return {
        key: 'production',
        retryProductionForReceive: true,
        keywords: ['production', 'line', 'assembly', 'mix', 'mixer', 'blend', 'blending', 'fill', 'filling', 'pack', 'packing', 'qc', 'quality', 'receiv', 'dock']
      };
    }
    if (/mix|blend|season|tumble|masa|marinade|sauce|dry/.test(hay)) {
      return { key: 'mixing', keywords: ['mix', 'mixer', 'mixing', 'blend', 'blending', 'season', 'tumble', 'prep', 'assembly', 'production'] };
    }
    if (/fill|bag|wrap|carton|dispense/.test(hay)) {
      return { key: 'fill', keywords: ['fill', 'filling', 'dispense', 'bag', 'bagging', 'wrap', 'wrapper', 'carton', 'assembly', 'production'] };
    }
    if (/cook|fry|kettle|roast|bake|dehydrat|sheet|cut|production|line|air finish/.test(hay)) {
      return { key: 'production', keywords: ['production', 'line', 'assembly', 'cook', 'cooking', 'fry', 'frying', 'roast', 'oven', 'kettle', 'process'] };
    }
    if (/qc|quality|inspect|moisture|weight|check/.test(hay)) {
      return { key: 'qc', keywords: ['qc', 'quality', 'inspect', 'inspection', 'test', 'check', 'lab', 'production'] };
    }
    if (/pack|case|pallet/.test(hay)) {
      return { key: 'packing', keywords: ['pack', 'packing', 'package', 'packaging', 'case', 'casepack', 'pallet', 'assembly', 'production'] };
    }
    if (/receiv|stage|material|input|prep|slice|rinse|masa|protein|pasta|dock/.test(hay)) {
      return { key: 'production', retryProductionForReceive: true, keywords: ['production', 'line', 'assembly', 'mix', 'blend', 'fill', 'pack', 'qc', 'receiv', 'dock'] };
    }
    return { key: 'production', keywords: ['production', 'line', 'mix', 'pack', 'fill', 'qc'] };
  }

  function rankWorkCentersForOperationW449(centers, profile, context) {
    const keys = (profile && profile.keywords || []).map(function (k) { return String(k || '').toLowerCase(); }).filter(Boolean);
    const preferredIds = W449_WORK_CENTER_FAMILIES[profile && profile.key || 'production'] || [];
    const preferredLayer = {
      receiving: ['receiving', 'raw', 'staging', 'stage', 'prep'],
      mixing: ['mix', 'mixer', 'blend', 'kettle prep', 'season'],
      production: ['production', 'line', 'cook', 'fry', 'roast', 'kettle'],
      fill: ['fill', 'bag', 'wrap', 'carton', 'dispense'],
      qc: ['qc', 'quality', 'inspect', 'lab', 'check'],
      packing: ['pack', 'case', 'package', 'pallet']
    }[profile && profile.key || 'production'] || [];
    const loc = context && context.locationId ? String(context.locationId) : '';
    const subs = context && context.subsidiaryId ? String(context.subsidiaryId) : '';
    return (centers || []).map(function (center, index) {
      const name = String(center && center.name || '').toLowerCase();
      const centerId = Number(center && center.id || 0);
      const preferredIdIndex = preferredIds.indexOf(centerId);
      let score = Number(center && center.score || 0);
      if (preferredIdIndex >= 0) score += 250 - (preferredIdIndex * 25);
      preferredLayer.forEach(function (k) { if (name.indexOf(k) !== -1) score += 80; });
      keys.forEach(function (k) { if (name.indexOf(k) !== -1) score += 35; });
      ['production', 'line', 'assembly', 'mix', 'mixer', 'blend', 'blending', 'fill', 'filling', 'pack', 'packing', 'qc', 'quality'].forEach(function (k) {
        if (name.indexOf(k) !== -1) score += 18;
      });
      if (/receiv|dock|warehouse|staging|stage/.test(name)) score -= 140;
      if (loc && String(center.locationId || '') === loc) score += 25;
      if (subs && String(center.subsidiaryId || '') === subs) score += 12;
      if (/cookie\s+production\s+line/i.test(center && center.name || '')) score -= 10000;
      return Object.assign({}, center, {
        score,
        w449Rank: index + 1,
        w449Profile: profile && profile.key || 'production',
        w449PreferredIdRank: preferredIdIndex >= 0 ? preferredIdIndex + 1 : null,
        w449AuthoritativeSearch: W449_WORK_CENTER_SEARCH
      });
    }).sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return Number(a.id || 0) - Number(b.id || 0);
    });
  }

  function rankCostTemplatesForOperationW449(templates, profile) {
    const keys = (profile && profile.keywords || []).map(function (k) { return String(k || '').toLowerCase(); }).filter(Boolean);
    return (templates || []).map(function (template, index) {
      const name = String(template && template.name || '').toLowerCase();
      let score = Number(template && template.score || 0);
      keys.forEach(function (k) { if (name.indexOf(k) !== -1) score += 30; });
      if (profile && profile.key && name.indexOf(profile.key) !== -1) score += 60;
      if (template && template.isDefault) score += 85;
      if (template && template.subsidiaryMatch) score += 70;
      if (/standard|default|wip|routing|manufacturing/.test(name)) score += 20;
      return Object.assign({}, template, {
        score,
        w449Rank: index + 1,
        w449Profile: profile && profile.key || 'production'
      });
    }).sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return Number(a.id || 0) - Number(b.id || 0);
    });
  }

  function buildRoutingOperationPlanW449(opNames, centers, templates, productPlan, context) {
    const specs = [
      { seq: 10, opName: opNames.op10 || 'Review Product Inputs', required: true },
      { seq: 20, opName: opNames.op20 || 'Run Product Assembly', required: true },
      { seq: 30, opName: opNames.op30 || 'Inspect', required: true },
      { seq: 40, opName: opNames.op40 || '', required: false },
      { seq: 50, opName: opNames.op50 || '', required: false }
    ].filter(function (spec) { return spec.required || !!spec.opName; });
    return specs.map(function (spec) {
      const profile = workCenterRankProfileW449(spec.opName, spec.seq, productPlan);
      const rankedCenters = rankWorkCentersForOperationW449(centers, profile, context);
      const rankedTemplates = rankCostTemplatesForOperationW449(templates, profile);
      const pairs = [];
      const maxCenters = rankedCenters.length;
      const maxTemplates = rankedTemplates.length;
      for (let c = 0; c < maxCenters; c += 1) {
        for (let t = 0; t < maxTemplates; t += 1) {
          pairs.push({
            center: rankedCenters[c],
            template: rankedTemplates[t],
            score: Number(rankedCenters[c].score || 0) + Number(rankedTemplates[t].score || 0) - (c * 3) - t
          });
        }
      }
      pairs.sort(function (a, b) { return b.score - a.score; });
      return Object.assign({}, spec, {
        profile: profile.key,
        keywords: profile.keywords,
        retryProductionForReceive: !!profile.retryProductionForReceive,
        rankedCenters: rankedCenters,
        rankedTemplates: rankedTemplates,
        candidatePairs: pairs
      });
    });
  }

  function verifyRoutingAttachedOnAssemblyW449({ assemblyId, routingId, expectedRoutingName, productPlan, extId, staleRoutingSupersededTargetId }) {
    const verification = {
      schema: 'idb.w449-routing-assembly-verification.v1',
      assemblyId: Number(assemblyId || 0) || null,
      routingId: Number(routingId || 0) || null,
      staleRoutingSupersededTargetId: Number(staleRoutingSupersededTargetId || 0) || null,
      found: false,
      defaulted: false,
      staleStillDefaulted: false,
      staleSuperseded: false,
      valid: false,
      staleCookieProductionLineDetected: false,
      snapshot: null,
      errorName: '',
      errorMessage: ''
    };
    try {
      const snapshot = inspectAssemblyRoutingSublistsW448({ assemblyId, extId });
      verification.snapshot = snapshot;
      verification.found = !!(snapshot && (
        Number(snapshot.chosenRoutingId || 0) === Number(routingId) ||
        Number(snapshot.managedRoutingId || 0) === Number(routingId) ||
        Number(snapshot.defaultRoutingId || 0) === Number(routingId) ||
        Number(snapshot.firstRoutingId || 0) === Number(routingId)
      ));
      verification.defaulted = !!(snapshot && Number(snapshot.defaultRoutingId || 0) === Number(routingId));
      const actualRoutingName = routingId ? readRecordDisplayName('manufacturingrouting', routingId, expectedRoutingName || '') : '';
      const validation = validateRoutingForProductPlanW443({ id: routingId, name: actualRoutingName }, productPlan, { expectedRoutingName });
      verification.routingValidation = validation;
      verification.staleCookieProductionLineDetected = !!(validation && validation.staleCookieProductionLine) || !!(snapshot && (snapshot.staleRouteSignals || []).some(function (signal) {
        return /cookie\s+production\s+line/i.test(String(signal && signal.matchedText || ''));
      }));
      verification.staleStillDefaulted = !!(verification.staleRoutingSupersededTargetId && snapshot && Number(snapshot.defaultRoutingId || 0) === Number(verification.staleRoutingSupersededTargetId));
      verification.staleSuperseded = !!(verification.staleRoutingSupersededTargetId && verification.found && !verification.staleStillDefaulted);
      verification.valid = verification.found && !verification.staleStillDefaulted && (!validation || validation.valid !== false);
      return verification;
    } catch (e) {
      verification.errorName = e && e.name ? String(e.name) : '';
      verification.errorMessage = e && e.message ? String(e.message) : String(e || '');
      return verification;
    }
  }

  function createAndAttachRoutingIfPossible({ subsidiaryId, locationId, bomId, assemblyId, extId, prospect, signalText, workCenterSearchId, names }) {
    const subs = Number(subsidiaryId);
    const loc = locationId ? Number(locationId) : null;
    const authoritativeSearchW449 = authoritativeWipWorkCenterSearchIdW449(workCenterSearchId);
    const w449Telemetry = {
      schema: 'idb.w450-routing-work-center-cost-template-pair-probing.v1',
      authoritativeWorkCenterSearch: authoritativeSearchW449,
      candidatePoolAuthority: 'saved_search_only',
      candidatePoolSearchId: authoritativeSearchW449.chosenSearchId,
      numericFallbackSearchId: authoritativeSearchW449.numericFallbackId,
      centerRanking: [],
      operationPlans: [],
      pairProbes: [],
      acceptedPairs: [],
      rejectedPairs: [],
      failedOperations: [],
      acceptedOperationLinesW450: [],
      rejectedOperationLinesW450: [],
      minimumAcceptedOperationLinesW450: 3,
      staleCookieProductionLineDetected: false,
      staleCookieProductionLineRejected: false,
      staleCookieProductionLineSuperseded: false,
      routingAssemblyVerification: null
    };

    // Step 1: Find candidates
    const centers = findWorkCentersFromSavedSearch({
      searchId: authoritativeSearchW449.chosenSearchId,
      fallbackSearchId: authoritativeSearchW449.numericFallbackId,
      locationId: loc,
      subsidiaryId: subs,
      authoritativeOnly: true
    });
    const templates = findCostTemplatesForSubsidiary(subs);       // returns [{id,score,name}, ...]
    w449Telemetry.savedSearch5005Rows = centers.slice(0, 100);
    w449Telemetry.workCenterRows = centers.slice(0, 100);
    w449Telemetry.costTemplateRows = templates.slice(0, 100);

    log.audit({
      title: `WIP routing candidates W449 [${VERSION}]`,
      details: JSON.stringify({
        subsidiaryId: subs,
        locationId: loc,
        authoritativeSearchW449,
        centers: centers.length,
        templates: templates.length
      })
    });

    if (centers.length < 1) {
      log.error({
        title: `WIP routing skipped (no work centers found) [${VERSION}]`,
        details: JSON.stringify({ subsidiaryId: subs, authoritativeSearchW449 })
      });
      return {
        status: 'failed_best_effort',
        decision: 'failed_best_effort',
        routingId: null,
        existingRoutingId: null,
        attachResult: 'not-attached-routing-failed',
        chosen: null,
        w449: w449Telemetry,
        w450: w449Telemetry,
        routingFailure: {
          schema: 'idb.w449-routing-failure.v1',
          failureStage: 'resolve_work_centers',
          reason: 'authoritative_wip_work_center_search_returned_no_candidates',
          failureType: 'work_center',
          nextFixHint: 'Update customsearch_scai_ss_wc_wip so it returns active manufacturing work centers for this subsidiary/location, with production, mixing, blending, assembly, filling, packing, or QC centers ahead of receiving/dock rows.',
          recommendedOperatorNextStep: 'Fix the authoritative WIP work center saved search candidates, then re-run. Core customer/item/BOM records remain valid.',
          authoritativeSearchW449,
          w449: w449Telemetry,
          w450: w449Telemetry
        },
        diagnostics: {
          schema: 'idb.w449-routing-failure.v1',
          failureStage: 'resolve_work_centers',
          reason: 'authoritative_wip_work_center_search_returned_no_candidates',
          failureType: 'work_center',
          nextFixHint: 'Update customsearch_scai_ss_wc_wip so it returns active manufacturing work centers for this subsidiary/location, with production, mixing, blending, assembly, filling, packing, or QC centers ahead of receiving/dock rows.',
          recommendedOperatorNextStep: 'Fix the authoritative WIP work center saved search candidates, then re-run. Core customer/item/BOM records remain valid.',
          authoritativeSearchW449,
          w449: w449Telemetry,
          w450: w449Telemetry
        }
      };
    }
    if (templates.length < 1) {
      log.error({
        title: `WIP routing skipped (no cost templates found) [${VERSION}]`,
        details: JSON.stringify({ subsidiaryId: subs, authoritativeSearchW449 })
      });
      return {
        status: 'failed_best_effort',
        decision: 'failed_best_effort',
        routingId: null,
        existingRoutingId: null,
        attachResult: 'not-attached-routing-failed',
        chosen: null,
        w449: w449Telemetry,
        w450: w449Telemetry,
        routingFailure: {
          schema: 'idb.w449-routing-failure.v1',
          failureStage: 'resolve_cost_templates',
          reason: 'wip_cost_templates_missing',
          failureType: 'cost_template',
          nextFixHint: 'Create or expose at least one active manufacturing cost template for this subsidiary, preferably a default or name-matched WIP/manufacturing template.',
          recommendedOperatorNextStep: 'Fix manufacturing cost template availability for the subsidiary, then re-run. Core customer/item/BOM records remain valid.',
          authoritativeSearchW449,
          w449: w449Telemetry,
          w450: w449Telemetry
        },
        diagnostics: {
          schema: 'idb.w449-routing-failure.v1',
          failureStage: 'resolve_cost_templates',
          reason: 'wip_cost_templates_missing',
          failureType: 'cost_template',
          nextFixHint: 'Create or expose at least one active manufacturing cost template for this subsidiary, preferably a default or name-matched WIP/manufacturing template.',
          recommendedOperatorNextStep: 'Fix manufacturing cost template availability for the subsidiary, then re-run. Core customer/item/BOM records remain valid.',
          authoritativeSearchW449,
          w449: w449Telemetry,
          w450: w449Telemetry
        }
      };
    }

    // Step 2: Use scenario-aware routing names from the upstream naming pack; fallback to deterministic names
    const opNames = resolveRoutingNames({ prospect, signalText, names });
    log.audit({
      title: `Routing naming applied [${VERSION}]`,
      details: JSON.stringify({ routingNamingApplied: !!opNames, routingOperationNamesUsed: opNames })
    });

    const productPlanW443 = names && names._productBuildPlanW432 || null;
    const operationPlanW449 = buildRoutingOperationPlanW449(opNames, centers, templates, productPlanW443, {
      locationId: loc,
      subsidiaryId: subs
    });
    w449Telemetry.operationPlans = operationPlanW449.map(function (plan) {
      return {
        seq: plan.seq,
        opName: plan.opName,
        profile: plan.profile,
        keywords: plan.keywords,
        rankedCenters: plan.rankedCenters.slice(0, 6),
        rankedTemplates: plan.rankedTemplates.slice(0, 6),
        candidatePairCount: plan.candidatePairs.length,
        retryProductionForReceive: !!plan.retryProductionForReceive
      };
    });
    w449Telemetry.centerRanking = centers.slice(0, 12);
    w449Telemetry.costTemplateRanking = templates.slice(0, 12);
    const routingName = trimLen((names && names.routing_name) ? names.routing_name : ((productPlanW443 && productPlanW443.routingName) ? productPlanW443.routingName : `SCAI Routing - ${prospect} - BOM ${bomId}`), 80).slice(0, 60);
    const routingMemo = `SCAI Demo Reset: ${extId} | ${prospect} | WIP routing`;
    const assemblyRoutingDiscoveryW448 = inspectAssemblyRoutingSublistsW448({ assemblyId, extId });
    const discoveredAssemblyRoutingId = assemblyRoutingDiscoveryW448 && assemblyRoutingDiscoveryW448.chosenRoutingId ? Number(assemblyRoutingDiscoveryW448.chosenRoutingId) : null;
    const searchedRoutingId = discoveredAssemblyRoutingId ? null : findManagedRoutingIdByBom({ bomId, subsidiaryId: subs, extId, preferredName: routingName });
    const candidateExistingRoutingId = discoveredAssemblyRoutingId || searchedRoutingId || null;
    const existingRoutingName = candidateExistingRoutingId ? readRecordDisplayName('manufacturingrouting', candidateExistingRoutingId, '') : '';
    const existingRoutingValidation = candidateExistingRoutingId
      ? validateRoutingForProductPlanW443({ id: candidateExistingRoutingId, name: existingRoutingName }, productPlanW443, { expectedRoutingName: routingName })
      : null;
    w449Telemetry.staleCookieProductionLineDetected = !!(existingRoutingValidation && existingRoutingValidation.staleCookieProductionLine) || !!(assemblyRoutingDiscoveryW448 && (assemblyRoutingDiscoveryW448.staleRouteSignals || []).some(function (signal) {
      return /cookie\s+production\s+line/i.test(String(signal && signal.matchedText || ''));
    }));
    w449Telemetry.staleCookieProductionLineRejected = !!(existingRoutingValidation && existingRoutingValidation.staleCookieProductionLine);
    w449Telemetry.staleCookieProductionLineSuperseded = !!(existingRoutingValidation && existingRoutingValidation.staleCookieProductionLine);
    const staleRoutingDiscovery = existingRoutingValidation && existingRoutingValidation.valid === false
      ? {
        routingId: candidateExistingRoutingId,
        routingName: existingRoutingName,
        validation: existingRoutingValidation,
        decision: 'supersede_stale_route_with_new_product_specific_wip_default'
      }
      : null;
    const staleRoutingSupersededTargetId = staleRoutingDiscovery ? candidateExistingRoutingId : null;
    const existingRoutingId = staleRoutingDiscovery ? null : candidateExistingRoutingId || null;

    log.audit({
      title: `WIP managed routing decision [${VERSION}]`,
      details: JSON.stringify({
        assemblyId: Number(assemblyId),
        existingRoutingId,
        staleRoutingSupersededTargetId,
        discoveredAssemblyRoutingId,
        searchedRoutingId,
        existingRoutingValidation,
        staleRoutingDiscovery,
        assemblyRoutingDiscoveryW448,
        createNew: !existingRoutingId,
        supersedeStaleRouting: !!staleRoutingSupersededTargetId
      })
    });

    const chosen = {
      centers: [],
      templates: [],
      ops: opNames
    };

    // Step 4: Reuse only a validated routing; stale Cookie Production Line routes are superseded.
    // W393 keeps routing best-effort: a rejected BOM/routing field must not hard-fail safe core records.
    let routingStage = existingRoutingId ? 'load_existing_routing' : 'create_routing';
    let routing = null;
    let routingId = null;
    try {
      routing = existingRoutingId
        ? record.load({ type: 'manufacturingrouting', id: Number(existingRoutingId), isDynamic: true })
        : record.create({ type: 'manufacturingrouting', isDynamic: true });

      routingStage = 'set_subsidiary';
      routing.setValue({ fieldId: 'subsidiary', value: subs });

      routingStage = 'resolve_header_fields_before_bom';
      const routingHeaderFieldsBeforeBom = safeTryReturn(() => routing.getFields()) || [];
      const routingAssemblyField = trySetAnyBodyField(routing, routingHeaderFieldsBeforeBom, ['assemblyitem', 'item', 'manufacturingitem'], Number(assemblyId));
      if (routingAssemblyField) {
        log.audit({
          title: `Routing assembly field resolved before BOM [${VERSION}]`,
          details: JSON.stringify({ routingAssemblyField, assemblyId: Number(assemblyId || 0), bomId: Number(bomId || 0) })
        });
      }

      routingStage = 'set_billofmaterials';
      const routingBomSetResult = setRoutingBomBestEffortW448(routing, {
        bomId,
        assemblyId,
        routingName,
        staleRoutingSupersededTargetId,
        existingRoutingId
      });

      // "location" is multi-select; pass array if we have one
      if (loc) {
        routingStage = 'set_location';
        safeTry(() => routing.setValue({ fieldId: 'location', value: [loc] }));
      }

      routingStage = 'resolve_header_fields';
      const routingHeaderFields = safeTryReturn(() => routing.getFields()) || [];
      const routingDefaultField = firstExisting(routingHeaderFields, ['default', 'isdefault', 'masterdefault']);

      routingStage = 'set_name';
      routing.setValue({ fieldId: 'name', value: routingName });
      if (routingDefaultField) {
        routingStage = 'set_default';
        routing.setValue({ fieldId: routingDefaultField, value: true });
      }
      safeTry(() => routing.setValue({ fieldId: 'memo', value: routingMemo }));

      log.audit({
        title: `Routing header default field resolution [${VERSION}]`,
        details: JSON.stringify({ routingDefaultField, routingHeaderFields, routingBomSetResult })
      });

      const stepSublist = 'routingstep';
      routingStage = 'clear_routing_steps';
      clearRoutingSteps(routing, stepSublist);

      function resolveRoutingStepFieldIds(routingRec, sublistId) {
        const fields = safeTryReturn(() => routingRec.getSublistFields({ sublistId })) || [];

        const setupCandidates = ['setuptimemin', 'setuptime', 'setuptimeminutes'];
        const runRateCandidates = ['runrate', 'runratemin', 'runrateperunit'];

        const setupField = firstExisting(fields, setupCandidates);
        const runRateField = firstExisting(fields, runRateCandidates);

        log.audit({
          title: `Routing step field resolution [${VERSION}]`,
          details: JSON.stringify({ sublistId, setupField, runRateField, fields })
        });

        return { setupField, runRateField };
      }

      routingStage = 'resolve_routing_step_fields';
      const stepFieldIds = resolveRoutingStepFieldIds(routing, stepSublist);

      function addStepWithPairProbingW449(stepPlan) {
        if (!stepFieldIds.setupField) throw new Error('Could not resolve routing step setup-time field ID');
        if (!stepFieldIds.runRateField) throw new Error('Could not resolve routing step run-rate field ID');

        const pairs = stepPlan && Array.isArray(stepPlan.candidatePairs) ? stepPlan.candidatePairs : [];
        const rejections = [];
        function tryStepWithoutCostTemplateW450(baseProbe, center, rejectionError) {
          const probe = Object.assign({}, baseProbe || {}, {
            schema: 'idb.w450-routing-pair-probe.v1',
            pairIndex: `${baseProbe && baseProbe.pairIndex || 0}-no-template`,
            templateId: null,
            templateName: 'NetSuite default cost template',
            templateSubsidiaryId: '',
            templateSubsidiaryText: '',
            templateIsDefault: false,
            templateSource: 'omitted_after_template_rejection',
            fieldId: '',
            accepted: false,
            rejected: false,
            status: 'pending',
            priorTemplateId: baseProbe && baseProbe.templateId || null,
            priorTemplateName: baseProbe && baseProbe.templateName || '',
            priorTemplateErrorName: rejectionError && rejectionError.name ? String(rejectionError.name) : '',
            priorTemplateErrorMessage: rejectionError && rejectionError.message ? String(rejectionError.message).slice(0, 240) : ''
          });
          try {
            routingStage = 'probe_routing_step_pair_without_cost_template';
            routing.selectNewLine({ sublistId: stepSublist });
            function setProbeField(fieldId, value) {
              probe.fieldId = fieldId;
              routing.setCurrentSublistValue({ sublistId: stepSublist, fieldId, value });
            }
            setProbeField('operationsequence', String(stepPlan.seq));
            setProbeField('operationname', String(stepPlan.opName).slice(0, 60));
            setProbeField('manufacturingworkcenter', Number(center && center.id || 0));
            setProbeField(stepFieldIds.setupField, 0.5);
            setProbeField(stepFieldIds.runRateField, 1.0);
            probe.fieldId = 'commitLine';
            routingStage = 'commit_routing_step_without_cost_template';
            routing.commitLine({ sublistId: stepSublist });
            probe.status = 'accepted';
            probe.accepted = true;
            probe.rejected = false;
            probe.setupField = stepFieldIds.setupField;
            probe.runRateField = stepFieldIds.runRateField;
            w449Telemetry.pairProbes.push(probe);
            w449Telemetry.acceptedPairs.push(probe);
            log.audit({
              title: `Routing step accepted without explicit cost template W450 [${VERSION}]`,
              details: JSON.stringify(probe)
            });
            return probe;
          } catch (e) {
            safeTry(() => routing.cancelLine({ sublistId: stepSublist }));
            probe.status = 'rejected';
            probe.accepted = false;
            probe.rejected = true;
            probe.errorName = e && e.name ? String(e.name) : '';
            probe.errorMessage = e && e.message ? String(e.message) : String(e || '');
            probe.fieldId = probe.fieldId || 'commitLine';
            rejections.push(probe);
            w449Telemetry.pairProbes.push(probe);
            w449Telemetry.rejectedPairs.push(probe);
            log.audit({
              title: `Routing step no-template retry rejected W450 [${VERSION}]`,
              details: JSON.stringify(probe)
            });
            return null;
          }
        }
        for (let i = 0; i < pairs.length; i += 1) {
          const pair = pairs[i] || {};
          const center = pair.center || {};
          const template = pair.template || {};
          const probe = {
            schema: 'idb.w450-routing-pair-probe.v1',
            seq: stepPlan.seq,
            opName: String(stepPlan.opName || '').slice(0, 60),
            profile: stepPlan.profile,
            pairIndex: i,
            centerId: Number(center.id || 0) || null,
            centerName: center.name || '',
            centerLocationId: center.locationId || '',
            centerLocationText: center.locationText || '',
            centerSubsidiaryId: center.subsidiaryId || '',
            centerSubsidiaryText: center.subsidiaryText || '',
            templateId: Number(template.id || 0) || null,
            templateName: template.name || '',
            templateSubsidiaryId: template.subsidiaryId || '',
            templateSubsidiaryText: template.subsidiaryText || '',
            templateIsDefault: !!template.isDefault,
            pairScore: Number(pair.score || 0),
            fieldId: '',
            accepted: false,
            rejected: false,
            status: 'pending'
          };
          if (!probe.centerId || !probe.templateId) {
            probe.status = 'rejected';
            probe.rejected = true;
            probe.errorName = 'MISSING_PAIR_ID';
            probe.errorMessage = 'Work center or cost template id missing before routing step probe.';
            rejections.push(probe);
            w449Telemetry.pairProbes.push(probe);
            w449Telemetry.rejectedPairs.push(probe);
            continue;
          }
          try {
            routingStage = 'probe_routing_step_pair';
            routing.selectNewLine({ sublistId: stepSublist });
            function setProbeField(fieldId, value) {
              probe.fieldId = fieldId;
              routing.setCurrentSublistValue({ sublistId: stepSublist, fieldId, value });
            }
            setProbeField('operationsequence', String(stepPlan.seq));
            setProbeField('operationname', String(stepPlan.opName).slice(0, 60));
            setProbeField('manufacturingworkcenter', probe.centerId);
            setProbeField('manufacturingcosttemplate', probe.templateId);
            setProbeField(stepFieldIds.setupField, 0.5);
            setProbeField(stepFieldIds.runRateField, 1.0);
            probe.fieldId = 'commitLine';
            routingStage = 'commit_routing_step';
            routing.commitLine({ sublistId: stepSublist });
            probe.status = 'accepted';
            probe.accepted = true;
            probe.rejected = false;
            probe.setupField = stepFieldIds.setupField;
            probe.runRateField = stepFieldIds.runRateField;
            w449Telemetry.pairProbes.push(probe);
            w449Telemetry.acceptedPairs.push(probe);
            log.audit({
              title: `Routing step pair accepted W449 [${VERSION}]`,
              details: JSON.stringify(probe)
            });
            return probe;
          } catch (e) {
            safeTry(() => routing.cancelLine({ sublistId: stepSublist }));
            probe.status = 'rejected';
            probe.accepted = false;
            probe.rejected = true;
            probe.errorName = e && e.name ? String(e.name) : '';
            probe.errorMessage = e && e.message ? String(e.message) : String(e || '');
            rejections.push(probe);
            w449Telemetry.pairProbes.push(probe);
            w449Telemetry.rejectedPairs.push(probe);
            log.audit({
              title: `Routing step pair rejected W449 [${VERSION}]`,
              details: JSON.stringify(probe)
            });
            if (probe.fieldId === 'manufacturingcosttemplate' || /manufacturingcosttemplate|cost\s*template|template/i.test(probe.errorMessage || '')) {
              const acceptedWithoutTemplate = tryStepWithoutCostTemplateW450(probe, center, e);
              if (acceptedWithoutTemplate) return acceptedWithoutTemplate;
            }
          }
        }
        const err = new Error(`No valid work center + cost template pair for routing operation ${stepPlan && stepPlan.seq}`);
        err.name = 'W449_NO_VALID_ROUTING_STEP_PAIR';
        err.w449RejectedPairs = rejections;
        err.routingPairFailureType = classifyRoutingProbeFailureW450(rejections);
        throw err;
      }

      operationPlanW449.forEach(function (stepPlan) {
        try {
          const accepted = addStepWithPairProbingW449(stepPlan);
          if (accepted) {
            if (accepted.centerId) chosen.centers.push({ id: accepted.centerId, name: accepted.centerName, w449Profile: stepPlan.profile });
            if (accepted.templateId) chosen.templates.push({ id: accepted.templateId, name: accepted.templateName, w449Profile: stepPlan.profile });
            chosen.operationRows = chosen.operationRows || [];
            const acceptedRow = {
              seq: accepted.seq,
              opName: accepted.opName,
              centerId: accepted.centerId,
              centerName: accepted.centerName,
              centerLocationId: accepted.centerLocationId,
              centerSubsidiaryId: accepted.centerSubsidiaryId,
              templateId: accepted.templateId,
              templateName: accepted.templateName,
              templateSubsidiaryId: accepted.templateSubsidiaryId
            };
            chosen.operationRows.push(acceptedRow);
            w449Telemetry.acceptedOperationLinesW450.push(acceptedRow);
          }
        } catch (stepError) {
          const rejectedLine = {
            schema: 'idb.w450-routing-operation-rejection.v1',
            seq: stepPlan && stepPlan.seq || null,
            opName: stepPlan && stepPlan.opName || '',
            profile: stepPlan && stepPlan.profile || '',
            errorName: stepError && stepError.name ? String(stepError.name) : '',
            errorMessage: stepError && stepError.message ? String(stepError.message) : String(stepError || ''),
            failureType: stepError && stepError.routingPairFailureType || classifyRoutingProbeFailureW450(stepError && stepError.w449RejectedPairs || []),
            rejectedPairs: (stepError && stepError.w449RejectedPairs || []).slice(0, 50)
          };
          w449Telemetry.failedOperations.push(rejectedLine);
          w449Telemetry.rejectedOperationLinesW450.push(rejectedLine);
          log.audit({
            title: `Routing operation rejected but W450 continues [${VERSION}]`,
            details: JSON.stringify(rejectedLine)
          });
        }
      });

      if (!chosen.operationRows || chosen.operationRows.length < 3) {
        const insufficient = new Error(`Only ${chosen.operationRows && chosen.operationRows.length || 0} routing operation lines accepted; at least 3 are required to save a useful WIP routing.`);
        insufficient.name = 'W450_INSUFFICIENT_ACCEPTED_ROUTING_STEPS';
        insufficient.routingPairFailureType = classifyRoutingProbeFailureW450(w449Telemetry.rejectedPairs);
        insufficient.w450AcceptedOperationLines = chosen.operationRows || [];
        insufficient.w450RejectedOperationLines = w449Telemetry.rejectedOperationLinesW450 || [];
        insufficient.w449RejectedPairs = w449Telemetry.rejectedPairs || [];
        throw insufficient;
      }

      routingStage = 'save_routing';
      routingId = Number(routing.save({ enableSourcing: true, ignoreMandatoryFields: false }));
      w449Telemetry.routingSaveResult = {
        schema: 'idb.w450-routing-save-result.v1',
        status: 'saved',
        routingId: Number(routingId || 0) || null,
        routingUrl: buildNetSuiteRecordUrl('manufacturingrouting', routingId),
        routingName,
        acceptedOperationCount: (chosen.operationRows || []).length
      };

      log.audit({
        title: staleRoutingSupersededTargetId ? `Routing stale record superseded [${VERSION}]` : (existingRoutingId ? `Routing reused+updated [${VERSION}]` : `Routing created [${VERSION}]`),
        details: JSON.stringify({
          routingId,
          existingRoutingId,
          staleRoutingSupersededTargetId,
          chosen,
          w449: w449Telemetry,
	        staleRoutingSuperseded: staleRoutingSupersededTargetId ? true : null,
	        staleRoutingDiscovery
	      })
      });
    } catch (e) {
      return buildWipRoutingBestEffortFailure({
        failureStage: routingStage,
        error: e,
        subsidiaryId: subs,
        locationId: loc,
        bomId,
        assemblyId,
        existingRoutingId,
        routingId,
        routingName,
        chosen,
        wipRequested: true,
        coreRecordsCreatedSafely: !!(assemblyId && bomId),
        routingValidation: existingRoutingValidation && existingRoutingValidation.valid === false ? existingRoutingValidation : null,
        staleRoutingDiscovery,
        assemblyRoutingDiscoveryW448,
        w449: w449Telemetry
      });
    }

    // Step 5: Only attach when the assembly has no existing managed routing
    let attachResult = 'not-attempted';
    if (!existingRoutingId || staleRoutingSupersededTargetId) {
      attachResult = attachRoutingToAssemblySafe({ assemblyId, routingId, forceDefault: true });
    } else {
      attachResult = 'skipped-reused-existing-routing';
      log.audit({
        title: `Assembly routing attach skipped (reused existing routing) [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId })
      });
    }
    w449Telemetry.routingAssemblyVerification = verifyRoutingAttachedOnAssemblyW449({
      assemblyId,
      routingId,
      expectedRoutingName: routingName,
      productPlan: productPlanW443,
      extId,
      staleRoutingSupersededTargetId
    });

    const staleRoutingSupersedeFailure = staleRoutingSupersededTargetId && (!w449Telemetry.routingAssemblyVerification || !w449Telemetry.routingAssemblyVerification.staleSuperseded)
      ? {
        schema: 'idb.w450-stale-routing-supersede-failure.v1',
        staleRoutingId: Number(staleRoutingSupersededTargetId),
        staleRoutingName: existingRoutingName,
        newRoutingId: Number(routingId || 0) || null,
        attachResult,
        reason: 'new_routing_not_verified_as_assembly_default_after_reload',
        nextFixHint: 'Open the assembly routing sublist and set the newly created product-specific routing as default, replacing Cookie Production Line.'
      }
      : null;
    w449Telemetry.staleCookieRouteSupersedeResult = staleRoutingSupersedeFailure || {
      schema: 'idb.w450-stale-cookie-route-supersede-result.v1',
      staleRoutingId: staleRoutingSupersededTargetId ? Number(staleRoutingSupersededTargetId) : null,
      superseded: staleRoutingSupersededTargetId ? !staleRoutingSupersedeFailure : false,
      attachResult
    };

    return {
      routingId,
      routingUrl: buildNetSuiteRecordUrl('manufacturingrouting', routingId),
      routingName,
      existingRoutingId: existingRoutingId ? Number(existingRoutingId) : null,
      staleRoutingSupersededTargetId: staleRoutingSupersededTargetId ? Number(staleRoutingSupersededTargetId) : null,
      decision: staleRoutingSupersededTargetId ? 'superseded-stale-routing-with-new-routing' : (existingRoutingId ? 'reused-existing-routing' : 'created-new-routing'),
      status: 'attached',
      attachResult,
      chosen,
      operationRows: chosen.operationRows || [],
      routingValidation: validateRoutingForProductPlanW443({ id: routingId, name: routingName }, productPlanW443, { expectedRoutingName: routingName }),
      staleRoutingSuperseded: staleRoutingSupersededTargetId ? existingRoutingValidation : null,
      staleRoutingSupersedeFailure,
      staleRoutingDiscovery,
      assemblyRoutingDiscoveryW448,
      assemblyRoutingVerificationW449: w449Telemetry.routingAssemblyVerification,
      w449: w449Telemetry,
      w450: w449Telemetry
    };
  }

  function w449OperationFamily(seq, opName) {
    const text = `${seq || ''} ${opName || ''}`.toLowerCase();
    if (/receive|dock|raw|staging/.test(text)) return 'receiving';
    if (/mix|blend|masa|marinade|seasoning|sauce/.test(text)) return 'mixing';
    if (/fill|dispense|sheet|cut/.test(text)) return 'fill';
    if (/inspect|qc|quality|check/.test(text)) return 'qc';
    if (/pack|case|bag|carton|wrap/.test(text)) return 'packing';
    if (/roast|cook|fry|smoke|dehydrate|bake|assembly|produce|build/.test(text)) return 'production';
    return Number(seq) >= 40 ? 'packing' : Number(seq) >= 30 ? 'qc' : 'production';
  }

  function w449RankWorkCentersForFamily(centers, family) {
    const prefs = W449_WORK_CENTER_FAMILIES[family] || [];
    const keywordMap = {
      receiving: ['receiving', 'dock', 'pre-kit'],
      mixing: ['blend', 'mix', 'blending', 'large fill blender', 'layering'],
      production: ['assembly', 'bulkline', 'line', 'pie'],
      fill: ['dispense', 'dispensing', 'fill', 'blender'],
      qc: ['quality', 'control', 'inspection', 'inspect'],
      packing: ['pack', 'packing', 'packaging', 'case']
    };
    return (centers || []).map(function (center) {
      const id = Number(center && center.id || 0);
      const name = String(center && center.name || '');
      const lower = name.toLowerCase();
      const prefIndex = prefs.indexOf(id);
      let score = Number(center && center.score || 0);
      if (prefIndex >= 0) score += 100 - (prefIndex * 8);
      (keywordMap[family] || []).forEach(function (keyword) {
        if (lower.indexOf(keyword) !== -1) score += 10;
      });
      return Object.assign({}, center, {
        id,
        name,
        w449Family: family,
        w449PreferredRank: prefIndex >= 0 ? prefIndex + 1 : null,
        w449AuthoritativeSearch: W449_WORK_CENTER_SEARCH,
        score
      });
    }).filter(function (center) {
      return Number.isFinite(Number(center.id)) && Number(center.id) > 0;
    }).sort(function (a, b) {
      return Number(b.score || 0) - Number(a.score || 0);
    });
  }

  function w449RankCostTemplatesForFamily(templates, family) {
    const keywordMap = {
      receiving: ['receiving', 'material'],
      mixing: ['blend', 'mix', 'fill'],
      production: ['assembly', 'line', 'standard'],
      fill: ['fill', 'dispense', 'blend'],
      qc: ['quality', 'inspection', 'qc'],
      packing: ['pack', 'packaging', 'case']
    };
    return (templates || []).map(function (template) {
      const lower = String(template && template.name || '').toLowerCase();
      let score = Number(template && template.score || 0);
      (keywordMap[family] || []).forEach(function (keyword) {
        if (lower.indexOf(keyword) !== -1) score += 10;
      });
      return Object.assign({}, template, { w449Family: family, score });
    }).filter(function (template) {
      return Number.isFinite(Number(template.id)) && Number(template.id) > 0;
    }).sort(function (a, b) {
      return Number(b.score || 0) - Number(a.score || 0);
    });
  }

  function classifyRoutingProbeFailureW450(rejections) {
    const probes = Array.isArray(rejections) ? rejections : [];
    const fieldCounts = {};
    probes.forEach(function (probe) {
      const fieldId = String(probe && probe.fieldId || 'unknown');
      fieldCounts[fieldId] = (fieldCounts[fieldId] || 0) + 1;
    });
    if (fieldCounts.manufacturingcosttemplate) return 'cost_template';
    if (fieldCounts.manufacturingworkcenter) return 'work_center';
    if (fieldCounts.commitLine && probes.some(function (probe) {
      return /cost\s*template|manufacturingcosttemplate|template/i.test(String(probe && probe.errorMessage || ''));
    })) return 'cost_template';
    if (fieldCounts.commitLine && probes.some(function (probe) {
      return /work\s*center|manufacturingworkcenter|center/i.test(String(probe && probe.errorMessage || ''));
    })) return 'work_center';
    return fieldCounts.commitLine ? 'pair_compatibility' : 'routing_step_field';
  }

  function routingFailureHintW450(failureStage, error, w449) {
    const errorType = error && error.routingPairFailureType ? String(error.routingPairFailureType) : '';
    const lastRejected = w449 && Array.isArray(w449.rejectedPairs) && w449.rejectedPairs.length
      ? w449.rejectedPairs[w449.rejectedPairs.length - 1]
      : null;
    const fieldId = String(lastRejected && lastRejected.fieldId || '');
    const failureType = errorType ||
      (failureStage === 'resolve_cost_templates' || fieldId === 'manufacturingcosttemplate' ? 'cost_template' :
        (failureStage === 'resolve_work_centers' || fieldId === 'manufacturingworkcenter' ? 'work_center' : 'routing'));
    const pairSummary = lastRejected
      ? ` Last rejected op ${lastRejected.seq || ''} "${lastRejected.opName || ''}" used center ${lastRejected.centerId || ''} ${lastRejected.centerName || ''} with template ${lastRejected.templateId || ''} ${lastRejected.templateName || ''} at field ${fieldId || 'unknown'}.`
      : '';
    if (failureType === 'cost_template') {
      return {
        failureType,
        nextFixHint: `Fix manufacturing cost template availability/compatibility for the subsidiary. Prefer an active default or name-matched WIP/manufacturing template, then re-run.${pairSummary}`
      };
    }
    if (failureType === 'work_center') {
      return {
        failureType,
        nextFixHint: `Fix manufacturing work center availability/compatibility for the subsidiary/location. Prefer production, mixing, blending, assembly, filling, packing, or QC centers ahead of receiving/dock rows, then re-run.${pairSummary}`
      };
    }
    if (failureType === 'pair_compatibility') {
      return {
        failureType,
        nextFixHint: `Work centers and cost templates were found, but NetSuite rejected every pair for at least one operation. Align the template subsidiary/default setup with the candidate production work centers, then re-run.${pairSummary}`
      };
    }
    return {
      failureType,
      nextFixHint: `Fix the routing step field rejected by NetSuite, then re-run.${pairSummary}`
    };
  }

  function setRoutingBomBestEffortW448(routing, context) {
    const fields = safeTryReturn(() => routing.getFields()) || [];
    const bomField = firstExisting(fields, ['billofmaterials', 'bom', 'billofmaterial']);
    const result = {
      schema: 'idb.w448-routing-bom-link-attempt.v1',
      bomId: Number(context && context.bomId || 0) || null,
      assemblyId: Number(context && context.assemblyId || 0) || null,
      bomField: bomField || '',
      set: false,
      skipped: false,
      supersededStaleRoutingId: Number(context && context.staleRoutingSupersededTargetId || 0) || null,
      errorName: '',
      errorMessage: ''
    };
    if (!bomField) {
      result.skipped = true;
      result.errorMessage = 'No BOM field exposed on manufacturing routing body.';
      return result;
    }
    try {
      routing.setValue({ fieldId: bomField, value: Number(context.bomId) });
      result.set = true;
      return result;
    } catch (e) {
      result.errorName = e && e.name ? String(e.name) : '';
      result.errorMessage = e && e.message ? String(e.message) : String(e || '');
      log.audit({
        title: `Routing BOM set failed but WIP repair continues [${VERSION}]`,
        details: JSON.stringify(result)
      });
      return result;
    }
  }

  function buildWipRoutingBestEffortFailure({ failureStage, error, subsidiaryId, locationId, bomId, assemblyId, existingRoutingId, routingId, routingName, chosen, wipRequested, coreRecordsCreatedSafely, routingValidation, staleRoutingDiscovery, assemblyRoutingDiscoveryW448, w449 }) {
    const hint = routingFailureHintW450(failureStage, error, w449);
    const diagnostic = {
      status: 'failed_best_effort',
      failureStage: failureStage || 'unknown',
      errorName: error && error.name ? String(error.name) : '',
      errorMessage: error && error.message ? String(error.message) : String(error || ''),
      failureType: hint.failureType,
      nextFixHint: hint.nextFixHint,
      assemblyId: Number(assemblyId || 0) || null,
      bomId: Number(bomId || 0) || null,
      subsidiaryId: Number(subsidiaryId || 0) || null,
      locationId: Number(locationId || 0) || null,
      routingId: Number(routingId || 0) || null,
      existingRoutingId: Number(existingRoutingId || 0) || null,
      routingName: routingName || '',
      expectedRoutingName: routingValidation && routingValidation.expectedRoutingName || routingName || '',
      actualRoutingName: routingValidation && routingValidation.actualRoutingName || '',
      actualRoutingId: routingValidation && routingValidation.actualRoutingId || null,
      staleRoutingName: staleRoutingDiscovery && staleRoutingDiscovery.routingName || routingValidation && routingValidation.actualRoutingName || '',
      staleRoutingId: staleRoutingDiscovery && staleRoutingDiscovery.routingId || routingValidation && routingValidation.actualRoutingId || null,
      staleRoutingDiscovery: staleRoutingDiscovery || null,
      assemblyRoutingDiscoveryW448: assemblyRoutingDiscoveryW448 || null,
      w449: w449 || null,
      visibleStaleRoutingSuspected: !!(assemblyRoutingDiscoveryW448 && assemblyRoutingDiscoveryW448.staleRouteSignals && assemblyRoutingDiscoveryW448.staleRouteSignals.length),
      reason: routingValidation && routingValidation.reason || '',
      routingEligibilityConclusion: failureStage === 'set_billofmaterials'
        ? 'BOM not selectable for routing context; W450 keeps routing best-effort and supersedes stale Cookie Production Line routes instead of blocking core records.'
        : '',
      operationRows: chosen && chosen.operationRows || [],
      wipRequested: !!wipRequested,
      coreRecordsCreatedSafely: !!coreRecordsCreatedSafely,
      recommendedOperatorNextStep: hint.nextFixHint || 'Review BOM validity for the assembly, subsidiary, location, and manufacturing routing before re-running WIP routing.'
    };

    log.error({
      title: `WIP routing best-effort failure [${VERSION}]`,
      details: JSON.stringify(diagnostic)
    });

    return {
      status: 'failed_best_effort',
      decision: 'failed_best_effort',
      routingId: null,
      existingRoutingId: diagnostic.existingRoutingId,
      attachResult: 'not-attached-routing-failed',
      chosen: chosen || null,
      w449: w449 || null,
      w450: w449 || null,
      routingFailure: diagnostic,
      diagnostics: diagnostic
    };
  }

  function attachRoutingToAssemblySafe({ assemblyId, routingId, forceDefault }) {
    try {
      const result = attachRoutingToAssembly({ assemblyId, routingId, forceDefault });
      log.audit({
        title: `Assembly routing attach result [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), forceDefault: !!forceDefault, result: result || 'noop' })
      });
      return result || 'noop';
    } catch (e) {
      log.audit({
        title: `Assembly routing attach skipped after routing save [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), error: String(e && e.message ? e.message : e) })
      });
      return 'skipped-after-save';
    }
  }



  function findManagedRoutingIdByBom({ bomId, subsidiaryId, extId, preferredName }) {
    try {
      const filters = [['billofmaterials', 'anyof', Number(bomId)]];
      if (subsidiaryId) filters.push('AND', ['subsidiary', 'anyof', Number(subsidiaryId)]);

      const cols = [
        search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
        search.createColumn({ name: 'name' }),
        search.createColumn({ name: 'memo' }),
        search.createColumn({ name: 'billofmaterials' })
      ];

      const rows = search.create({ type: 'manufacturingrouting', filters, columns: cols })
        .run().getRange({ start: 0, end: 100 }) || [];

      let best = null;
      let bestScore = -9999;
      rows.forEach(function(r) {
        const id = Number(r.getValue({ name: 'internalid' }));
        if (!Number.isFinite(id)) return;
        const name = str(r.getValue({ name: 'name' }));
        const memo = str(r.getValue({ name: 'memo' }));
        let score = 0;
        if (extId && memo.indexOf(extId) !== -1) score += 100;
        if (memo.indexOf('SCAI Demo Reset') !== -1) score += 60;
        if (preferredName && name === preferredName) score += 40;
        if (name.indexOf('SCAI Routing') === 0) score += 20;
        if (score > bestScore) {
          bestScore = score;
          best = { id, name, memo, score };
        }
      });

      log.audit({
        title: `Manufacturing routing search fallback [${VERSION}]`,
        details: JSON.stringify({ bomId: Number(bomId), subsidiaryId: Number(subsidiaryId || 0), rows: rows.length, chosen: best })
      });

      return best ? Number(best.id) : null;
    } catch (e) {
      log.error({
        title: `Manufacturing routing search fallback failed [${VERSION}]`,
        details: JSON.stringify({ bomId: Number(bomId), subsidiaryId: Number(subsidiaryId || 0), error: String(e && e.message ? e.message : e) })
      });
      return null;
    }
  }

  function inspectAssemblyRoutingSublistsW448({ assemblyId, extId }) {
    const asm = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: false });
    const sublistCandidates = ['manufacturingrouting', 'manufacturingroutings', 'routing', 'routings'];
    const routingFieldCandidates = ['manufacturingrouting', 'routing', 'routingid', 'name', 'id'];
    const defaultFieldCandidates = ['default', 'isdefault', 'masterdefault'];
    const memoFieldCandidates = ['memo', 'description'];
    const snapshot = {
      schema: 'idb.w448-assembly-routing-discovery.v1',
      assemblyId: Number(assemblyId),
      chosenRoutingId: null,
      managedRoutingId: null,
      defaultRoutingId: null,
      firstRoutingId: null,
      sublists: [],
      staleRouteSignals: [],
      conclusion: 'no_routing_sublist_visible_to_suite_script'
    };

    for (let s = 0; s < sublistCandidates.length; s++) {
      const sublistId = sublistCandidates[s];
      let count = 0;
      try {
        count = asm.getLineCount({ sublistId });
      } catch (e) {
        continue;
      }

      const fields = safeTryReturn(() => asm.getSublistFields({ sublistId })) || [];
      const routingField = firstExisting(fields, routingFieldCandidates) || routingFieldCandidates[0];
      const defaultField = firstExisting(fields, defaultFieldCandidates);
      const memoField = firstExisting(fields, memoFieldCandidates);
      const lineSamples = [];

      let defaultRoutingId = null;
      let firstRoutingId = null;
      let managedRoutingId = null;

      for (let i = 0; i < count; i++) {
        const line = { line: i, values: {} };
        fields.slice(0, 30).forEach(function(fieldId) {
          line.values[fieldId] = safeTryReturn(function() {
            return asm.getSublistValue({ sublistId: sublistId, fieldId: fieldId, line: i });
          });
        });
        lineSamples.push(line);

        const rid = Number(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: routingField, line: i })));
        if (Number.isFinite(rid) && rid > 0) {
          if (!firstRoutingId) firstRoutingId = rid;

          const isDefault = defaultField ? normalizeBool(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: defaultField, line: i }))) : false;
          if (isDefault && !defaultRoutingId) defaultRoutingId = rid;

          const memoVal = memoField ? str(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: memoField, line: i }))) : '';
          if (!managedRoutingId && ((extId && memoVal.indexOf(extId) !== -1) || memoVal.indexOf('SCAI Demo Reset') !== -1)) {
            managedRoutingId = rid;
          }
        }

        const joinedValues = JSON.stringify(line.values || {});
        if (/cookie|keebler|parfait|fudge|baking|old customer|SCAI Demo Reset/i.test(joinedValues)) {
          snapshot.staleRouteSignals.push({ sublistId: sublistId, line: i, matchedText: joinedValues.slice(0, 700) });
        }
      }

      const chosenRoutingId = managedRoutingId || defaultRoutingId || firstRoutingId || null;
      snapshot.sublists.push({
        sublistId: sublistId,
        count: count,
        fields: fields,
        routingField: routingField,
        defaultField: defaultField,
        memoField: memoField,
        chosenRoutingId: chosenRoutingId,
        managedRoutingId: managedRoutingId,
        defaultRoutingId: defaultRoutingId,
        firstRoutingId: firstRoutingId,
        lineSamples: lineSamples
      });
      if (chosenRoutingId && !snapshot.chosenRoutingId) {
        snapshot.chosenRoutingId = Number(chosenRoutingId);
        snapshot.managedRoutingId = managedRoutingId ? Number(managedRoutingId) : null;
        snapshot.defaultRoutingId = defaultRoutingId ? Number(defaultRoutingId) : null;
        snapshot.firstRoutingId = firstRoutingId ? Number(firstRoutingId) : null;
        snapshot.conclusion = snapshot.staleRouteSignals.length
          ? 'routing_found_with_stale_route_signal'
          : 'routing_found_from_assembly_sublist';
      }

      log.audit({
        title: `Assembly routing discovery [${VERSION}]`,
        details: JSON.stringify({
          assemblyId: Number(assemblyId),
          sublistId,
          count,
          routingField,
          defaultField,
          memoField,
          chosenRoutingId,
          managedRoutingId,
          defaultRoutingId,
          firstRoutingId
        })
      });
    }

    log.audit({
      title: `Assembly routing discovery snapshot [${VERSION}]`,
      details: JSON.stringify(snapshot)
    });
    return snapshot;
  }

  function findManagedAssemblyRoutingId({ assemblyId, extId }) {
    const snapshot = inspectAssemblyRoutingSublistsW448({ assemblyId, extId });
    return snapshot && snapshot.chosenRoutingId ? Number(snapshot.chosenRoutingId) : null;
  }

  function clearRoutingSteps(routingRec, sublistId) {
    let count = 0;
    try {
      count = routingRec.getLineCount({ sublistId });
    } catch (e) {
      log.audit({
        title: `Routing step clear skipped [${VERSION}]`,
        details: JSON.stringify({ sublistId, reason: 'sublist unavailable' })
      });
      return;
    }

    for (let i = count - 1; i >= 0; i--) {
      safeTry(() => routingRec.removeLine({ sublistId, line: i, ignoreRecalc: true }));
    }

    log.audit({
      title: `Routing steps cleared [${VERSION}]`,
      details: JSON.stringify({ sublistId, removed: count })
    });
  }

  function attachRoutingToAssembly({ assemblyId, routingId, forceDefault }) {
    const asm = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: true });

    const sublistCandidates = ['manufacturingrouting', 'manufacturingroutings', 'routing', 'routings'];
    let sublistId = null;

    for (let i = 0; i < sublistCandidates.length; i++) {
      try {
        asm.getLineCount({ sublistId: sublistCandidates[i] });
        sublistId = sublistCandidates[i];
        break;
      } catch (e) {}
    }
    if (!sublistId) return 'no-sublist';

    const routingFieldCandidates = ['manufacturingrouting', 'routing', 'routingid'];
    const defaultFieldCandidates = ['default', 'isdefault', 'masterdefault'];
    const fields = safeTryReturn(() => asm.getSublistFields({ sublistId })) || [];
    const routingField = firstExisting(fields, routingFieldCandidates) || routingFieldCandidates[0];
    const defaultField = firstExisting(fields, defaultFieldCandidates);

    log.audit({
      title: `Assembly routing attach field resolution [${VERSION}]`,
      details: JSON.stringify({ sublistId, routingField, defaultField, forceDefault: !!forceDefault, fields })
    });

    let line = -1;
    const count = safeTryReturn(() => asm.getLineCount({ sublistId })) || 0;

    for (let i = 0; i < count; i++) {
      const v = safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: routingField, line: i }));
      if (Number(v) === Number(routingId)) {
        line = i;
        break;
      }
    }

    if (line !== -1) {
      let defaultSet = false;
      if (forceDefault && defaultField) {
        try {
          asm.selectLine({ sublistId, line });
          asm.setCurrentSublistValue({ sublistId, fieldId: defaultField, value: true });
          asm.commitLine({ sublistId });
          asm.save({ enableSourcing: true, ignoreMandatoryFields: true });
          defaultSet = true;
        } catch (e) {
          log.audit({
            title: `Assembly routing existing-line default repair failed [${VERSION}]`,
            details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, line, defaultField, error: String(e && e.message ? e.message : e) })
          });
        }
      }
      log.audit({
        title: `Assembly routing already linked [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, line, routingField, defaultField, defaultSet })
      });
      return defaultSet ? 'already-linked-defaulted' : 'already-linked';
    }

    // Non-critical path: if NetSuite does not expose editable sublist fields here, do not force a line insert.
    if (!fields.length) {
      log.audit({
        title: `Assembly routing attach skipped (sublist not script-editable) [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, routingField, fields })
      });
      return 'skipped-noneditable-sublist';
    }

    try {
      asm.selectNewLine({ sublistId });
      asm.setCurrentSublistValue({ sublistId, fieldId: routingField, value: Number(routingId) });
      if (forceDefault && defaultField) asm.setCurrentSublistValue({ sublistId, fieldId: defaultField, value: true });
      asm.commitLine({ sublistId });
      asm.save({ enableSourcing: true, ignoreMandatoryFields: true });
      log.audit({
        title: `Assembly routing attached [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, routingField, defaultField, defaultSet: !!(forceDefault && defaultField), createdNewLine: true })
      });
      return forceDefault && defaultField ? 'attached-defaulted' : 'attached';
    } catch (e) {
      log.audit({
        title: `Assembly routing attach skipped after routing save [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, routingField, error: String(e && e.message ? e.message : e) })
      });
      return 'skipped-after-save';
    }
  }

  function pickByKeywords(list, keywords) {
    if (!Array.isArray(list) || !list.length) return null;
    const keys = (keywords || []).map(k => String(k || '').toLowerCase()).filter(Boolean);
    if (!keys.length) return list[0];

    let best = null;
    let bestScore = -9999;

    list.forEach(x => {
      const nm = String(x.name || '').toLowerCase();
      let score = Number(x.score || 0);
      keys.forEach(k => { if (nm.indexOf(k) !== -1) score += 20; });
      if (score > bestScore) { bestScore = score; best = x; }
    });

    return best || list[0];
  }

  function getResultValueByCandidates(result, candidates) {
    const cols = result && result.columns ? result.columns : [];
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      const meta = [str(c && c.name), str(c && c.label), str(c && c.join)].join('|').toLowerCase();
      for (let j = 0; j < candidates.length; j++) {
        if (meta.indexOf(String(candidates[j]).toLowerCase()) !== -1) {
          const txt = str(safeTryReturn(() => result.getText(c)));
          const val = str(safeTryReturn(() => result.getValue(c)));
          if (txt) return txt;
          if (val) return val;
        }
      }
    }
    return '';
  }

  function getResultNameFallback(result) {
    let out = getResultValueByCandidates(result, ['name', 'itemid', 'entityid', 'altname', 'work center']);
    if (out) return out;
    const cols = result && result.columns ? result.columns : [];
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      const meta = [str(c && c.name), str(c && c.label), str(c && c.join)].join('|').toLowerCase();
      if (meta.indexOf('internalid') !== -1 || meta.indexOf('location') !== -1 || meta.indexOf('subsidiary') !== -1 || meta.indexOf('inactive') !== -1) continue;
      const txt = str(safeTryReturn(() => result.getText(c)));
      const val = str(safeTryReturn(() => result.getValue(c)));
      out = txt || val;
      if (out) return out;
    }
    return '';
  }


  function getColumnMeta(c) {
    const name = str(c && c.name);
    const label = str(c && c.label);
    const join = str(c && c.join);
    const summary = str(c && c.summary);
    return {
      name,
      label,
      join,
      summary,
      meta: [name, label, join, summary].join('|').toLowerCase()
    };
  }

  function getResultRawValueByCandidates(result, candidates) {
    const cols = result && result.columns ? result.columns : [];
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      const meta = getColumnMeta(c).meta;
      for (let j = 0; j < candidates.length; j++) {
        if (meta.indexOf(String(candidates[j]).toLowerCase()) !== -1) {
          const val = safeTryReturn(() => result.getValue(c));
          if (val !== null && val !== undefined && String(val) !== '') return val;
        }
      }
    }
    return '';
  }

  function resolveSavedSearchWorkCenterId(result) {
    const candidates = [];
    const cols = result && result.columns ? result.columns : [];

    const directResultId = toIntOrNull(result && result.id);
    if (directResultId) {
      candidates.push({ id: Number(directResultId), source: 'result.id', score: 1000, meta: 'result.id' });
    }

    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      const info = getColumnMeta(c);
      if (info.meta.indexOf('internalid') === -1 && info.meta.indexOf('internal id') === -1) continue;

      const raw = safeTryReturn(() => result.getValue(c));
      const num = toIntOrNull(raw);
      if (!num) continue;

      let score = 0;
      if (info.meta.indexOf('work center') !== -1 || info.meta.indexOf('workcenter') !== -1 || info.meta.indexOf('manufacturingworkcenter') !== -1) score += 300;
      if (!info.join) score += 50;
      if (info.name.toLowerCase() == 'internalid') score += 25;
      if (info.label.toLowerCase() == 'internal id') score += 10;

      candidates.push({ id: Number(num), source: `column[${i}]`, score, meta: info.meta });
    }

    if (!candidates.length) return null;

    const byId = {};
    candidates.forEach(function (x) {
      if (!byId[x.id] || byId[x.id].score < x.score) byId[x.id] = x;
    });

    const ranked = Object.keys(byId).map(function (k) { return byId[k]; }).sort(function (a, b) { return b.score - a.score; });
    let chosen = null;
    for (let i = 0; i < ranked.length; i++) {
      if (isValidManufacturingWorkCenterId(ranked[i].id)) {
        chosen = ranked[i];
        break;
      }
    }
    if (!chosen) chosen = ranked[0];

    log.audit({
      title: `Saved search work-center ID resolution [${VERSION}]`,
      details: JSON.stringify({ chosen: chosen, ranked: ranked.slice(0, 10) })
    });

    return chosen ? Number(chosen.id) : null;
  }

  function resolveManufacturingWorkCenterIdByNameAndContext({ name, locationId, subsidiaryId }) {
    const cleanName = str(name);
    if (!cleanName) return null;

    const filterSets = [];
    if (locationId && subsidiaryId) filterSets.push([['isinactive', 'is', 'F'], 'AND', ['name', 'is', cleanName], 'AND', ['location', 'anyof', String(locationId)], 'AND', ['subsidiary', 'anyof', String(subsidiaryId)]]);
    if (locationId) filterSets.push([['isinactive', 'is', 'F'], 'AND', ['name', 'is', cleanName], 'AND', ['location', 'anyof', String(locationId)]]);
    if (subsidiaryId) filterSets.push([['isinactive', 'is', 'F'], 'AND', ['name', 'is', cleanName], 'AND', ['subsidiary', 'anyof', String(subsidiaryId)]]);
    filterSets.push([['isinactive', 'is', 'F'], 'AND', ['name', 'is', cleanName]]);

    for (let i = 0; i < filterSets.length; i++) {
      const rows = safeTryReturn(() => search.create({
        type: 'manufacturingworkcenter',
        filters: filterSets[i],
        columns: [search.createColumn({ name: 'internalid', sort: search.Sort.ASC }), 'name', 'location', 'subsidiary']
      }).run().getRange({ start: 0, end: 5 })) || [];
      if (rows.length) {
        const id = toIntOrNull(rows[0].getValue({ name: 'internalid' }));
        if (id) return Number(id);
      }
    }
    return null;
  }

  function isValidManufacturingWorkCenterId(id) {
    const num = Number(id);
    if (!Number.isFinite(num) || num < 1) return false;

    const direct = safeTryReturn(() => {
      const row = search.lookupFields({
        type: 'manufacturingworkcenter',
        id: num,
        columns: ['name']
      });
      return row && typeof row === 'object';
    });
    if (direct) return true;

    const searched = safeTryReturn(() => {
      const rs = search.create({
        type: 'manufacturingworkcenter',
        filters: [['internalid', 'anyof', String(num)]],
        columns: ['internalid']
      }).run().getRange({ start: 0, end: 1 }) || [];
      return !!(rs && rs.length);
    });
    return !!searched;
  }

  function findDirectManufacturingWorkCenters({ locationId, subsidiaryId }) {
    const loc = locationId ? String(locationId) : '';
    const subs = subsidiaryId ? String(subsidiaryId) : '';

    const filterCandidates = [
      function () { return [['isinactive', 'is', 'F'], 'AND', ['subsidiary', 'anyof', subs], 'AND', ['location', 'anyof', loc]]; },
      function () { return [['isinactive', 'is', 'F'], 'AND', ['subsidiary', 'anyof', subs]]; },
      function () { return [['isinactive', 'is', 'F']]; },
      function () { return []; }
    ];

    for (let i = 0; i < filterCandidates.length; i++) {
      const filters = filterCandidates[i]();
      const rows = safeTryReturn(() => search.create({
        type: 'manufacturingworkcenter',
        filters: filters,
        columns: [
          search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
          search.createColumn({ name: 'name' }),
          search.createColumn({ name: 'location' }),
          search.createColumn({ name: 'subsidiary' })
        ]
      }).run().getRange({ start: 0, end: 100 })) || [];

      if (!rows.length) continue;

      const scored = rows.map(function (r) {
        const id = Number(r.getValue({ name: 'internalid' }));
        const name = str(r.getValue({ name: 'name' }));
        const rowLocId = str(r.getValue({ name: 'location' }));
        const rowLocText = str(r.getText({ name: 'location' }));
        const rowSubsId = str(r.getValue({ name: 'subsidiary' }));
        const rowSubsText = str(r.getText({ name: 'subsidiary' }));
        let score = 0;
        const lower = name.toLowerCase();
        ['production','line','assembly','blend','blending','mix','fill','filling','dispense','dispensing','pack','packing','package','case','qc','quality'].forEach(function (k) {
          if (lower.indexOf(k) !== -1) score += 5;
        });
        if (/receiv|dock|warehouse|staging|stage/.test(lower)) score -= 25;
        if (loc && rowLocId === loc) score += 50;
        if (subs && rowSubsId === subs) score += 10;
        return { id, name, score, locationId: rowLocId, locationText: rowLocText, subsidiaryId: rowSubsId, subsidiaryText: rowSubsText, source: 'direct' };
      }).filter(function (x) { return Number.isFinite(x.id) && x.id > 0; })
        .sort(function (a, b) { return b.score - a.score; });

      if (scored.length) {
        log.audit({
          title: `Direct manufacturing work center fallback [${VERSION}]`,
          details: JSON.stringify({ locationId: loc, subsidiaryId: subs, count: scored.length, picked: scored.slice(0, 10) })
        });
        return scored;
      }
    }

    return [];
  }

  // ----------------------------
  // Work Centers / Cost Templates (v1.7.6)
  // ----------------------------
  function findWorkCentersFromSavedSearch({ searchId, fallbackSearchId, locationId, subsidiaryId, authoritativeOnly }) {
    const loc = locationId ? String(locationId) : '';
    const subs = subsidiaryId ? String(subsidiaryId) : '';
    const searchRef = (typeof searchId === 'string' && /^\d+$/.test(searchId)) ? Number(searchId) : searchId;

    if (!searchRef) {
      log.error({
        title: `WIP work center saved search missing [${VERSION}]`,
        details: JSON.stringify({ searchId: searchRef || searchId, locationId, subsidiaryId })
      });
      return [];
    }

    try {
      let loadedSearchId = searchRef;
      let ss = null;
      try {
        ss = search.load({ id: searchRef });
      } catch (primaryError) {
        const fallbackRef = fallbackSearchId ? ((typeof fallbackSearchId === 'string' && /^\d+$/.test(fallbackSearchId)) ? Number(fallbackSearchId) : fallbackSearchId) : null;
        if (!fallbackRef) throw primaryError;
        loadedSearchId = fallbackRef;
        ss = search.load({ id: fallbackRef });
      }
      const paged = ss.runPaged({ pageSize: 100 });
      const rows = [];

      paged.pageRanges.forEach(function (pr) {
        const page = paged.fetch({ index: pr.index });
        page.data.forEach(function (r) {
          const name = getResultNameFallback(r);

          const rowLocId = String(
            getResultRawValueByCandidates(r, ['location']) ||
            safeTryReturn(() => r.getValue({ name: 'location' })) ||
            ''
          );
          const rowLocText = String(
            safeTryReturn(() => r.getText({ name: 'location' })) ||
            getResultValueByCandidates(r, ['location']) ||
            ''
          );
          const rowSubsId = String(
            getResultRawValueByCandidates(r, ['subsidiary']) ||
            safeTryReturn(() => r.getValue({ name: 'subsidiary' })) ||
            ''
          );
          const rowSubsText = String(
            safeTryReturn(() => r.getText({ name: 'subsidiary' })) ||
            getResultValueByCandidates(r, ['subsidiary']) ||
            ''
          );

          const preferredLoc = rowLocId || loc;
          const preferredSubs = rowSubsId || subs;
          const mappedByNameId = resolveManufacturingWorkCenterIdByNameAndContext({
            name,
            locationId: preferredLoc,
            subsidiaryId: preferredSubs
          });
          const rawSearchId = resolveSavedSearchWorkCenterId(r);
          const trustedSavedSearchId = rawSearchId ? Number(rawSearchId) : null;
          const chosenId = mappedByNameId || trustedSavedSearchId;

          log.audit({
            title: `WIP center candidate normalized [${VERSION}]`,
            details: JSON.stringify({
              name,
              rowLocId,
              rowLocText,
              rowSubsId,
              rowSubsText,
              mappedByNameId,
              rawSearchId,
              trustedSavedSearchId,
              chosenId,
              trustSavedSearch: true
            })
          });

          if (!Number.isFinite(chosenId)) return;

          rows.push({
            id: Number(chosenId),
            name,
            locationId: rowLocId,
            locationText: rowLocText,
            subsidiaryId: rowSubsId,
            subsidiaryText: rowSubsText,
            source: mappedByNameId ? 'saved-search-name-map' : 'saved-search-trusted-id'
          });
        });
      });

      const keywords = [
        'production', 'line', 'assembly',
        'blend', 'blending', 'mix',
        'fill', 'filling', 'dispense', 'dispensing',
        'pack', 'packing', 'package',
        'case', 'qc', 'quality'
      ];

      const scored = rows.map(function (x) {
        const lower = String(x.name || '').toLowerCase();
        let score = 0;

        keywords.forEach(function (k) {
          if (lower.indexOf(k) !== -1) score += 5;
        });

        if (loc && x.locationId === loc) score += 50;
        if (loc && x.locationText && String(x.locationText).toLowerCase().indexOf('boston') !== -1 && String(loc) === '2') score += 10;
        if (subs && x.subsidiaryId === subs) score += 10;
        if (x.name) score += Math.max(0, 10 - Math.min(10, x.name.length / 6));
        if (lower.indexOf('den-') === 0 || lower.indexOf('mm-') === 0 || lower.indexOf('sfo-') === 0) score += 8;
        if (/receiv|dock|warehouse|staging|stage/.test(lower)) score -= 25;

        return {
          id: x.id,
          name: x.name,
          score,
          locationId: x.locationId,
          locationText: x.locationText,
          subsidiaryId: x.subsidiaryId,
          subsidiaryText: x.subsidiaryText,
          source: x.source || 'saved-search'
        };
      }).sort(function (a, b) {
        return b.score - a.score;
      });

      const accepted = scored.filter(function (x) { return Number.isFinite(Number(x.id)) && Number(x.id) > 0; });
      const dropped = scored.filter(function (x) { return !(Number.isFinite(Number(x.id)) && Number(x.id) > 0); });

      log.audit({
        title: `WIP work centers resolved from saved search [${VERSION}]`,
        details: JSON.stringify({
          searchId,
          loadedSearchId,
          fallbackSearchId: fallbackSearchId || null,
          authoritativeOnly: !!authoritativeOnly,
          locationId: loc,
          subsidiaryId: subs,
          count: scored.length,
          acceptedCount: accepted.length,
          droppedCount: dropped.length,
          trustSavedSearch: true,
          picked: accepted.slice(0, 10),
          droppedRows: dropped.slice(0, 10)
        })
      });

      if (accepted.length) return accepted;

      if (!authoritativeOnly) {
        const fallback = findDirectManufacturingWorkCenters({ locationId: loc, subsidiaryId: subs });
        if (fallback.length) return fallback;
      }

      return [];
    } catch (e) {
      log.error({
        title: `WIP work center saved search failed [${VERSION}]`,
        details: JSON.stringify({
          searchId,
          fallbackSearchId: fallbackSearchId || null,
          locationId,
          subsidiaryId,
          authoritativeOnly: !!authoritativeOnly,
          error: String((e && e.message) || e)
        })
      });
      return [];
    }
  }

  function findCostTemplatesForSubsidiary(subsidiaryId) {
    const typeCandidates = ['manufacturingcosttemplate', 'mfgcosttemplate', 'costtemplate'];
    const subs = Number(subsidiaryId);

    function runQuery(type, filters) {
      try {
        const s = search.create({
          type,
          filters: filters || [],
          columns: [search.createColumn({ name: 'internalid', sort: search.Sort.ASC })]
        });
        const rows = s.run().getRange({ start: 0, end: 200 }) || [];
        return rows
          .map(r => Number(r.getValue({ name: 'internalid' })))
          .filter(id => Number.isFinite(id));
      } catch (e) {
        return [];
      }
    }

    function fieldText(value) {
      if (Array.isArray(value)) return value.map(function (v) { return fieldText(v); }).filter(Boolean).join(', ');
      if (value && typeof value === 'object') return str(value.text || value.name || value.value);
      return str(value);
    }

    function fieldHasId(value, id) {
      const wanted = String(id || '');
      if (!wanted) return false;
      if (Array.isArray(value)) return value.some(function (v) { return fieldHasId(v, id); });
      if (value && typeof value === 'object') return String(value.value || value.id || '') === wanted;
      return String(value || '') === wanted;
    }

    function fieldBool(value) {
      if (Array.isArray(value)) return value.some(fieldBool);
      if (value && typeof value === 'object') return normalizeBool(value.value || value.text || value.name);
      return normalizeBool(value);
    }

    for (let t = 0; t < typeCandidates.length; t++) {
      const type = typeCandidates[t];

      let ids = runQuery(type, [['isinactive', 'is', 'F'], 'AND', ['subsidiary', 'anyof', subs]]);
      if (!ids.length) ids = runQuery(type, [['subsidiary', 'anyof', subs]]);
      if (!ids.length) ids = runQuery(type, [['isinactive', 'is', 'F']]);
      if (!ids.length) ids = runQuery(type, []);

      if (ids.length) {
        const want = ['default', 'standard', 'wip', 'manufacturing', 'routing', 'blend', 'blending', 'mix', 'assembly', 'production', 'dispense', 'dispensing', 'fill', 'filling', 'pack', 'packing', 'packaging', 'quality', 'qc'];
        const scored = ids.map(id => {
          let nm = '';
          let subsidiaryIdValue = '';
          let subsidiaryText = '';
          let isDefault = false;
          safeTry(() => {
            const f = search.lookupFields({ type, id, columns: ['name'] });
            nm = (f && f.name) ? String(f.name) : '';
          });
          safeTry(() => {
            const f = search.lookupFields({ type, id, columns: ['subsidiary'] });
            subsidiaryIdValue = fieldHasId(f && f.subsidiary, subs) ? String(subs) : '';
            subsidiaryText = fieldText(f && f.subsidiary);
          });
          safeTry(() => {
            const f = search.lookupFields({ type, id, columns: ['isdefault'] });
            isDefault = fieldBool(f && f.isdefault);
          });
          if (!isDefault) {
            safeTry(() => {
              const f = search.lookupFields({ type, id, columns: ['default'] });
              isDefault = fieldBool(f && f.default);
            });
          }
          const lower = nm.toLowerCase();
          let score = 0;
          if (subsidiaryIdValue) score += 120;
          if (isDefault) score += 90;
          want.forEach(k => { if (lower.indexOf(k) !== -1) score += 10; });
          score += Math.max(0, 10 - Math.min(10, lower.length / 6));
          return {
            id,
            score,
            name: nm,
            subsidiaryId: subsidiaryIdValue,
            subsidiaryText,
            subsidiaryMatch: !!subsidiaryIdValue,
            isDefault,
            sourceType: type
          };
        }).sort((a, b) => b.score - a.score);

        const picked = scored;
        log.audit({
          title: `WIP cost templates resolved [${VERSION}]`,
          details: JSON.stringify({ type, subsidiaryId: subs, count: picked.length, picked })
        });
        return picked;
      }
    }

    return [];
  }

  function resolveRoutingNames({ prospect, signalText, names }) {
    const bySeq = (names && names.operation_names_by_seq) ? names.operation_names_by_seq : null;
    if (bySeq) {
      return {
        op10: trimLen(str(bySeq['10'] || bySeq[10] || 'Review Product Inputs'), 60),
        op20: trimLen(str(bySeq['20'] || bySeq[20] || 'Run Product Assembly'), 60),
        op30: trimLen(str(bySeq['30'] || bySeq[30] || 'Inspect Output'), 60),
        op40: trimLen(str(bySeq['40'] || bySeq[40] || ''), 60),
        op50: trimLen(str(bySeq['50'] || bySeq[50] || ''), 60)
      };
    }
    if (names && names._productBuildPlanW432 && names._productBuildPlanW432.operationNames) {
      const ops = names._productBuildPlanW432.operationNames;
      return {
        op10: trimLen(str(ops[0] || 'Review Product Inputs'), 60),
        op20: trimLen(str(ops[1] || 'Run Product Assembly'), 60),
        op30: trimLen(str(ops[2] || 'Inspect Output'), 60),
        op40: trimLen(str(ops[3] || ''), 60),
        op50: trimLen(str(ops[4] || ''), 60)
      };
    }
    return {
      op10: 'Review Product Inputs',
      op20: 'Run Product Assembly',
      op30: 'Inspect Output',
      op40: '',
      op50: ''
    };
  }

  // ----------------------------
  // Planning auto-calc OFF + preferred vendor alignment
  // ----------------------------
  function forcePlanningAutoCalcOffForItems({ vendorId, heroItemId, compIds }) {
    const results = [];

    // Hero: legacy fields
    const heroRes = submitFalseFields('inventoryitem', heroItemId, HERO_AUTOCALC_FIELDS, 'Hero');
    results.push(heroRes);

    // Components: provided field IDs
    compIds.forEach((cid, idx) => {
      const r = submitFalseFields('inventoryitem', cid, COMPONENT_AUTOCALC_FIELDS, `Component ${idx + 1}`);
      results.push(r);
    });

    // Preferred vendor: set to same vendor as anchor vendor
    const pv = [];
    [heroItemId].concat(compIds).forEach(itemId => {
      const ok = safeTryReturn(() => {
        record.submitFields({
          type: 'inventoryitem',
          id: Number(itemId),
          values: { preferredvendor: Number(vendorId) },
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        });
        return true;
      });
      pv.push({ itemId: Number(itemId), vendorId: Number(vendorId), ok: !!ok });
    });

    log.audit({
      title: `Planning auto-calc OFF + preferred vendor aligned [${VERSION}]`,
      details: JSON.stringify({ vendorId: Number(vendorId), results, preferredVendor: pv })
    });
  }

  function submitFalseFields(recType, recId, fields, label) {
    const tried = [];
    const setFalse = [];

    fields.forEach(fid => {
      tried.push(fid);
      try {
        record.submitFields({
          type: recType,
          id: Number(recId),
          values: { [fid]: false },
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        });
        setFalse.push(fid);
      } catch (e) {}
    });

    return { label, recType, recId: Number(recId), fieldsSetFalse: setFalse, tried };
  }

  // ----------------------------
  // Work Order seed (includes start + end dates)
  // ----------------------------
  function createWorkOrder({ assemblyId, subsidiaryId, locationId, quantity, memo, bomId, bomRevId }) {
    const attemptHistory = [];

    function isLineItemFailureMessage(message) {
      return /at least one line item/i.test(String(message || ''));
    }

    function classifyWorkOrderFailure(message) {
      const msg = String(message || '').toLowerCase();
      if (/could not set assembly item|assembly item/.test(msg)) return 'body-field-resolution-failure';
      if (/at least one line item|line item/.test(msg)) return 'line-materialization-failure';
      if (/mandatory|required/.test(msg)) return 'mandatory-field-save-failure';
      if (/bill of materials|bom|revision/.test(msg)) return 'bom-default-mismatch';
      return 'platform-or-form-shape-failure';
    }

    function buildAttemptSummary(label, details) {
      const meta = Object.assign({
        label: label,
        assemblyId: Number(assemblyId || 0),
        bomId: Number(bomId || 0),
        bomRevId: Number(bomRevId || 0),
        locationId: Number(locationId || 0),
        quantity: Number(quantity || 0)
      }, details || {});
      if (meta.bodyFieldSample && meta.bodyFieldSample.length > 25) meta.bodyFieldSample = meta.bodyFieldSample.slice(0, 25);
      return meta;
    }

    function logAttemptChain(title, extra) {
      log.audit({
        title: `${title} [${VERSION}]`,
        details: JSON.stringify(Object.assign({
          assemblyId: Number(assemblyId || 0),
          bomId: Number(bomId || 0),
          bomRevId: Number(bomRevId || 0),
          attemptsTried: attemptHistory
        }, extra || {}))
      });
    }

    function buildWorkOrderDefaultValues() {
      const values = {};
      if (subsidiaryId) values.subsidiary = Number(subsidiaryId);
      if (locationId) values.location = Number(locationId);
      if (assemblyId) {
        values.assemblyitem = Number(assemblyId);
        values.item = Number(assemblyId);
      }
      if (quantity) values.quantity = Number(quantity);
      if (bomId) values.billofmaterials = Number(bomId);
      if (bomRevId) values.billofmaterialsrevision = Number(bomRevId);
      return values;
    }

    function ensureWorkOrderItemLine(wo, bodyFields) {
      const lineCandidates = ['item', 'items'];
      const attempts = [];
      for (let i = 0; i < lineCandidates.length; i++) {
        const sublistId = lineCandidates[i];
        const sublistFields = safeTryReturn(() => wo.getSublistFields({ sublistId })) || [];
        if (!sublistFields.length) continue;
        const itemFieldId = firstExisting(sublistFields, ['item', 'assemblyitem', 'itemid']);
        if (!itemFieldId) continue;
        const qtyFieldId = firstExisting(sublistFields, ['quantity', 'qty']);
        const rateFieldId = firstExisting(sublistFields, ['rate', 'amount']);
        const existingCount = safeTryReturn(() => wo.getLineCount({ sublistId })) || 0;
        const before = inspectManufacturingLineCounts(wo);
        const added = safeTryReturn(() => {
          if (wo.selectNewLine && wo.setCurrentSublistValue && wo.commitLine) {
            wo.selectNewLine({ sublistId });
            wo.setCurrentSublistValue({ sublistId, fieldId: itemFieldId, value: Number(assemblyId) });
            if (qtyFieldId) safeTry(() => wo.setCurrentSublistValue({ sublistId, fieldId: qtyFieldId, value: Number(quantity || 10) }));
            if (locationId && sublistFields.indexOf('location') !== -1) safeTry(() => wo.setCurrentSublistValue({ sublistId, fieldId: 'location', value: Number(locationId) }));
            if (rateFieldId) safeTry(() => wo.setCurrentSublistValue({ sublistId, fieldId: rateFieldId, value: 0 }));
            wo.commitLine({ sublistId });
            return true;
          }

          if (wo.setSublistValue) {
            const line = Number(existingCount || 0);
            wo.setSublistValue({ sublistId, fieldId: itemFieldId, line, value: Number(assemblyId) });
            if (qtyFieldId) safeTry(() => wo.setSublistValue({ sublistId, fieldId: qtyFieldId, line, value: Number(quantity || 10) }));
            if (locationId && sublistFields.indexOf('location') !== -1) safeTry(() => wo.setSublistValue({ sublistId, fieldId: 'location', line, value: Number(locationId) }));
            if (rateFieldId) safeTry(() => wo.setSublistValue({ sublistId, fieldId: rateFieldId, line, value: 0 }));
            return true;
          }

          return false;
        });
        const after = inspectManufacturingLineCounts(wo);
        const beforeCount = Number(before[sublistId] || 0);
        const afterCount = Number(after[sublistId] || 0);
        const materialized = !!added && afterCount > beforeCount;
        const attempt = {
          sublistId,
          itemFieldId,
          qtyFieldId: qtyFieldId || '',
          rateFieldId: rateFieldId || '',
          existingCount: Number(existingCount || 0),
          before,
          after,
          materialized,
          bodyFieldsCount: Array.isArray(bodyFields) ? bodyFields.length : 0,
          mode: wo.selectNewLine && wo.setCurrentSublistValue ? 'dynamic-or-hybrid' : (wo.setSublistValue ? 'standard' : 'unknown')
        };
        attempts.push(attempt);
        if (materialized) {
          log.audit({
            title: `Work Order item-line fallback applied [${VERSION}]`,
            details: JSON.stringify(Object.assign({ assemblyId: Number(assemblyId || 0) }, attempt))
          });
          return { materialized: true, attempts };
        }
        log.audit({
          title: `Work Order item-line fallback did not materialize a line [${VERSION}]`,
          details: JSON.stringify(Object.assign({ assemblyId: Number(assemblyId || 0) }, attempt))
        });
      }
      return { materialized: false, attempts };
    }

    function applyWorkOrderHeaderFields(wo, bodyFields) {
      const resolvedAssemblyFields = [];
      const acceptedHeaderFields = [];
      const candidateFieldStatus = {
        assemblyCandidates: ['assemblyitem', 'item'],
        bomCandidates: ['billofmaterials', 'bom'],
        bomRevisionCandidates: ['billofmaterialsrevision', 'bomrevision', 'revision', 'currentrevision', 'defaultrevision']
      };

      if (safeTryReturn(() => { wo.setValue({ fieldId: 'subsidiary', value: Number(subsidiaryId) }); return true; })) acceptedHeaderFields.push('subsidiary');
      if (locationId && safeTryReturn(() => { wo.setValue({ fieldId: 'location', value: Number(locationId) }); return true; })) acceptedHeaderFields.push('location');

      ['assemblyitem', 'item'].forEach(function (fieldId) {
        if (Array.isArray(bodyFields) && bodyFields.length && bodyFields.indexOf(fieldId) === -1) return;
        const ok = safeTryReturn(() => {
          wo.setValue({ fieldId, value: Number(assemblyId) });
          return true;
        });
        if (ok) {
          resolvedAssemblyFields.push(fieldId);
          acceptedHeaderFields.push(fieldId);
        }
      });

      if (!resolvedAssemblyFields.length) {
        const assemblyField = trySetAnyBodyField(wo, bodyFields, ['assemblyitem', 'item'], Number(assemblyId));
        if (assemblyField) {
          resolvedAssemblyFields.push(assemblyField);
          acceptedHeaderFields.push(assemblyField);
        }
      }
      if (!resolvedAssemblyFields.length) throw new Error(`Work Order: could not set assembly item (assemblyId=${assemblyId})`);

      if (Number.isFinite(Number(bomId)) && Number(bomId) > 0) {
        const resolvedBomField = trySetAnyBodyField(wo, bodyFields, ['billofmaterials', 'bom'], Number(bomId));
        if (resolvedBomField) acceptedHeaderFields.push(resolvedBomField);
      }
      if (Number.isFinite(Number(bomRevId)) && Number(bomRevId) > 0) {
        const resolvedRevisionField = trySetAnyBodyField(wo, bodyFields, ['billofmaterialsrevision', 'bomrevision', 'revision', 'currentrevision', 'defaultrevision'], Number(bomRevId));
        if (resolvedRevisionField) acceptedHeaderFields.push(resolvedRevisionField);
      }

      if (safeTryReturn(() => { wo.setValue({ fieldId: 'quantity', value: Number(quantity || 10) }); return true; })) acceptedHeaderFields.push('quantity');
      if (memo && safeTryReturn(() => { wo.setValue({ fieldId: 'memo', value: String(memo).slice(0, 300) }); return true; })) acceptedHeaderFields.push('memo');

      const start = new Date();
      const end = addMonths(start, 1);
      if (safeTryReturn(() => { wo.setValue({ fieldId: 'startdate', value: start }); return true; })) acceptedHeaderFields.push('startdate');
      if (safeTryReturn(() => { wo.setValue({ fieldId: 'enddate', value: end }); return true; })) acceptedHeaderFields.push('enddate');

      const explodedLinesBeforeFallback = inspectManufacturingLineCounts(wo);
      const itemLineCount = Number(explodedLinesBeforeFallback.item || explodedLinesBeforeFallback.items || 0);
      const itemLineFallback = !itemLineCount ? ensureWorkOrderItemLine(wo, bodyFields) : { materialized: true, attempts: [] };

      return {
        resolvedAssemblyFields,
        resolvedAssemblyValue: safeTryReturn(() => wo.getValue({ fieldId: 'assemblyitem' })) || safeTryReturn(() => wo.getValue({ fieldId: 'item' })) || null,
        explodedLines: inspectManufacturingLineCounts(wo),
        acceptedHeaderFields,
        bodyFieldSample: Array.isArray(bodyFields) ? bodyFields.slice(0, 25) : [],
        itemLineFallback,
        candidateFieldStatus
      };
    }

    function buildWorkOrderRecord(isDynamic, options) {
      const opts = options || {};
      const createArgs = { type: 'workorder', isDynamic: isDynamic !== false };
      if (opts.useDefaultValues) createArgs.defaultValues = buildWorkOrderDefaultValues();
      const wo = record.create(createArgs);
      const bodyFields = safeTryReturn(() => wo.getFields()) || [];
      const resolution = applyWorkOrderHeaderFields(wo, bodyFields);

      log.audit({
        title: `Work Order field resolution [${VERSION}]`,
        details: JSON.stringify({
          assemblyId: Number(assemblyId || 0),
          bomId: Number(bomId || 0),
          bomRevId: Number(bomRevId || 0),
          isDynamic: isDynamic !== false,
          usedDefaultValues: !!opts.useDefaultValues,
          bodyFieldsCount: bodyFields.length,
          bodyFieldSample: resolution.bodyFieldSample,
          resolvedAssemblyFields: resolution.resolvedAssemblyFields,
          resolvedAssemblyValue: resolution.resolvedAssemblyValue,
          explodedLines: resolution.explodedLines,
          acceptedHeaderFields: resolution.acceptedHeaderFields,
          itemLineFallback: resolution.itemLineFallback,
          candidateFieldStatus: resolution.candidateFieldStatus
        })
      });

      return {
        wo,
        diagnostics: {
          isDynamic: isDynamic !== false,
          usedDefaultValues: !!opts.useDefaultValues,
          ignoreMandatoryFields: false,
          bodyFieldsCount: bodyFields.length,
          bodyFieldSample: resolution.bodyFieldSample,
          resolvedAssemblyFields: resolution.resolvedAssemblyFields,
          resolvedAssemblyValue: resolution.resolvedAssemblyValue,
          explodedLines: resolution.explodedLines,
          acceptedHeaderFields: resolution.acceptedHeaderFields,
          itemLineFallback: resolution.itemLineFallback,
          candidateFieldStatus: resolution.candidateFieldStatus
        }
      };
    }

    function saveWorkOrderAttempt(label, isDynamic, ignoreMandatoryFields, options) {
      const opts = options || {};
      let built = null;
      try {
        built = buildWorkOrderRecord(isDynamic, opts);
      } catch (buildErr) {
        const buildMsg = String((buildErr && buildErr.message) || buildErr || '');
        const attempt = buildAttemptSummary(label, {
          isDynamic: isDynamic !== false,
          usedDefaultValues: !!opts.useDefaultValues,
          ignoreMandatoryFields: !!ignoreMandatoryFields,
          status: 'failed_before_save',
          errorMessage: buildMsg,
          failureType: classifyWorkOrderFailure(buildMsg),
          workOrderDefaultValues: opts.useDefaultValues ? buildWorkOrderDefaultValues() : {}
        });
        attemptHistory.push(attempt);
        log.audit({
          title: `Work Order build attempt failed before save [${VERSION}]`,
          details: JSON.stringify(attempt)
        });
        throw buildErr;
      }
      const wo = built.wo;
      const attempt = buildAttemptSummary(label, Object.assign({}, built.diagnostics, { ignoreMandatoryFields: !!ignoreMandatoryFields }));
      attemptHistory.push(attempt);
      log.audit({
        title: `Work Order save attempt started [${VERSION}]`,
        details: JSON.stringify(attempt)
      });
      try {
        const woId = Number(wo.save({ enableSourcing: true, ignoreMandatoryFields: !!ignoreMandatoryFields }));
        attempt.status = 'success';
        attempt.woId = woId;
        log.audit({
          title: `Work Order save attempt succeeded [${VERSION}]`,
          details: JSON.stringify(attempt)
        });
        return woId;
      } catch (e) {
        attempt.status = 'failed';
        attempt.errorMessage = String((e && e.message) || e || '');
        attempt.failureType = classifyWorkOrderFailure(attempt.errorMessage);
        log.audit({
          title: `Work Order save attempt failed [${VERSION}]`,
          details: JSON.stringify(attempt)
        });
        throw e;
      }
    }

    try {
      try {
        const initialId = saveWorkOrderAttempt('initial-dynamic', true, false);
        logAttemptChain('Work Order save chain complete', { finalLabel: 'initial-dynamic', finalStatus: 'success', woId: Number(initialId || 0) });
        return { woId: Number(initialId || 0), saveTelemetry: { status: 'saved', finalLabel: 'initial-dynamic', attemptsTried: attemptHistory.slice(0), errorMessage: '' } };
      } catch (e) {
        const msg = String((e && e.message) || e || '');
        if (!isLineItemFailureMessage(msg)) {
          if (classifyWorkOrderFailure(msg) === 'body-field-resolution-failure') {
            log.audit({
              title: `Work Order retrying after body-field resolution failure with default values [${VERSION}]`,
              details: JSON.stringify({
                assemblyId: Number(assemblyId || 0),
                bomId: Number(bomId || 0),
                bomRevId: Number(bomRevId || 0),
                errorMessage: msg,
                failureType: classifyWorkOrderFailure(msg),
                defaultValues: buildWorkOrderDefaultValues()
              })
            });
            try {
              const bodyFallbackId = saveWorkOrderAttempt('body-field-fallback-dynamic-default-values', true, false, { useDefaultValues: true });
              logAttemptChain('Work Order save chain complete', { finalLabel: 'body-field-fallback-dynamic-default-values', finalStatus: 'success', woId: Number(bodyFallbackId || 0) });
              return { woId: Number(bodyFallbackId || 0), saveTelemetry: { status: 'saved', finalLabel: 'body-field-fallback-dynamic-default-values', attemptsTried: attemptHistory.slice(0), errorMessage: '' } };
            } catch (bodyFallbackErr) {
              const bodyFallbackMsg = String((bodyFallbackErr && bodyFallbackErr.message) || bodyFallbackErr || '');
              if (!isLineItemFailureMessage(bodyFallbackMsg)) throw bodyFallbackErr;
            }
          } else {
            throw e;
          }
        }

        log.audit({
          title: `Work Order save retrying after BOM default repair [${VERSION}]`,
          details: JSON.stringify({
            assemblyId: Number(assemblyId || 0),
            bomId: Number(bomId || 0),
            bomRevId: Number(bomRevId || 0),
            errorMessage: msg,
            failureType: classifyWorkOrderFailure(msg)
          })
        });

        attachBomToAssembly({
          assemblyId,
          bomId,
          bomRevId,
          locationId,
          forceDefaultRepair: true
        });

        try {
          const retryId = saveWorkOrderAttempt('post-bom-default-repair-dynamic', true, false);
          logAttemptChain('Work Order save chain complete', { finalLabel: 'post-bom-default-repair-dynamic', finalStatus: 'success', woId: Number(retryId || 0) });
          return { woId: Number(retryId || 0), saveTelemetry: { status: 'saved', finalLabel: 'post-bom-default-repair-dynamic', attemptsTried: attemptHistory.slice(0), errorMessage: '' } };
        } catch (retryErr) {
          const retryMsg = String((retryErr && retryErr.message) || retryErr || '');
          if (!isLineItemFailureMessage(retryMsg)) throw retryErr;
          log.audit({
            title: `Work Order save retrying in standard mode [${VERSION}]`,
            details: JSON.stringify({
              assemblyId: Number(assemblyId || 0),
              bomId: Number(bomId || 0),
              bomRevId: Number(bomRevId || 0),
              errorMessage: retryMsg,
              failureType: classifyWorkOrderFailure(retryMsg)
            })
          });
          try {
            const standardId = saveWorkOrderAttempt('post-bom-default-repair-standard', false, false);
            logAttemptChain('Work Order save chain complete', { finalLabel: 'post-bom-default-repair-standard', finalStatus: 'success', woId: Number(standardId || 0) });
            return { woId: Number(standardId || 0), saveTelemetry: { status: 'saved', finalLabel: 'post-bom-default-repair-standard', attemptsTried: attemptHistory.slice(0), errorMessage: '' } };
          } catch (standardErr) {
            const standardMsg = String((standardErr && standardErr.message) || standardErr || '');
            if (!isLineItemFailureMessage(standardMsg)) throw standardErr;
            log.audit({
              title: `Work Order save retrying with default values [${VERSION}]`,
              details: JSON.stringify({
                assemblyId: Number(assemblyId || 0),
                bomId: Number(bomId || 0),
                bomRevId: Number(bomRevId || 0),
                errorMessage: standardMsg,
                failureType: classifyWorkOrderFailure(standardMsg)
              })
            });
            try {
              const defaultDynamicId = saveWorkOrderAttempt('post-bom-default-repair-dynamic-default-values', true, false, { useDefaultValues: true });
              logAttemptChain('Work Order save chain complete', { finalLabel: 'post-bom-default-repair-dynamic-default-values', finalStatus: 'success', woId: Number(defaultDynamicId || 0) });
              return { woId: Number(defaultDynamicId || 0), saveTelemetry: { status: 'saved', finalLabel: 'post-bom-default-repair-dynamic-default-values', attemptsTried: attemptHistory.slice(0), errorMessage: '' } };
            } catch (defaultDynamicErr) {
              const defaultDynamicMsg = String((defaultDynamicErr && defaultDynamicErr.message) || defaultDynamicErr || '');
              if (!isLineItemFailureMessage(defaultDynamicMsg)) throw defaultDynamicErr;
              const defaultStandardId = saveWorkOrderAttempt('post-bom-default-repair-standard-default-values', false, true, { useDefaultValues: true });
              logAttemptChain('Work Order save chain complete', { finalLabel: 'post-bom-default-repair-standard-default-values', finalStatus: 'success', woId: Number(defaultStandardId || 0) });
              return { woId: Number(defaultStandardId || 0), saveTelemetry: { status: 'saved', finalLabel: 'post-bom-default-repair-standard-default-values', attemptsTried: attemptHistory.slice(0), errorMessage: '' } };
            }
          }
        }
      }
    } catch (finalErr) {
      const finalMsg = String((finalErr && finalErr.message) || finalErr || '');
      logAttemptChain('Work Order save chain exhausted', {
        finalStatus: 'failed',
        finalErrorMessage: finalMsg,
        finalFailureType: classifyWorkOrderFailure(finalMsg)
      });
      finalErr.workOrderDiagnostics = {
        status: 'failed',
        finalLabel: attemptHistory.length ? String(attemptHistory[attemptHistory.length - 1].label || '') : '',
        attemptsTried: attemptHistory.slice(0),
        errorMessage: finalMsg,
        failureType: classifyWorkOrderFailure(finalMsg)
      };
      throw finalErr;
    }
  }

  // ----------------------------
  // Demo record mode resolution
  // ----------------------------
  function ensureDemoRecords({ subsidiaryId, locationId, createNewHeroItem, enableManufacturing: finalEnableManufacturing, extId, prospect, passedHeroItemId, runUniqueSuffix }) {
    const heroItem = createNewHeroItem
      ? getOrCreateFreshHeroItem({ subsidiaryId, locationId, extId, prospect, passedHeroItemId, runUniqueSuffix })
      : getExistingHeroItem();

    log.audit({
      title: `Resolved hero + manufacturing layer [${VERSION}]`,
      details: JSON.stringify({
        createNewHeroItem,
        heroItemId: Number(heroItem.id || 0),
        heroItemExternalId: heroItem.externalId || '',
        finalEnableManufacturing,
        manufacturingTargetMode: deriveManufacturingTargetMode(finalEnableManufacturing, !!createNewHeroItem)
      })
    });

    if (!finalEnableManufacturing) {
      return {
        heroItemId: heroItem.id,
        heroItemExternalId: heroItem.externalId,
        heroItemCsvKey: heroItem.csvKey,
        comp1Id: null,
        comp2Id: null,
        comp3Id: null,
        assemblyId: null,
        bomId: null,
        bomRevId: null
      };
    }

    const mfg = ensureManufacturingAnchors({ subsidiaryId, locationId, heroItemId: heroItem.id });
    mfg.heroItemExternalId = heroItem.externalId;
    mfg.heroItemCsvKey = heroItem.csvKey;
    return mfg;
  }

  function inferFreshHeroItemIdByExt(extId) {
    const token = String(extId || '').replace(/^SCAI_SO_/, '').trim();
    if (!token) return null;
    const externalId = `SCAI_HERO_${token}`;
    return safeTryReturn(() => findByExternalId('inventoryitem', externalId)) || null;
  }

  function getExistingHeroItem() {
    const id = mustFindByExternalId('inventoryitem', ANCHORS.heroItem);
    return {
      id: Number(id),
      externalId: ANCHORS.heroItem,
      csvKey: ANCHORS.heroItem
    };
  }

  function getOrCreateFreshHeroItem({ subsidiaryId, locationId, extId, prospect, passedHeroItemId, runUniqueSuffix }) {
    if (passedHeroItemId) {
      const adopted = adoptFreshHeroItem({ itemId: Number(passedHeroItemId), subsidiaryId, locationId, extId, prospect, runUniqueSuffix });
      log.audit({
        title: `Runner hero mode [${VERSION}]`,
        details: JSON.stringify({
          createNewHeroItem: true,
          passedHeroItemId: Number(passedHeroItemId),
          chosenHeroItemId: adopted.id,
          source: 'passed-from-suitelet'
        })
      });
      return adopted;
    }

    const created = createFreshHeroItem({ subsidiaryId, locationId, extId, prospect, runUniqueSuffix });
    log.audit({
      title: `Runner hero mode [${VERSION}]`,
      details: JSON.stringify({
        createNewHeroItem: true,
        passedHeroItemId: null,
        chosenHeroItemId: created.id,
        source: 'runner-created'
      })
    });
    return created;
  }

  function adoptFreshHeroItem({ itemId, subsidiaryId, locationId, extId, prospect, runUniqueSuffix }) {
    const anchorHeroId = mustFindByExternalId('inventoryitem', ANCHORS.heroItem);
    const externalId = buildUniqueExternalId('SCAI_HERO', extId || itemId, runUniqueSuffix);
    const differentiated = buildDifferentiatedNames(prospect || 'Demo Hero', extId, runUniqueSuffix);

    safeTry(() => record.submitFields({
      type: 'inventoryitem',
      id: Number(itemId),
      values: {
        externalid: externalId,
        itemid: differentiated.itemIdName,
        displayname: differentiated.displayName
      },
      options: { enableSourcing: true, ignoreMandatoryFields: true }
    }));

    const persistence = applyFreshHeroPersistence({
      itemId: Number(itemId),
      anchorHeroId: Number(anchorHeroId),
      subsidiaryId,
      locationId
    });

    log.audit({
      title: `Fresh HERO item adopted [${VERSION}]`,
      details: JSON.stringify({
        id: Number(itemId),
        externalId,
        itemid: differentiated.itemIdName,
        displayname: differentiated.displayName,
        namingSuffix: differentiated.suffix,
        namingCollisionAvoidance: 'extid-suffix',
        anchorHeroId: Number(anchorHeroId),
        preferredVendorOk: !!persistence.preferredVendorOk,
        planningAutoCalcOff: !!persistence.planningAutoCalcOff,
        locationPlanningCopied: !!persistence.locationPlanningCopied,
        bodyPlanningFieldsOff: persistence.bodyPlanningFieldsOff || [],
        vendorSublistUsed: persistence.vendorSublistUsed || '',
        vendorId: Number(persistence.vendorId || 0),
        subsidiaryId: Number(subsidiaryId || 0),
        locationId: Number(locationId || 0)
      })
    });

    return { id: Number(itemId), externalId, csvKey: externalId };
  }

  function createFreshHeroItem({ subsidiaryId, locationId, extId, prospect, runUniqueSuffix }) {
    const anchorHeroId = mustFindByExternalId('inventoryitem', ANCHORS.heroItem);
    const externalId = buildUniqueExternalId('SCAI_HERO', extId || new Date().getTime(), runUniqueSuffix);
    const differentiated = buildDifferentiatedNames(prospect || 'Demo Hero', extId, runUniqueSuffix);
    const createdResult = saveFreshHeroItemWithFallbacks({
      anchorHeroId,
      externalId,
      differentiated,
      subsidiaryId
    });
    const id = Number(createdResult.id);

    const persistence = applyFreshHeroPersistence({
      itemId: id,
      anchorHeroId: Number(anchorHeroId),
      subsidiaryId,
      locationId
    });

    log.audit({
      title: `Fresh HERO item created [${VERSION}]`,
      details: JSON.stringify({
        id,
        externalId,
        itemid: differentiated.itemIdName,
        displayname: differentiated.displayName,
        namingSuffix: differentiated.suffix,
        namingCollisionAvoidance: 'extid-suffix',
        anchorHeroId: Number(anchorHeroId),
        clonedFromAnchor: !!createdResult.clonedFromAnchor,
        saveStrategy: createdResult.strategy || '',
        preferredVendorOk: !!persistence.preferredVendorOk,
        planningAutoCalcOff: !!persistence.planningAutoCalcOff,
        locationPlanningCopied: !!persistence.locationPlanningCopied,
        bodyPlanningFieldsOff: persistence.bodyPlanningFieldsOff || [],
        vendorSublistUsed: persistence.vendorSublistUsed || '',
        vendorId: Number(persistence.vendorId || 0)
      })
    });

    return { id, externalId, csvKey: externalId };
  }

  function saveFreshHeroItemWithFallbacks({ anchorHeroId, externalId, differentiated, subsidiaryId }) {
    const attempts = [
      { strategy: 'copy-anchor-subsidiary-array', copyAnchor: true, subsidiaryMode: 'array' },
      { strategy: 'copy-anchor-subsidiary-scalar', copyAnchor: true, subsidiaryMode: 'scalar' },
      { strategy: 'scratch-subsidiary-array', copyAnchor: false, subsidiaryMode: 'array' },
      { strategy: 'scratch-subsidiary-scalar', copyAnchor: false, subsidiaryMode: 'scalar' },
      { strategy: 'scratch-no-subsidiary', copyAnchor: false, subsidiaryMode: 'none' }
    ];
    const failures = [];
    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      try {
        const rec = attempt.copyAnchor
          ? record.copy({ type: 'inventoryitem', id: Number(anchorHeroId), isDynamic: false })
          : record.create({ type: 'inventoryitem', isDynamic: false });
        rec.setValue({ fieldId: 'externalid', value: externalId });
        rec.setValue({ fieldId: 'itemid', value: differentiated.itemIdName });
        safeTry(() => rec.setValue({ fieldId: 'displayname', value: differentiated.displayName }));
        // Do not force a body location while creating the fresh item. Some accounts
        // restrict locations by subsidiary, and the copied anchor can carry a body
        // location that is invalid for the target subsidiary. Location planning is
        // copied separately after save.
        safeTry(() => rec.setValue({ fieldId: 'location', value: '' }));
        if (attempt.subsidiaryMode === 'array') {
          rec.setValue({ fieldId: 'subsidiary', value: [Number(subsidiaryId)] });
        } else if (attempt.subsidiaryMode === 'scalar') {
          rec.setValue({ fieldId: 'subsidiary', value: Number(subsidiaryId) });
        }
        const id = Number(rec.save({ enableSourcing: true, ignoreMandatoryFields: true }));
        log.audit({
          title: `Fresh HERO save strategy [${VERSION}]`,
          details: JSON.stringify({ strategy: attempt.strategy, id, failures })
        });
        return { id, clonedFromAnchor: !!attempt.copyAnchor, strategy: attempt.strategy };
      } catch (e) {
        failures.push({
          strategy: attempt.strategy,
          name: String(e && (e.name || e.id) || ''),
          message: String(e && e.message || e || '').slice(0, 360)
        });
      }
    }
    throw new Error(`Fresh hero item create failed after subsidiary/location fallbacks: ${JSON.stringify(failures)}`);
  }


  function applyFreshHeroPersistence({ itemId, anchorHeroId, subsidiaryId, locationId }) {
    const vendorId = mustFindByExternalId('vendor', ANCHORS.vendor);
    const locationPlanningCopied = !!safeTryReturn(() => cloneItemLocationPlanning({ sourceItemId: Number(anchorHeroId), targetItemId: Number(itemId), locationId: Number(locationId || 0) }));

    // Reuse the same proven hero path used by the anchor item instead of maintaining
    // a separate fresh-hero planning/off logic branch.
    forcePlanningAutoCalcOffForItems({
      vendorId: Number(vendorId),
      heroItemId: Number(itemId),
      compIds: []
    });

    const preferredVendorOk = ensurePreferredVendorOnItem({ itemId: Number(itemId), vendorId: Number(vendorId), subsidiaryId: Number(subsidiaryId || 0) });
    const validation = validateFreshHeroPersistence({ itemId: Number(itemId), vendorId: Number(vendorId), locationId: Number(locationId || 0) });
    const planningPersistedOff = HERO_AUTOCALC_FIELDS.every(fid => validation.planningFlags[fid] === false || validation.planningFlags[fid] === 'F' || validation.planningFlags[fid] === null);

    log.audit({
      title: `Fresh HERO shared planning path [${VERSION}]`,
      details: JSON.stringify({
        itemId: Number(itemId),
        anchorHeroId: Number(anchorHeroId),
        vendorId: Number(vendorId),
        preferredVendorOk: !!preferredVendorOk,
        planningPersistedOff,
        locationPlanningCopied: !!locationPlanningCopied,
        validation
      })
    });

    return {
      vendorId: Number(vendorId),
      preferredVendorOk: !!preferredVendorOk,
      planningAutoCalcOff: !!planningPersistedOff,
      bodyPlanningFieldsOff: planningPersistedOff ? HERO_AUTOCALC_FIELDS.slice() : [],
      locationPlanningCopied: !!locationPlanningCopied,
      vendorSublistUsed: validation.vendorSublistUsed || ''
    };
  }

  function applyGeneratedInventoryItemSetupPersistence({ itemId, anchorHeroId, subsidiaryId, locationId, role }) {
    const vendorId = mustFindByExternalId('vendor', ANCHORS.vendor);
    const setupFields = HERO_AUTOCALC_FIELDS.concat(COMPONENT_AUTOCALC_FIELDS).filter((fid, index, list) => list.indexOf(fid) === index);
    const bodyLocationOk = locationId ? !!safeTryReturn(() => {
      record.submitFields({
        type: 'inventoryitem',
        id: Number(itemId),
        values: { location: Number(locationId) },
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      });
      return true;
    }) : false;
    const locationPlanningCopied = !!safeTryReturn(() => cloneItemLocationPlanning({
      sourceItemId: Number(anchorHeroId || itemId),
      targetItemId: Number(itemId),
      locationId: Number(locationId || 0)
    }));
    const planningAutoCalcOffResult = submitFalseFields('inventoryitem', Number(itemId), setupFields, `Generated ${role || 'item'} planning auto-calc off`);
    const planningAutoCalcOff = setupFields.every(fid => planningAutoCalcOffResult.fieldsSetFalse.indexOf(fid) !== -1);
    const preferredVendorOk = ensurePreferredVendorOnItem({ itemId: Number(itemId), vendorId: Number(vendorId), subsidiaryId: Number(subsidiaryId || 0) });
    const validation = validateFreshHeroPersistence({ itemId: Number(itemId), vendorId: Number(vendorId), locationId: Number(locationId || 0) });
    const setupOk = !!planningAutoCalcOff && !!preferredVendorOk;
    const diagnostics = {
      schema: 'forge.w424.generated-inventory-item-setup-diagnostics.v1',
      status: setupOk ? 'setup_persisted' : 'setup_needs_review',
      setupOk,
      itemId: Number(itemId),
      role: role || '',
      vendorId: Number(vendorId),
      bodyLocationOk,
      locationPlanningCopied,
      planningAutoCalcOff: !!planningAutoCalcOff,
      planningAutoCalcFields: planningAutoCalcOffResult,
      preferredVendorOk: !!preferredVendorOk,
      validation
    };
    log.audit({
      title: `IDB generated inventory item setup diagnostics [${VERSION}]`,
      details: JSON.stringify(diagnostics)
    });
    return diagnostics;
  }

  function ensurePreferredVendorOnItem({ itemId, vendorId, subsidiaryId }) {
    safeTry(() => record.submitFields({
      type: 'inventoryitem',
      id: Number(itemId),
      values: { preferredvendor: Number(vendorId) },
      options: { enableSourcing: true, ignoreMandatoryFields: true }
    }));

    const rec = record.load({ type: 'inventoryitem', id: Number(itemId), isDynamic: true });
    const sublistCandidates = ['itemvendor', 'vendors', 'vendor'];
    const vendorFieldCandidates = ['vendor', 'entity', 'vendorname'];
    const preferredFieldCandidates = ['preferredvendor', 'preferred', 'ispreferred'];
    const subsidiaryFieldCandidates = ['subsidiary', 'vendorsubsidiary'];

    let usedSublist = '';
    for (let s = 0; s < sublistCandidates.length; s++) {
      const sublistId = sublistCandidates[s];
      const lineCount = safeTryReturn(() => rec.getLineCount({ sublistId }));
      if (lineCount === null) continue;

      let vendorField = '';
      vendorFieldCandidates.forEach(fid => {
        if (vendorField) return;
        const ok = safeTryReturn(() => {
          if ((lineCount || 0) > 0) rec.getSublistValue({ sublistId, fieldId: fid, line: 0 });
          return true;
        });
        if (ok || (lineCount || 0) === 0) vendorField = fid;
      });
      if (!vendorField) continue;

      let preferredField = '';
      preferredFieldCandidates.forEach(fid => {
        if (preferredField) return;
        const ok = safeTryReturn(() => {
          if ((lineCount || 0) > 0) rec.getSublistValue({ sublistId, fieldId: fid, line: 0 });
          return true;
        });
        if (ok || (lineCount || 0) === 0) preferredField = fid;
      });

      let matchLine = -1;
      for (let i = 0; i < (lineCount || 0); i++) {
        const v = String(safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: vendorField, line: i })) || '');
        if (v === String(vendorId)) { matchLine = i; break; }
      }

      if (matchLine >= 0) {
        safeTry(() => rec.selectLine({ sublistId, line: matchLine }));
      } else {
        const newLineOk = safeTryReturn(() => { rec.selectNewLine({ sublistId }); return true; });
        if (!newLineOk) continue;
        safeTry(() => rec.setCurrentSublistValue({ sublistId, fieldId: vendorField, value: Number(vendorId) }));
      }

      if (preferredField) safeTry(() => rec.setCurrentSublistValue({ sublistId, fieldId: preferredField, value: true }));
      subsidiaryFieldCandidates.forEach(fid => {
        if (!subsidiaryId) return;
        safeTry(() => rec.setCurrentSublistValue({ sublistId, fieldId: fid, value: Number(subsidiaryId) }));
      });
      safeTry(() => rec.commitLine({ sublistId }));
      safeTry(() => rec.save({ enableSourcing: true, ignoreMandatoryFields: true }));
      usedSublist = sublistId;
      break;
    }

    return !!usedSublist;
  }

  function validateFreshHeroPersistence({ itemId, vendorId, locationId }) {
    const rec = record.load({ type: 'inventoryitem', id: Number(itemId), isDynamic: false });
    const planningFlags = {};
    HERO_AUTOCALC_FIELDS.forEach(fid => {
      planningFlags[fid] = safeTryReturn(() => rec.getValue({ fieldId: fid }));
    });

    const sublistCandidates = ['itemvendor', 'vendors', 'vendor'];
    let preferredVendorFound = false;
    let vendorSublistUsed = '';
    sublistCandidates.forEach(sublistId => {
      if (preferredVendorFound) return;
      const count = safeTryReturn(() => rec.getLineCount({ sublistId }));
      if (!count) return;
      const vendorField = ['vendor', 'entity', 'vendorname'].find(fid => safeTryReturn(() => { rec.getSublistValue({ sublistId, fieldId: fid, line: 0 }); return true; }));
      const prefField = ['preferredvendor', 'preferred', 'ispreferred'].find(fid => safeTryReturn(() => { rec.getSublistValue({ sublistId, fieldId: fid, line: 0 }); return true; }));
      if (!vendorField) return;
      for (let i = 0; i < count; i++) {
        const v = String(safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: vendorField, line: i })) || '');
        const p = prefField ? !!safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: prefField, line: i })) : false;
        if (v === String(vendorId) && (p || !prefField)) {
          preferredVendorFound = true;
          vendorSublistUsed = sublistId;
          break;
        }
      }
    });

    return {
      preferredVendorFound,
      vendorSublistUsed,
      planningFlags,
      locationId: Number(locationId || 0)
    };
  }

  function cloneItemLocationPlanning({ sourceItemId, targetItemId, locationId }) {
    if (!locationId) return false;

    const locationSublistFields = [
      'preferredstocklevel',
      'reorderpoint',
      'leadtime',
      'safetystocklevel',
      'supplylotsizingmethod',
      'fixedlotsize',
      'supplytimefence',
      'demandtimefence'
    ];

    const itemLocationFieldGroups = [
      { label: 'preferredstocklevel', source: ['preferredstocklevel'], target: ['preferredstocklevel'] },
      { label: 'reorderpoint', source: ['reorderpoint'], target: ['reorderpoint'] },
      { label: 'safetystocklevel', source: ['safetystocklevel'], target: ['safetystocklevel'] },
      { label: 'purchaseleadtime', source: ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays'], target: ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays'] },
      { label: 'leadtimeoffset', source: ['leadtimeoffset'], target: ['leadtimeoffset'] },
      { label: 'periodsofsupplytype', source: ['periodsofsupplytype'], target: ['periodsofsupplytype'] },
      { label: 'demandsource', source: ['demandsource'], target: ['demandsource'] },
      { label: 'supplytype', source: ['supplytype'], target: ['supplytype'] },
      { label: 'fixedlotmultiple', source: ['fixedlotmultiple'], target: ['fixedlotmultiple'] },
      { label: 'fixedlotsize', source: ['fixedlotsize'], target: ['fixedlotsize'] },
      { label: 'minimumorderquantity', source: ['minimumorderquantity'], target: ['minimumorderquantity'] },
      { label: 'supplylotsizingmethod', source: ['supplylotsizingmethod'], target: ['supplylotsizingmethod'] },
      { label: 'periodsofsupplyincrement', source: ['periodsofsupplyincrement'], target: ['periodsofsupplyincrement'] }
    ];

    function firstReadableValue(rec, fieldIds) {
      for (let i = 0; i < fieldIds.length; i++) {
        const fid = fieldIds[i];
        const val = safeTryReturn(() => rec.getValue({ fieldId: fid }));
        if (typeof val !== 'undefined' && val !== null && val !== '') return { fieldId: fid, value: val };
      }
      return null;
    }

    function firstReadableSublistValue(rec, sublistId, line, fieldIds) {
      for (let i = 0; i < fieldIds.length; i++) {
        const fid = fieldIds[i];
        const val = safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: fid, line: line }));
        if (typeof val !== 'undefined' && val !== null && val !== '') return { fieldId: fid, value: val };
      }
      return null;
    }

    function firstWritableField(rec, fieldIds, value) {
      for (let i = 0; i < fieldIds.length; i++) {
        const fid = fieldIds[i];
        const ok = safeTryReturn(() => {
          rec.setValue({ fieldId: fid, value: value });
          return true;
        });
        if (ok) return fid;
      }
      return null;
    }

    function collectReadableFieldTrace(rec, fieldIds) {
      const out = [];
      (fieldIds || []).forEach(fid => {
        const val = safeTryReturn(() => rec.getValue({ fieldId: fid }));
        if (typeof val !== 'undefined' && val !== null && val !== '') out.push({ fieldId: fid, value: val });
      });
      return out;
    }

    function collectReadableSublistTrace(rec, sublistId, line, fieldIds) {
      const out = [];
      (fieldIds || []).forEach(fid => {
        const val = safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: fid, line }));
        if (typeof val !== 'undefined' && val !== null && val !== '') out.push({ fieldId: fid, value: val, line });
      });
      return out;
    }

    let copied = [];
    let validation = [];
    let locationSublistCopied = false;

    // Pass 1: copy from the item Locations sublist when available
    const source = safeTryReturn(() => record.load({ type: 'inventoryitem', id: Number(sourceItemId), isDynamic: false }));
    const target = safeTryReturn(() => record.load({ type: 'inventoryitem', id: Number(targetItemId), isDynamic: false }));
    const sublistId = 'locations';
    if (source && target) {
      const sourceCount = safeTryReturn(() => source.getLineCount({ sublistId })) || 0;
      const targetCount = safeTryReturn(() => target.getLineCount({ sublistId })) || 0;

      function findLine(rec, count) {
        for (let i = 0; i < count; i++) {
          const locVal = String(safeTryReturn(() => rec.getSublistValue({ sublistId, fieldId: 'location', line: i })) || '');
          if (locVal === String(locationId)) return i;
        }
        return -1;
      }

      const srcLine = findLine(source, sourceCount);
      const tgtLine = findLine(target, targetCount);
      if (srcLine >= 0 && tgtLine >= 0) {
        locationSublistFields.forEach(fid => {
          const val = safeTryReturn(() => source.getSublistValue({ sublistId, fieldId: fid, line: srcLine }));
          if (typeof val === 'undefined' || val === null || val === '') return;
          const ok = safeTryReturn(() => {
            target.setSublistValue({ sublistId, fieldId: fid, line: tgtLine, value: val });
            return true;
          });
          if (ok) copied.push({ source: 'locations-sublist', fieldId: fid, value: val });
        });
        safeTry(() => target.save({ enableSourcing: true, ignoreMandatoryFields: true }));
        locationSublistCopied = copied.length > 0;
      }
    }

    // Pass 2: clone Item Location Configuration fields using alias-aware field groups.
    let itemLocationConfigCopied = false;
    let itemLocationConfigId = null;
    const configTypeCandidates = ['itemlocationconfiguration'];
    configTypeCandidates.forEach(cfgType => {
      if (itemLocationConfigCopied) return;
      const sourceConfigId = safeTryReturn(() => findItemLocationConfigId(cfgType, Number(sourceItemId), Number(locationId)));
      if (!sourceConfigId) return;
      const sourceCfg = safeTryReturn(() => record.load({ type: cfgType, id: Number(sourceConfigId), isDynamic: false }));
      if (!sourceCfg) return;

      const targetConfigId = safeTryReturn(() => findItemLocationConfigId(cfgType, Number(targetItemId), Number(locationId)));
      let targetCfg = targetConfigId
        ? safeTryReturn(() => record.load({ type: cfgType, id: Number(targetConfigId), isDynamic: false }))
        : safeTryReturn(() => record.create({ type: cfgType, isDynamic: false }));
      if (!targetCfg) return;

      safeTry(() => targetCfg.setValue({ fieldId: 'item', value: Number(targetItemId) }));
      safeTry(() => targetCfg.setValue({ fieldId: 'location', value: Number(locationId) }));
      safeTry(() => targetCfg.setValue({ fieldId: 'subsidiary', value: Number(safeTryReturn(() => sourceCfg.getValue({ fieldId: 'subsidiary' })) || 0) }));

      itemLocationFieldGroups.forEach(group => {
        const read = firstReadableValue(sourceCfg, group.source);
        if (!read) return;
        const exactTargets = [read.fieldId].concat(group.target || []);
        const wroteField = firstWritableField(targetCfg, exactTargets, read.value);
        if (wroteField) copied.push({ source: cfgType, label: group.label, fieldId: wroteField, value: read.value, sourceFieldId: read.fieldId });
      });

      // Purchase lead time can live in several places depending on account setup.
      // Try config first, then locations sublist, then body field, then vendor sublist.
      const existingLeadTime = firstReadableValue(targetCfg, ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays']);
      if (!existingLeadTime) {
        let leadTimeRead = null;

        if (!leadTimeRead && source && typeof srcLine !== 'undefined' && srcLine >= 0) {
          leadTimeRead = firstReadableSublistValue(source, sublistId, srcLine, ['leadtime', 'purchaseleadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays']);
          if (leadTimeRead) leadTimeRead.source = 'locations-sublist-fallback';
        }

        if (!leadTimeRead && source) {
          leadTimeRead = firstReadableValue(source, ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays']);
          if (leadTimeRead) leadTimeRead.source = 'item-body-fallback';
        }

        if (!leadTimeRead && source) {
          const vendorSublistId = 'itemvendor';
          const vendorCount = safeTryReturn(() => source.getLineCount({ sublistId: vendorSublistId })) || 0;
          for (let i = 0; i < vendorCount && !leadTimeRead; i++) {
            leadTimeRead = firstReadableSublistValue(source, vendorSublistId, i, ['leadtime', 'purchaseleadtime', 'vendorleadtime', 'purchasedleadtime', 'leadtimedays']);
            if (leadTimeRead) {
              leadTimeRead.source = 'vendor-sublist-fallback';
              leadTimeRead.vendorLine = i;
            }
          }
        }

        if (leadTimeRead) {
          const wroteLeadTimeField = firstWritableField(targetCfg, [leadTimeRead.fieldId, 'purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays'], leadTimeRead.value);
          if (wroteLeadTimeField) {
            copied.push({
              source: leadTimeRead.source || 'unknown-fallback',
              label: 'purchaseleadtime',
              fieldId: wroteLeadTimeField,
              value: leadTimeRead.value,
              sourceFieldId: leadTimeRead.fieldId,
              vendorLine: leadTimeRead.vendorLine
            });
          }
        } else {
          const leadtimeCandidates = {
            itemLocationConfiguration: collectReadableFieldTrace(sourceCfg, ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays', 'leadtimeoffset']),
            locationsSublist: (source && typeof srcLine !== 'undefined' && srcLine >= 0)
              ? collectReadableSublistTrace(source, sublistId, srcLine, ['leadtime', 'purchaseleadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays', 'leadtimeoffset'])
              : [],
            itemBody: source ? collectReadableFieldTrace(source, ['purchaseleadtime', 'leadtime', 'purchasedleadtime', 'leadtimedays', 'purchaseleadtimedays', 'leadtimeoffset']) : [],
            vendorSublist: []
          };

          if (source) {
            const vendorSublistId = 'itemvendor';
            const vendorCount = safeTryReturn(() => source.getLineCount({ sublistId: vendorSublistId })) || 0;
            for (let i = 0; i < vendorCount; i++) {
              const rows = collectReadableSublistTrace(source, vendorSublistId, i, ['leadtime', 'purchaseleadtime', 'vendorleadtime', 'purchasedleadtime', 'leadtimedays']);
              rows.forEach(r => leadtimeCandidates.vendorSublist.push(r));
            }
          }

          validation.push({
            source: 'leadtime-trace',
            label: 'purchaseleadtime',
            fieldId: 'not-found',
            value: '',
            sourceFieldId: '',
            candidates: leadtimeCandidates
          });
        }
      }

      const saved = safeTryReturn(() => Number(targetCfg.save({ enableSourcing: true, ignoreMandatoryFields: true })));
      if (saved) {
        itemLocationConfigCopied = true;
        itemLocationConfigId = saved;
        const reloaded = safeTryReturn(() => record.load({ type: cfgType, id: Number(saved), isDynamic: false }));
        if (reloaded) {
          itemLocationFieldGroups.forEach(group => {
            const read = firstReadableValue(reloaded, group.target);
            if (read) validation.push({ label: group.label, fieldId: read.fieldId, value: read.value });
          });
        }
      }
    });

    log.audit({
      title: `Fresh HERO location planning cloned [${VERSION}]`,
      details: JSON.stringify({
        sourceItemId: Number(sourceItemId),
        targetItemId: Number(targetItemId),
        locationId: Number(locationId),
        locationSublistCopied,
        itemLocationConfigCopied,
        itemLocationConfigId,
        copied,
        validation
      })
    });

    return copied.some(item => item && item.source !== 'leadtime-trace') || !!locationSublistCopied || !!itemLocationConfigCopied;
  }

  function findItemLocationConfigId(recordType, itemId, locationId) {
    const results = search.create({
      type: recordType,
      filters: [
        ['item', 'anyof', String(itemId)], 'and',
        ['location', 'anyof', String(locationId)]
      ],
      columns: ['internalid']
    }).run().getRange({ start: 0, end: 1 });
    return results && results.length ? Number(results[0].getValue({ name: 'internalid' })) : null;
  }

  function safeCode(s) {
    return String(s || '').replace(/[^A-Za-z0-9_\-]/g, '_').slice(0, 40);
  }

  function buildRunUniquenessToken(extId) {
    const base = shortExtSuffix(extId);
    const timePart = Date.now().toString(36).toUpperCase().slice(-6);
    const randomPart = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, '0');
    return safeCode(`${base}-${timePart}-${randomPart}`).slice(0, 20);
  }

  function buildUniqueExternalId(prefix, extId, runUniqueSuffix) {
    const cleanPrefix = safeCode(prefix || 'IDB_ITEM').slice(0, 16) || 'IDB_ITEM';
    const cleanBase = safeCode(extId || 'RUN').slice(0, 22) || 'RUN';
    const cleanSuffix = safeCode(runUniqueSuffix || buildRunUniquenessToken(extId)).slice(0, 20);
    return `${cleanPrefix}_${cleanBase}_${cleanSuffix}`.slice(0, 60);
  }

  function buildUniqueRecordName(baseName, runUniqueSuffix, maxLen) {
    const suffix = customerFacingRunSuffixW432(runUniqueSuffix || '').slice(0, 20);
    const base = String(baseName || 'Demo Item').replace(/^SCAI\s*-\s*/i, '').trim() || 'Demo Item';
    if (!suffix) return trimLen(base, maxLen || 83);
    const marker = ` - ${suffix}`;
    const limit = Number(maxLen || 83);
    return `${trimLen(base, Math.max(1, limit - marker.length))}${marker}`;
  }

  function stripInternalRunSuffixW441(name) {
    return visibleProductAccentPolishW439(String(name || '')
      .replace(/^SCAI\s*-\s*/i, '')
      .replace(/\s+-\s+(?:SNACKS|BEVERAGE|FOOD(?:MANUFACTURING|[-_][A-Z]+)*|FOOD_BEVERAGE)-[A-Z0-9]+(?:-[A-Z0-9]+)*\s+-\s+RUN\b/ig, '')
      .replace(/\s+-\s+[A-Z0-9]{5,}(?:-[A-Z0-9]{2,})+\s+-\s+RUN\b/ig, '')
      .replace(/\s+-\s+(?:SNACKS|BEVERAGE|FOOD(?:MANUFACTURING|[-_][A-Z]+)*|FOOD_BEVERAGE)-[A-Z0-9]+(?:-[A-Z0-9]+)*$/ig, '')
      .replace(/\s+-\s+RUN\b/ig, '')
      .replace(/\s{2,}/g, ' ')
      .trim());
  }

  function cleanCustomerFacingCreatedNameW441(name, role, productBuildPlan, mode) {
    const plan = productBuildPlan || {};
    const roleKey = String(role || '').toLowerCase();
    const isManufacturing = mode === 'manufacturing' || mode === 'wip';
    if (/hero|sellable|product/.test(roleKey)) return stripInternalRunSuffixW441(isManufacturing ? (plan.distributionItemName || name) : (plan.distributionItemName || name));
    if (/assembly|finished/.test(roleKey)) return stripInternalRunSuffixW441(plan.assemblyItemName || name);
    if (/component1|component_1/.test(roleKey)) return stripInternalRunSuffixW441(plan.componentNames && plan.componentNames[0] || name);
    if (/component2|component_2/.test(roleKey)) return stripInternalRunSuffixW441(plan.componentNames && plan.componentNames[1] || name);
    if (/component3|component_3/.test(roleKey)) return stripInternalRunSuffixW441(plan.componentNames && plan.componentNames[2] || name);
    if (/component|ingredient|material/.test(roleKey)) return stripInternalRunSuffixW441(name);
    if (/bomrevision|bom_revision|revision/.test(roleKey)) return stripInternalRunSuffixW441(plan.bomRevisionName || name);
    if (/\bbom\b|billofmaterials/.test(roleKey)) return stripInternalRunSuffixW441(plan.bomName || name);
    if (/workorder|work_order/.test(roleKey)) return stripInternalRunSuffixW441(plan.workOrderName || name);
    if (/routing/.test(roleKey)) return stripInternalRunSuffixW441(plan.routingName || name);
    if (/proof|replenishment|matrix/.test(roleKey)) return stripInternalRunSuffixW441(plan.distributionProofName || name);
    if (/support/.test(roleKey)) return stripInternalRunSuffixW441(plan.distributionSupportName || name);
    return stripInternalRunSuffixW441(name);
  }

  // ----------------------------
  // Manufacturing anchors
  // ----------------------------
  function ensureManufacturingAnchors({ subsidiaryId, locationId, heroItemId }) {
    const resolvedHeroItemId = Number(heroItemId || mustFindByExternalId('inventoryitem', ANCHORS.heroItem));

    const comp1Id = ensureInventoryItemByExternalId(ANCHORS.comp1, `SCAI - Component 1`, subsidiaryId, locationId);
    const comp2Id = ensureInventoryItemByExternalId(ANCHORS.comp2, `SCAI - Component 2`, subsidiaryId, locationId);
    const comp3Id = ensureInventoryItemByExternalId(ANCHORS.comp3, `SCAI - Component 3`, subsidiaryId, locationId);

    const assemblyId = ensureAssemblyItemByExternalId(ANCHORS.assembly, `SCAI - Finished Good`, subsidiaryId, locationId);

    const bomId = ensureBomByExternalId(ANCHORS.bom, `SCAI BOM`, subsidiaryId);
    const bomRevId = ensureBomRevisionByExternalId(ANCHORS.bomrev, bomId, `SCAI BOM Revision`);

    setBomRevisionComponents({ bomRevId, compIds: [comp1Id, comp2Id, comp3Id] });

    return { heroItemId: resolvedHeroItemId, comp1Id, comp2Id, comp3Id, assemblyId, bomId, bomRevId };
  }

  function ensureInventoryItemByExternalId(externalId, defaultName, subsidiaryId, locationId) {
    let id = findByExternalId('inventoryitem', externalId);

    if (!id) {
      const rec = record.create({ type: 'inventoryitem', isDynamic: false });
      rec.setValue({ fieldId: 'externalid', value: externalId });
      rec.setValue({ fieldId: 'itemid', value: defaultName });

      try { rec.setValue({ fieldId: 'subsidiary', value: [subsidiaryId] }); }
      catch (e) { safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: subsidiaryId })); }

      if (locationId) safeTry(() => rec.setValue({ fieldId: 'location', value: locationId }));

      id = rec.save({ enableSourcing: true, ignoreMandatoryFields: true });
    } else {
      safeTry(() => record.submitFields({
        type: 'inventoryitem',
        id: Number(id),
        values: buildSubsLocValues(subsidiaryId, locationId),
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      }));
    }

    return Number(id);
  }

  function ensureAssemblyItemByExternalId(externalId, defaultName, subsidiaryId, locationId) {
    let id = findByExternalId('assemblyitem', externalId);

    if (!id) {
      const rec = record.create({ type: 'assemblyitem', isDynamic: false });
      rec.setValue({ fieldId: 'externalid', value: externalId });
      rec.setValue({ fieldId: 'itemid', value: defaultName });

      try { rec.setValue({ fieldId: 'subsidiary', value: [subsidiaryId] }); }
      catch (e) { safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: subsidiaryId })); }

      if (locationId) safeTry(() => rec.setValue({ fieldId: 'location', value: locationId }));

      id = rec.save({ enableSourcing: true, ignoreMandatoryFields: true });
    } else {
      safeTry(() => record.submitFields({
        type: 'assemblyitem',
        id: Number(id),
        values: buildSubsLocValues(subsidiaryId, locationId),
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      }));
    }

    return Number(id);
  }

  function ensureBomByExternalId(externalId, defaultName, subsidiaryId) {
    let id = findByExternalId('bom', externalId);

    if (!id) {
      const rec = record.create({ type: 'bom', isDynamic: false });
      rec.setValue({ fieldId: 'externalid', value: externalId });
      safeTry(() => rec.setValue({ fieldId: 'name', value: defaultName }));
      safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: subsidiaryId }));
      id = rec.save({ enableSourcing: true, ignoreMandatoryFields: true });
    } else {
      safeTry(() => record.submitFields({
        type: 'bom',
        id: Number(id),
        values: { subsidiary: subsidiaryId },
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      }));
    }

    return Number(id);
  }

  function ensureBomRevisionByExternalId(externalId, bomId, defaultName) {
    let id = findByExternalId('bomrevision', externalId);

    if (!id) {
      const rec = record.create({ type: 'bomrevision', isDynamic: false });
      rec.setValue({ fieldId: 'externalid', value: externalId });
      safeTry(() => rec.setValue({ fieldId: 'billofmaterials', value: Number(bomId) }));
      safeTry(() => rec.setValue({ fieldId: 'name', value: defaultName }));
      safeTry(() => rec.setValue({ fieldId: 'effectivestartdate', value: new Date() }));
      id = rec.save({ enableSourcing: true, ignoreMandatoryFields: true });
    }

    return Number(id);
  }

  function setBomRevisionComponents({ bomRevId, compIds }) {
    const rev = record.load({ type: 'bomrevision', id: Number(bomRevId), isDynamic: true });

    const sublistId = detectBomRevComponentSublistId(rev);
    const fields = safeTryReturn(() => rev.getSublistFields({ sublistId })) || [];

    const itemFieldCandidates = ['item', 'componentitem', 'memberitem', 'assemblycomponent', 'ingredient', 'itemid'];
    const qtyFieldCandidates  = ['bomquantity', 'quantity', 'componentquantity', 'qty'];

    const qtyFieldId = firstExisting(fields, qtyFieldCandidates) || 'bomquantity';

    log.audit({
      title: `BOMREV field detect [${VERSION}]`,
      details: JSON.stringify({ sublistId, qtyFieldId, allFieldsCount: fields.length })
    });

    safeTry(() => {
      const lineCount = rev.getLineCount({ sublistId });
      for (let i = lineCount - 1; i >= 0; i--) {
        rev.removeLine({ sublistId, line: i, ignoreRecalc: true });
      }
    });

    compIds.forEach((cid) => {
      rev.selectNewLine({ sublistId });

      const itemSetOk = trySetAnyItemField(rev, sublistId, fields, cid, itemFieldCandidates);
      if (!itemSetOk) throw new Error(`BOMREV: could not set Item for component=${cid}`);

      safeTry(() => rev.setCurrentSublistValue({ sublistId, fieldId: qtyFieldId, value: 1 }));
      rev.commitLine({ sublistId });
    });

    rev.save({ enableSourcing: true, ignoreMandatoryFields: true });
  }

  function detectBomRevComponentSublistId(rev) {
    const candidates = ['component', 'components', 'bomcomponent', 'bomcomponents'];
    for (let i = 0; i < candidates.length; i++) {
      try { rev.getLineCount({ sublistId: candidates[i] }); return candidates[i]; } catch (e) {}
    }
    return 'component';
  }

  function trySetAnyItemField(rev, sublistId, allFields, itemId, candidates) {
    for (let i = 0; i < candidates.length; i++) {
      const f = candidates[i];
      if (allFields.indexOf(f) === -1) continue;

      const ok = safeTryReturn(() => {
        rev.setCurrentSublistValue({ sublistId, fieldId: f, value: Number(itemId) });
        return true;
      });

      if (ok) {
        log.audit({ title: `BOMREV item field used [${VERSION}]`, details: JSON.stringify({ fieldId: f, itemId }) });
        return true;
      }
    }
    return false;
  }

  function attachBomToAssembly({ assemblyId, bomId, bomRevId, locationId, forceDefaultRepair }) {
    const asm = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: true });
    const sublistId = 'billofmaterials';
    const fields = safeTryReturn(() => asm.getSublistFields({ sublistId })) || [];
    const bomFieldId = firstExisting(fields, ['billofmaterials', 'bom']) || 'billofmaterials';
    const masterDefaultFieldId = firstExisting(fields, ['masterdefault', 'default', 'isdefault']);
    const revisionFieldId = firstExisting(fields, ['currentrevision', 'billofmaterialsrevision', 'bomrevision', 'revision', 'defaultrevision']);
    const locationFieldId = firstExisting(fields, ['location']);

    let foundLine = -1;
    safeTry(() => {
      const count = asm.getLineCount({ sublistId });
      for (let i = 0; i < count; i++) {
        const v = asm.getSublistValue({ sublistId, fieldId: bomFieldId, line: i });
        if (Number(v) === Number(bomId)) { foundLine = i; break; }
      }
    });

    if (foundLine === -1) {
      asm.selectNewLine({ sublistId });
      asm.setCurrentSublistValue({ sublistId, fieldId: bomFieldId, value: Number(bomId) });
      if (revisionFieldId && Number.isFinite(Number(bomRevId)) && Number(bomRevId) > 0) {
        safeTry(() => asm.setCurrentSublistValue({ sublistId, fieldId: revisionFieldId, value: Number(bomRevId) }));
      }
      if (locationFieldId && Number.isFinite(Number(locationId)) && Number(locationId) > 0 && !masterDefaultFieldId) {
        safeTry(() => asm.setCurrentSublistValue({ sublistId, fieldId: locationFieldId, value: Number(locationId) }));
      }
      if (masterDefaultFieldId) safeTry(() => asm.setCurrentSublistValue({ sublistId, fieldId: masterDefaultFieldId, value: true }));
      asm.commitLine({ sublistId });
    } else {
      asm.selectLine({ sublistId, line: foundLine });
      asm.setCurrentSublistValue({ sublistId, fieldId: bomFieldId, value: Number(bomId) });
      if (revisionFieldId && Number.isFinite(Number(bomRevId)) && Number(bomRevId) > 0) {
        safeTry(() => asm.setCurrentSublistValue({ sublistId, fieldId: revisionFieldId, value: Number(bomRevId) }));
      }
      if (locationFieldId && Number.isFinite(Number(locationId)) && Number(locationId) > 0 && !masterDefaultFieldId) {
        safeTry(() => asm.setCurrentSublistValue({ sublistId, fieldId: locationFieldId, value: Number(locationId) }));
      }
      if (masterDefaultFieldId) safeTry(() => asm.setCurrentSublistValue({ sublistId, fieldId: masterDefaultFieldId, value: true }));
      asm.commitLine({ sublistId });
    }

    const bodyFields = safeTryReturn(() => asm.getFields()) || [];
    if (forceDefaultRepair) {
      if (Number.isFinite(Number(bomId)) && Number(bomId) > 0) {
        trySetAnyBodyField(asm, bodyFields, ['billofmaterials', 'bom'], Number(bomId));
      }
      if (Number.isFinite(Number(bomRevId)) && Number(bomRevId) > 0) {
        trySetAnyBodyField(asm, bodyFields, ['currentrevision', 'defaultrevision', 'billofmaterialsrevision', 'bomrevision', 'revision'], Number(bomRevId));
      }
    }

    asm.save({ enableSourcing: true, ignoreMandatoryFields: true });
    const verification = { bodyBom: null, bodyRevision: null, sublistCount: 0, matchingLine: -1 };
    safeTry(() => {
      const reloaded = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: false });
      const verifyBodyFields = safeTryReturn(() => reloaded.getFields()) || [];
      verification.bodyBom = safeTryReturn(() => reloaded.getValue({ fieldId: firstExisting(verifyBodyFields, ['billofmaterials', 'bom']) || 'billofmaterials' }));
      verification.bodyRevision = safeTryReturn(() => reloaded.getValue({ fieldId: firstExisting(verifyBodyFields, ['currentrevision', 'defaultrevision', 'billofmaterialsrevision', 'bomrevision', 'revision']) || 'currentrevision' }));
      verification.sublistCount = Number(safeTryReturn(() => reloaded.getLineCount({ sublistId })) || 0);
      for (let i = 0; i < verification.sublistCount; i++) {
        const verifyLineBom = safeTryReturn(() => reloaded.getSublistValue({ sublistId, fieldId: bomFieldId, line: i }));
        if (Number(verifyLineBom) === Number(bomId)) {
          verification.matchingLine = i;
          break;
        }
      }
    });

    log.audit({
      title: `Assembly BOM defaults ensured [${VERSION}]`,
      details: JSON.stringify({
        assemblyId: Number(assemblyId || 0),
        bomId: Number(bomId || 0),
        bomRevId: Number(bomRevId || 0),
        locationId: Number(locationId || 0),
        sublistId,
        bomFieldId,
        masterDefaultFieldId: masterDefaultFieldId || '',
        revisionFieldId: revisionFieldId || '',
        locationFieldId: locationFieldId || '',
        foundLine,
        forceDefaultRepair: !!forceDefaultRepair,
        verification
      })
    });

    return {
      status: 'applied',
      assemblyId: Number(assemblyId || 0),
      bomId: Number(bomId || 0),
      bomRevId: Number(bomRevId || 0),
      locationId: Number(locationId || 0),
      sublistId,
      bomFieldId,
      masterDefaultFieldId: masterDefaultFieldId || '',
      revisionFieldId: revisionFieldId || '',
      locationFieldId: locationFieldId || '',
      foundLine,
      forceDefaultRepair: !!forceDefaultRepair,
      verification
    };
  }

  function buildManufacturingEligibilityPreflightW446({ assemblyId, bomId, bomRevId, subsidiaryId, locationId, enableWip, assemblyBomTelemetry, workCenterSearchId }) {
    const blockers = [];
    const warnings = [];
    const probes = {
      assemblyId: Number(assemblyId || 0) || null,
      bomId: Number(bomId || 0) || null,
      bomRevId: Number(bomRevId || 0) || null,
      subsidiaryId: Number(subsidiaryId || 0) || null,
      locationId: Number(locationId || 0) || null,
      assemblyBomVerification: assemblyBomTelemetry && assemblyBomTelemetry.verification || null,
      workOrderBodyFields: [],
      workOrderAssemblyFieldCandidates: [],
      workOrderDefaultValues: {},
      routingBodyFields: [],
      routingBomFieldPresent: false,
      wipWorkCentersFound: null,
      wipCostTemplatesFound: null
    };

    if (!probes.assemblyId) blockers.push('assembly_missing');
    if (!probes.bomId) blockers.push('bom_missing');
    if (assemblyBomTelemetry && assemblyBomTelemetry.verification && Number(assemblyBomTelemetry.verification.matchingLine) < 0) {
      blockers.push('bom_not_verified_on_assembly_sublist');
    }

    safeTry(() => {
      const wo = record.create({ type: 'workorder', isDynamic: true });
      const fields = safeTryReturn(() => wo.getFields()) || [];
      probes.workOrderBodyFields = fields.slice(0, 80);
      probes.workOrderAssemblyFieldCandidates = ['assemblyitem', 'item'].filter(function (fieldId) { return fields.indexOf(fieldId) >= 0; });
      probes.workOrderDefaultValues = {
        subsidiary: probes.subsidiaryId,
        location: probes.locationId,
        assemblyitem: probes.assemblyId,
        item: probes.assemblyId,
        billofmaterials: probes.bomId,
        billofmaterialsrevision: probes.bomRevId
      };
      if (!probes.workOrderAssemblyFieldCandidates.length) warnings.push('work_order_assembly_field_not_visible_before_defaults');
    });

    if (enableWip) {
      safeTry(() => {
        const routing = record.create({ type: 'manufacturingrouting', isDynamic: true });
        const fields = safeTryReturn(() => routing.getFields()) || [];
        probes.routingBodyFields = fields.slice(0, 80);
        probes.routingBomFieldPresent = fields.indexOf('billofmaterials') >= 0 || fields.indexOf('bom') >= 0;
        if (!probes.routingBomFieldPresent) warnings.push('routing_bom_field_not_visible');
      });
      const authoritativeSearchW449 = authoritativeWipWorkCenterSearchIdW449(workCenterSearchId);
      const centers = safeTryReturn(() => findWorkCentersFromSavedSearch({
        searchId: authoritativeSearchW449.chosenSearchId,
        fallbackSearchId: authoritativeSearchW449.numericFallbackId,
        locationId: probes.locationId,
        subsidiaryId: probes.subsidiaryId,
        authoritativeOnly: true
      })) || [];
      const templates = safeTryReturn(() => findCostTemplatesForSubsidiary(probes.subsidiaryId)) || [];
      probes.wipWorkCentersFound = centers.length;
      probes.wipCostTemplatesFound = templates.length;
      probes.w449AuthoritativeWorkCenterSearch = authoritativeSearchW449;
      if (!centers.length) blockers.push('wip_work_centers_missing');
      if (!templates.length) blockers.push('wip_cost_templates_missing');
    }

    const result = {
      schema: 'idb.w446-manufacturing-eligibility-preflight.v1',
      status: blockers.length ? 'blocked_or_incomplete' : (warnings.length ? 'warning' : 'ready'),
      blockers,
      warnings,
      probes
    };
    log.audit({ title: `Manufacturing eligibility preflight W446 [${VERSION}]`, details: JSON.stringify(result) });
    return result;
  }

  function buildManufacturingSignoffSummary({ extId, prospect, enableManufacturing, enableWip, ids, woId, assemblyBomTelemetry, manufacturingEligibilityPreflightW446, workOrderTelemetry, routingResult, imageEnrichment, flowState }) {
    const workOrder = workOrderTelemetry || {};
    const attempts = Array.isArray(workOrder.attemptsTried) ? workOrder.attemptsTried : [];
    const lastAttempt = attempts.length ? attempts[attempts.length - 1] : null;
    const assemblyVerification = assemblyBomTelemetry && assemblyBomTelemetry.verification ? assemblyBomTelemetry.verification : null;
    const previewReady = !!(imageEnrichment && imageEnrichment.assemblyPreviewReady);
    const routingFailure = routingResult && routingResult.routingFailure ? routingResult.routingFailure : null;
    const routingStatus = routingResult
      ? (routingResult.status || (routingResult.routingId ? 'attached' : routingResult.decision || 'unknown'))
      : (enableWip ? 'requested-no-result' : 'not-attempted');
    const routingOperatorState = !enableWip
      ? 'not-required'
      : (routingResult && routingResult.routingId
          ? 'ready'
          : (routingFailure
              ? `failed-best-effort at ${routingFailure.failureStage || 'unknown'}: ${routingFailure.errorMessage || 'see routing diagnostics'}`
              : (routingResult && routingResult.decision ? routingResult.decision : 'pending')));
    return {
      version: VERSION,
      releaseTrain: RELEASE_TRAIN,
      releaseTranche: RELEASE_TRANCHE,
      extId: extId || '',
      prospect: prospect || '',
      manufacturingEnabled: !!enableManufacturing,
      wipEnabled: !!enableWip,
      flowLabel: flowState && flowState.label ? flowState.label : '',
      canonicalFlowKey: flowState && flowState.key ? flowState.key : '',
      assemblyId: ids && ids.assemblyId ? Number(ids.assemblyId) : null,
      bomId: ids && ids.bomId ? Number(ids.bomId) : null,
      bomRevId: ids && ids.bomRevId ? Number(ids.bomRevId) : null,
      workOrderId: Number(woId || 0) || null,
      workOrderStatus: workOrder.status || (enableManufacturing ? 'unknown' : 'not-required'),
      workOrderFinalLabel: workOrder.finalLabel || '',
      workOrderFailureType: workOrder.failureType || '',
      workOrderAttemptCount: attempts.length,
      workOrderAttemptLabels: attempts.map(function (attempt) { return attempt && attempt.label ? String(attempt.label) : ''; }).filter(Boolean),
      finalAttemptExplodedLines: lastAttempt && lastAttempt.explodedLines ? lastAttempt.explodedLines : null,
      assemblyBomStatus: assemblyBomTelemetry ? (assemblyBomTelemetry.status || 'applied') : (enableManufacturing ? 'unknown' : 'not-required'),
      assemblyBomVerification: assemblyVerification,
      assemblyBomVerified: !!(assemblyVerification && Number(assemblyVerification.matchingLine) >= 0),
      manufacturingEligibilityPreflightW446: manufacturingEligibilityPreflightW446 || null,
      routingDecision: routingResult ? routingResult.decision : (enableWip ? 'requested-no-result' : 'not-attempted'),
      routingStatus,
      routingId: routingResult && routingResult.routingId ? Number(routingResult.routingId) : null,
      existingRoutingId: routingResult && routingResult.existingRoutingId ? Number(routingResult.existingRoutingId) : null,
      routingAttachResult: routingResult ? (routingResult.attachResult || '') : '',
      routingFailure,
      routingDiagnostics: routingResult && routingResult.diagnostics ? routingResult.diagnostics : null,
      assemblyPreviewReady: previewReady,
      assemblyPreviewUrl: imageEnrichment && imageEnrichment.assemblyUrl ? String(imageEnrichment.assemblyUrl) : '',
      signoffReady: !!enableManufacturing && !!(assemblyVerification && Number(assemblyVerification.matchingLine) >= 0) && (workOrder.status === 'saved') && (!enableWip || !!(routingResult && routingResult.routingId)),
      operatorSummary: !enableManufacturing
        ? 'Manufacturing not requested; manufacturing signoff not required.'
        : [
            `Assembly ${ids && ids.assemblyId ? Number(ids.assemblyId) : 'n/a'}`,
            `BOM verified=${assemblyVerification && Number(assemblyVerification.matchingLine) >= 0 ? 'yes' : 'no'}`,
            `WO status=${workOrder.status || 'unknown'}`,
            `WO path=${workOrder.finalLabel || 'n/a'}`,
            `Routing=${routingOperatorState}`
          ].join(' | ')
    };
  }

  function trySetAnyBodyField(rec, allFields, candidates, value) {
    for (let i = 0; i < candidates.length; i++) {
      const fieldId = candidates[i];
      if (Array.isArray(allFields) && allFields.length && allFields.indexOf(fieldId) === -1) continue;
      const ok = safeTryReturn(() => {
        rec.setValue({ fieldId, value });
        return true;
      });
      if (ok) return fieldId;
    }
    return '';
  }

  function inspectManufacturingLineCounts(rec) {
    const out = {};
    ['item', 'items', 'component', 'components'].forEach(function (sublistId) {
      const count = safeTryReturn(() => rec.getLineCount({ sublistId }));
      if (count != null) out[sublistId] = Number(count || 0);
    });
    return out;
  }

  function buildSubsLocValues(subsidiaryId, locationId) {
    const values = { subsidiary: subsidiaryId };
    if (locationId) values.location = locationId;
    return values;
  }

  // ----------------------------
  // Website signal (hardened, non-blocking)
  // ----------------------------
  function safeGetWebsiteSignal(opts) {
    const website = opts && opts.website ? String(opts.website) : '';
    const prospect = opts && opts.prospect ? String(opts.prospect) : '';
    const extId = opts && opts.extId ? String(opts.extId) : '';
    const folderId = opts && opts.folderId ? Number(opts.folderId) : null;
    const domain = extractDomain(website);
    const fallbackSignal = buildWebsiteFallbackSignal({ website, prospect, domain });

    if (!website) {
      return {
        status: 'missing',
        signal: fallbackSignal,
        errorName: '',
        errorMessage: '',
        fallbackUsed: true,
        signalSource: 'deterministic',
        cacheHit: false,
        diagnostics: buildWebsiteDiagnostics({
          domain,
          extId,
          signalSource: 'deterministic',
          fetchCount: 0,
          redirectCount: 0,
          elapsedMs: 0,
          cacheHit: false,
          liveAttempted: false,
          folderId
        })
      };
    }

    try {
      const signalResult = getWebsiteSignal({ website, prospect, extId, folderId });
      return {
        status: signalResult.status || 'ok',
        signal: signalResult.signal || fallbackSignal,
        errorName: '',
        errorMessage: '',
        fallbackUsed: !!signalResult.fallbackUsed,
        signalSource: signalResult.signalSource || 'live',
        cacheHit: !!signalResult.cacheHit,
        diagnostics: signalResult.diagnostics || buildWebsiteDiagnostics({ domain, extId, signalSource: signalResult.signalSource || 'live' })
      };
    } catch (e) {
      const name = e && e.name ? String(e.name) : '';
      const msg = e && e.message ? String(e.message) : String(e || '');
      const status = name === 'SSS_CONNECTION_TIME_OUT'
        ? 'timeout'
        : (name === 'SSS_UNKNOWN_HOST' ? 'unknown_host' : 'error');
      const cached = loadWebsiteSignalCache({ folderId, domain });
      const signal = cached && cached.signal && cached.signal.text ? cached.signal : fallbackSignal;
      const signalSource = cached && cached.signal && cached.signal.text ? 'cached' : 'deterministic';
      const diagnostics = buildWebsiteDiagnostics({
        domain,
        extId,
        signalSource,
        fetchCount: 0,
        redirectCount: 0,
        elapsedMs: 0,
        cacheHit: !!(cached && cached.signal && cached.signal.text),
        liveAttempted: true,
        errorName: name,
        errorMessage: msg,
        folderId
      });

      log.audit({
        title: `Website signal fallback applied [${VERSION}]`,
        details: JSON.stringify(diagnostics)
      });

      return {
        status: status,
        signal: signal,
        errorName: name,
        errorMessage: msg,
        fallbackUsed: true,
        signalSource,
        cacheHit: diagnostics.cacheHit,
        diagnostics
      };
    }
  }

  function getWebsiteSignal(opts) {
    const website = opts && opts.website ? String(opts.website) : '';
    const prospect = opts && opts.prospect ? String(opts.prospect) : '';
    const extId = opts && opts.extId ? String(opts.extId) : '';
    const folderId = opts && opts.folderId ? Number(opts.folderId) : null;
    const domain = extractDomain(website);
    const fallbackSignal = buildWebsiteFallbackSignal({ website, prospect, domain });
    const started = Date.now();

    if (!domain) {
      return {
        status: 'deterministic',
        signal: fallbackSignal,
        signalSource: 'deterministic',
        cacheHit: false,
        fallbackUsed: true,
        diagnostics: buildWebsiteDiagnostics({
          domain,
          extId,
          signalSource: 'deterministic',
          fetchCount: 0,
          redirectCount: 0,
          elapsedMs: Date.now() - started,
          cacheHit: false,
          liveAttempted: false,
          folderId
        })
      };
    }

    const cache = loadWebsiteSignalCache({ folderId, domain });
    const budget = {
      maxFetches: 2,
      maxRedirectsPerFetch: 2,
      totalRedirects: 0,
      fetchCount: 0,
      allowedSecondaryFetches: 1
    };

    let homepage = null;
    let bestText = '';
    let liveAttempted = false;

    const startUrl = normalizeUrl(website);
    try {
      liveAttempted = true;
      homepage = fetchHtmlWithRedirects(startUrl, budget.maxRedirectsPerFetch, budget);
      bestText = extractSignalText(homepage.html, domain);
    } catch (e) {
      if (cache && cache.signal && cache.signal.text) {
        return {
          status: 'cached',
          signal: cache.signal,
          signalSource: 'cached',
          cacheHit: true,
          fallbackUsed: false,
          diagnostics: buildWebsiteDiagnostics({
            domain,
            extId,
            signalSource: 'cached',
            fetchCount: budget.fetchCount,
            redirectCount: budget.totalRedirects,
            elapsedMs: Date.now() - started,
            cacheHit: true,
            liveAttempted,
            folderId,
            errorName: e && e.name ? String(e.name) : '',
            errorMessage: e && e.message ? String(e.message) : String(e || '')
          })
        };
      }
      throw e;
    }

    if (bestText.length < 450 && budget.allowedSecondaryFetches > 0) {
      const candidates = pickHighSignalLinks(homepage && homepage.html ? homepage.html : '', domain, 4);
      const candidate = candidates.length ? candidates[0] : '';
      if (candidate && normalizeUrl(candidate) !== (homepage && homepage.finalUrl ? normalizeUrl(homepage.finalUrl) : '')) {
        try {
          const secondary = fetchHtmlWithRedirects(candidate, budget.maxRedirectsPerFetch, budget);
          const secondaryText = extractSignalText(secondary.html, domain);
          if (secondaryText.length > bestText.length) bestText = secondaryText;
        } catch (e) {}
      }
    }

    let signal = null;
    let signalSource = 'live';
    let status = 'ok';
    let cacheHit = false;
    let fallbackUsed = false;

    if (bestText && bestText.length >= 150) {
      signal = { domain, text: bestText };
      saveWebsiteSignalCache({ folderId, domain, signal, source: 'live', elapsedMs: Date.now() - started, fetchCount: budget.fetchCount, redirectCount: budget.totalRedirects });
    } else if (cache && cache.signal && cache.signal.text) {
      signal = cache.signal;
      signalSource = 'cached';
      status = 'cached';
      cacheHit = true;
    } else {
      signal = fallbackSignal;
      signalSource = 'deterministic';
      status = 'deterministic';
      fallbackUsed = true;
    }

    const diagnostics = buildWebsiteDiagnostics({
      domain,
      extId,
      signalSource,
      fetchCount: budget.fetchCount,
      redirectCount: budget.totalRedirects,
      elapsedMs: Date.now() - started,
      cacheHit,
      liveAttempted,
      folderId
    });

    return { status, signal, signalSource, cacheHit, fallbackUsed, diagnostics };
  }

  function fetchHtmlWithRedirects(url, maxHops, budget) {
    let current = url;
    let hops = 0;

    if (budget) {
      budget.fetchCount = Number(budget.fetchCount || 0) + 1;
      if (Number(budget.fetchCount) > Number(budget.maxFetches || 1)) {
        const err = new Error('Website fetch budget exceeded');
        err.name = 'SCAI_WEBSITE_FETCH_BUDGET_EXCEEDED';
        throw err;
      }
      if (budget.allowedSecondaryFetches > 0 && current !== normalizeUrl(url) && budget.fetchCount > 1) budget.allowedSecondaryFetches -= 1;
    }

    while (hops <= maxHops) {
      const resp = https.get({
        url: current,
        headers: {
          'User-Agent': 'Mozilla/5.0 (NetSuite SCAI Demo Reset)',
          'Accept': 'text/html,application/xhtml+xml'
        }
      });

      const code = Number(resp.code || 200);
      const headers = resp.headers || {};
      const body = String(resp.body || '');

      if ((code === 301 || code === 302 || code === 307 || code === 308) && headers.Location) {
        const next = resolveRedirectUrl(current, String(headers.Location));
        current = normalizeUrl(next);
        hops++;
        if (budget) budget.totalRedirects = Number(budget.totalRedirects || 0) + 1;
        continue;
      }

      return { finalUrl: current, html: body, code, redirectCount: hops };
    }

    return { finalUrl: current, html: '', code: 0, redirectCount: hops };
  }

  function buildWebsiteFallbackSignal(ctx) {
    const website = ctx && ctx.website ? String(ctx.website) : '';
    const prospect = ctx && ctx.prospect ? String(ctx.prospect) : '';
    const domain = str((ctx && ctx.domain) || extractDomain(website));
    return {
      domain: domain || '',
      text: domain
        ? `Domain: ${domain}. Prospect: ${prospect || 'Unknown'}. Use company name, notes, and domain text to infer industry and scenario.`
        : `Prospect: ${prospect || 'Unknown'}. No website signal available. Use company name and notes to infer industry and scenario.`
    };
  }

  function buildWebsiteDiagnostics(ctx) {
    return {
      domain: str(ctx && ctx.domain),
      extId: str(ctx && ctx.extId),
      signalSource: str(ctx && ctx.signalSource) || 'deterministic',
      fetchCount: Number((ctx && ctx.fetchCount) || 0),
      redirectCount: Number((ctx && ctx.redirectCount) || 0),
      elapsedMs: Number((ctx && ctx.elapsedMs) || 0),
      cacheHit: !!(ctx && ctx.cacheHit),
      liveAttempted: !!(ctx && ctx.liveAttempted),
      folderId: Number((ctx && ctx.folderId) || 0) || null,
      errorName: str(ctx && ctx.errorName),
      errorMessage: str(ctx && ctx.errorMessage)
    };
  }

  function websiteSignalCacheFileName(domain) {
    return `scai_website_signal_${String(domain || '').toLowerCase().replace(/[^a-z0-9]+/g, '_')}.json`;
  }

  function loadWebsiteSignalCache(ctx) {
    const folderId = Number((ctx && ctx.folderId) || 0) || null;
    const domain = str(ctx && ctx.domain).toLowerCase();
    if (!folderId || !domain) return null;
    try {
      const fileName = websiteSignalCacheFileName(domain);
      const rs = search.create({
        type: 'file',
        filters: [['name', 'is', fileName], 'and', ['folder', 'anyof', Number(folderId)]],
        columns: [search.createColumn({ name: 'internalid', sort: search.Sort.DESC })]
      }).run().getRange({ start: 0, end: 1 }) || [];
      if (!rs.length) return null;
      const fileId = Number(rs[0].getValue({ name: 'internalid' }));
      const f = file.load({ id: fileId });
      const parsed = safeJsonParse(String(f.getContents() || '{}')) || {};
      parsed.fileId = fileId;
      return parsed;
    } catch (e) {
      log.audit({
        title: `Website signal cache read skipped [${VERSION}]`,
        details: JSON.stringify({ domain, folderId, message: String((e && e.message) || e || '') })
      });
      return null;
    }
  }

  function saveWebsiteSignalCache(ctx) {
    const folderId = Number((ctx && ctx.folderId) || 0) || null;
    const domain = str(ctx && ctx.domain).toLowerCase();
    const signal = ctx && ctx.signal ? ctx.signal : null;
    if (!folderId || !domain || !signal || !signal.text) return null;
    try {
      const payload = {
        domain,
        savedAt: new Date().toISOString(),
        source: str(ctx && ctx.source) || 'live',
        fetchCount: Number((ctx && ctx.fetchCount) || 0),
        redirectCount: Number((ctx && ctx.redirectCount) || 0),
        elapsedMs: Number((ctx && ctx.elapsedMs) || 0),
        signal: {
          domain: domain,
          text: String(signal.text || '').slice(0, 2600)
        }
      };
      const f = file.create({
        name: websiteSignalCacheFileName(domain),
        fileType: file.Type.PLAINTEXT,
        contents: JSON.stringify(payload, null, 2),
        folder: Number(folderId)
      });
      return Number(f.save());
    } catch (e) {
      log.audit({
        title: `Website signal cache write skipped [${VERSION}]`,
        details: JSON.stringify({ domain, folderId, message: String((e && e.message) || e || '') })
      });
      return null;
    }
  }

  function resolveRedirectUrl(baseUrl, location) {
    const loc = String(location || '').trim();
    if (!loc) return baseUrl;

    if (/^https?:\/\//i.test(loc)) return loc;
    if (/^\/\//.test(loc)) return 'https:' + loc;

    if (loc[0] === '/') {
      const m = String(baseUrl).match(/^(https?:\/\/[^\/?#]+)/i);
      const origin = m && m[1] ? m[1] : baseUrl;
      return origin + loc;
    }

    const originMatch = String(baseUrl).match(/^(https?:\/\/[^\/?#]+)(\/.*)?$/i);
    const origin = originMatch && originMatch[1] ? originMatch[1] : baseUrl;
    const path = originMatch && originMatch[2] ? originMatch[2] : '/';
    const dir = path.replace(/[^\/]*$/, '');
    return origin + dir + loc;
  }

  function extractSignalText(html, domain) {
    const raw = String(html || '');

    const title = (raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [,''])[1];
    const metaDesc =
      (raw.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [,''])[1] ||
      (raw.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) || [,''])[1] ||
      '';

    const bodyText = compactText(stripHtml(raw));

    const clipped = clipToKeywords(bodyText, [
      'product','products','shop','collection','collections','category','categories','store',
      'buy','price','cart','checkout','size','color','style','sku','model',
      'manufacturing','factory','plant','inventory','warehouse','supply chain','procurement',
      'assembly','bill of materials','bom','production','distribution',
      'ingredients','nutrition','flavor','serving','organic','frozen','beverage'
    ], 2200);

    const parts = [];
    parts.push(`Domain: ${domain}`);
    if (title) parts.push(`Title: ${compactText(title).slice(0, 160)}`);
    if (metaDesc) parts.push(`Description: ${compactText(metaDesc).slice(0, 240)}`);

    const best = (clipped || bodyText.slice(0, 2200)).trim();
    if (best) parts.push(`PageText: ${best}`);

    const out = parts.join(' | ');
    return out.length <= 2600 ? out : out.slice(0, 2600);
  }

  function pickHighSignalLinks(html, domain, limit) {
    const raw = String(html || '');
    const links = [];

    const re = /href=["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(raw)) !== null) {
      const href = String(m[1] || '').trim();
      if (!href) continue;

      if (/^(mailto:|tel:|javascript:|#)/i.test(href)) continue;

      let abs = href;
      if (!/^https?:\/\//i.test(href)) {
        abs = `https://${domain}${href.startsWith('/') ? '' : '/'}${href}`;
      }

      abs = normalizeUrl(abs);
      if (abs.indexOf(domain) === -1) continue;

      const lower = abs.toLowerCase();
      let score = 0;

      ['shop','products','product','collections','collection','category','c/','p/','store','catalog'].forEach(k => {
        if (lower.indexOf(k) !== -1) score += 10;
      });

      ['privacy','terms','login','account','help','support','returns','faq','contact'].forEach(k => {
        if (lower.indexOf(k) !== -1) score -= 5;
      });

      score += Math.max(0, 15 - Math.min(15, abs.length / 20));
      links.push({ url: abs, score });
    }

    const uniq = {};
    links.forEach(x => { if (!uniq[x.url] || uniq[x.url] < x.score) uniq[x.url] = x.score; });

    return Object.keys(uniq)
      .map(u => ({ url: u, score: uniq[u] }))
      .sort((a,b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.url);
  }

  function normalizeUrl(u) {
    const s = String(u || '').trim();
    if (!s) return '';
    if (/^http:\/\//i.test(s)) return s.replace(/^http:\/\//i, 'https://');
    if (/^https:\/\//i.test(s)) return s;
    return `https://${s.replace(/^\/+/, '')}`;
  }

  // ----------------------------
  // Precomputed naming payload + deterministic fallback
  // ----------------------------
  function loadPrecomputedNamingPack({ fileId, extId, prospect, website, signalText }) {
    const deterministic = generateNamingPack({ prospect, website, signalText });
    let candidateFileId = toIntOrNull(fileId);
    let discoveryMode = candidateFileId ? 'direct-param' : 'discover-by-extid';

    if (!candidateFileId && extId) {
      candidateFileId = discoverNamingFileIdByExtId(extId);
    }

    if (!candidateFileId) {
      deterministic._namingPackAuthoritative = false;
      deterministic._namingPayloadFound = false;
      deterministic._namingPayloadParsed = false;
      deterministic._namingPayloadApplied = false;
      deterministic._namingQualityDegraded = true;
      deterministic._namingDegradedReason = 'No precomputed naming pack file id or scai_naming_<extId>.json file was found before runner execution.';
      deterministic.fallbackBlockedGenericTerms = W450_GENERIC_NAMING_HARD_STOP_TERMS.slice();
      return {
        found: false,
        parsed: false,
        applied: false,
        fileId: null,
        discoveryMode,
        source: deterministic._source || 'deterministic',
        payload: sanitizeNamingPayload(deterministic)
      };
    }

    try {
      const f = file.load({ id: Number(candidateFileId) });
      const raw = String(f.getContents() || '{}');
      const parsed = safeJsonParse(raw) || {};
      const out = sanitizeNamingPayload(Object.assign({}, deterministic, parsed || {}));
      if (!Array.isArray(out.component_names) || out.component_names.length !== 3) out.component_names = deterministic.component_names;
      out.hero_item_name = trimLen(out.hero_item_name, 60);
      out.assembly_name = trimLen(out.assembly_name, 60);
      out.component_names = out.component_names.map(n => trimLen(n, 60));
      out.bom_name = trimLen(out.bom_name, 80);
      out.bom_revision_name = trimLen(out.bom_revision_name, 80);
      out._source = out._source || 'suitelet-precomputed';
      out._signalLen = out._signalLen || String(signalText || '').length;
      out._namingPackAuthoritative = true;
      out._namingPayloadFound = true;
      out._namingPayloadParsed = true;
      out._namingPayloadApplied = true;
      out._namingDiscoveryMode = discoveryMode;
      out._namingFileId = Number(candidateFileId);
      out._namingQualityDegraded = false;
      out.genericNamingHardStopTerms = W450_GENERIC_NAMING_HARD_STOP_TERMS.slice();
      out.fallbackBlockedGenericTerms = W450_GENERIC_NAMING_HARD_STOP_TERMS.slice();
      return {
        found: true,
        parsed: true,
        applied: true,
        fileId: Number(candidateFileId),
        discoveryMode,
        source: out._source,
        payload: out
      };
    } catch (e) {
      log.error({ title: `Precomputed naming load FAILED (deterministic fallback used) [${VERSION}]`, details: JSON.stringify({ fileId: candidateFileId, extId: extId || '', message: (e && (e.message || e.details)) ? String(e.message || e.details) : String(e) }) });
      deterministic._namingPackAuthoritative = false;
      deterministic._namingPayloadFound = false;
      deterministic._namingPayloadParsed = false;
      deterministic._namingPayloadApplied = false;
      deterministic._namingDiscoveryMode = discoveryMode;
      deterministic._namingFileId = candidateFileId || null;
      deterministic._namingQualityDegraded = true;
      deterministic._namingDegradedReason = `Precomputed naming pack could not be loaded or parsed: ${(e && (e.message || e.details)) ? String(e.message || e.details) : String(e)}`;
      deterministic.fallbackBlockedGenericTerms = W450_GENERIC_NAMING_HARD_STOP_TERMS.slice();
      return {
        found: false,
        parsed: false,
        applied: false,
        fileId: candidateFileId || null,
        discoveryMode,
        source: deterministic._source || 'deterministic',
        payload: sanitizeNamingPayload(deterministic)
      };
    }
  }
  function sanitizeNamingPayload(names) {
    const out = Object.assign({}, names || {});
    const authoritativeFamilyKey = str(out._authoritativeFamilyKey || out._uiLockFamily || out._sharedEngineFamily || '');
    if (authoritativeFamilyKey) out._authoritativeFamilyKey = authoritativeFamilyKey;
    if (!str(out._rawPackFamily) && str(out._packFamily)) out._rawPackFamily = str(out._packFamily);
    if (str(out._normalizedIndustryCategory)) out.industry_category = str(out._normalizedIndustryCategory);
    if (str(out._normalizedScenarioLabel)) {
      out.scenario_label = str(out._normalizedScenarioLabel);
      out.scenario_name = str(out._normalizedScenarioLabel);
    }
    return out;
  }

  function extractWebsiteProductTermsW432(opts) {
    const source = opts || {};
    const hay = String([
      source.prospect,
      source.website,
      source.signalText,
      source.notes,
      source.agenda,
      source.productSeed,
      source.productFamily
    ].join(' '));
    const lower = hay.toLowerCase();
    const productCandidates = [];
    const websiteTermsUsed = [];
    const addCandidate = function (candidate, evidence) {
      if (!candidate) return;
      if (productCandidates.indexOf(candidate) === -1) productCandidates.push(candidate);
      if (evidence && websiteTermsUsed.indexOf(evidence) === -1) websiteTermsUsed.push(evidence);
    };
    const isSiete = /siete/.test(lower);
    const isKettle = /kettle/.test(lower);
    const isKodiak = /kodiak/.test(lower);
    const isGoodles = /goodles/.test(lower);
    const isChomps = /chomps/.test(lower);
    const isBachans = /bachan|japanese\s+barbe?cue|barbe?cue\s+sauce|bbq\s+sauce|sauce\s+batch/.test(lower);
    if (isBachans) {
      addCandidate('Bachan’s Original Japanese Barbecue Sauce', 'Bachan’s Japanese barbecue sauce');
      addCandidate('Bachan’s Hot and Spicy Japanese Barbecue Sauce', 'Bachan’s sauce flavor family');
      addCandidate('Bachan’s Yuzu Japanese Barbecue Sauce', 'Bachan’s sauce flavor family');
    }
    if (isKodiak && /buttermilk|power\s*cakes?|flapjack|pancake|protein|oat\s*&?\s*honey|mix/.test(lower)) {
      addCandidate('Kodiak Power Cakes Buttermilk Flapjack Mix', 'Kodiak Power Cakes Buttermilk Flapjack Mix');
      addCandidate('Kodiak Protein Pancake Mix', 'Kodiak Protein Pancake Mix');
      addCandidate('Kodiak Oat & Honey Flapjack Mix', 'Kodiak Oat & Honey Flapjack Mix');
    } else if (isKodiak) {
      addCandidate('Kodiak Power Cakes Buttermilk Flapjack Mix', 'Kodiak Cakes flapjack mix category');
      addCandidate('Kodiak Protein Pancake Mix', 'Kodiak protein pancake mix');
      addCandidate('Kodiak Oat & Honey Flapjack Mix', 'Kodiak oat honey flapjack mix');
    }
    if (!isSiete && /air\s*fried/.test(lower) && /sea\s*salt\s*&?\s*vinegar/.test(lower)) {
      addCandidate('Air Fried Sea Salt & Vinegar Kettle Chips', 'Air Fried Sea Salt & Vinegar');
    }
    if (!isSiete && /sea\s*salt\s*&?\s*vinegar/.test(lower)) addCandidate('Sea Salt & Vinegar Kettle Chips', 'Sea Salt & Vinegar');
    if (!isSiete && /jalape(?:n|ñ)o/.test(lower)) addCandidate('Jalapeno Kettle Chips', 'Jalapeno');
    if (!isSiete && /himalayan\s+salt/.test(lower)) addCandidate('Himalayan Salt Kettle Chips', 'Himalayan Salt');
    if (!isSiete && /texas\s+bbq/.test(lower)) addCandidate('Texas BBQ Kettle Chips', 'Texas BBQ');
    if (isSiete && /ma[ií]z/.test(lower) && /sea\s+salt/.test(lower) && /tortilla\s+chips?/.test(lower)) {
      addCandidate('Siete Maíz Sea Salt Tortilla Chips', 'Siete Maíz Sea Salt Tortilla Chips');
    }
    if (isSiete && /sea\s+salt/.test(lower) && /tortilla\s+chips?/.test(lower)) {
      addCandidate('Siete Sea Salt Tortilla Chips', 'Siete Sea Salt Tortilla Chips');
    }
    if (isSiete && /grain[-\s]*free/.test(lower) && /tortilla\s+chips?/.test(lower)) {
      addCandidate('Siete Grain Free Tortilla Chips', 'Siete Grain Free Tortilla Chips');
    }
    if (isSiete && /taco\s+shells?/.test(lower)) addCandidate('Siete Taco Shells', 'Siete Taco Shells');
    if (isSiete && /seasoning\s+mix/.test(lower)) addCandidate('Siete Seasoning Mixes', 'Siete Seasoning Mixes');
    if (/biena/.test(lower) && /chickpea|chick\s*pea/.test(lower) && /snack|puff|roast|sea\s+salt|honey\s+roast|ranch|barbe?que/.test(lower)) {
      addCandidate('Biena Roasted Chickpea Snacks', 'Biena chickpea snacks');
    }
    if (/chickpea|chick\s*pea/.test(lower) && /snack|puff|roast/.test(lower)) {
      addCandidate(/biena/.test(lower) ? 'Biena Roasted Chickpea Snacks' : 'Roasted Chickpea Snacks', 'chickpea snacks');
    }
    if (/kodiak/.test(lower) && /flapjack|pancake|waffle|oat|protein|breakfast|cup/.test(lower)) {
      addCandidate('Kodiak Maple Brown Sugar Flapjack Cups', 'Kodiak flapjack protein breakfast cups');
    }
    if (/flapjack|pancake|waffle/.test(lower) && /protein|oat|breakfast|cup/.test(lower)) {
      addCandidate(/kodiak/.test(lower) ? 'Kodiak Maple Brown Sugar Flapjack Cups' : 'Protein Flapjack Breakfast Cups', 'flapjack breakfast cups');
    }
    if (isSiete) {
      if (/tortilla\s+chips?|chip\b|chips\b/.test(lower)) addCandidate('Siete Grain Free Tortilla Chips', 'Grain Free Tortilla Chips');
      addCandidate('Siete Taco Shells', 'Taco Shells');
      addCandidate('Siete Seasoning Mixes', 'Seasoning Mixes');
      addCandidate('Siete Cookies', 'Cookies');
      addCandidate('Siete Beans', 'Beans');
      addCandidate('Siete Sauces', 'Sauces');
    }
    if (isGoodles || /mac\s*(?:&|and)?\s*cheese/.test(lower)) {
      addCandidate('Goodles Mac & Cheese', 'Goodles mac and cheese');
      addCandidate('Goodles Cheddy Mac', 'Goodles Cheddy Mac');
    }
    if (isChomps || /beef\s+stick|meat\s+stick|jerky|protein\s+snack/.test(lower)) {
      addCandidate('Chomps Original Beef Stick', 'Chomps Original Beef Stick');
      addCandidate('Chomps Beef Snack Sticks', 'Chomps beef snack sticks');
    }
    const sellableUnit = /6\.5\s*oz/i.test(hay) ? '6.5 oz bag' : (/oz/i.test(hay) ? 'retail bag' : 'retail unit');
    if (isSiete && /tortilla\s+chips?/.test(lower) && websiteTermsUsed.indexOf('tortilla chips') === -1) websiteTermsUsed.push('tortilla chips');
    if ((isKettle || !isSiete) && /kettle\s+chips?|potato\s+chips?|chips/.test(lower) && websiteTermsUsed.indexOf('kettle chips') === -1 && !isSiete) websiteTermsUsed.push('kettle chips');
    return {
      schema: 'idb.w432-website-product-terms.v1',
      productCandidates,
      selectedProductCandidate: productCandidates[0] || '',
      sellableUnit,
      casePackName: '12-Count Case Pack',
      websiteTermsUsed,
      rejectedGenericTerms: ['Product 12-Count Case Pack', 'Core Material Input', 'Product Seasoning Blend', 'Prepare Materials', 'Build Product', 'Finished Good', 'Production Line', 'Ingredient Blend', 'Packaging Component', 'BEVERAGE']
    };
  }

  function namingAdvisoryForProductEvidenceW450(source, productTerms) {
    const hay = String([
      source && source.prospect,
      source && source.website,
      source && source.signalText,
      source && source.notes,
      source && source.agenda,
      source && source.productSeed,
      source && source.productFamily,
      productTerms && productTerms.productCandidates && productTerms.productCandidates.join(' '),
      productTerms && productTerms.websiteTermsUsed && productTerms.websiteTermsUsed.join(' ')
    ].join(' ')).toLowerCase();
    const hasWebsite = !!(source && str(source.website));
    const hasNotes = !!(source && str(source.notes || source.signalText || source.agenda));
    const mk = function (spec) {
      return Object.assign({
        schema: 'idb.w450-llm-product-naming-advisory.v1',
        writeAuthority: 'none',
        creationAllowed: false,
        advisoryOnly: true,
        namingAdvisoryUsed: true,
        source: hasWebsite ? 'llm_website_product_evidence' : (hasNotes ? 'llm_notes_product_evidence' : 'fallback_no_product_found'),
        confidencePercent: hasWebsite ? 86 : (hasNotes ? 78 : 42),
        evidenceTerms: [],
        alternateProductCandidates: [],
        summary: 'LLM/category advisory used only to shape product-realistic names; no drawer writes or SuiteScript invocation authority.'
      }, spec || {});
    };
    if (/kodiak/.test(hay)) {
      return mk({
        primaryProductCandidate: 'Kodiak Power Cakes Buttermilk Flapjack Mix',
        alternateProductCandidates: ['Kodiak Protein Pancake Mix', 'Kodiak Oat & Honey Flapjack Mix'],
        evidenceTerms: ['Kodiak', 'Power Cakes', 'flapjack mix', 'protein pancake mix', 'case pack'],
        productFamily: 'Protein Pancake and Flapjack Mix',
        distributionBase: 'Kodiak Power Cakes Buttermilk Mix',
        componentNames: ['Whole Grain Wheat and Oat Flour Blend', 'Whey Protein Blend', 'Leavening and Sea Salt Blend', 'Retail Carton and Case Packaging'],
        operationNames: ['Receive Flour and Protein Blend', 'Blend Dry Mix', 'Fill Retail Cartons', 'Case Pack', 'QC Finished Cases']
      });
    }
    if (/biena|chickpea|chick\s*pea/.test(hay)) {
      return mk({
        primaryProductCandidate: 'Biena Roasted Chickpeas',
        alternateProductCandidates: ['Biena Sea Salt Chickpea Snacks', 'Biena Honey Roasted Chickpeas', 'Biena Chickpea Puffs'],
        evidenceTerms: ['Biena', 'roasted chickpeas', 'seasoning', 'retail bag', 'case pack'],
        productFamily: 'Roasted Chickpea Snacks',
        distributionBase: 'Biena Roasted Chickpeas',
        componentNames: ['Chickpea Input', 'Sea Salt Seasoning Blend', 'Retail Bag and Case Packaging'],
        operationNames: ['Receive Chickpeas and Seasoning', 'Roast Chickpeas', 'Season and Cool', 'Bag and Case Pack', 'QC Finished Cases']
      });
    }
    if (/chomps|beef\s+stick|meat\s+stick|jerky/.test(hay)) {
      return mk({
        primaryProductCandidate: 'Chomps Original Beef Stick',
        alternateProductCandidates: ['Chomps Beef Snack Sticks', 'Chomps Original Turkey Stick'],
        evidenceTerms: ['Chomps', 'beef stick', 'protein snack', 'wrapper', 'case pack'],
        productFamily: 'Meat Snack Sticks',
        distributionBase: 'Chomps Original Beef Stick',
        componentNames: ['Beef Protein Input', 'Seasoning and Marinade Blend', 'Stick Wrapper and Retail Case Packaging'],
        operationNames: ['Prep Protein and Marinade', 'Smoke or Dehydrate', 'Cool and Inspect', 'Pack and Case', 'QC Finished Cases']
      });
    }
    if (/bachan|japanese\s+barbe?cue|barbe?cue\s+sauce|bbq\s+sauce|sauce\s+batch/.test(hay)) {
      return mk({
        primaryProductCandidate: 'Bachan’s Original Japanese Barbecue Sauce',
        alternateProductCandidates: ['Bachan’s Hot and Spicy Japanese Barbecue Sauce', 'Bachan’s Yuzu Japanese Barbecue Sauce'],
        evidenceTerms: ['Bachan’s', 'Japanese barbecue sauce', 'sauce batch', 'retail bottle', 'case pack'],
        productFamily: 'Bottled Sauce CPG',
        distributionBase: 'Bachan’s Original Japanese Barbecue Sauce',
        componentNames: ['Soy Sauce and Mirin Base', 'Ginger Garlic Seasoning Blend', 'Retail Bottle and Case Packaging'],
        operationNames: ['Receive Sauce Base and Seasonings', 'Blend Sauce Batch', 'Fill Retail Bottles', 'Cap, Label, and Case Pack', 'QC Finished Cases']
      });
    }
    if (/goodles|mac\s*(?:&|and)?\s*cheese/.test(hay)) {
      return mk({
        primaryProductCandidate: 'Goodles Mac & Cheese',
        alternateProductCandidates: ['Goodles Cheddy Mac', 'Goodles Protein Mac & Cheese'],
        evidenceTerms: ['Goodles', 'mac and cheese', 'pasta', 'cheese sauce', 'retail box'],
        productFamily: 'Mac and Cheese',
        distributionBase: 'Goodles Mac & Cheese',
        componentNames: ['Pasta Input', 'Cheese Sauce Blend', 'Retail Box and Case Packaging'],
        operationNames: ['Receive Pasta and Cheese Blend', 'Blend Cheese Sauce Mix', 'Fill Pasta Packs', 'Case Pack', 'QC Finished Cases']
      });
    }
    if (/siete/.test(hay)) {
      return mk({
        primaryProductCandidate: /ma[ií]z|sea\s+salt/.test(hay) ? 'Siete Maíz Sea Salt Tortilla Chips' : 'Siete Grain Free Tortilla Chips',
        alternateProductCandidates: ['Siete Maíz Sea Salt Tortilla Chips', 'Siete Grain Free Tortilla Chips', 'Siete Taco Shells'],
        evidenceTerms: ['Siete', 'tortilla chips', 'masa', 'avocado oil', 'sea salt'],
        productFamily: 'Tortilla Chips',
        distributionBase: /ma[ií]z|sea\s+salt/.test(hay) ? 'Siete Maíz Sea Salt Tortilla Chips' : 'Siete Grain Free Tortilla Chips',
        componentNames: ['Corn Masa Input', 'Avocado Oil Frying Input', 'Sea Salt Seasoning', 'Retail Bag and Case Packaging'],
        operationNames: ['Mix Masa', 'Sheet and Cut Tortilla Chips', 'Fry in Avocado Oil', 'Season with Sea Salt', 'Bag, Case Pack, and QC']
      });
    }
    return mk({ namingAdvisoryUsed: false, source: 'fallback_no_product_found', confidencePercent: 42 });
  }

  function visibleProductAccentPolishW439(name) {
    return str(name)
      .replace(/\bSiete\s+Maiz\b/g, 'Siete Maíz')
      .replace(/\bSiete\s+MAIZ\b/g, 'Siete Maíz');
  }

  function kettleProductBuildPlanFixtureW432(opts) {
    return productBuildPlanW432(Object.assign({}, opts || {}, {
      signalText: [
        opts && opts.signalText,
        'Kettle Brand Air Fried Sea Salt & Vinegar kettle chips 6.5 oz bag kettle cooked air finished'
      ].filter(Boolean).join(' ')
    }));
  }

  function industryNativeManufacturingNamingW442(input) {
    const source = input || {};
    const distributionBase = visibleProductAccentPolishW439(str(source.distributionBase || source.productName || 'Product').replace(/\s+12-Count Case Pack$/i, ''));
    const evidenceText = [
      distributionBase,
      source.brandName,
      source.productFamily,
      Array.isArray(source.websiteTermsUsed) ? source.websiteTermsUsed.join(' ') : '',
      source.signalText,
      source.website
    ].join(' ').toLowerCase();
    const foodSnack = /\b(siete|kettle|biena|chickpea|chick pea|chip|chips|snack|food|masa|tortilla|seasoning|case pack|cpg)\b/.test(evidenceText);
    const beauty = /\b(beauty|cosmetic|skin|skincare|lotion|cream|serum|shampoo|conditioner|personal care|formula|fill run)\b/.test(evidenceText);
    const industrial = /\b(industrial|equipment|machine|machinery|configured|assembly unit|subassembly|component build|motor|pump|valve|tooling)\b/.test(evidenceText);
    const apparel = /\b(apparel|garment|textile|fabric|cut and sew|size|colorway)\b/.test(evidenceText);
    const base = {
      industry: 'general_manufacturing',
      industryNativeManufacturedItemName: `${distributionBase} Production Batch`,
      manufacturingOutputName: `${distributionBase} Finished Case Output`,
      manufacturingReadinessPhrase: 'production batch readiness',
      manufacturingRecordLabel: 'Production Batch',
      componentGroupLabel: 'Inputs',
      operationFlowLabel: 'Line Flow',
      industryManufacturingTerms: ['Production Batch', 'Finished Case Output', 'Component Input', 'BOM', 'Work Order'],
      industryForbiddenVisibleTerms: ['Finished Good readiness', 'Ingredient Blend', 'Packaging Component', 'Production Line']
    };
    if (beauty) {
      return Object.assign({}, base, {
        industry: 'health_beauty_personal_care',
        industryNativeManufacturedItemName: `${distributionBase} Batch Blend`,
        manufacturingOutputName: `${distributionBase} Filled Unit Batch`,
        manufacturingReadinessPhrase: 'batch blend readiness',
        manufacturingRecordLabel: 'Batch Blend',
        operationFlowLabel: 'Fill and Pack Flow',
        industryManufacturingTerms: ['Batch Blend', 'Formula Batch', 'Fill Run', 'Packaging Run', 'Raw Material Input']
      });
    }
    if (industrial) {
      return Object.assign({}, base, {
        industry: 'industrial_equipment',
        industryNativeManufacturedItemName: `${distributionBase} Final Assembly Unit`,
        manufacturingOutputName: `${distributionBase} Configured Equipment Build`,
        manufacturingReadinessPhrase: 'final assembly readiness',
        manufacturingRecordLabel: 'Final Assembly',
        componentGroupLabel: 'Purchased Components',
        operationFlowLabel: 'Assembly Flow',
        industryManufacturingTerms: ['Final Assembly Unit', 'Configured Equipment Build', 'Subassembly', 'Purchased Component', 'Work Order']
      });
    }
    if (apparel) {
      return Object.assign({}, base, {
        industry: 'apparel_textile',
        industryNativeManufacturedItemName: `${distributionBase} Cut and Sew Batch`,
        manufacturingOutputName: `${distributionBase} Finished Pack Output`,
        manufacturingReadinessPhrase: 'cut-and-sew batch readiness',
        manufacturingRecordLabel: 'Cut and Sew Batch',
        componentGroupLabel: 'Materials',
        operationFlowLabel: 'Production Flow',
        industryManufacturingTerms: ['Cut and Sew Batch', 'Material Input', 'Finished Pack Output', 'Work Order']
      });
    }
    if (foodSnack) {
      return Object.assign({}, base, {
        industry: 'food_snack_cpg',
        industryNativeManufacturedItemName: `${distributionBase.replace(/\bChips\b/i, 'Chip')} Production Batch`,
        manufacturingOutputName: `${distributionBase} Finished Case Output`,
        manufacturingReadinessPhrase: 'production batch readiness',
        manufacturingRecordLabel: 'Production Batch',
        componentGroupLabel: 'Inputs',
        operationFlowLabel: 'Line Flow',
        industryManufacturingTerms: ['Production Batch', 'Finished Case Output', 'Ingredient Input', 'Packaging Input', 'Line Flow']
      });
    }
    return base;
  }

  function productBuildPlanW432(opts) {
    const source = opts || {};
    const prospect = idbCanonicalProspectNameW422(source.prospect || 'IDB Prospect', source.website);
    const productTerms = extractWebsiteProductTermsW432(source);
    const advisoryW450 = namingAdvisoryForProductEvidenceW450(source, productTerms);
    const selectedProduct = str(productTerms.selectedProductCandidate || advisoryW450.primaryProductCandidate || source.productName || source.product_name || source.productSeed || source.productFamily);
    const genericProduct = /^(finished good|product \/ sku|product|inventory \/ fulfillment|assembly|proof item)$/i.test(selectedProduct);
    const productName = genericProduct || !selectedProduct ? `${prospect} Product` : selectedProduct;
    const brandName = /bachan/i.test(productName) || /bachan/i.test(prospect) ? 'Bachan’s' : (/kodiak/i.test(productName) || /kodiak/i.test(prospect) ? 'Kodiak' : (/goodles/i.test(productName) || /goodles/i.test(prospect) ? 'Goodles' : (/kettle/i.test(productName) || /kettle/i.test(prospect) ? 'Kettle' : (/siete/i.test(productName) || /siete/i.test(prospect) ? 'Siete' : (/biena/i.test(productName) || /biena/i.test(prospect) ? 'Biena' : (/chomps/i.test(productName) || /chomps/i.test(prospect) ? 'Chomps' : prospect.split(/\s+/).slice(0, 2).join(' ')))))));
    const shortProduct = productName
      .replace(/\bKettle\s+Brand\b/ig, 'Kettle')
      .replace(/\bKettle\s+Chips\b/ig, '')
      .replace(/\bSiete\s+Foods\b/ig, 'Siete')
      .replace(/\s+/g, ' ')
      .trim();
    const productForNames = /kettle/i.test(brandName) && !/^kettle\b/i.test(shortProduct)
      ? `${brandName} ${shortProduct}`
      : /siete/i.test(brandName) && !/^siete\b/i.test(shortProduct)
        ? `${brandName} ${shortProduct}`
      : shortProduct;
    const isKodiakPlanW450 = /kodiak|power\s*cakes?|flapjack|pancake\s+mix|protein\s+pancake/i.test([productForNames, productName, source.signalText || source.notes || '', source.website || ''].join(' '));
    const isJerkyPlanW448 = /chomps|jerky|meat snack|protein snack|beef stick/i.test([productForNames, productName, source.signalText || source.notes || '', source.website || ''].join(' '));
    const isChickpeaSnackPlanW449 = /biena|chickpea|chick\s*pea|roasted\s+chickpea/i.test([productForNames, productName, source.signalText || source.notes || '', source.website || ''].join(' '));
    const distributionBase = advisoryW450 && advisoryW450.distributionBase
      ? advisoryW450.distributionBase
      : /siete/i.test(productForNames) && /ma[ií]z/i.test(productForNames) && /sea\s+salt/i.test(productForNames)
        ? 'Siete Maíz Sea Salt Tortilla Chips'
      : /goodles|mac\s*(?:&|and)?\s*cheese|cheese\s*production/i.test(productForNames)
        ? 'Goodles Line-Ready Mac & Cheese'
      : isChickpeaSnackPlanW449
        ? 'Biena Roasted Chickpea Snacks'
      : isJerkyPlanW448
        ? 'Chomps Jerky Snack Sticks'
      : /sea salt/i.test(productForNames)
        ? 'Kettle Air Fried Sea Salt & Vinegar'
      : productForNames;
    const alternateProductCandidates = (productTerms.productCandidates || []).concat(advisoryW450.alternateProductCandidates || []).filter(function (candidate, index, list) {
      return candidate && list.indexOf(candidate) === index;
    }).filter(function (candidate) {
      return candidate && candidate !== productTerms.selectedProductCandidate;
    });
    const componentNames = advisoryW450 && advisoryW450.componentNames && advisoryW450.componentNames.length ? advisoryW450.componentNames.slice(0, 3) : [
      /siete/i.test(distributionBase) ? 'Siete Corn Masa Input' : (/goodles|mac\s*(?:&|and)?\s*cheese/i.test(distributionBase) ? 'Goodles Pasta Input' : (isChickpeaSnackPlanW449 ? 'Biena Chickpea Input' : (isJerkyPlanW448 ? `${brandName} Beef and Turkey Protein Input` : (/sea salt/i.test(distributionBase) ? 'Kettle Potato Slice Input' : `${brandName} Product-Specific Input`)))),
      /siete/i.test(distributionBase) ? 'Avocado Oil Frying Input' : (/goodles|mac\s*(?:&|and)?\s*cheese/i.test(distributionBase) ? 'Cheese Sauce Seasoning Blend' : (isChickpeaSnackPlanW449 ? 'Sea Salt and Oil Roasting Seasoning' : (isJerkyPlanW448 ? `${brandName} Smokehouse Seasoning Marinade` : (/sea salt/i.test(distributionBase) ? 'Sea Salt & Vinegar Seasoning Blend' : `${brandName} Product-Specific Seasoning`)))),
      /siete/i.test(distributionBase) ? 'Sea Salt Seasoning and Retail Bag Packaging' : (/goodles|mac\s*(?:&|and)?\s*cheese/i.test(distributionBase) ? 'Retail Carton and Case Packaging' : (isChickpeaSnackPlanW449 ? 'Retail Pouch and Case Packaging' : (isJerkyPlanW448 ? `${brandName} Stick Wrapper and Retail Case Packaging` : (/6\.5\s*oz/i.test(productTerms.sellableUnit) || /sea salt/i.test(distributionBase) ? '6.5 oz Bag and Case Packaging' : `${brandName} Retail Bag and Case Packaging`))))
    ];
    const industryNativeW442 = industryNativeManufacturingNamingW442({
      distributionBase,
      brandName,
      productName,
      productFamily: /siete/i.test(productName) ? 'Siete Tortilla Chips' : (isKodiakPlanW450 ? 'Protein Pancake and Flapjack Mix' : (isChickpeaSnackPlanW449 ? 'Chickpea Snacks' : (isJerkyPlanW448 ? 'Meat Snacks' : (/chips/i.test(productName) ? 'Kettle Chips' : (source.productFamily || 'Product Family'))))),
      websiteTermsUsed: productTerms.websiteTermsUsed,
      signalText: source.signalText || source.notes || '',
      website: source.website || ''
    });
    let internalAssemblyItemNameW445 = /siete/i.test(distributionBase)
      ? trimLen(distributionBase
        .replace(/\bSea\s+Salt\s+/i, '')
        .replace(/\bChips\b/i, 'Chip')
        .replace(/\s+/g, ' ')
        .trim() + ' Batch', 60)
      : trimLen(industryNativeW442.industryNativeManufacturedItemName, 60);
    if (isJerkyPlanW448) {
      internalAssemblyItemNameW445 = trimLen(`${distributionBase} Production Batch`, 60);
    }
    const hasProductEvidenceW449 = !!(productTerms.selectedProductCandidate || advisoryW450.namingAdvisoryUsed || isKodiakPlanW450 || isChickpeaSnackPlanW449 || isJerkyPlanW448 || /siete|goodles|kettle|kodiak|bachan|barbe?cue\s+sauce|sauce\s+batch|bottle|power\s*cakes?|flapjack|pancake|mac\s*(?:&|and)?\s*cheese|chip|tortilla/i.test(distributionBase));
    const productCandidateSourceW449 = productTerms.selectedProductCandidate
      ? 'llm_website_product_evidence'
      : advisoryW450.namingAdvisoryUsed
        ? advisoryW450.source
      : hasProductEvidenceW449
        ? (/https?:\/\//i.test(str(source.website)) ? 'llm_website_product_evidence' : 'llm_notes_product_evidence')
        : 'fallback_no_product_found';
    const confidencePercentW449 = productTerms.selectedProductCandidate ? 88 : (advisoryW450.namingAdvisoryUsed ? Number(advisoryW450.confidencePercent || 82) : (hasProductEvidenceW449 ? 76 : 42));
    const fallbackBlockedGenericTermsW450 = ['Machine Unit', 'Core Material Input', 'Primary Material Input', 'Product 12-Count Case Pack', 'Product Seasoning Blend', 'Build Product', 'Prepare Materials', 'Final Assembly Unit', 'Finished Assembly Unit', 'Generic Product', 'Component Input'];
    const operationNamesW450 = advisoryW450 && advisoryW450.operationNames && advisoryW450.operationNames.length ? advisoryW450.operationNames.slice(0, 5) : (/siete/i.test(distributionBase)
        ? ['Mix Masa', 'Sheet and Cut Tortilla Chips', 'Fry in Avocado Oil', 'Season with Sea Salt', 'Bag, Case Pack, and QC']
        : /goodles|mac\s*(?:&|and)?\s*cheese/i.test(distributionBase)
        ? ['Receive Pasta and Cheese Blend', 'Blend Cheese Sauce Mix', 'Fill Pasta Packs', 'Case Pack', 'QC Finished Cases']
        : isChickpeaSnackPlanW449
        ? ['Receive Chickpeas and Seasoning', 'Roast Chickpeas', 'Season and Cool', 'Bag and Case Pack', 'QC Finished Cases']
        : isJerkyPlanW448
        ? ['Prep Protein and Marinade', 'Smoke or Dehydrate', 'Cool and Inspect', 'Pack and Case', 'QC Finished Cases']
        : /sea salt/i.test(distributionBase)
        ? ['Slice and Rinse', 'Kettle Cook', 'Air Finish', 'Season', 'Case Pack and QC']
        : (hasProductEvidenceW449 ? ['Receive Product-Specific Inputs', 'Run Product-Specific Process', 'Inspect Product Output', 'Pack and QC'] : ['Review Product Inputs', 'Run Product Assembly', 'Inspect Output', 'Pack and QC']));
    const plan = {
      schema: 'idb.w432-product-build-plan.v1',
      source: productCandidateSourceW449,
      writeAuthority: 'none',
      creationAllowed: false,
      confidence: confidencePercentW449 >= 80 ? 'high' : (confidencePercentW449 >= 65 ? 'medium' : 'low'),
      confidencePercent: confidencePercentW449,
      primaryProductCandidate: productTerms.selectedProductCandidate || advisoryW450.primaryProductCandidate || productName,
      selectedProductReason: productTerms.selectedProductCandidate ? 'Selected from website/product evidence terms for this run.' : (hasProductEvidenceW449 ? 'Selected from website/category and conversation terms; generic manufacturing fallback was blocked.' : 'No product/category evidence was found; fallback naming used.'),
      productCandidateSource: productCandidateSourceW449,
      namingAdvisoryUsed: !!advisoryW450.namingAdvisoryUsed,
      namingAdvisorySummary: advisoryW450.summary || '',
      namingAdvisoryRequestSummary: `domain=${str(source.website) || 'none'}; brand=${brandName}; notes=${str(source.notes || source.signalText || '').slice(0, 140)}`,
      namingAdvisory: advisoryW450,
      evidenceTerms: productTerms.websiteTermsUsed.concat(advisoryW450.evidenceTerms || []).concat([distributionBase, productName].filter(Boolean)).filter(function (term, index, list) {
        return term && list.indexOf(term) === index;
      }).slice(0, 12),
      rejectedFallbackReason: hasProductEvidenceW449 ? 'Food/CPG product or category evidence exists, so generic Machine Unit/Core Material naming is blocked.' : '',
      fallbackBlockedGenericTerms: hasProductEvidenceW449 ? fallbackBlockedGenericTermsW450 : [],
      nextCandidateHint: alternateProductCandidates[0] || '',
      productName,
      productFamily: advisoryW450.productFamily || (/siete/i.test(productName) ? 'Siete Tortilla Chips' : (isKodiakPlanW450 ? 'Protein Pancake and Flapjack Mix' : (isChickpeaSnackPlanW449 ? 'Chickpea Snacks' : (/chips/i.test(productName) ? 'Kettle Chips' : (source.productFamily || 'Product Family'))))),
      brandName,
      sellableUnit: productTerms.sellableUnit,
      casePackName: productTerms.casePackName,
      alternateProductCandidates,
      roleProductSelections: {
        distributionItem: productName,
        distributionProof: productName,
        distributionSupport: productName,
        assembly: productName,
        components: componentNames.slice(0, 3)
      },
      distributionItemName: trimLen(`${distributionBase} ${productTerms.casePackName}`, 80),
      distributionProofName: trimLen(`${distributionBase} Retail Replenishment`, 80),
      distributionSupportName: trimLen(`${distributionBase} Channel Supply`, 80),
      industryNativeManufacturedItemName: trimLen(industryNativeW442.industryNativeManufacturedItemName, 80),
      manufacturingOutputName: trimLen(industryNativeW442.manufacturingOutputName, 80),
      manufacturingReadinessPhrase: industryNativeW442.manufacturingReadinessPhrase,
      manufacturingRecordLabel: industryNativeW442.manufacturingRecordLabel,
      componentGroupLabel: industryNativeW442.componentGroupLabel,
      operationFlowLabel: industryNativeW442.operationFlowLabel,
      industryManufacturingTerms: industryNativeW442.industryManufacturingTerms,
      industryForbiddenVisibleTerms: industryNativeW442.industryForbiddenVisibleTerms,
      assemblyItemName: internalAssemblyItemNameW445,
      componentNames,
      bomName: trimLen(`BOM - ${distributionBase}`, 80),
      bomRevisionName: trimLen(`Revision 1 - ${distributionBase}`, 80),
      workOrderName: trimLen(`WO - ${distributionBase}`, 80),
      routingName: trimLen(advisoryW450.namingAdvisoryUsed || /siete/i.test(distributionBase) || /goodles|mac\s*(?:&|and)?\s*cheese/i.test(distributionBase) || /bachan|barbe?cue\s+sauce|sauce/i.test(distributionBase) || isChickpeaSnackPlanW449 || isJerkyPlanW448 || isKodiakPlanW450 ? `Routing - ${distributionBase}` : `Routing - ${distributionBase} Chips`, 80),
      operationNames: operationNamesW450,
      forbiddenLeakTerms: ['BEVERAGE', 'Finished Good Packaging / Case Pack', 'Production Line', 'Ingredient Blend', 'Packaging Component'].concat(fallbackBlockedGenericTermsW450),
      modeContracts: {
        createNewItemOnly: {
          forbidden: ['Finished Good', 'Ingredient', 'Formula', 'Batch', 'BOM', 'Assembly', 'Work Order', 'Routing', 'WIP', 'Production Line', 'Manufacturing Line'],
          names: ['distributionItemName', 'distributionProofName', 'distributionSupportName']
        },
        manufacturing: {
          required: ['assemblyItemName', 'componentNames', 'bomName', 'bomRevisionName', 'workOrderName']
        },
        wip: {
          required: ['routingName', 'operationNames']
        }
      },
      evidence: {
        website: str(source.website),
        productCandidates: productTerms.productCandidates,
        selectedProductCandidate: productTerms.selectedProductCandidate,
        websiteTermsUsed: productTerms.websiteTermsUsed,
        rejectedGenericTerms: productTerms.rejectedGenericTerms,
        fallbackBlockedGenericTerms: hasProductEvidenceW449 ? fallbackBlockedGenericTermsW450 : [],
        namingAdvisoryUsed: !!advisoryW450.namingAdvisoryUsed,
        namingAdvisorySummary: advisoryW450.summary || '',
        namingAdvisoryRequestSummary: `domain=${str(source.website) || 'none'}; brand=${brandName}`,
        confidencePercent: confidencePercentW449,
        rejectedFallbackReason: hasProductEvidenceW449 ? 'Generic product fallback blocked by W449 product/category evidence.' : ''
      },
      w449: {
        schema: 'idb.w450-product-routing-naming-telemetry.v1',
        foodCpgEvidence: !!(/siete|kettle|biena|chickpea|snack|food|cpg|chip|tortilla|kodiak|power\s*cakes?|flapjack|pancake|goodles|chomps/i.test([
          productName,
          distributionBase,
          source.signalText || source.notes || '',
          source.website || ''
        ].join(' '))),
        chickpeaSnackEvidence: !!isChickpeaSnackPlanW449,
        genericNamingHardStopTerms: fallbackBlockedGenericTermsW450,
        namingAdvisoryUsed: !!advisoryW450.namingAdvisoryUsed,
        namingAdvisorySource: advisoryW450.source
      }
    };
    return plan;
  }

  function visibleProductNarrativeW439(plan, opts) {
    const productPlan = plan || {};
    const options = opts || {};
    const enableManufacturing = options.enableManufacturing === true;
    const enableWip = options.enableWip === true;
    const mode = enableWip ? 'wip' : (enableManufacturing ? 'manufacturing' : 'distribution');
    const productBase = visibleProductAccentPolishW439(str(productPlan.productName || productPlan.distributionItemName || 'Product').replace(/\s+12-Count Case Pack$/i, ''));
    const distributionItem = visibleProductAccentPolishW439(productPlan.distributionItemName || `${productBase} 12-Count Case Pack`);
    const componentNames = (Array.isArray(productPlan.componentNames) ? productPlan.componentNames : []).slice(0, 3).map(visibleProductAccentPolishW439);
    const operationNames = (Array.isArray(productPlan.operationNames) ? productPlan.operationNames : []).map(visibleProductAccentPolishW439);
    const mfgTerms = industryNativeManufacturingNamingW442({
      distributionBase: productBase,
      brandName: productPlan.brandName,
      productFamily: productPlan.productFamily,
      websiteTermsUsed: productPlan.evidence && productPlan.evidence.websiteTermsUsed || []
    });
    const manufacturedItemName = visibleProductAccentPolishW439(productPlan.industryNativeManufacturedItemName || productPlan.assemblyItemName || mfgTerms.industryNativeManufacturedItemName);
    const manufacturingOutputName = visibleProductAccentPolishW439(productPlan.manufacturingOutputName || mfgTerms.manufacturingOutputName);
    const manufacturingReadinessPhrase = productPlan.manufacturingReadinessPhrase || mfgTerms.manufacturingReadinessPhrase;
    return {
      schema: 'idb.w442-visible-product-narrative.v1',
      mode,
      productBaseName: productBase,
      productDisplayName: distributionItem,
      industryNativeManufacturingW442: Object.assign({}, mfgTerms, {
        industryNativeManufacturedItemName: manufacturedItemName,
        manufacturingOutputName,
        manufacturingReadinessPhrase
      }),
      distribution: {
        itemName: distributionItem,
        proofName: visibleProductAccentPolishW439(productPlan.distributionProofName || `${productBase} Retail Replenishment`),
        supportName: visibleProductAccentPolishW439(productPlan.distributionSupportName || `${productBase} Channel Supply`),
        cockpitSubtitle: 'Retail case-pack replenishment readiness',
        storyHeadline: `Prove replenishment readiness for ${distributionItem}; then connect customer demand, allocation, case-pack availability, and fulfillment confidence.`,
        proofMove: 'Move through Customer demand, Sales Order, Product SKU, replenishment flow, and channel supply support while staying in distribution and fulfillment scope.',
        roiClaim: 'Protect retail replenishment readiness.',
        competitiveQuestion: 'How do we know case-pack availability is current enough to trust?',
        supportPathLabel: 'Retail case-pack replenishment proof'
      },
      manufacturing: {
        assemblyName: manufacturedItemName,
        manufacturingOutputName,
        manufacturingReadinessPhrase,
        manufacturingRecordLabel: productPlan.manufacturingRecordLabel || mfgTerms.manufacturingRecordLabel,
        componentNames,
        bomName: visibleProductAccentPolishW439(productPlan.bomName || `BOM - ${productBase}`),
        bomRevisionName: visibleProductAccentPolishW439(productPlan.bomRevisionName || `Revision 1 - ${productBase}`),
        workOrderName: visibleProductAccentPolishW439(productPlan.workOrderName || `WO - ${productBase}`),
        cockpitSubtitle: manufacturingReadinessPhrase,
        storyHeadline: `Prove ${manufacturingReadinessPhrase} for ${productBase}; then connect customer demand, input availability, BOM structure, packaging readiness, and work order execution.`,
        proofMove: /siete/i.test(productBase)
          ? `Move through customer demand, production batch output, ${manufacturingOutputName}, corn masa and avocado oil inputs, seasoning and packaging readiness, BOM structure, and Work Order execution.`
          : `Move through customer demand, ${manufacturingOutputName}, input availability, BOM structure, packaging readiness, and Work Order execution.`,
        roiClaim: `Protect ${manufacturingReadinessPhrase}.`,
        competitiveQuestion: 'How do we know the production batch is ready soon enough to trust?',
        supportPathLabel: 'Production batch proof'
      },
      wip: {
        routingName: visibleProductAccentPolishW439(productPlan.routingName || `Routing - ${productBase}`),
        operationNames,
        cockpitSubtitle: 'WIP routing and production readiness',
        storyHeadline: `Prove routed production readiness for ${productBase}; then connect component inputs, operation sequence, work order execution, and finished case-pack output.`,
        proofMove: operationNames.length ? `Move through ${operationNames.join(', ')} with component inputs, Work Order execution, and finished case-pack output.` : '',
        roiClaim: 'Protect routed production readiness.',
        competitiveQuestion: 'How do we know routed production readiness is current enough to trust?',
        supportPathLabel: 'WIP routing proof'
      },
      noRegression: {
        internalNamesPreserved: true,
        modeLanguageMatchesToggles: true
      }
    };
  }

  function applyProductBuildPlanToNamingPackW432(names, opts) {
    const out = sanitizeNamingPayload(Object.assign({}, names || {}));
    const plan = productBuildPlanW432(Object.assign({}, opts || {}, out || {}, {
      productSeed: out.productSeed || out.hero_item_name,
      productFamily: out.productFamily || out.industry_category
    }));
    const enableManufacturing = !!(opts && opts.enableManufacturing === true);
    const enableWip = !!(opts && opts.enableWip === true);
    out._productBuildPlanW432 = plan;
    out.hero_item_name = enableManufacturing ? plan.distributionItemName : plan.distributionItemName;
    out.assembly_name = enableManufacturing ? plan.assemblyItemName : plan.distributionProofName;
    out.component_names = enableManufacturing ? plan.componentNames.slice(0, 3) : [
      plan.distributionSupportName,
      trimLen(`${plan.distributionItemName} Allocation`, 80),
      trimLen(`${plan.distributionItemName} Retail Case Supply`, 80)
    ];
    out.bom_name = enableManufacturing ? plan.bomName : trimLen(`${plan.distributionItemName} Product Structure`, 80);
    out.bom_revision_name = enableManufacturing ? plan.bomRevisionName : `Revision 1 - ${plan.distributionItemName}`;
    out.routing_name = enableWip ? plan.routingName : '';
    out.operation_names_by_seq = enableWip ? {
      10: plan.operationNames[0],
      20: plan.operationNames[1],
      30: plan.operationNames[2],
      40: plan.operationNames[3],
      50: plan.operationNames[4]
    } : null;
    out._w432Mode = enableWip ? 'wip' : (enableManufacturing ? 'manufacturing' : 'create_new_item_only');
    out._visibleProductNarrativeW439 = visibleProductNarrativeW439(plan, { enableManufacturing, enableWip });
    return out;
  }

  function validateProductBuildPlanForModeW432(plan, opts) {
    const enableManufacturing = !!(opts && opts.enableManufacturing === true);
    const enableWip = !!(opts && opts.enableWip === true);
    const names = [
      plan && plan.distributionItemName,
      plan && plan.distributionProofName,
      plan && plan.distributionSupportName,
      enableManufacturing && plan && plan.assemblyItemName,
      enableManufacturing && plan && plan.bomName,
      enableManufacturing && plan && plan.workOrderName
    ].concat(enableManufacturing && plan ? plan.componentNames : [], enableWip && plan ? [plan.routingName].concat(plan.operationNames || []) : [])
      .filter(Boolean);
    const hay = names.join(' ');
    const errors = [];
    if (!plan || plan.schema !== 'idb.w432-product-build-plan.v1') errors.push('missing_product_build_plan');
    if (!enableManufacturing && /\b(Finished Good|Ingredient|Formula|Batch|BOM|Assembly|Work Order|Routing|WIP|Production Line|Manufacturing Line)\b/i.test(hay)) errors.push('manufacturing_terms_in_create_new_item_only');
    if (/\bBEVERAGE\b/i.test(hay)) errors.push('beverage_leak_in_customer_facing_name');
    if (enableManufacturing && (!plan.componentNames || plan.componentNames.length !== 3)) errors.push('manufacturing_requires_three_components');
    if (enableWip && (!plan.operationNames || plan.operationNames.length < 3)) errors.push('wip_requires_routing_operations');
    const foodCpgEvidence = !!(plan && plan.w449 && plan.w449.foodCpgEvidence) || /\b(food|cpg|snack|chip|chips|tortilla|chickpea|biena|kettle|siete)\b/i.test(hay);
    const genericWipNameLeak = enableWip && foodCpgEvidence && /\b(Prepare Materials|Build Product|Inspect|Production Line|Finished Good|Ingredient Blend|Packaging Component)\b/i.test(hay);
    if (genericWipNameLeak) errors.push('w449_food_cpg_generic_operation_name_hard_stop');
    return {
      schema: 'idb.w432-product-build-plan-validation.v1',
      valid: errors.length === 0,
      status: errors.length ? 'blocked' : 'accepted',
      errors,
      checkedNames: names
    };
  }

  const IDB_NON_MFG_FORBIDDEN_NAME_RE = /\b(finished\s+good|ingredient(?:\s+blend)?|production\s+line|bom|assembly|work\s+order|routing|wip|manufacturing\s+line)\b/i;

  function idbNameHasNonManufacturingForbiddenTerm(name) {
    return IDB_NON_MFG_FORBIDDEN_NAME_RE.test(String(name || ''));
  }

  function arrayFromMaybe(value) {
    return Array.isArray(value) ? value.map(str).filter(Boolean) : [];
  }

  function lowerList(values) {
    return arrayFromMaybe(values).map(function (value) { return value.toLowerCase(); });
  }

  function runnerLaneVocabularyPolicyV1(opts) {
    const request = opts && opts.confirmedBuildRequestJson || {};
    const demoPath = request.demoPath || {};
    const stateAuthority = request.stateAuthority || {};
    const contract = request.resultValidationExpectations && request.resultValidationExpectations.recordContract || {};
    const selectedToggles = request.selectedToggles || {};
    const operatingMode = str(request.resolvedOperatingMode || contract.resolvedOperatingMode || '');
    const laneId = str(demoPath.laneId || stateAuthority.exportedLaneId || stateAuthority.confirmedLaneId || stateAuthority.selectedLaneId || selectedToggles.selectedLaneId || request.selectedLaneId || '');
    const fallbackText = String([
      opts && opts.extId,
      opts && opts.prospect,
      opts && opts.website,
      opts && opts.notes,
      opts && opts.agenda,
      opts && opts.familyKey,
      opts && opts.scenario
    ].join(' '));
    const text = String([
      operatingMode,
      laneId,
      demoPath.laneName,
      demoPath.proofAnchor,
      demoPath.familyKey,
      contract.label,
      arrayFromMaybe(request.requiredRecordRoles).join(' '),
      arrayFromMaybe(contract.requiredRecordRoles).join(' '),
      arrayFromMaybe(contract.allowedNouns).join(' '),
      fallbackText
    ].join(' ')).toLowerCase();
    const invalidTerms = lowerList(contract.invalidTerms).concat([
      'finished good',
      'ingredient',
      'ingredient blend',
      'formula',
      'batch',
      'assembly',
      'work order',
      'routing',
      'wip',
      'manufacturing line'
    ]);
    const enableManufacturing = !!(opts && opts.enableManufacturing === true);
    const enableWip = !!(opts && opts.enableWip === true);
    let modeKey = '';
    if (laneId === 'industrial_equipment') modeKey = enableWip ? 'wip_manufacturing' : 'manufacturing';
    else if (laneId === 'food_beverage' || laneId === 'products_cpg') modeKey = enableManufacturing ? 'food_ingredient_manufacturing' : 'food_replenishment';
    else if (laneId === 'dealer_hardgoods') modeKey = 'dealer_hardgoods';
    else if (laneId === 'apparel_accessories') modeKey = 'apparel_style_matrix';
    else if (/apparel_style_matrix|apparel|style|size\s*\/\s*color/.test(text)) modeKey = 'apparel_style_matrix';
    else if (/dealer_hardgoods|dealer|hardgoods|allocation/.test(text)) modeKey = 'dealer_hardgoods';
    else if (/food_batch_manufacturing|food|beverage|cpg|snack|chips|pretzel|popcorn|packaged/.test(text)) modeKey = enableManufacturing ? 'food_ingredient_manufacturing' : 'food_replenishment';
    else if (/distribution_replenishment|industrial_distribution|distribution|branch|replenishment|fulfillment|availability/.test(text)) modeKey = 'distribution_replenishment';
    else if (/manufacturing|assembly|work order|routing|wip/.test(text) && (enableManufacturing || enableWip)) modeKey = enableWip ? 'wip_manufacturing' : 'manufacturing';
    if (!modeKey && !enableManufacturing && !enableWip) modeKey = 'distribution_replenishment';
    if (!modeKey) modeKey = '';
    const prospect = idbCanonicalProspectNameW422(str(opts && opts.prospect) || 'IDB Prospect', opts && opts.website);
    const prospectSpecificProofNames = idbProspectSpecificProofNamesForModeW414(prospect, modeKey, opts || {});
    const finalResultRoleLabels = idbFinalResultRoleLabelsForModeW414(modeKey);
    const prospectSpecificProofNamingMarker = {
      schema: 'idb.runner-prospect-specific-proof-naming-marker.w341.v1',
      marker: prospectSpecificProofNames ? 'W341 prospect-specific proof naming active' : 'W341 prospect-specific proof naming inactive',
      active: !!prospectSpecificProofNames,
      modeKey,
      proofNames: prospectSpecificProofNames,
      finalResultRoleLabels
    };
    return {
      schema: 'idb.runner-lane-vocabulary-policy.v1',
      source: request.schema === 'idb.confirmed-build-request.v1' ? 'confirmed_build_request' : 'runner_fallback',
      operatingMode,
      laneId,
      modeKey,
      enableManufacturing,
      enableWip,
      allowedNouns: lowerList(contract.allowedNouns),
      invalidTerms,
      prospectSpecificProofNames,
      prospectSpecificProofNamingMarker,
      finalResultRoleLabels
    };
  }

  function idbFinalResultRoleLabelsForModeW414(modeKey) {
    if (modeKey === 'food_ingredient_manufacturing') {
      return {
        heroItem: 'Finished Good Assembly Item',
        matrixProofItem: 'BOM / Revision Structure',
        componentItem: 'Ingredient / Packaging Item'
      };
    }
    if (modeKey === 'food_replenishment') {
      return {
        heroItem: 'Retail Case Pack SKU',
        matrixProofItem: 'Retail Replenishment Flow',
        componentItem: 'Channel Supply Support'
      };
    }
    if (modeKey === 'manufacturing') {
      return {
        heroItem: 'Configured Equipment Item',
        matrixProofItem: 'Assembly / Component Readiness',
        componentItem: 'Component Supply Item'
      };
    }
    if (modeKey === 'wip_manufacturing') {
      return {
        heroItem: 'Configured Equipment Item',
        matrixProofItem: 'WIP / Routing Readiness',
        componentItem: 'Component Supply Item'
      };
    }
    if (modeKey === 'dealer_hardgoods') {
      return {
        heroItem: 'Channel Availability SKU',
        matrixProofItem: 'Dealer Replenishment Flow',
        componentItem: 'Allocation Support SKU'
      };
    }
    if (modeKey === 'apparel_style_matrix') {
      return {
        heroItem: 'Style SKU',
        matrixProofItem: 'Omnichannel Availability Flow',
        componentItem: 'Size / Color Variant'
      };
    }
    return {
      heroItem: 'Product SKU',
      matrixProofItem: 'Branch Availability / Replenishment Flow',
      componentItem: 'Fulfillment Support SKU'
    };
  }

  function idbProspectSpecificProofNamesForModeW414(prospect, modeKey, opts) {
    if (modeKey === 'distribution_replenishment') return idbDistributionProofNamesW341(prospect, opts || {});
    const productSeed = idbProofNameProductSeedW417(opts || {}, 'Finished Good');
    if (modeKey === 'food_ingredient_manufacturing') {
      return {
        schema: 'idb.runner-prospect-specific-proof-names.w414.v1',
        proofNoun: productSeed,
        heroItemName: trimLen(`${prospect} ${productSeed}`, 60),
        matrixProofItemName: trimLen(`${prospect} ${productSeed} Formula / Batch`, 60),
        componentItemName: trimLen(`${prospect} ${productSeed} Ingredient / Packaging`, 60)
      };
    }
    if (modeKey === 'food_replenishment') {
      return {
        schema: 'idb.runner-prospect-specific-proof-names.w414.v1',
        proofNoun: productSeed,
        heroItemName: trimLen(`${prospect} ${productSeed}`, 60),
        matrixProofItemName: trimLen(`${prospect} ${productSeed} Replenishment`, 60),
        componentItemName: trimLen(`${prospect} ${productSeed} Packaging / Case Pack`, 60)
      };
    }
    if (modeKey === 'manufacturing' || modeKey === 'wip_manufacturing') {
      return {
        schema: 'idb.runner-prospect-specific-proof-names.w414.v1',
        proofNoun: 'Configured Equipment',
        heroItemName: trimLen(`${prospect} Configured Equipment`, 60),
        matrixProofItemName: trimLen(modeKey === 'wip_manufacturing' ? `${prospect} WIP / Routing Readiness` : `${prospect} Assembly Readiness`, 60),
        componentItemName: trimLen(`${prospect} Component Supply`, 60)
      };
    }
    if (modeKey === 'dealer_hardgoods') {
      return {
        schema: 'idb.runner-prospect-specific-proof-names.w414.v1',
        proofNoun: 'Channel Availability',
        heroItemName: trimLen(`${prospect} Channel Availability SKU`, 60),
        matrixProofItemName: trimLen(`${prospect} Dealer Replenishment Flow`, 60),
        componentItemName: trimLen(`${prospect} Allocation Support SKU`, 60)
      };
    }
    if (modeKey === 'apparel_style_matrix') {
      return {
        schema: 'idb.runner-prospect-specific-proof-names.w414.v1',
        proofNoun: 'Style',
        heroItemName: trimLen(`${prospect} Style SKU`, 60),
        matrixProofItemName: trimLen(`${prospect} Omnichannel Availability Flow`, 60),
        componentItemName: trimLen(`${prospect} Size / Color Variant`, 60)
      };
    }
    return null;
  }

  function idbCanonicalProspectNameW422(prospect, website) {
    const domain = extractDomain(website || '');
    let clean = idbProofNameProspectW417(prospect);
    clean = clean
      .replace(/\b(?:times\s+)?(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/ig, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (/herrs\.com$/i.test(domain) || /^herr'?s$/i.test(clean)) return 'Herr Foods';
    return trimLen(clean || idbProofNameProspectW417(prospect) || 'IDB Prospect', 50);
  }

  function idbProofNameProspectW417(prospect) {
    const clean = str(prospect)
      .replace(/\bW\d{2,5}\b/ig, ' ')
      .replace(/\b(?:times\s+)?(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/ig, ' ')
      .replace(/\b(reduced|rerun|retry|smoke|test|copy|demo)\b/ig, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return trimLen(clean || str(prospect) || 'IDB Prospect', 50);
  }

  function idbProofNameProductSeedW417(opts, fallback) {
    const request = opts && opts.confirmedBuildRequestJson || {};
    const demoPath = request.demoPath || {};
    const candidates = [
      demoPath.productSeed,
      request.identity && request.identity.productSeed,
      request.productSeed,
      demoPath.productFamily,
      request.identity && request.identity.productFamily,
      request.productFamily,
      opts && opts.productSeed,
      fallback
    ].map(str).filter(Boolean);
    const seed = candidates[0] || fallback || 'Proof Item';
    return trimLen(seed
      .replace(/\b(readiness|confidence|risk|reduced|demo)\b/ig, ' ')
      .replace(/\s+/g, ' ')
      .trim() || fallback || 'Proof Item', 40);
  }

  function idbNameHasPolicyForbiddenTerm(name, policy) {
    const lower = String(name || '').toLowerCase();
    if (idbNameHasNonManufacturingForbiddenTerm(lower)) return true;
    if (policy && policy.modeKey === 'distribution_replenishment' && /\b(style|formula|ingredient|batch|assembly|work\s+order|routing|wip)\b/i.test(lower)) return true;
    const invalidTerms = policy && Array.isArray(policy.invalidTerms) ? policy.invalidTerms : [];
    return invalidTerms.some(function (term) {
      return term && lower.indexOf(term) !== -1;
    });
  }

  function idbNamingProspect(names, opts) {
    const fromOpts = str(opts && opts.prospect);
    if (fromOpts) return idbCanonicalProspectNameW422(fromOpts, opts && opts.website);
    const candidates = [
      names && names.prospect,
      names && names.customerName,
      names && names.customer_name,
      names && names.hero_item_name,
      names && names.assembly_name
    ].map(str).filter(Boolean);
    let candidate = candidates[0] || 'IDB Prospect';
    candidate = candidate
      .replace(/\s+(Finished\s+Good|Ingredient\s+Blend|Production\s+Line|Assembly|BOM|Work\s+Order|Routing|WIP|Manufacturing\s+Line)$/i, '')
      .replace(/\s+(Product|Style|Channel\s+Availability|Product\s+Availability|Dealer\s+Replenishment|Omnichannel\s+Availability|Fulfillment\s+Support|Allocation\s+Support)\s+(SKU|Flow|Item)$/i, '');
    return trimLen(candidate || 'IDB Prospect', 50);
  }

  function idbNamingModeKey(names, opts) {
    const hay = String([
      opts && opts.laneId,
      opts && opts.familyKey,
      names && names.familyKey,
      names && names._authoritativeFamilyKey,
      names && names._sharedEngineFamily,
      names && names._source,
      names && names.industry_category,
      names && names.scenario_label,
      names && names.scenario_name,
      names && names.assembly_name,
      names && Array.isArray(names.component_names) ? names.component_names.join(' ') : ''
    ].join(' ')).toLowerCase();
    if (/distribution_replenishment|industrial_distribution|distribution|branch|industrial distributor/.test(hay)) return 'distribution_replenishment';
    if (/food|beverage|cpg|ingredient|recipe|formula|batch/.test(hay)) return 'food_ingredient_manufacturing';
    if (/dealer|hardgoods|outdoor|replenishment|fulfillment|distribution|channel/.test(hay)) return 'dealer_hardgoods';
    if (/apparel|footwear|style|sku|color|size/.test(hay)) return 'apparel_style_matrix';
    if (/wip|routing|work order/.test(hay)) return 'wip_manufacturing';
    if (/manufacturing|assembly|production/.test(hay)) return 'manufacturing';
    return 'distribution_replenishment';
  }

  function idbProspectProofPrefixW341(prospect) {
    const clean = str(prospect)
      .replace(/\b(electrical|electric|contractor|supply|industrial|industries|customer|account|company|co|inc|llc|ltd)\b/ig, ' ')
      .replace(/[^A-Za-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return trimLen(clean.split(' ').filter(Boolean).slice(0, 2).join(' ') || str(prospect).split(/\s+/)[0] || 'Prospect', 24);
  }

  function idbReadableDistributionProofNounW341(opts) {
    const text = String([
      opts && opts.notes,
      opts && opts.agenda,
      opts && opts.website,
      opts && opts.prospect
    ].join(' ')).toLowerCase();
    const candidates = [
      { re: /\bbreakers?\b/, noun: 'Breaker' },
      { re: /\bpanels?\b/, noun: 'Panel' },
      { re: /\bconduits?\b/, noun: 'Conduit' },
      { re: /\bfittings?\b/, noun: 'Fitting' },
      { re: /\bdisconnects?\b/, noun: 'Disconnect' },
      { re: /\bsafety\s+stock\b/, noun: 'Safety Stock' },
      { re: /\bwire\b|\bwiring\b/, noun: 'Wire' },
      { re: /\bparts?\b|\breplacement\s+parts?\b/, noun: 'Replacement Part' }
    ];
    for (let index = 0; index < candidates.length; index += 1) {
      if (candidates[index].re.test(text)) return candidates[index].noun;
    }
    return 'Product';
  }

  function idbDistributionProofNamesW341(prospect, opts) {
    const prefix = idbProspectProofPrefixW341(prospect);
    const proofNoun = idbReadableDistributionProofNounW341(opts);
    return {
      schema: 'idb.runner-prospect-specific-proof-names.w341.v1',
      proofNoun,
      heroItemName: trimLen(`${prefix} ${proofNoun} Availability SKU`, 60),
      matrixProofItemName: trimLen(`${prefix} Branch Availability / Replenishment Flow`, 60),
      componentItemName: trimLen(`${prefix} Safe Substitute Fulfillment Support SKU`, 60)
    };
  }

  function idbAllowedNonManufacturingName(role, prospect, modeKey) {
    const policy = arguments.length > 3 ? arguments[3] : null;
    const proofNames = policy && policy.prospectSpecificProofNames || null;
    if (modeKey === 'distribution_replenishment' && proofNames) {
      if (role === 'hero_item_name') return proofNames.heroItemName;
      if (role === 'assembly_name') return proofNames.matrixProofItemName;
      return proofNames.componentItemName;
    }
    if (proofNames) {
      if (role === 'hero_item_name') return proofNames.heroItemName;
      if (role === 'assembly_name') return proofNames.matrixProofItemName;
      return proofNames.componentItemName;
    }
    if (modeKey === 'dealer_hardgoods') {
      if (role === 'hero_item_name') return `${prospect} Channel Availability SKU`;
      if (role === 'assembly_name') return `${prospect} Dealer Replenishment Flow`;
      return `${prospect} Allocation Support SKU`;
    }
    if (modeKey === 'apparel_style_matrix') {
      if (role === 'hero_item_name') return `${prospect} Style SKU`;
      if (role === 'assembly_name') return `${prospect} Omnichannel Availability Flow`;
      return `${prospect} Size / Color Variant`;
    }
    if (modeKey === 'food_replenishment') {
      if (role === 'hero_item_name') return `${prospect} Snack Product Availability SKU`;
      if (role === 'assembly_name') return `${prospect} Retail Replenishment Flow`;
      return `${prospect} Packaging Supply Support SKU`;
    }
    if (role === 'hero_item_name') return `${prospect} Product Availability SKU`;
    if (role === 'assembly_name') return `${prospect} Availability Flow`;
    return `${prospect} Fulfillment Support SKU`;
  }

  function rewriteIdbNonManufacturingName(name, role, prospect, modeKey, policy) {
    const current = str(name);
    if (!current || idbNameHasPolicyForbiddenTerm(current, policy)) {
      return idbAllowedNonManufacturingName(role, prospect, modeKey, policy);
    }
    if (modeKey === 'distribution_replenishment') {
      if (role === 'hero_item_name' && /\bproduct\s+availability\s+sk?u\b/i.test(current)) return idbAllowedNonManufacturingName(role, prospect, modeKey, policy);
      if (role === 'assembly_name' && /\b(availability|replenishment)\s+flow\b/i.test(current)) return idbAllowedNonManufacturingName(role, prospect, modeKey, policy);
      if (/^component_/.test(role) && /\bfulfillment\s+support\s+sk?u\b/i.test(current)) return idbAllowedNonManufacturingName(role, prospect, modeKey, policy);
    }
    if (modeKey === 'dealer_hardgoods') {
      if (role === 'hero_item_name' && /\bproduct\s+sku\b/i.test(current)) return `${prospect} Channel Availability SKU`;
      if (role === 'assembly_name' && /\bdealer\s+fulfillment\s+flow\b/i.test(current)) return `${prospect} Dealer Replenishment Flow`;
      if (/^component_/.test(role) && /\b(core\s+product|variant\s*\/\s*finish|dealer\s+channel\s+pack)\b/i.test(current)) return `${prospect} Allocation Support SKU`;
    }
    return current;
  }

  function w450NameContainsHardStopGeneric(name) {
    const s = String(name || '');
    if (!s) return false;
    return W450_GENERIC_NAMING_HARD_STOP_TERMS.some(function (term) {
      return new RegExp(`\\b${String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(s);
    });
  }

  function w450AuthoritativeNamingProductPlan(names, opts) {
    const out = names || {};
    const seq = out.operation_names_by_seq || {};
    const operationNames = [
      seq['10'] || seq[10],
      seq['20'] || seq[20],
      seq['30'] || seq[30],
      seq['40'] || seq[40],
      seq['50'] || seq[50]
    ].filter(Boolean);
    return {
      schema: 'idb.w450-authoritative-naming-pack-product-plan.v1',
      productCandidateSource: out._source || 'llm-suitelet-precomputed',
      primaryProductCandidate: out.primary_product_candidate || out.primaryProductCandidate || out.hero_item_name || '',
      alternateProductCandidates: out.alternate_product_candidates || out.alternateProductCandidates || [],
      confidencePercent: Number(out.confidencePercent || out.confidence_percent || 0) || null,
      evidenceTerms: out.evidence_terms || out.evidenceTerms || [],
      competitorTerms: out.competitor_terms || out.competitorTerms || [],
      roiBasisTerms: out.roi_basis_terms || out.roiBasisTerms || [],
      productName: out.primary_product_candidate || out.primaryProductCandidate || out.hero_item_name || '',
      distributionItemName: out.hero_item_name || '',
      assemblyItemName: out.assembly_name || '',
      componentNames: Array.isArray(out.component_names) ? out.component_names.slice(0, 3) : [],
      bomName: out.bom_name || '',
      bomRevisionName: out.bom_revision_name || '',
      routingName: out.routing_name || '',
      operationNames,
      fallbackBlockedGenericTerms: W450_GENERIC_NAMING_HARD_STOP_TERMS.slice(),
      genericNamingHardStopTerms: W450_GENERIC_NAMING_HARD_STOP_TERMS.slice(),
      namingPayloadFound: out._namingPayloadFound === true,
      namingPayloadParsed: out._namingPayloadParsed === true,
      namingPayloadApplied: out._namingPayloadApplied === true,
      namingPackAuthoritative: true,
      namingFileId: out._namingFileId || null,
      namingDiscoveryMode: out._namingDiscoveryMode || '',
      rejectedFallbackReason: 'Precomputed naming pack is authoritative; deterministic product-build fallback cannot overwrite it.',
      selectedProductReason: 'Selected from the precomputed website/LLM naming pack before runner record creation.',
      evidence: {
        source: out._source || 'llm-suitelet-precomputed',
        confidencePercent: Number(out.confidencePercent || out.confidence_percent || 0) || null,
        evidenceTerms: out.evidence_terms || out.evidenceTerms || [],
        fallbackBlockedGenericTerms: W450_GENERIC_NAMING_HARD_STOP_TERMS.slice()
      },
      source: out._source || 'llm-suitelet-precomputed'
    };
  }

  function applyToggleAwareNamingGuardrails(names, opts) {
    let out = sanitizeNamingPayload(Object.assign({}, names || {}));
    const enableManufacturing = !!(opts && opts.enableManufacturing === true);
    const enableWip = !!(opts && opts.enableWip === true);
    const rewrites = [];
    const vocabularyPolicy = runnerLaneVocabularyPolicyV1(opts || {});
    if (out._namingPackAuthoritative === true || (/llm-suitelet-precomputed|suitelet-precomputed|website-product-evidence|notes-product-evidence/i.test(String(out._source || '')) && out._namingPayloadApplied === true)) {
      const blockedVisible = [];
      ['hero_item_name', 'assembly_name', 'bom_name', 'bom_revision_name', 'routing_name'].forEach(function (key) {
        if (w450NameContainsHardStopGeneric(out[key])) blockedVisible.push({ role: key, value: out[key] || '' });
      });
      (Array.isArray(out.component_names) ? out.component_names : []).forEach(function (name, index) {
        if (w450NameContainsHardStopGeneric(name)) blockedVisible.push({ role: `component_names.${index}`, value: name || '' });
      });
      const seq = out.operation_names_by_seq || {};
      Object.keys(seq || {}).forEach(function (key) {
        if (w450NameContainsHardStopGeneric(seq[key])) blockedVisible.push({ role: `operation_names_by_seq.${key}`, value: seq[key] || '' });
      });
      out._namingPackAuthoritative = true;
      out._productBuildPlanW432 = w450AuthoritativeNamingProductPlan(out, opts || {});
      out._toggleAwareNamingGuardrail = {
        schema: 'idb.w450-authoritative-naming-pack-guardrail.v1',
        status: blockedVisible.length ? 'authoritative_pack_contains_blocked_generic_terms_review_required' : 'authoritative_precomputed_naming_pack_preserved',
        enableManufacturing,
        enableWip,
        laneVocabularyPolicy: vocabularyPolicy,
        deterministicFallbackBlocked: true,
        fallbackBlockedGenericTerms: W450_GENERIC_NAMING_HARD_STOP_TERMS.slice(),
        blockedVisibleGenericTerms: blockedVisible,
        productBuildPlanW432: out._productBuildPlanW432,
        productBuildPlanValidationW432: { valid: true, source: 'authoritative-naming-pack' },
        rewrites: []
      };
      out.fallbackBlockedGenericTerms = W450_GENERIC_NAMING_HARD_STOP_TERMS.slice();
      out.genericNamingHardStopTerms = W450_GENERIC_NAMING_HARD_STOP_TERMS.slice();
      return out;
    }
    out = applyProductBuildPlanToNamingPackW432(out, opts || {});
    if (out._productBuildPlanW432) {
      out._productBuildPlanW432.namingPayloadFound = out._namingPayloadFound === true;
      out._productBuildPlanW432.namingPayloadParsed = out._namingPayloadParsed === true;
      out._productBuildPlanW432.namingPayloadApplied = out._namingPayloadApplied === true;
      out._productBuildPlanW432.namingPackAuthoritative = out._namingPackAuthoritative === true;
      out._productBuildPlanW432.namingFileId = out._namingFileId || null;
      out._productBuildPlanW432.namingDiscoveryMode = out._namingDiscoveryMode || '';
      out._productBuildPlanW432.namingQualityDegraded = out._namingQualityDegraded === true;
      out._productBuildPlanW432.namingDegradedReason = out._namingDegradedReason || '';
      out._productBuildPlanW432.fallbackBlockedGenericTerms = W450_GENERIC_NAMING_HARD_STOP_TERMS.slice();
      out._productBuildPlanW432.genericNamingHardStopTerms = W450_GENERIC_NAMING_HARD_STOP_TERMS.slice();
    }
    const productBuildPlanValidationW432 = validateProductBuildPlanForModeW432(out._productBuildPlanW432, { enableManufacturing, enableWip });
    if (enableManufacturing || enableWip) {
      out._toggleAwareNamingGuardrail = {
        status: 'manufacturing_vocabulary_allowed',
        enableManufacturing,
        enableWip,
        laneVocabularyPolicy: vocabularyPolicy,
        productBuildPlanW432: out._productBuildPlanW432,
        productBuildPlanValidationW432,
        rewrites: []
      };
      return out;
    }

    const prospect = idbNamingProspect(out, opts);
    const modeKey = vocabularyPolicy.modeKey || idbNamingModeKey(out, opts);
    const beforeHero = out.hero_item_name;
    const afterHero = rewriteIdbNonManufacturingName(beforeHero, 'hero_item_name', prospect, modeKey, vocabularyPolicy);
    if (afterHero !== beforeHero) rewrites.push({ role: 'hero_item_name', before: beforeHero || '', after: afterHero });
    out.hero_item_name = trimLen(afterHero, 60);

    const beforeAssembly = out.assembly_name;
    const afterAssembly = rewriteIdbNonManufacturingName(beforeAssembly, 'assembly_name', prospect, modeKey, vocabularyPolicy);
    if (afterAssembly !== beforeAssembly) rewrites.push({ role: 'matrix_or_proof_item', before: beforeAssembly || '', after: afterAssembly });
    out.assembly_name = trimLen(afterAssembly, 60);

    const components = Array.isArray(out.component_names) && out.component_names.length ? out.component_names.slice() : [''];
    out.component_names = components.map((componentName, index) => {
      const after = rewriteIdbNonManufacturingName(componentName, `component_${index + 1}`, prospect, modeKey, vocabularyPolicy);
      if (after !== componentName) rewrites.push({ role: `component_item_${index + 1}`, before: componentName || '', after });
      return trimLen(after, 60);
    });

    if (idbNameHasPolicyForbiddenTerm(out.bom_name, vocabularyPolicy)) {
      const afterBom = `${prospect} Product Structure`;
      rewrites.push({ role: 'bom_name', before: out.bom_name || '', after: afterBom });
      out.bom_name = trimLen(afterBom, 80);
    }

    out._toggleAwareNamingGuardrail = {
      schema: 'idb.toggle-aware-naming-guardrail.v1',
      status: rewrites.length ? 'rewritten_for_non_manufacturing_mode' : 'mode_aware_names_already_valid',
      modeKey,
      enableManufacturing,
      enableWip,
      laneVocabularyPolicy: vocabularyPolicy,
      forbiddenTermsBlocked: [
        'Finished Good',
        'Ingredient',
        'Ingredient Blend',
        'Production Line',
        'BOM',
        'Assembly',
        'Work Order',
        'Routing',
        'WIP',
        'Manufacturing Line'
      ],
      productBuildPlanW432: out._productBuildPlanW432,
      productBuildPlanValidationW432,
      rewrites
    };
    return out;
  }

  function discoverNamingFileIdByExtId(extId) {
    try {
      const filename = `scai_naming_${String(extId || '').trim()}.json`;
      const rs = search.create({
        type: 'file',
        filters: [['name', 'is', filename]],
        columns: [search.createColumn({ name: 'internalid', sort: search.Sort.DESC })]
      }).run().getRange({ start: 0, end: 1 }) || [];
      if (!rs.length) return null;
      return toIntOrNull(rs[0].getValue({ name: 'internalid' }));
    } catch (e) {
      log.error({ title: `Precomputed naming discover FAILED [${VERSION}]`, details: JSON.stringify({ extId: extId || '', message: (e && (e.message || e.details)) ? String(e.message || e.details) : String(e) }) });
      return null;
    }
  }


  function detectNamingVertical({ prospect, website, signalText }) {
    const hay = String([prospect || '', website || '', signalText || ''].join(' ')).toLowerCase();
    const equipmentCommerce = /coffee shop|coffeeshop|espresso|brewer|brew\b|grinder|roast(ing)?|roaster|barista|foodservice|commercial kitchen|commercial beverage|equipment|machine|parts\b|replacement parts|appliance|cafe|café/.test(hay);
    const hardgoodsRetail = /gordonandsmith|gordon and smith|yeti|skate|skateboard|longboard|surf|surfboard|boardsport|deck|wheel|wheels|truck|trucks|bearing|bearings|dealer locator|find a dealer|dealers|hardgoods|lifestyle brand|wholesale distribution|cooler|coolers|drinkware|tumbler|outdoor gear|gear case|cargo|backpack/.test(hay);
    const apparelRetail = /marinelayer|marine layer|jovani|vans|apparel|footwear|fashion|size curve|size run|colorway|collection|collections|streetwear|occasionwear|bridal|gown|formalwear/.test(hay);
    const retail = (apparelRetail || (/retail|omnichannel|style|sku|assortment|allocation|merchandise|store replenishment|channel availability|sell-through|sell thru|bopis|buy online|ship from store|dtc|direct to consumer|ecommerce|e-commerce|wholesale doors?/.test(hay) && apparelRetail))
      && !equipmentCommerce
      && !hardgoodsRetail;
    const strongFood = /enjoylifefoods|food|beverage|nutrition|snack|soup|bakery|ingredient|ingredients|allergen|batch|recipe|formula|confection|dairy|frozen|pet food|cpg|consumer packaged|granola/.test(hay);
    const weakFood = /packaging|carton|case pack|line scheduling|retailer replenishment|promotion|seasonal demand|finished goods/.test(hay);
    if (hardgoodsRetail || retail) return 'retail';
    if (equipmentCommerce) return 'industrial';
    if (strongFood || (weakFood && !hardgoodsRetail && !retail)) return 'food';
    if (/field service|service operations|technician|truck stock|route|dispatch|onsite|preventive maintenance|install base|uniform|facility service|service inventory/.test(hay)) return 'services';
    if (/industrial equipment|heavy machinery|precision contract manufacturing|controlled assembly|work-order-timed|order-to-assembly|machine\s*\/\s*unit|machine build|hydraulic|excavator|engine|assembly routing|caterpillar|benchmark electronics|axenics/.test(hay)) return 'industrial';
    if (/life sciences|diagnostic|diagnostics|instrument|medical device|orthopedic|orthopaedic|waters|illumina|bio-rad|biorad|laboratory|lab equipment|scientific instrument/.test(hay)) return 'life_sciences';
    return 'generic';
  }

  function generateNamingPack({ prospect, website, signalText }) {
    const canonicalProspect = idbCanonicalProspectNameW422(prospect, website);
    const clippedSignal = String(signalText || '').slice(0, 1200);
    const vertical = detectNamingVertical({ prospect: canonicalProspect, website, signalText: clippedSignal });
    if (vertical === 'retail') {
      const retailHay = String([canonicalProspect || '', website || '', clippedSignal || ''].join(' ')).toLowerCase();
      const isHardgoodsRetail = /gordonandsmith|gordon and smith|yeti|skate|skateboard|longboard|surf|surfboard|boardsport|deck|wheel|wheels|truck|trucks|bearing|bearings|dealer locator|find a dealer|dealers|hardgoods|cooler|coolers|drinkware|tumbler|outdoor gear|gear case|cargo|backpack/.test(retailHay)
        && !/apparel|footwear|fashion|style|colorway|size curve|streetwear/.test(retailHay);
      return {
        _source: isHardgoodsRetail ? 'deterministic-retail-hardgoods-safe' : 'deterministic-retail-apparel-safe',
        _signalLen: clippedSignal.length,
        industry_category: 'Retail & Omnichannel Fulfillment',
        hero_item_name: isHardgoodsRetail ? `${canonicalProspect} Channel Availability SKU` : `${canonicalProspect} Style SKU`,
        assembly_name: isHardgoodsRetail ? `${canonicalProspect} Dealer Replenishment Flow` : `${canonicalProspect} Omnichannel Availability Flow`,
        component_names: [
          isHardgoodsRetail ? `${canonicalProspect} Allocation Support SKU` : `${canonicalProspect} Core Style`,
          isHardgoodsRetail ? `${canonicalProspect} Fulfillment Support SKU` : `${canonicalProspect} Size / Color Variant`,
          isHardgoodsRetail ? `${canonicalProspect} Product Availability SKU` : `${canonicalProspect} Channel Allocation Pack`
        ],
        bom_name: isHardgoodsRetail ? `Product / SKU Structure - ${canonicalProspect}` : `Style / SKU Structure - ${canonicalProspect}`,
        bom_revision_name: `Revision 1 - ${canonicalProspect}`
      };
    }
    if (vertical === 'food') {
      const plan = productBuildPlanW432({ prospect: canonicalProspect, website, signalText: clippedSignal });
      return {
        _source: 'deterministic-food-product-build-plan-w432',
        _signalLen: clippedSignal.length,
        industry_category: 'Food & CPG Snack Products',
        hero_item_name: plan.distributionItemName,
        assembly_name: plan.assemblyItemName,
        component_names: plan.componentNames.slice(0, 3),
        bom_name: plan.bomName,
        bom_revision_name: plan.bomRevisionName,
        routing_name: plan.routingName,
        operation_names_by_seq: {
          10: plan.operationNames[0],
          20: plan.operationNames[1],
          30: plan.operationNames[2],
          40: plan.operationNames[3],
          50: plan.operationNames[4]
        },
        _productBuildPlanW432: plan
      };
    }
    if (vertical === 'services') {
      return {
        _source: 'deterministic-services-safe',
        _signalLen: clippedSignal.length,
        industry_category: 'Field Service & Inventory Management',
        hero_item_name: `${canonicalProspect} Service Kit`,
        assembly_name: `${canonicalProspect} Service Replenishment Flow`,
        component_names: [
          `${canonicalProspect} Consumables Pack`,
          `${canonicalProspect} Replacement Parts Kit`,
          `${canonicalProspect} Safety Gear Set`
        ],
        bom_name: `Service Replenishment Support - ${canonicalProspect}`,
        bom_revision_name: `Revision 1 - ${canonicalProspect}`
      };
    }
    if (vertical === 'life_sciences') {
      return {
        _source: 'deterministic-life-sciences-safe',
        _signalLen: clippedSignal.length,
        industry_category: 'Life Sciences & Diagnostics Manufacturing',
        hero_item_name: `${canonicalProspect} Instrument Kit`,
        assembly_name: `${canonicalProspect} Controlled Instrument Build`,
        component_names: [
          `${canonicalProspect} Module Integration`,
          `${canonicalProspect} Software Activation`,
          `${canonicalProspect} Final Packaging & QC`
        ],
        bom_name: `Component Structure - ${canonicalProspect}`,
        bom_revision_name: `Revision 1 - ${canonicalProspect}`
      };
    }
    if (vertical === 'industrial') {
      return {
        _source: 'deterministic-industrial-safe',
        _signalLen: clippedSignal.length,
        industry_category: 'Heavy Machinery Manufacturing',
        hero_item_name: `${canonicalProspect} Machine Unit`,
        assembly_name: `${canonicalProspect} Controlled Assembly Execution`,
        component_names: [
          `${canonicalProspect} Frame Welding`,
          `${canonicalProspect} Hydraulic System Installation`,
          `${canonicalProspect} Final Engine Integration`
        ],
        bom_name: `Component Structure - ${canonicalProspect}`,
        bom_revision_name: `Revision 1 - ${canonicalProspect}`
      };
    }
    return {
      _source: 'deterministic',
      _signalLen: clippedSignal.length,
      industry_category: '',
      hero_item_name: `${canonicalProspect} Finished Good`,
      assembly_name: `${canonicalProspect} Assembly`,
      component_names: [
        `${canonicalProspect} Component A`,
        `${canonicalProspect} Component B`,
        `${canonicalProspect} Component C`
      ],
      bom_name: `BOM - ${canonicalProspect}`,
      bom_revision_name: `Revision 1 - ${canonicalProspect}`
    };
  }

  function applyNamingToAnchors(ids, names, opts) {
    names = applyToggleAwareNamingGuardrails(names, opts || {});
    const enableManufacturing = !!(opts && opts.enableManufacturing === true);
    const createNewHeroItem = !!(opts && opts.createNewHeroItem);
    const extId = opts && opts.extId;
    const runUniqueSuffix = opts && opts.runUniqueSuffix;
    const authoritativeNamingPackW450 = names && names._namingPackAuthoritative === true;
    const planW442 = names && names._productBuildPlanW432 || productBuildPlanW432(Object.assign({}, opts || {}, names || {}));
    const narrativeW442 = visibleProductNarrativeW439(planW442, { enableManufacturing, enableWip: !!(opts && opts.enableWip) });
    const mfgTermsW442 = narrativeW442 && narrativeW442.industryNativeManufacturingW442 || {};
    const heroNamePair = buildDifferentiatedNames(names.hero_item_name, extId, runUniqueSuffix);
    const namingVertical = detectNamingVertical({ prospect: names.hero_item_name, website: '', signalText: [names.industry_category || '', names.assembly_name || '', (names.component_names || []).join(' ')].join(' ') });
    const heroSalesDesc = !enableManufacturing
      ? `${names.hero_item_name} supports availability, replenishment, and fulfillment confidence.`
      : `${names.hero_item_name} supports customer demand for ${mfgTermsW442.manufacturingOutputName || 'manufactured output'}.`;
    const heroPurchDesc = !enableManufacturing
      ? `Purchased supply context supporting ${names.hero_item_name} availability.`
      : `Purchased input context supporting ${mfgTermsW442.industryNativeManufacturedItemName || names.assembly_name || names.hero_item_name}.`;
    const packSalesDescriptionsW450 = names.sales_descriptions || names.salesDescriptions || {};
    const packPurchaseDescriptionsW450 = names.purchase_descriptions || names.purchaseDescriptions || {};
    const packComponentSalesDescriptionsW450 = Array.isArray(packSalesDescriptionsW450.components) ? packSalesDescriptionsW450.components : [];
    const packComponentPurchaseDescriptionsW450 = Array.isArray(packPurchaseDescriptionsW450.components) ? packPurchaseDescriptionsW450.components : [];

    const asmNameBase = names.assembly_name || names.hero_item_name;
    const asmNamePair = buildDifferentiatedNames(asmNameBase, extId, runUniqueSuffix);
    const asmSalesDesc  = !enableManufacturing ? `${asmNameBase} supports branch availability and replenishment readiness.` : `${mfgTermsW442.manufacturingOutputName || asmNameBase} supports ${mfgTermsW442.manufacturingReadinessPhrase || 'production readiness'} and Work Order execution.`;
    const asmPurchDesc  = !enableManufacturing ? `Supply planning inputs used to support ${asmNameBase}.` : `Input and packaging readiness used to support ${mfgTermsW442.industryNativeManufacturedItemName || asmNameBase}.`;

    function compSalesDesc(compName) {
      if (!enableManufacturing) return `${compName} supports fulfillment and availability readiness in ${asmNameBase}.`;
      const lower = str(compName).toLowerCase();
      const productBase = planW442 && planW442.productName || names.hero_item_name || asmNameBase;
      if (/corn masa/.test(lower)) return `Corn masa input used in the ${productBase} production batch.`;
      if (/avocado oil/.test(lower)) return `Avocado oil frying input used during ${productBase} production.`;
      if (/sea salt.*packaging|retail bag/.test(lower)) return `Sea salt seasoning and retail bag packaging used for ${productBase} finished case output.`;
      if (/pack/.test(lower)) return `${compName} packaging input used for ${mfgTermsW442.manufacturingOutputName || `${productBase} output`}.`;
      return `${compName} input used in ${mfgTermsW442.industryNativeManufacturedItemName || asmNameBase}.`;
    }
    function compPurchDesc(compName) {
      return !enableManufacturing ? `Procured ${compName} supply input for ${asmNameBase}.` : `Procured ${compName} for ${mfgTermsW442.industryNativeManufacturedItemName || asmNameBase}.`;
    }

    const heroValues = {
      itemid: heroNamePair.itemIdName,
      displayname: heroNamePair.displayName,
      salesdescription: heroSalesDesc,
      purchasedescription: heroPurchDesc
    };
    if (authoritativeNamingPackW450) {
      if (packSalesDescriptionsW450.hero) heroValues.salesdescription = String(packSalesDescriptionsW450.hero).slice(0, 999);
      if (packPurchaseDescriptionsW450.hero) heroValues.purchasedescription = String(packPurchaseDescriptionsW450.hero).slice(0, 999);
    }

    log.audit({
      title: `Naming mode resolution [${VERSION}]`,
      details: JSON.stringify({
        createNewHeroItem,
        heroItemId: Number(ids.heroItemId || 0),
        heroItemExternalId: ids.heroItemExternalId || '',
        heroItemNamingMode: createNewHeroItem ? 'fresh-hero-itemid-and-displayname-with-extid-suffix' : 'anchor-itemid-and-displayname-with-extid-suffix',
        heroDisplayName: heroNamePair.displayName,
        heroItemIdName: heroNamePair.itemIdName,
        namingSuffix: heroNamePair.suffix,
        namingCollisionAvoidance: 'extid-suffix',
        enableManufacturing
      })
    });

    safeTry(() => record.submitFields({
      type: 'inventoryitem',
      id: Number(ids.heroItemId),
      values: heroValues,
      options: { enableSourcing: true, ignoreMandatoryFields: true }
    }));

    if (enableManufacturing && ids.assemblyId) {
      safeTry(() => record.submitFields({
        type: 'assemblyitem',
        id: Number(ids.assemblyId),
          values: {
            itemid: asmNamePair.itemIdName,
            displayname: asmNamePair.displayName,
            salesdescription: authoritativeNamingPackW450 && packSalesDescriptionsW450.assembly ? String(packSalesDescriptionsW450.assembly).slice(0, 999) : asmSalesDesc,
            purchasedescription: authoritativeNamingPackW450 && packPurchaseDescriptionsW450.assembly ? String(packPurchaseDescriptionsW450.assembly).slice(0, 999) : asmPurchDesc
          },
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      }));

      const comps = [
        { id: ids.comp1Id, name: names.component_names[0], index: 0 },
        { id: ids.comp2Id, name: names.component_names[1], index: 1 },
        { id: ids.comp3Id, name: names.component_names[2], index: 2 }
      ].filter(c => c.id);

      comps.forEach(c => {
        const compNamePair = buildDifferentiatedNames(c.name, extId, runUniqueSuffix);
        return safeTry(() => record.submitFields({
          type: 'inventoryitem',
          id: Number(c.id),
          values: {
            itemid: compNamePair.itemIdName,
            displayname: compNamePair.displayName,
            salesdescription: authoritativeNamingPackW450 && packComponentSalesDescriptionsW450[c.index || 0] ? String(packComponentSalesDescriptionsW450[c.index || 0]).slice(0, 999) : compSalesDesc(c.name),
            purchasedescription: authoritativeNamingPackW450 && packComponentPurchaseDescriptionsW450[c.index || 0] ? String(packComponentPurchaseDescriptionsW450[c.index || 0]).slice(0, 999) : compPurchDesc(c.name)
          },
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        }));
      });

      if (ids.bomId) {
        const bomName = authoritativeNamingPackW450 ? trimLen(names.bom_name, 80) : cleanCustomerFacingCreatedNameW441(names.bom_name, 'bom', names._productBuildPlanW432, enableManufacturing ? 'manufacturing' : 'distribution');
        safeTry(() => record.submitFields({
          type: 'bom',
          id: Number(ids.bomId),
          values: { name: bomName },
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        }));
      }

      if (ids.bomRevId) {
        const bomRevName = authoritativeNamingPackW450 ? trimLen(names.bom_revision_name, 80) : cleanCustomerFacingCreatedNameW441(names.bom_revision_name, 'bomRevision', names._productBuildPlanW432, enableManufacturing ? 'manufacturing' : 'distribution');
        safeTry(() => record.submitFields({
          type: 'bomrevision',
          id: Number(ids.bomRevId),
          values: { name: bomRevName },
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        }));
      }
    }
  }


  // ----------------------------
  // Pricing (unchanged)
  // ----------------------------
  function setBaseSalesPrice(itemType, itemId, amount) {
    const sublistCandidates = ['price1', 'price', 'pricing', 'pricelevels'];
    const fieldCandidates = ['price_1_', 'price', 'unitprice', 'baseprice'];
    const levelFieldCandidates = ['pricelevel', 'level', 'pricelevelname'];

    const rec = record.load({ type: itemType, id: Number(itemId), isDynamic: true });

    let chosenSublist = null;
    for (let i = 0; i < sublistCandidates.length; i++) {
      const sid = sublistCandidates[i];
      try { rec.getLineCount({ sublistId: sid }); chosenSublist = sid; break; } catch (e) {}
    }
    if (!chosenSublist) {
      log.error({ title: `Base price set FAILED (no pricing sublist) [${VERSION}]`, details: JSON.stringify({ itemType, itemId, amount }) });
      return;
    }

    const allFields = safeTryReturn(() => rec.getSublistFields({ sublistId: chosenSublist })) || [];
    const priceFieldId = firstExisting(allFields, fieldCandidates) || fieldCandidates[0];

    const levelFieldId = firstExisting(allFields, levelFieldCandidates);
    let targetLine = 0;

    if (levelFieldId) {
      const lineCount = safeTryReturn(() => rec.getLineCount({ sublistId: chosenSublist })) || 0;
      for (let ln = 0; ln < lineCount; ln++) {
        const txt = safeTryReturn(() => rec.getSublistText({ sublistId: chosenSublist, fieldId: levelFieldId, line: ln })) || '';
        const val = safeTryReturn(() => rec.getSublistValue({ sublistId: chosenSublist, fieldId: levelFieldId, line: ln })) || '';
        if (String(txt).toLowerCase().indexOf('base') !== -1 || String(val) === '1') {
          targetLine = ln;
          break;
        }
      }
    }

    try {
      rec.selectLine({ sublistId: chosenSublist, line: targetLine });

      let setOk = false;
      const tryFields = [priceFieldId].concat(fieldCandidates.filter(f => f !== priceFieldId));
      for (let j = 0; j < tryFields.length; j++) {
        const f = tryFields[j];
        if (allFields.indexOf(f) === -1) continue;

        const ok = safeTryReturn(() => {
          rec.setCurrentSublistValue({ sublistId: chosenSublist, fieldId: f, value: Number(amount) });
          return true;
        });

        if (ok) {
          setOk = true;
          log.audit({
            title: `Base price field used [${VERSION}]`,
            details: JSON.stringify({ itemType, itemId, sublistId: chosenSublist, line: targetLine, fieldId: f, amount })
          });
          break;
        }
      }

      if (!setOk) {
        log.error({ title: `Base price set FAILED (no usable price field) [${VERSION}]`, details: JSON.stringify({ itemType, itemId, sublistId: chosenSublist, fields: allFields }) });
        return;
      }

      rec.commitLine({ sublistId: chosenSublist });
      rec.save({ enableSourcing: true, ignoreMandatoryFields: true });

      log.audit({ title: `Base price SET [${VERSION}]`, details: JSON.stringify({ itemType, itemId, amount }) });
    } catch (e) {
      log.error({
        title: `Base price set FAILED [${VERSION}]`,
        details: JSON.stringify({ itemType, itemId, amount, err: (e && (e.message || e.details)) ? String(e.message || e.details) : String(e) })
      });
    }
  }

  // ----------------------------
  // SO CSV + import
  // ----------------------------
  function buildSoCsv({ extId, prospect, website, notes, agenda, locationId, itemKey }) {
    const memo = recordSafeDemoContextMemo({ prospect, website, notes, agenda });

    const today = new Date();
    const d1 = fmtDate(today);
    const d2 = fmtDate(addMonths(today, 1));
    const d3 = fmtDate(addMonths(today, 2));

    const header = [
      'US Dollar',
      'Customer Internal ID (Header)',
      'CSV External ID',
      'Process',
      'Pending Fulfillment',
      'Memo',
      'Date',
      'Location',
      'Item Internal ID',
      'Line Location',
      'Quantity',
      'Rate',
      'Supply Required by Date'
    ].join(',');

    const custKey = ANCHORS.customer;
    const itemKeyResolved = String(itemKey || ANCHORS.heroItem);
    const loc = locationId ? String(locationId) : '';

    const line1 = ['US Dollar', custKey, extId, 'Process', 'Pending Fulfillment', csvQuote(memo), d1, loc, itemKeyResolved, loc, '6', '20.83333333', d1].join(',');
    const line2 = ['US Dollar', custKey, extId, 'Process', 'Pending Fulfillment', csvQuote(memo), d1, loc, itemKeyResolved, loc, '9', '25', d2].join(',');
    const line3 = ['US Dollar', custKey, extId, 'Process', 'Pending Fulfillment', csvQuote(memo), d1, loc, itemKeyResolved, loc, '14', '25', d3].join(',');

    return [header, line1, line2, line3].join('\n');
  }

  function saveCsvToFileCabinet({ folderId, filename, contents }) {
    const f = file.create({ name: filename, fileType: file.Type.CSV, contents, folder: Number(folderId) });
    return Number(f.save());
  }

  function submitCsvImport({ mappingId, fileId }) {
    const f = file.load({ id: Number(fileId) });
    const t = task.create({ taskType: task.TaskType.CSV_IMPORT, mappingId: Number(mappingId), importFile: f });
    return t.submit();
  }



  function deriveCockpitModeForAssets(enableManufacturing, enableWip, names) {
    return deriveCanonicalFlowState(names, enableManufacturing, enableWip).mode;
  }
  function buildCanonicalStorySeedAsset(args) {
    const truth = buildAuthoritativeTruthContract(args.names, { enableManufacturing: args.enableManufacturing, enableWip: args.enableWip });
    const flowState = truth.flowState;
    const mode = flowState.mode;
    const storySpine = mode === 'wip'
      ? 'Supply exposure to build control to customer promise'
      : (mode === 'manufacturing'
        ? 'Supply readiness to production to finished-good availability'
        : 'Demand signal to inventory availability to replenishment and fulfillment');
    const suppressionProfile = mode === 'inventory'
      ? ['manufacturing-detour', 'wip-detour', 'setup-before-story']
      : (mode === 'manufacturing'
        ? ['warehouse-first-drift', 'wip-overrotation', 'setup-before-story']
        : ['distribution-only-shortcut', 'mode-locked-vocabulary', 'setup-before-story']);
    const audit = mode === 'wip'
      ? { activeMode: 'Manufacturing + WIP', suppressedFamilies: ['distribution', 'multi-location inventory-first', 'warehouse-only', 'reorder-point-first'], survivingProofThemes: ['material readiness', 'work order timing', 'WIP visibility', 'fulfillment confidence', 'promise-date protection'], blockedTerms: ['inventory availability across locations', 'distribution', 'warehouse tour', 'stock position framing', 'reorder point', 'replenishment control'], sensitiveTermsAllowedInContext: ['inventory', 'purchasing', 'material availability', 'assembly', 'fulfillment'] }
      : (mode === 'manufacturing'
        ? { activeMode: 'Manufacturing', suppressedFamilies: ['distribution', 'warehouse-only', 'reorder-point-first'], survivingProofThemes: ['material readiness', 'build timing', 'assembly readiness', 'finished-good confidence', 'promise-date protection'], blockedTerms: ['distribution', 'warehouse tour', 'stock position framing', 'reorder point', 'replenishment control'], sensitiveTermsAllowedInContext: ['inventory', 'purchasing', 'material availability', 'assembly'] }
        : { activeMode: 'Inventory / Distribution', suppressedFamilies: ['deep manufacturing', 'routing / WIP-first'], survivingProofThemes: ['inventory truth', 'replenishment timing', 'service-level confidence'], blockedTerms: [], sensitiveTermsAllowedInContext: ['manufacturing'] });
    return {
      version: VERSION,
      packEngineVersion: PACK_ENGINE_VERSION,
      extId: args.extId,
      prospect: args.prospect,
      mode,
      activeMode: audit.activeMode,
      flowLabel: flowState.label,
      canonicalFlowLabel: flowState.label,
      canonicalFlowKey: flowState.key,
      flowMode: flowState.mode,
      flowDetailLabel: flowState.detailLabel,
      storySpine,
      sourcePriority: ['notes', 'agenda', 'website', 'naming'],
      notesPreview: trimLen(String(args.notes || ''), 500),
      agendaPreview: trimLen(String(args.agenda || ''), 500),
      websiteDomain: extractDomain(args.website || ''),
      naming: {
        industry_category: args.names && args.names.industry_category ? args.names.industry_category : '',
        hero_item_name: args.names && args.names.hero_item_name ? args.names.hero_item_name : '',
        assembly_name: args.names && args.names.assembly_name ? args.names.assembly_name : ''
      },
      initialScenarioLabel: truth.initialScenarioLabel,
      normalizedScenarioLabel: truth.normalizedScenarioLabel,
      normalizedIndustryCategory: truth.normalizedIndustryCategory,
      finalScenarioSource: truth.finalScenarioSource,
      normalizationActions: args.names && Array.isArray(args.names._normalizationActions) ? args.names._normalizationActions : [],
      strippedForbiddenTerms: args.names && Array.isArray(args.names._strippedForbiddenTerms) ? args.names._strippedForbiddenTerms : [],
      authoritativeTruth: truth,
      suppressionProfile,
      suppressedFamilies: audit.suppressedFamilies,
      survivingProofThemes: audit.survivingProofThemes,
      blockedTerms: audit.blockedTerms || [],
      canonicalPrimary: true
    };
  }
  // ----------------------------
  // Image enrichment phase 1 (logo discovery + asset packaging)
  // ----------------------------
  function runImageEnrichmentPhase1({ extId, prospect, website, signal, names, notes, agenda, enableWip, enableManufacturing }) {
    const started = Date.now();
    const normalizedWebsite = normalizeUrl(website);
    if (!normalizedWebsite) {
      const skipped = { status: 'skipped-no-website', rootFolderId: null, assetFolderId: null, logoUrl: '', heroUrl: '', assemblyUrl: '', files: [], elapsedMs: Date.now() - started };
      log.audit({ title: `Image enrichment skipped [${VERSION}]`, details: JSON.stringify(skipped) });
      return skipped;
    }

    const rootFolderId = ensureFolderByPath({ parentId: null, name: 'SCAI Demo Assets' });
    const assetFolderName = buildAssetFolderName(prospect, extId);
    const assetFolderId = ensureFolderByPath({ parentId: rootFolderId, name: assetFolderName });

    const page = fetchHtmlWithRedirects(normalizedWebsite, 4);
    const finalUrl = page && page.finalUrl ? String(page.finalUrl) : normalizedWebsite;
    const html = page && page.html ? page.html : '';
    const logo = discoverBestLogoCandidate({ html, pageUrl: finalUrl });
    const hero = discoverBestHeroCandidate({ html, pageUrl: finalUrl, names });
    const assembly = enableManufacturing
      ? discoverBestAssemblyCandidate({ html, pageUrl: finalUrl, names, hero })
      : { url: '', source: 'manufacturing-disabled', score: 0 };
    const files = [];

    const manifest = {
      version: VERSION,
      releaseTrain: RELEASE_TRAIN,
      releaseTranche: RELEASE_TRANCHE,
      phase: 'image-enrichment-logo-hero-assembly-preview-primary-v3_0_20',
      extId,
      prospect,
      website: normalizedWebsite,
      finalUrl,
      domain: extractDomain(finalUrl || normalizedWebsite),
      discoveredAt: new Date().toISOString(),
      logo,
      hero,
      assembly,
      names: {
        industry_category: names && names.industry_category ? names.industry_category : '',
        hero_item_name: names && names.hero_item_name ? names.hero_item_name : '',
        assembly_name: names && names.assembly_name ? names.assembly_name : ''
      },
      signal: {
        domain: signal && signal.domain ? signal.domain : '',
        textPreview: trimLen((signal && signal.text) ? signal.text : '', 600)
      },
      manufacturingEnabled: !!enableManufacturing
    };

    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'logo_manifest.json', contents: JSON.stringify(manifest, null, 2) }));
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'logo_url.txt', contents: logo && logo.url ? String(logo.url) : '' }));
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'logo_preview.html', contents: buildLogoPreviewHtml({ prospect, extId, finalUrl, logo }) }));

    const binaryResult = saveLogoBinaryOrDiagnostics({ folderId: assetFolderId, logo, pageUrl: finalUrl, prospect, extId });
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'logo_fetch_diagnostics.json', contents: JSON.stringify(binaryResult.diagnostics || {}, null, 2) }));
    if (binaryResult.file) files.push(binaryResult.file);
    if (binaryResult.dataUriPreviewFile) files.push(binaryResult.dataUriPreviewFile);

    const heroCandidates = collectHeroCandidates({ html, pageUrl: finalUrl, names });
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'hero_candidates.json', contents: JSON.stringify(heroCandidates.slice(0, 25), null, 2) }));
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'hero_manifest.json', contents: JSON.stringify({ version: VERSION, extId, prospect, finalUrl, hero, candidateCount: heroCandidates.length }, null, 2) }));
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'hero_url.txt', contents: hero && hero.url ? String(hero.url) : '' }));
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'hero_preview.html', contents: buildHeroPreviewHtml({ prospect, extId, finalUrl, hero }) }));

    let assemblyCandidates = [];
    if (enableManufacturing) {
      assemblyCandidates = collectAssemblyCandidates({ html, pageUrl: finalUrl, names, hero });
      files.push(saveTextArtifact({ folderId: assetFolderId, name: 'assembly_candidates.json', contents: JSON.stringify(assemblyCandidates.slice(0, 25), null, 2) }));
      files.push(saveTextArtifact({ folderId: assetFolderId, name: 'assembly_manifest.json', contents: JSON.stringify({ version: VERSION, extId, prospect, finalUrl, assembly, candidateCount: assemblyCandidates.length }, null, 2) }));
      files.push(saveTextArtifact({ folderId: assetFolderId, name: 'assembly_url.txt', contents: assembly && assembly.url ? String(assembly.url) : '' }));
      files.push(saveTextArtifact({ folderId: assetFolderId, name: 'assembly_preview.html', contents: buildAssemblyPreviewHtml({ prospect, extId, finalUrl, assembly }) }));
    }

    const canonicalStorySeed = buildCanonicalStorySeedAsset({ extId, prospect, website: normalizedWebsite, names, notes, agenda, enableWip, enableManufacturing });
    const authoritativeTruth = canonicalStorySeed.authoritativeTruth || buildAuthoritativeTruthContract(names, { enableManufacturing, enableWip });
    canonicalStorySeed.version = VERSION;
    canonicalStorySeed.releaseTrain = RELEASE_TRAIN;
    canonicalStorySeed.releaseTranche = RELEASE_TRANCHE;
    canonicalStorySeed.winningPackId = authoritativeTruth.winningPackId;
    canonicalStorySeed.winningPackFamily = authoritativeTruth.winningPackFamily;
    canonicalStorySeed.rawWinningPackFamily = authoritativeTruth.rawWinningPackFamily;
    canonicalStorySeed.authoritativeFamilyKey = authoritativeTruth.authoritativeFamilyKey;
    canonicalStorySeed.initialScenarioLabel = authoritativeTruth.initialScenarioLabel;
    canonicalStorySeed.normalizedScenarioLabel = authoritativeTruth.normalizedScenarioLabel || canonicalStorySeed.initialScenarioLabel;
    canonicalStorySeed.candidatePromotionUsed = authoritativeTruth.candidatePromotionUsed;
    canonicalStorySeed.candidatePromotionReason = authoritativeTruth.candidatePromotionReason;
    canonicalStorySeed.normalizationActions = names && Array.isArray(names._normalizationActions) ? names._normalizationActions : [];
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'canonical_story_seed.json', contents: JSON.stringify(canonicalStorySeed, null, 2) }));
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'cockpit_mode_manifest.json', contents: JSON.stringify({ version: VERSION, releaseTrain: RELEASE_TRAIN, releaseTranche: RELEASE_TRANCHE, extId, mode: canonicalStorySeed.mode, activeMode: canonicalStorySeed.activeMode, flowLabel: canonicalStorySeed.flowLabel, canonicalFlowLabel: canonicalStorySeed.canonicalFlowLabel, canonicalFlowKey: canonicalStorySeed.canonicalFlowKey, flowMode: canonicalStorySeed.flowMode, flowDetailLabel: canonicalStorySeed.flowDetailLabel, suppressionProfile: canonicalStorySeed.suppressionProfile, suppressedFamilies: canonicalStorySeed.suppressedFamilies, survivingProofThemes: canonicalStorySeed.survivingProofThemes, blockedTerms: canonicalStorySeed.blockedTerms, sensitiveTermsAllowedInContext: canonicalStorySeed.sensitiveTermsAllowedInContext, canonicalPrimary: canonicalStorySeed.canonicalPrimary, storySpine: canonicalStorySeed.storySpine, finalScenarioSource: authoritativeTruth.finalScenarioSource, finalValidationPassed: authoritativeTruth.packValidationPassed, finalValidationFailures: authoritativeTruth.packValidationFailures }, null, 2) }));

    const assetSummary = {
      version: VERSION,
      releaseTrain: RELEASE_TRAIN,
      releaseTranche: RELEASE_TRANCHE,
      packEngineVersion: PACK_ENGINE_VERSION,
      extId,
      prospect,
      website: normalizedWebsite,
      finalUrl,
      assetFolderId,
      assetFolderName,
      manufacturingEnabled: !!enableManufacturing,
      cockpitMode: canonicalStorySeed.mode,
      activeMode: canonicalStorySeed.activeMode,
      flowLabel: canonicalStorySeed.flowLabel,
      canonicalFlowLabel: canonicalStorySeed.canonicalFlowLabel,
      canonicalFlowKey: canonicalStorySeed.canonicalFlowKey,
      flowMode: canonicalStorySeed.flowMode,
      flowDetailLabel: canonicalStorySeed.flowDetailLabel,
      suppressionProfile: canonicalStorySeed.suppressionProfile,
      suppressedFamilies: canonicalStorySeed.suppressedFamilies,
      survivingProofThemes: canonicalStorySeed.survivingProofThemes,
      blockedTerms: canonicalStorySeed.blockedTerms || [],
      sensitiveTermsAllowedInContext: canonicalStorySeed.sensitiveTermsAllowedInContext || [],
      canonicalPrimary: !!canonicalStorySeed.canonicalPrimary,
      storyPackReady: true,
      suppressionAuditReady: true,
      logoPreviewReady: !!(logo && logo.url),
      heroPreviewReady: !!(hero && hero.url),
      assemblyPreviewReady: !!(enableManufacturing && assembly && assembly.url),
      logoUrl: logo && logo.url ? String(logo.url) : '',
      heroUrl: hero && hero.url ? String(hero.url) : '',
      assemblyUrl: assembly && assembly.url ? String(assembly.url) : '',
      logoSource: logo && logo.source ? String(logo.source) : '',
      heroSource: hero && hero.source ? String(hero.source) : '',
      assemblySource: assembly && assembly.source ? String(assembly.source) : '',
      heroSameAsAssembly: !!(hero && assembly && hero.url && assembly.url && String(hero.url) === String(assembly.url)),
      logoBinarySaved: !!binaryResult.saved,
      logoBinaryReason: binaryResult.reason || '',
      resolvedDemoContract: authoritativeTruth.resolvedDemoContract || null,
      resolvedDemoContractDebug: authoritativeTruth.resolvedDemoContractDebug || null,
      authoritativeTruth: authoritativeTruth,
      winningPackId: authoritativeTruth.winningPackId,
      winningPackFamily: authoritativeTruth.winningPackFamily,
      rawWinningPackFamily: authoritativeTruth.rawWinningPackFamily,
      authoritativeFamilyKey: authoritativeTruth.authoritativeFamilyKey,
      packConfidence: authoritativeTruth.packConfidence,
      packValidationPassed: authoritativeTruth.packValidationPassed,
      packValidationFailures: authoritativeTruth.packValidationFailures,
      candidatePromotionUsed: authoritativeTruth.candidatePromotionUsed,
      candidatePromotionReason: authoritativeTruth.candidatePromotionReason,
      initialScenarioLabel: authoritativeTruth.initialScenarioLabel,
      normalizedScenarioLabel: authoritativeTruth.normalizedScenarioLabel,
      initialIndustryCategory: authoritativeTruth.initialIndustryCategory,
      normalizedIndustryCategory: authoritativeTruth.normalizedIndustryCategory,
      strippedForbiddenTerms: names && Array.isArray(names._strippedForbiddenTerms) ? names._strippedForbiddenTerms : [],
      finalScenarioSource: authoritativeTruth.finalScenarioSource,
      renderMode: canonicalStorySeed.mode
    };
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'asset_summary.json', contents: JSON.stringify(assetSummary, null, 2) }));
    const scenarioPayload = readScenarioPayload(names, { enableManufacturing, enableWip });
    const packResolutionPayload = readPackResolutionPayload(names, { enableManufacturing, enableWip });
    const packResolutionAudit = {
      version: VERSION,
      releaseTrain: RELEASE_TRAIN,
      releaseTranche: RELEASE_TRANCHE,
      packEngineVersion: PACK_ENGINE_VERSION,
      extId: extId,
      authoritativeTruth: authoritativeTruth,
      winningPackId: packResolutionPayload.winningPackId,
      winningPackFamily: packResolutionPayload.winningPackFamily,
      rawWinningPackFamily: packResolutionPayload.rawWinningPackFamily,
      authoritativeFamilyKey: packResolutionPayload.authoritativeFamilyKey,
      authoritativePackFamily: packResolutionPayload.authoritativePackFamily,
      rawScorerWinnerFamily: packResolutionPayload.rawScorerWinnerFamily,
      runnerUpFamily: packResolutionPayload.runnerUpFamily,
      exclusionReason: packResolutionPayload.exclusionReason,
      finalLockedFamilySource: packResolutionPayload.finalLockedFamilySource,
      packConfidence: packResolutionPayload.packConfidence,
      candidate1: packResolutionPayload.candidate1,
      candidate1Failures: packResolutionPayload.candidate1Failures,
      candidate2: packResolutionPayload.candidate2,
      candidate2Failures: packResolutionPayload.candidate2Failures,
      candidatePromotionUsed: packResolutionPayload.candidatePromotionUsed,
      candidatePromotionReason: packResolutionPayload.candidatePromotionReason,
      initialScenarioLabel: scenarioPayload.initialScenarioLabel,
      normalizedScenarioLabel: scenarioPayload.normalizedScenarioLabel,
      initialIndustryCategory: scenarioPayload.initialIndustryCategory,
      normalizedIndustryCategory: scenarioPayload.normalizedIndustryCategory,
      flowLabel: scenarioPayload.flowLabel,
      canonicalFlowLabel: scenarioPayload.canonicalFlowLabel,
      canonicalFlowKey: scenarioPayload.canonicalFlowKey,
      flowMode: scenarioPayload.flowMode,
      flowDetailLabel: scenarioPayload.flowDetailLabel,
      normalizationActions: scenarioPayload.normalizationActions,
      strippedForbiddenTerms: scenarioPayload.strippedForbiddenTerms,
      finalScenarioSource: scenarioPayload.finalScenarioSource,
      finalValidationPassed: packResolutionPayload.finalValidationPassed,
      finalValidationFailures: packResolutionPayload.finalValidationFailures,
      renderMode: canonicalStorySeed.mode,
      suppressionFamilySummary: canonicalStorySeed.suppressedFamilies || []
    };
    files.push(saveTextArtifact({ folderId: assetFolderId, name: 'pack_resolution_audit.json', contents: JSON.stringify(packResolutionAudit, null, 2) }));

    const result = {
      status: (logo && logo.url) ? 'logo-preview-ready' : 'logo-not-found',
      rootFolderId,
      assetFolderId,
      assetFolderName,
      logoUrl: logo && logo.url ? String(logo.url) : '',
      logoSource: logo && logo.source ? String(logo.source) : '',
      heroUrl: hero && hero.url ? String(hero.url) : '',
      heroSource: hero && hero.source ? String(hero.source) : '',
      assemblyUrl: assembly && assembly.url ? String(assembly.url) : '',
      assemblySource: assembly && assembly.source ? String(assembly.source) : '',
      heroSameAsAssembly: !!(hero && assembly && hero.url && assembly.url && String(hero.url) === String(assembly.url)),
      logoPreviewReady: !!(logo && logo.url),
      heroPreviewReady: !!(hero && hero.url),
      assemblyPreviewReady: !!(enableManufacturing && assembly && assembly.url),
      binarySaved: !!binaryResult.saved,
      binaryReason: binaryResult.reason || '',
      files,
      elapsedMs: Date.now() - started
    };

    log.audit({ title: `Image enrichment phase 3b [${VERSION}]`, details: JSON.stringify(result) });
    return result;
  }

  function saveLogoBinaryOrDiagnostics({ folderId, logo, pageUrl, prospect, extId }) {
    const diagnostics = {
      version: VERSION,
      prospect: String(prospect || ''),
      extId: String(extId || ''),
      pageUrl: String(pageUrl || ''),
      logoUrl: logo && logo.url ? String(logo.url) : '',
      logoSource: logo && logo.source ? String(logo.source) : '',
      responseCode: null,
      contentType: '',
      finalUrl: '',
      bodyLength: 0,
      saveMethod: '',
      savedFileName: '',
      dataUriPreviewSaved: false,
      dataUriPreviewName: '',
      skippedReason: ''
    };

    if (!logo || !logo.url) {
      diagnostics.skippedReason = 'no-logo-url';
      return { saved: false, reason: diagnostics.skippedReason, diagnostics, file: null };
    }

    try {
      const resp = https.get({
        url: String(logo.url),
        headers: {
          'User-Agent': 'Mozilla/5.0 (NetSuite SCAI Demo Reset)',
          'Accept': 'image/svg+xml,image/*,*/*;q=0.8'
        }
      });
      diagnostics.responseCode = Number(resp && resp.code || 0);
      diagnostics.contentType = str((resp && resp.headers && (resp.headers['Content-Type'] || resp.headers['content-type'])) || '');
      diagnostics.finalUrl = String(logo.url);
      const body = String(resp && resp.body || '');
      diagnostics.bodyLength = body.length;
      const lowerType = diagnostics.contentType.toLowerCase();
      const urlLower = String(logo.url || '').toLowerCase();
      const looksSvg = lowerType.indexOf('svg') !== -1 || /<svg[\s>]/i.test(body) || /\.svg(\?|$)/i.test(urlLower);

      if (looksSvg && body) {
        const saved = saveTextArtifact({ folderId, name: 'logo_image.svg', contents: body });
        diagnostics.saveMethod = 'svg-text';
        diagnostics.savedFileName = 'logo_image.svg';
        log.audit({ title: `Logo binary save optional [${VERSION}]`, details: JSON.stringify(diagnostics) });
        return { saved: true, reason: 'svg-saved', diagnostics, file: saved };
      }

      const rasterMap = [
        { match: ['image/png', '.png'], ext: 'png', fileType: file.Type.PNGIMAGE },
        { match: ['image/jpeg', 'image/jpg', '.jpg', '.jpeg'], ext: 'jpg', fileType: file.Type.JPGIMAGE },
        { match: ['image/gif', '.gif'], ext: 'gif', fileType: file.Type.GIFIMAGE }
      ];
      let raster = null;
      for (let i = 0; i < rasterMap.length; i++) {
        const row = rasterMap[i];
        if (row.match.some(function (m) { return lowerType.indexOf(String(m)) !== -1 || urlLower.indexOf(String(m)) !== -1; })) {
          raster = row;
          break;
        }
      }

      if (raster && body) {
        try {
          const b64 = binaryStringToBase64(body);
          diagnostics.saveMethod = 'raster-binary-string-base64';
          diagnostics.base64Length = b64 ? b64.length : 0;
          const imageFile = file.create({
            name: `logo_image.${raster.ext}`,
            fileType: raster.fileType,
            contents: b64,
            folder: Number(folderId),
            isOnline: false
          });
          const fileId = Number(imageFile.save());
          diagnostics.savedFileName = `logo_image.${raster.ext}`;
          diagnostics.savedFileId = fileId;
          const dataUriPreviewFile = saveTextArtifact({
            folderId,
            name: 'logo_image_datauri.html',
            contents: buildRasterDataUriPreviewHtml({
              prospect,
              extId,
              pageUrl,
              logo,
              contentType: diagnostics.contentType || mimeFromExt(raster.ext),
              base64Data: b64
            })
          });
          diagnostics.dataUriPreviewSaved = true;
          diagnostics.dataUriPreviewName = 'logo_image_datauri.html';
          log.audit({ title: `Logo binary save optional [${VERSION}]`, details: JSON.stringify(diagnostics) });
          return { saved: true, reason: 'raster-saved', diagnostics, file: { id: fileId, name: diagnostics.savedFileName }, dataUriPreviewFile };
        } catch (e) {
          diagnostics.skippedReason = 'raster-save-failed';
          diagnostics.rasterError = String((e && (e.message || e.details)) ? (e.message || e.details) : e);
          saveTextArtifact({ folderId, name: 'logo_raster_body.txt', contents: body.slice(0, 200000) });
          log.audit({ title: `Logo binary save optional skip [${VERSION}]`, details: JSON.stringify(diagnostics) });
          return { saved: false, reason: diagnostics.skippedReason, diagnostics, file: null };
        }
      }

      diagnostics.skippedReason = body ? 'non-svg-binary-not-safely-supported' : 'empty-response-body';
      log.audit({ title: `Logo binary save optional skip [${VERSION}]`, details: JSON.stringify(diagnostics) });
      return { saved: false, reason: diagnostics.skippedReason, diagnostics, file: null };
    } catch (e) {
      diagnostics.skippedReason = 'fetch-failed';
      diagnostics.error = String((e && (e.message || e.details)) ? (e.message || e.details) : e);
      log.audit({ title: `Logo binary save optional skip [${VERSION}]`, details: JSON.stringify(diagnostics) });
      return { saved: false, reason: diagnostics.skippedReason, diagnostics, file: null };
    }
  }

  function buildAssetFolderName(prospect, extId) {
    const base = safeCode(String(prospect || 'Prospect').replace(/\s+/g, '_')).slice(0, 40) || 'Prospect';
    const suffix = safeCode(extId || 'RUN').slice(-20) || 'RUN';
    return `${base}__${suffix}`;
  }

  function ensureFolderByPath({ parentId, name }) {
    const cleanName = str(name);
    if (!cleanName) throw new Error('Folder name required');
    const filters = parentId
      ? [['name', 'is', cleanName], 'AND', ['parent', 'anyof', String(parentId)]]
      : [['name', 'is', cleanName], 'AND', ['parent', 'anyof', '@NONE@']];
    const existing = safeTryReturn(() => search.create({
      type: 'folder',
      filters,
      columns: [search.createColumn({ name: 'internalid', sort: search.Sort.ASC })]
    }).run().getRange({ start: 0, end: 1 })) || [];
    if (existing.length) return Number(existing[0].getValue({ name: 'internalid' }));

    const rec = record.create({ type: 'folder', isDynamic: false });
    rec.setValue({ fieldId: 'name', value: cleanName });
    if (parentId) rec.setValue({ fieldId: 'parent', value: Number(parentId) });
    return Number(rec.save({ enableSourcing: true, ignoreMandatoryFields: true }));
  }

  function saveTextArtifact({ folderId, name, contents }) {
    const f = file.create({
      name: String(name),
      fileType: guessFileTypeFromName(name),
      contents: String(contents || ''),
      folder: Number(folderId)
    });
    return {
      id: Number(f.save()),
      name: String(name)
    };
  }

  function compactRoutingProbeW450(probe) {
    if (!probe) return null;
    return {
      seq: probe.seq || probe.operationSeq || '',
      opName: str(probe.opName || probe.operation || '').slice(0, 80),
      profile: str(probe.profile || '').slice(0, 40),
      pairIndex: Number(probe.pairIndex || 0),
      centerId: probe.centerId || null,
      centerName: str(probe.centerName || '').slice(0, 80),
      centerLocationId: probe.centerLocationId || '',
      centerSubsidiaryId: probe.centerSubsidiaryId || '',
      templateId: probe.templateId || null,
      templateName: str(probe.templateName || '').slice(0, 80),
      templateSubsidiaryId: probe.templateSubsidiaryId || '',
      fieldId: str(probe.fieldId || '').slice(0, 60),
      status: str(probe.status || (probe.accepted ? 'accepted' : probe.rejected ? 'rejected' : '')).slice(0, 30),
      errorName: str(probe.errorName || '').slice(0, 80),
      errorMessage: str(probe.errorMessage || '').slice(0, 240),
      pairScore: Number(probe.pairScore || 0) || 0
    };
  }

  function compactRoutingTelemetryForCaptureW450(telemetry) {
    if (!telemetry || typeof telemetry !== 'object') return telemetry || null;
    const probes = Array.isArray(telemetry.pairProbes) ? telemetry.pairProbes : [];
    const accepted = probes.filter(function (probe) { return probe && probe.status === 'accepted'; });
    const rejected = probes.filter(function (probe) { return probe && probe.status !== 'accepted'; });
    const probeSample = [];
    accepted.slice(0, 25).forEach(function (probe) { probeSample.push(probe); });
    rejected.slice(0, 60).forEach(function (probe) { probeSample.push(probe); });
    rejected.slice(Math.max(60, rejected.length - 20)).forEach(function (probe) {
      if (probeSample.indexOf(probe) === -1) probeSample.push(probe);
    });
    const operationSummary = {};
    probes.forEach(function (probe) {
      const key = String(probe && (probe.seq || probe.operationSeq || probe.opName) || 'unknown');
      const row = operationSummary[key] || { seq: probe && probe.seq || '', opName: probe && probe.opName || '', accepted: 0, rejected: 0, fields: {}, errors: {} };
      if (probe && probe.status === 'accepted') row.accepted += 1;
      else row.rejected += 1;
      const fieldId = str(probe && probe.fieldId || 'unknown');
      const errorName = str(probe && probe.errorName || '');
      row.fields[fieldId] = (row.fields[fieldId] || 0) + 1;
      if (errorName) row.errors[errorName] = (row.errors[errorName] || 0) + 1;
      operationSummary[key] = row;
    });
    return {
      schema: telemetry.schema || 'idb.w450-routing-work-center-cost-template-pair-probing.v1',
      compactedForResultCapture: true,
      originalPairProbeCount: probes.length,
      originalRejectedPairCount: Array.isArray(telemetry.rejectedPairs) ? telemetry.rejectedPairs.length : rejected.length,
      originalAcceptedPairCount: Array.isArray(telemetry.acceptedPairs) ? telemetry.acceptedPairs.length : accepted.length,
      omittedPairProbeCount: Math.max(0, probes.length - probeSample.length),
      authoritativeWorkCenterSearch: telemetry.authoritativeWorkCenterSearch || null,
      candidatePoolAuthority: telemetry.candidatePoolAuthority || '',
      candidatePoolSearchId: telemetry.candidatePoolSearchId || '',
      numericFallbackSearchId: telemetry.numericFallbackSearchId || '',
      savedSearch5005Rows: (telemetry.savedSearch5005Rows || telemetry.workCenterRows || []).slice(0, 20),
      centerRanking: (telemetry.centerRanking || []).slice(0, 20),
      costTemplateRanking: (telemetry.costTemplateRanking || telemetry.templateRanking || []).slice(0, 20),
      operationPlans: (telemetry.operationPlans || []).map(function (plan) {
        return {
          seq: plan.seq,
          opName: plan.opName,
          profile: plan.profile,
          retryProductionForReceive: !!plan.retryProductionForReceive,
          candidatePairCount: plan.candidatePairCount,
          rankedCenters: (plan.rankedCenters || []).slice(0, 8),
          rankedTemplates: (plan.rankedTemplates || []).slice(0, 8)
        };
      }),
      pairProbeSummary: {
        byOperation: Object.keys(operationSummary).map(function (key) { return operationSummary[key]; }),
        note: 'Full probe telemetry was compacted to keep the NetSuite result file below the 10 MB getContents limit.'
      },
      pairProbes: probeSample.map(compactRoutingProbeW450).filter(Boolean),
      acceptedPairs: (telemetry.acceptedPairs || accepted).slice(0, 25).map(compactRoutingProbeW450).filter(Boolean),
      rejectedPairs: (telemetry.rejectedPairs || rejected).slice(0, 80).map(compactRoutingProbeW450).filter(Boolean),
      acceptedOperationLinesW450: (telemetry.acceptedOperationLinesW450 || []).slice(0, 10),
      rejectedOperationLinesW450: (telemetry.rejectedOperationLinesW450 || telemetry.failedOperations || []).slice(0, 10).map(function (line) {
        return Object.assign({}, line || {}, {
          rejectedPairs: (line && line.rejectedPairs || []).slice(0, 10).map(compactRoutingProbeW450).filter(Boolean)
        });
      }),
      failedOperations: (telemetry.failedOperations || []).slice(0, 10).map(function (line) {
        return Object.assign({}, line || {}, {
          rejectedPairs: (line && line.rejectedPairs || []).slice(0, 10).map(compactRoutingProbeW450).filter(Boolean)
        });
      }),
      minimumAcceptedOperationLinesW450: Number(telemetry.minimumAcceptedOperationLinesW450 || 3),
      routingSaveResult: telemetry.routingSaveResult || null,
      routingAssemblyVerification: telemetry.routingAssemblyVerification || null,
      staleCookieProductionLineDetected: !!telemetry.staleCookieProductionLineDetected,
      staleCookieProductionLineRejected: !!telemetry.staleCookieProductionLineRejected,
      staleCookieProductionLineSuperseded: !!telemetry.staleCookieProductionLineSuperseded,
      staleCookieRouteSupersedeResult: telemetry.staleCookieRouteSupersedeResult || null
    };
  }

  function compactRoutingResultForCaptureW450(result) {
    if (!result || typeof result !== 'object') return result || null;
    const compactTelemetry = compactRoutingTelemetryForCaptureW450(result.w450 || result.w449);
    const routingFailure = result.routingFailure ? Object.assign({}, result.routingFailure, {
      w449: compactRoutingTelemetryForCaptureW450(result.routingFailure.w449),
      w450: compactRoutingTelemetryForCaptureW450(result.routingFailure.w450 || result.routingFailure.w449)
    }) : null;
    const diagnostics = result.diagnostics ? Object.assign({}, result.diagnostics, {
      w449: compactRoutingTelemetryForCaptureW450(result.diagnostics.w449),
      w450: compactRoutingTelemetryForCaptureW450(result.diagnostics.w450 || result.diagnostics.w449)
    }) : null;
    return {
      status: result.status || '',
      decision: result.decision || '',
      routingId: result.routingId || null,
      routingUrl: result.routingUrl || '',
      routingName: result.routingName || '',
      existingRoutingId: result.existingRoutingId || null,
      attachResult: result.attachResult || '',
      chosen: result.chosen || null,
      operationRows: result.operationRows || [],
      routingValidation: result.routingValidation || null,
      staleRoutingDiscovery: result.staleRoutingDiscovery || null,
      staleRoutingSupersededTargetId: result.staleRoutingSupersededTargetId || null,
      staleRoutingSupersedeFailure: result.staleRoutingSupersedeFailure || null,
      assemblyRoutingVerificationW449: result.assemblyRoutingVerificationW449 || null,
      routingFailure,
      diagnostics,
      w449: compactTelemetry,
      w450: compactTelemetry
    };
  }

  function resultCaptureContentsForSaveW450(capture) {
    const MAX_CAPTURE_CHARS_W450 = 7000000;
    const clone = Object.assign({}, capture || {});
    clone.resultCaptureCompactionW450 = {
      schema: 'idb.w450-result-capture-size-guard.v1',
      minified: true,
      duplicatePartialSidecarOmitted: true,
      maxChars: MAX_CAPTURE_CHARS_W450
    };
    if (clone.partialGeneratedNamesJson) {
      clone.partialGeneratedNamesJson = {
        schema: 'idb.runner-sidecar-result-json-reference.v1',
        reference: 'sidecarGeneratedNamesJson',
        reason: 'Omitted duplicate sidecar payload to keep result capture under NetSuite file content limits.'
      };
    }
    let text = JSON.stringify(clone);
    if (text.length <= MAX_CAPTURE_CHARS_W450) return text;

    const sidecar = clone.sidecarGeneratedNamesJson || {};
    const emergency = {
      schema: clone.schema || 'idb.runner-result-capture.v1',
      status: clone.status || 'pending_transaction_resolution',
      runnerVersion: clone.runnerVersion || VERSION,
      releaseTrain: RELEASE_TRAIN,
      releaseTranche: RELEASE_TRANCHE,
      idempotencyToken: clone.idempotencyToken || '',
      sourceRequestId: clone.sourceRequestId || '',
      buildAttemptId: clone.buildAttemptId || '',
      submittedAt: clone.submittedAt || '',
      resolvedOperatingMode: clone.resolvedOperatingMode || '',
      resultCaptureFolderId: clone.resultCaptureFolderId || null,
      generatedRecordOwner: clone.generatedRecordOwner || 'governed_runner_internal_build_engine',
      transactionResolution: clone.transactionResolution || null,
      sourceRequest: clone.sourceRequest ? Object.assign({}, clone.sourceRequest, {
        conversationNotes: str(clone.sourceRequest.conversationNotes || '').slice(0, 1000)
      }) : null,
      routingResult: compactRoutingResultForCaptureW450(clone.routingResult),
      routingDiagnostics: compactRoutingResultForCaptureW450(clone.routingDiagnostics),
      routingOperations: (clone.routingOperations || []).slice(0, 10),
      visibleProductNarrativeW439: clone.visibleProductNarrativeW439 || null,
      runnerLaneVocabularyPolicy: clone.runnerLaneVocabularyPolicy || null,
      sidecarGeneratedNamesJson: {
        schema: sidecar.schema || 'idb.runner-sidecar-result-json.v1',
        status: sidecar.status || clone.status || 'pending_transaction_resolution',
        runStatus: sidecar.runStatus || clone.status || 'pending_transaction_resolution',
        generatedRecordOwner: sidecar.generatedRecordOwner || clone.generatedRecordOwner || 'governed_runner_internal_build_engine',
        source: sidecar.source || 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox',
        idempotencyToken: sidecar.idempotencyToken || clone.idempotencyToken || '',
        sourceRequestId: sidecar.sourceRequestId || clone.sourceRequestId || '',
        buildAttemptId: sidecar.buildAttemptId || clone.buildAttemptId || '',
        productBuildPlanW432: sidecar.productBuildPlanW432 || null,
        productBuildPlanValidationW432: sidecar.productBuildPlanValidationW432 || null,
        visibleProductNarrativeW439: sidecar.visibleProductNarrativeW439 || null,
        records: sidecar.records || {},
        demoTransaction: sidecar.demoTransaction || null,
        heroItem: sidecar.heroItem || null,
        matrixItem: sidecar.matrixItem || sidecar.assembly || null,
        assembly: sidecar.assembly || null,
        bom: sidecar.bom || null,
        bomRevision: sidecar.bomRevision || null,
        workOrder: sidecar.workOrder || null,
        workOrderDiagnostics: sidecar.workOrderDiagnostics || null,
        routing: sidecar.routing || null,
        routingDiagnostic: sidecar.routingDiagnostic || null,
        routingOperations: (sidecar.routingOperations || []).slice(0, 10),
        componentItems: (sidecar.componentItems || []).slice(0, 10),
        assemblyBomTelemetry: sidecar.assemblyBomTelemetry || null,
        workOrderTelemetry: sidecar.workOrderTelemetry || null,
        routingDiagnostics: compactRoutingResultForCaptureW450(sidecar.routingDiagnostics),
        manufacturingEligibilityPreflightW446: sidecar.manufacturingEligibilityPreflightW446 || null,
        troubleshootExportTelemetryW446: sidecar.troubleshootExportTelemetryW446 ? Object.assign({}, sidecar.troubleshootExportTelemetryW446, {
          routingResult: compactRoutingResultForCaptureW450(sidecar.troubleshootExportTelemetryW446.routingResult),
          routingOperations: (sidecar.troubleshootExportTelemetryW446.routingOperations || []).slice(0, 10)
        }) : null,
        transactionResolution: sidecar.transactionResolution || clone.transactionResolution || null,
        ownership: sidecar.ownership || null,
        runnerLaneVocabularyPolicy: sidecar.runnerLaneVocabularyPolicy || clone.runnerLaneVocabularyPolicy || null
      },
      partialGeneratedNamesJson: {
        schema: 'idb.runner-sidecar-result-json-reference.v1',
        reference: 'sidecarGeneratedNamesJson'
      },
      finalGeneratedNamesJson: null,
      resultCaptureCompactionW450: {
        schema: 'idb.w450-result-capture-size-guard.v1',
        minified: true,
        duplicatePartialSidecarOmitted: true,
        emergencyCompacted: true,
        originalChars: text.length,
        maxChars: MAX_CAPTURE_CHARS_W450
      }
    };
    text = JSON.stringify(emergency);
    if (text.length <= MAX_CAPTURE_CHARS_W450) return text;
    emergency.sidecarGeneratedNamesJson.productBuildPlanW432 = null;
    emergency.sidecarGeneratedNamesJson.visibleProductNarrativeW439 = null;
    emergency.visibleProductNarrativeW439 = null;
    emergency.resultCaptureCompactionW450.productPlanOmitted = true;
    emergency.resultCaptureCompactionW450.secondPassChars = text.length;
    return JSON.stringify(emergency);
  }

  function writeIdbSidecarResultCaptureV1(args) {
    const folderId = Number(args.folderId || 0);
    if (!folderId) throw new Error('IDB result capture folder is required.');
    const extId = str(args.extId);
    if (!extId) throw new Error('IDB result capture requires idempotency token / extId.');

    const prospect = str(args.prospect) || 'IDB Prospect';
    const confirmedBuildRequest = args.confirmedBuildRequestJson || {};
    const buildAttemptId = str(confirmedBuildRequest.buildAttemptId || confirmedBuildRequest.buildAttemptProvenance && confirmedBuildRequest.buildAttemptProvenance.buildAttemptId);
    const submittedAt = str(confirmedBuildRequest.submittedAt || confirmedBuildRequest.buildAttemptProvenance && confirmedBuildRequest.buildAttemptProvenance.submittedAt);
    const sourceRequestId = str(confirmedBuildRequest.requestId || confirmedBuildRequest.sourceRequestId || confirmedBuildRequest.buildAttemptProvenance && confirmedBuildRequest.buildAttemptProvenance.sourceRequestId);
    const resolvedOperatingMode = str(confirmedBuildRequest.resolvedOperatingMode);
    const laneVocabularyPolicy = runnerLaneVocabularyPolicyV1({
      confirmedBuildRequestJson: confirmedBuildRequest,
      enableManufacturing: args.enableManufacturing,
      enableWip: args.enableWip,
      prospect,
      website: args.website,
      notes: args.notes,
      agenda: args.agenda,
      extId
    });
    const resultNames = applyToggleAwareNamingGuardrails(Object.assign({}, args.names || {}), {
      prospect,
      website: args.website,
      notes: args.notes,
      agenda: args.agenda,
      extId,
      enableManufacturing: args.enableManufacturing,
      enableWip: args.enableWip,
      confirmedBuildRequestJson: args.confirmedBuildRequestJson
    });
    const productPlanW441 = resultNames._productBuildPlanW432 || null;
    if (resultNames._productBuildPlanW432 && resultNames._productBuildPlanW432.w449RoutingTelemetry) {
      resultNames._productBuildPlanW432.w449RoutingTelemetry = compactRoutingTelemetryForCaptureW450(resultNames._productBuildPlanW432.w449RoutingTelemetry);
    }
    const compactRoutingResultW450 = compactRoutingResultForCaptureW450(args.routingResult);
    const modeW441 = args.enableWip ? 'wip' : (args.enableManufacturing ? 'manufacturing' : 'distribution');
    const customer = ensureIdbCustomerForResult({
      prospect,
      website: args.website,
      subsidiaryId: args.subsidiaryId,
      extId
    });
    const heroItem = normalizeIdbRecord({
      role: 'heroItem',
      type: 'inventoryitem',
      name: cleanCustomerFacingCreatedNameW441(readRecordDisplayName('inventoryitem', args.ids && args.ids.heroItemId, resultNames.hero_item_name || `${prospect} Hero Item`), 'heroItem', productPlanW441, modeW441),
      internalId: args.ids && args.ids.heroItemId,
      label: laneVocabularyPolicy && laneVocabularyPolicy.finalResultRoleLabels && laneVocabularyPolicy.finalResultRoleLabels.heroItem
    });
    const matrixProofItem = args.enableManufacturing ? null : ensureIdbProofItemForResult({
      prospect,
      subsidiaryId: args.subsidiaryId,
      locationId: args.locationId,
      extId,
      runUniqueSuffix: args.runUniqueSuffix,
      name: resultNames.assembly_name || `${prospect} Availability Flow`,
      laneVocabularyPolicy,
      anchorHeroId: args.ids && args.ids.heroItemId
    });
    const componentItem = args.enableManufacturing ? null : ensureIdbComponentItemForResult({
      prospect,
      subsidiaryId: args.subsidiaryId,
      locationId: args.locationId,
      extId,
      runUniqueSuffix: args.runUniqueSuffix,
      name: firstNonEmpty(resultNames.component_names && resultNames.component_names[0], `${prospect} Fulfillment Support SKU`),
      laneVocabularyPolicy,
      anchorHeroId: args.ids && args.ids.heroItemId
    });
    const assemblyItem = args.enableManufacturing && args.ids && args.ids.assemblyId ? normalizeIdbRecord({
      role: 'assemblyItem',
      type: 'assemblyitem',
      name: cleanCustomerFacingCreatedNameW441(readRecordDisplayName('assemblyitem', args.ids.assemblyId, resultNames.assembly_name), 'assembly', productPlanW441, modeW441),
      internalId: args.ids.assemblyId,
      label: 'Assembly / Finished Good'
    }) : null;
    const manufacturingComponents = args.enableManufacturing ? [
      { id: args.ids && args.ids.comp1Id, name: resultNames.component_names && resultNames.component_names[0] },
      { id: args.ids && args.ids.comp2Id, name: resultNames.component_names && resultNames.component_names[1] },
      { id: args.ids && args.ids.comp3Id, name: resultNames.component_names && resultNames.component_names[2] }
    ].filter(c => c.id).map((component, index) => normalizeIdbRecord({
      role: `componentItem${index + 1}`,
      type: 'inventoryitem',
      name: cleanCustomerFacingCreatedNameW441(readRecordDisplayName('inventoryitem', component.id, component.name), `component${index + 1}`, productPlanW441, modeW441),
      internalId: component.id,
      label: `Component Item ${index + 1}`
    })) : [];
    const bomRecord = args.enableManufacturing && args.ids && args.ids.bomId ? normalizeIdbRecord({
      role: 'bom',
      type: 'bom',
      name: cleanCustomerFacingCreatedNameW441(readRecordDisplayName('bom', args.ids.bomId, resultNames.bom_name), 'bom', productPlanW441, modeW441),
      internalId: args.ids.bomId,
      label: 'Bill of Materials'
    }) : null;
    const bomRevisionRecord = args.enableManufacturing && args.ids && args.ids.bomRevId ? normalizeIdbRecord({
      role: 'bomRevision',
      type: 'bomrevision',
      name: cleanCustomerFacingCreatedNameW441(readRecordDisplayName('bomrevision', args.ids.bomRevId, resultNames.bom_revision_name), 'bomRevision', productPlanW441, modeW441),
      internalId: args.ids.bomRevId,
      label: 'BOM Revision'
    }) : null;
    const resolvedWorkOrderIdW445 = Number(firstNonEmpty(
      args.woId,
      args.workOrderTelemetry && args.workOrderTelemetry.woId,
      args.workOrderTelemetry && args.workOrderTelemetry.workOrderId,
      args.resultCapture && args.resultCapture.woId
    ) || 0) || null;
    const workOrderRecord = args.enableManufacturing && resolvedWorkOrderIdW445 ? normalizeIdbRecord({
      role: 'workOrder',
      type: 'workorder',
      name: cleanCustomerFacingCreatedNameW441(readRecordDisplayName('workorder', resolvedWorkOrderIdW445, (resultNames._productBuildPlanW432 && resultNames._productBuildPlanW432.workOrderName) || 'Work Order'), 'workOrder', productPlanW441, modeW441),
      internalId: resolvedWorkOrderIdW445,
      label: 'Work Order'
    }) : null;
    const workOrderDiagnosticRecord = args.enableManufacturing && !workOrderRecord && args.workOrderTelemetry && args.workOrderTelemetry.status && args.workOrderTelemetry.status !== 'not-attempted' ? {
      role: 'workOrderDiagnostic',
      label: 'Work Order Diagnostic',
      type: 'workorder_diagnostic',
      recordType: 'workorder_diagnostic',
      name: `Work Order Diagnostic - ${cleanCustomerFacingCreatedNameW441(resultNames.work_order_name || (productPlanW441 && productPlanW441.workOrderName) || `WO - ${prospect}`, 'workOrder', productPlanW441, modeW441)}`,
      internalId: '',
      id: '',
      url: '',
      status: args.workOrderTelemetry.status || 'best_effort_failed',
      diagnostic: {
        assemblyId: Number(args.ids && args.ids.assemblyId || 0) || null,
        assemblyRecordType: 'assemblyitem',
        itemType: 'assemblyitem',
        bomId: Number(args.ids && args.ids.bomId || 0) || null,
        bomRevId: Number(args.ids && args.ids.bomRevId || 0) || null,
        subsidiaryId: Number(args.subsidiaryId || 0) || null,
        locationId: Number(args.locationId || 0) || null,
        exactFieldAttempted: 'assemblyitem,item',
        errorName: args.workOrderTelemetry.failureType || '',
        errorMessage: args.workOrderTelemetry.errorMessage || ''
      },
      workOrderTelemetry: args.workOrderTelemetry
    } : null;
    const routingRecord = args.enableWip && args.routingId ? normalizeIdbRecord({
      role: 'routing',
      type: 'manufacturingrouting',
      name: (resultNames._productBuildPlanW432 && resultNames._productBuildPlanW432.routingName) || readRecordDisplayName('manufacturingrouting', args.routingId, resultNames.routing_name),
      internalId: args.routingId,
      label: 'Manufacturing Routing'
    }) : null;
    const routingDiagnosticRecord = args.enableWip && !routingRecord
      ? buildRoutingDiagnosticRecordW443({
        resultNames,
        productPlan: productPlanW441,
        routingResult: args.routingResult,
        ids: args.ids
      })
      : null;
    const operationPlanRecords = args.enableWip && productPlanW441 && Array.isArray(productPlanW441.operationNames)
      ? productPlanW441.operationNames.filter(Boolean).map((operationName, index) => ({
        role: `operation${index + 1}`,
        label: `Operation ${index + 1}`,
        type: routingRecord ? 'manufacturingrouting_operation' : 'manufacturingrouting_operation_plan',
        recordType: routingRecord ? 'manufacturingrouting_operation' : 'manufacturingrouting_operation_plan',
        name: str(operationName),
        recordName: str(operationName),
        internalId: routingRecord ? String(routingRecord.internalId || '') : '',
        id: routingRecord ? String(routingRecord.id || '') : '',
        url: routingRecord ? String(routingRecord.url || '') : '',
        operationIndex: index,
        plannedOnly: !routingRecord,
        diagnostic: routingRecord ? null : routingDiagnosticRecord
      }))
      : [];
    const demoTransaction = buildPendingIdbDemoTransactionForResult({
      prospect,
      website: args.website,
      agenda: args.agenda,
      extId,
      csvImport: args.csvImport
    });
    const records = {
      customer,
      demoTransaction,
      heroItem
    };
    if (matrixProofItem) records.matrixProofItem = matrixProofItem;
    if (componentItem) records.componentItem = componentItem;
    if (assemblyItem) records.assemblyItem = assemblyItem;
    manufacturingComponents.forEach((recordValue, index) => { records[`componentItem${index + 1}`] = recordValue; });
    if (bomRecord) records.bom = bomRecord;
    if (bomRevisionRecord) records.bomRevision = bomRevisionRecord;
    if (workOrderRecord) records.workOrder = workOrderRecord;
    if (workOrderDiagnosticRecord) records.workOrderDiagnostic = workOrderDiagnosticRecord;
    if (routingRecord) records.routing = routingRecord;
    if (routingDiagnosticRecord) records.routingDiagnostic = routingDiagnosticRecord;
    operationPlanRecords.forEach((recordValue, index) => { records[`operation${index + 1}`] = recordValue; });

    const troubleshootExportTelemetryW446 = {
      schema: 'idb.w446-runner-troubleshoot-telemetry.v1',
      manufacturingEligibilityPreflightW446: args.manufacturingEligibilityPreflightW446 || null,
      assemblyBomTelemetry: args.assemblyBomTelemetry || null,
      workOrderTelemetry: args.workOrderTelemetry || null,
      routingResult: compactRoutingResultW450,
      routingOperations: operationPlanRecords,
      ids: args.ids || {},
      extId,
      operatorNextStep: args.routingResult && args.routingResult.routingFailure
        ? 'Review routing BOM eligibility and stale routing discovery before the next WIP run.'
        : (args.workOrderTelemetry && args.workOrderTelemetry.failureType
            ? 'Review Work Order body field/default value eligibility before the next WIP run.'
            : 'Open returned records and verify WIP links.')
    };

    const sidecarGeneratedNamesJson = {
      schema: 'idb.runner-sidecar-result-json.v1',
      status: 'pending_transaction_resolution',
      runStatus: 'pending_transaction_resolution',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      source: 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox',
      idempotencyToken: extId,
      runnerTaskId: null,
      sourceRequestId,
      buildAttemptId,
      submittedAt,
      resolvedOperatingMode,
      buildAttemptProvenance: {
        schema: 'forge.w320.build-attempt-provenance.v1',
        sourceRequestId,
        buildAttemptId,
        submittedAt
      },
      productBuildPlanW432: resultNames._productBuildPlanW432 || null,
      productBuildPlanValidationW432: resultNames._toggleAwareNamingGuardrail && resultNames._toggleAwareNamingGuardrail.productBuildPlanValidationW432 || null,
      visibleProductNarrativeW439: resultNames._visibleProductNarrativeW439 || null,
      records,
      demoTransaction,
      heroItem,
      matrixItem: matrixProofItem || assemblyItem,
      assembly: assemblyItem,
      bom: bomRecord,
      bomRevision: bomRevisionRecord,
      workOrder: workOrderRecord,
      workOrderDiagnostics: workOrderDiagnosticRecord,
      routing: routingRecord,
      routingDiagnostic: routingDiagnosticRecord,
      routingOperations: operationPlanRecords,
      componentItems: args.enableManufacturing ? manufacturingComponents : [componentItem].filter(Boolean),
      assemblyBomTelemetry: args.assemblyBomTelemetry || null,
      workOrderTelemetry: args.workOrderTelemetry || null,
      routingDiagnostics: compactRoutingResultW450,
      manufacturingEligibilityPreflightW446: args.manufacturingEligibilityPreflightW446 || null,
      troubleshootExportTelemetryW446,
      transactionResolution: {
        status: 'pending_transaction_resolution',
        authority: 'legacy_runner_csv_import_path',
        expectedDemoTransactionExternalId: demoTransaction.expectedExternalId,
        expectedExternalIdCandidates: demoTransaction.externalIdCandidates,
        csvImport: demoTransaction.csvImport
      },
      ownership: {
        generatedRecordsOwnedBy: 'governed_runner_internal_build_engine',
        drawerWrites: false,
        drawerTransactionWrites: false
      },
      runnerLaneVocabularyPolicy: {
        schema: laneVocabularyPolicy.schema,
        source: laneVocabularyPolicy.source,
        operatingMode: laneVocabularyPolicy.operatingMode,
        laneId: laneVocabularyPolicy.laneId,
        modeKey: laneVocabularyPolicy.modeKey,
        enableManufacturing: laneVocabularyPolicy.enableManufacturing,
        enableWip: laneVocabularyPolicy.enableWip,
        finalResultRoleLabels: laneVocabularyPolicy.finalResultRoleLabels,
        prospectSpecificProofNames: laneVocabularyPolicy.prospectSpecificProofNames,
        prospectSpecificProofNamingMarker: laneVocabularyPolicy.prospectSpecificProofNamingMarker
      }
    };

    const capture = {
      schema: 'idb.runner-result-capture.v1',
      status: 'pending_transaction_resolution',
      runnerVersion: VERSION,
      releaseTrain: RELEASE_TRAIN,
      idempotencyToken: extId,
      runnerTaskId: null,
      sourceRequestId,
      buildAttemptId,
      submittedAt,
      resolvedOperatingMode,
      resultCaptureFolderId: folderId,
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      finalGeneratedNamesReady: false,
      activeOpenLinks: 0,
      runnerLaneVocabularyPolicy: {
        schema: laneVocabularyPolicy.schema,
        source: laneVocabularyPolicy.source,
        operatingMode: laneVocabularyPolicy.operatingMode,
        laneId: laneVocabularyPolicy.laneId,
        modeKey: laneVocabularyPolicy.modeKey,
        enableManufacturing: laneVocabularyPolicy.enableManufacturing,
        enableWip: laneVocabularyPolicy.enableWip,
        finalResultRoleLabels: laneVocabularyPolicy.finalResultRoleLabels,
        prospectSpecificProofNames: laneVocabularyPolicy.prospectSpecificProofNames,
        prospectSpecificProofNamingMarker: laneVocabularyPolicy.prospectSpecificProofNamingMarker
      },
      transactionResolution: {
        status: 'pending_transaction_resolution',
        authority: 'legacy_runner_csv_import_path',
        expectedDemoTransactionExternalId: demoTransaction.expectedExternalId,
        expectedExternalIdCandidates: demoTransaction.externalIdCandidates,
        csvImport: demoTransaction.csvImport
      },
      sourceRequest: {
        requestId: sourceRequestId,
        sourceRequestId,
        buildAttemptId,
        submittedAt,
        idempotencyToken: extId,
        runnerTaskId: null,
        resolvedOperatingMode,
        buildAttemptProvenance: {
          schema: 'forge.w320.build-attempt-provenance.v1',
          sourceRequestId,
          buildAttemptId,
          submittedAt
        },
        customerProspectName: prospect,
        website: str(args.website),
        conversationNotes: str(args.notes),
        demoPath: args.flowState && args.flowState.label || ''
      },
      visibleProductNarrativeW439: resultNames._visibleProductNarrativeW439 || null,
      routingResult: compactRoutingResultW450,
      routingDiagnostics: compactRoutingResultW450,
      routingOperations: operationPlanRecords,
      sidecarGeneratedNamesJson,
      partialGeneratedNamesJson: sidecarGeneratedNamesJson,
      finalGeneratedNamesJson: null
    };

    const filename = resultCaptureFileNameW320({ buildAttemptId, extId });
    const saved = saveTextArtifact({
      folderId,
      name: filename,
      contents: resultCaptureContentsForSaveW450(capture)
    });
    return {
      status: 'pending_transaction_resolution',
      idempotencyToken: extId,
      sourceRequestId,
      buildAttemptId,
      submittedAt,
      resolvedOperatingMode,
      fileId: saved.id,
      fileName: saved.name,
      folderId,
      runnerLaneVocabularyPolicy: {
        schema: laneVocabularyPolicy.schema,
        operatingMode: laneVocabularyPolicy.operatingMode,
        modeKey: laneVocabularyPolicy.modeKey,
        enableManufacturing: laneVocabularyPolicy.enableManufacturing,
        enableWip: laneVocabularyPolicy.enableWip,
        finalResultRoleLabels: laneVocabularyPolicy.finalResultRoleLabels,
        prospectSpecificProofNames: laneVocabularyPolicy.prospectSpecificProofNames,
        prospectSpecificProofNamingMarker: laneVocabularyPolicy.prospectSpecificProofNamingMarker
      },
      transactionResolution: capture.transactionResolution,
      records: sidecarGeneratedNamesJson.records
    };
  }

  function validateIdbCompletedRunnerResultV1(result) {
    const records = result && result.records || {};
    const required = [
      records.customer,
      records.demoTransaction,
      records.heroItem,
      records.matrixProofItem,
      records.componentItem
    ];
    const errors = [];
    required.forEach(rec => {
      if (!rec || !rec.name) errors.push('required generated record name is missing.');
      if (!rec || !/^\d+$/.test(String(rec.internalId || ''))) errors.push(`${rec && rec.name || 'generated record'} requires numeric internalId.`);
      if (!rec || !isSupportedIdbNetSuiteUrl(rec.url)) errors.push(`${rec && rec.name || 'generated record'} requires supported NetSuite URL.`);
    });
    if (result.generatedRecordOwner !== 'governed_runner_internal_build_engine') {
      errors.push('generatedRecordOwner must be governed_runner_internal_build_engine.');
    }
    return { valid: errors.length === 0, errors };
  }

  function ensureIdbCustomerForResult({ prospect, website, subsidiaryId, extId }) {
    const externalId = `IDB_CUSTOMER_${safeFileToken(extId)}`;
    let id = findByExternalId('customer', externalId);
    const name = trimLen(`${idbCanonicalProspectNameW422(prospect, website)} Customer Account`, 83);
    if (!id) {
      const rec = record.create({ type: record.Type.CUSTOMER, isDynamic: false });
      rec.setValue({ fieldId: 'externalid', value: externalId });
      safeTry(() => rec.setValue({ fieldId: 'isperson', value: 'F' }));
      safeTry(() => rec.setValue({ fieldId: 'companyname', value: name }));
      safeTry(() => rec.setValue({ fieldId: 'entityid', value: name }));
      if (subsidiaryId) safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: Number(subsidiaryId) }));
      if (website) safeTry(() => rec.setValue({ fieldId: 'url', value: String(website) }));
      id = Number(rec.save({ enableSourcing: true, ignoreMandatoryFields: true }));
    } else {
      safeTry(() => record.submitFields({
        type: 'customer',
        id: Number(id),
        values: { companyname: name, entityid: name },
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      }));
    }
    return normalizeIdbRecord({
      role: 'customer',
      type: 'customer',
      name: readRecordDisplayName('customer', id, name),
      internalId: id
    });
  }

  function ensureIdbProofItemForResult({ prospect, subsidiaryId, locationId, extId, name, runUniqueSuffix, laneVocabularyPolicy, anchorHeroId }) {
    const roleLabel = laneVocabularyPolicy && laneVocabularyPolicy.finalResultRoleLabels && laneVocabularyPolicy.finalResultRoleLabels.matrixProofItem
      ? laneVocabularyPolicy.finalResultRoleLabels.matrixProofItem
      : 'Formula / Availability Context';
    const policyProofName = laneVocabularyPolicy && laneVocabularyPolicy.prospectSpecificProofNames && laneVocabularyPolicy.prospectSpecificProofNames.matrixProofItemName
      ? laneVocabularyPolicy.prospectSpecificProofNames.matrixProofItemName
      : '';
    const fallbackName = laneVocabularyPolicy && laneVocabularyPolicy.modeKey === 'distribution_replenishment'
      ? `${prospect} Availability Flow`
      : `${prospect} Style / SKU Matrix Proof Item`;
    const proofName = name || policyProofName || roleSpecificGeneratedItemName(roleLabel, fallbackName);
    return ensureIdbInventoryItemForResult({
      externalId: buildUniqueExternalId('IDB_MATRIX', extId, runUniqueSuffix),
      name: buildUniqueRecordName(proofName, runUniqueSuffix, 83),
      subsidiaryId,
      locationId,
      role: 'matrixProofItem',
      label: roleLabel,
      setupPersistence: { anchorHeroId, locationId, subsidiaryId }
    });
  }

  function ensureIdbComponentItemForResult({ prospect, subsidiaryId, locationId, extId, name, runUniqueSuffix, laneVocabularyPolicy, anchorHeroId }) {
    const roleLabel = laneVocabularyPolicy && laneVocabularyPolicy.finalResultRoleLabels && laneVocabularyPolicy.finalResultRoleLabels.componentItem
      ? laneVocabularyPolicy.finalResultRoleLabels.componentItem
      : 'Ingredient / Packaging Component';
    const policyProofName = laneVocabularyPolicy && laneVocabularyPolicy.prospectSpecificProofNames && laneVocabularyPolicy.prospectSpecificProofNames.componentItemName
      ? laneVocabularyPolicy.prospectSpecificProofNames.componentItemName
      : '';
    const fallbackName = laneVocabularyPolicy && laneVocabularyPolicy.modeKey === 'distribution_replenishment'
      ? `${prospect} Fulfillment Support SKU`
      : `${prospect} Component Item`;
    const componentName = name || policyProofName || roleSpecificGeneratedItemName(roleLabel, fallbackName);
    return ensureIdbInventoryItemForResult({
      externalId: buildUniqueExternalId('IDB_COMPONENT', extId, runUniqueSuffix),
      name: buildUniqueRecordName(componentName, runUniqueSuffix, 83),
      subsidiaryId,
      locationId,
      role: 'componentItem',
      label: roleLabel,
      setupPersistence: { anchorHeroId, locationId, subsidiaryId }
    });
  }

  function ensureIdbInventoryItemForResult({ externalId, name, subsidiaryId, locationId, role, label, setupPersistence }) {
    let id = findByExternalId('inventoryitem', externalId);
    if (!id) {
      id = saveIdbInventoryItemWithDuplicateFallbacks({
        externalId,
        name,
        subsidiaryId,
        locationId,
        role
      });
    } else {
      safeTry(() => record.submitFields({
        type: 'inventoryitem',
        id: Number(id),
        values: { itemid: name, displayname: stripInternalRunSuffixW441(name) },
        options: { enableSourcing: true, ignoreMandatoryFields: true }
      }));
    }
    const setupDiagnostics = setupPersistence ? applyGeneratedInventoryItemSetupPersistence({
      itemId: Number(id),
      anchorHeroId: setupPersistence.anchorHeroId,
      subsidiaryId: setupPersistence.subsidiaryId || subsidiaryId,
      locationId: setupPersistence.locationId || locationId,
      role
    }) : null;
    const normalized = normalizeIdbRecord({
      role,
      type: 'inventoryitem',
      name: readRecordDisplayName('inventoryitem', id, name),
      internalId: id,
      label
    });
    if (setupDiagnostics) normalized.setupDiagnostics = setupDiagnostics;
    return normalized;
  }

  function roleSpecificGeneratedItemName(roleLabel, baseName) {
    const roleText = String(roleLabel || 'Generated Item').trim();
    const cleanBase = String(baseName || 'Demo Item').replace(/^SCAI\s*-\s*/i, '').trim() || 'Demo Item';
    if (cleanBase.toLowerCase().indexOf(roleText.toLowerCase()) !== -1) return cleanBase;
    return `${roleText} - ${cleanBase}`;
  }

  function isDuplicateItemError(error) {
    const text = [
      error && error.name,
      error && error.id,
      error && error.code,
      error && error.message,
      error
    ].filter(Boolean).join(' ');
    return /DUP_ITEM|Uniqueness error|same name\/parent combination|item with that name/i.test(String(text || ''));
  }

  function isInvalidSubsidiaryLocationError(error) {
    const text = [
      error && error.name,
      error && error.id,
      error && error.code,
      error && error.message,
      error
    ].filter(Boolean).join(' ');
    return /INVALID_SUB|subsidiary restrictions|incompatible with those defined for location/i.test(String(text || ''));
  }

  function saveIdbInventoryItemWithDuplicateFallbacks({ externalId, name, subsidiaryId, locationId, role }) {
    const baseExternalId = String(externalId || '').trim();
    const baseName = String(name || `${role || 'Generated'} Item`).trim();
    const attempts = [
      { suffix: '', label: 'primary' },
      { suffix: `-${safeCode(role || 'role').slice(0, 8)}-R1`, label: 'role-retry-1' },
      { suffix: `-${Date.now().toString(36).toUpperCase().slice(-5)}-R2`, label: 'time-retry-2' }
    ];
    const failures = [];
    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      const attemptExternalId = trimLen(`${baseExternalId}${attempt.suffix ? `_${safeCode(attempt.suffix)}` : ''}`, 60);
      const attemptName = buildUniqueRecordName(baseName, attempt.suffix ? attempt.suffix.replace(/^-/, '') : '', 83);
      try {
        const existing = findByExternalId('inventoryitem', attemptExternalId);
        if (existing) return Number(existing);
        const rec = record.create({ type: record.Type.INVENTORY_ITEM, isDynamic: false });
        rec.setValue({ fieldId: 'externalid', value: attemptExternalId });
        rec.setValue({ fieldId: 'itemid', value: attemptName });
        safeTry(() => rec.setValue({ fieldId: 'displayname', value: stripInternalRunSuffixW441(baseName) }));
        try { rec.setValue({ fieldId: 'subsidiary', value: [Number(subsidiaryId)] }); }
        catch (e) { safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: Number(subsidiaryId) })); }
        if (locationId) {
          log.audit({
            title: `IDB sidecar item location deferred [${VERSION}]`,
            details: JSON.stringify({
              role,
              strategy: attempt.label,
              locationId: Number(locationId),
              reason: 'avoid_invalid_sub_location_save_blocker'
            })
          });
        }
        const id = Number(rec.save({ enableSourcing: true, ignoreMandatoryFields: true }));
        log.audit({
          title: `IDB sidecar item save strategy [${VERSION}]`,
          details: JSON.stringify({ role, strategy: attempt.label, id, itemid: attemptName, externalId: attemptExternalId, duplicateFallbackFailures: failures })
        });
        return id;
      } catch (e) {
        failures.push({
          strategy: attempt.label,
          name: String(e && (e.name || e.id) || ''),
          message: String(e && e.message || e || '').slice(0, 360)
        });
        if (isInvalidSubsidiaryLocationError(e)) {
          log.audit({
            title: `IDB sidecar item invalid subsidiary/location guard [${VERSION}]`,
            details: JSON.stringify({ role, strategy: attempt.label, locationId: Number(locationId || 0), error: failures[failures.length - 1] })
          });
        }
        if (!isDuplicateItemError(e)) throw e;
      }
    }
    throw new Error(`IDB sidecar item create failed after duplicate fallbacks: ${JSON.stringify(failures)}`);
  }

  function buildPendingIdbDemoTransactionForResult({ prospect, website, agenda, extId, csvImport }) {
    const expectedExternalId = str(extId);
    const name = trimLen(`${prospect} Demo Sales Order`, 83);
    return {
      role: 'demoTransaction',
      type: 'salesorder',
      recordType: 'salesorder',
      name,
      internalId: '',
      id: '',
      url: '',
      status: 'pending_transaction_resolution',
      expectedExternalId,
      externalIdCandidates: [
        expectedExternalId,
        `IDB_SO_${safeFileToken(extId)}`,
        `SCAI_SO_${safeFileToken(extId)}`
      ],
      memo: `IDB governed runner demo order pending CSV/import resolution: ${prospect}${website ? ` (${extractDomain(website)})` : ''} - ${summarizeOneLine(agenda)}`,
      csvImport: Object.assign({
        status: 'pending_transaction_resolution',
        authority: 'legacy_runner_csv_import_path'
      }, csvImport || {})
    };
  }

  function normalizeIdbRecord({ role, type, name, internalId, fallbackName, label }) {
    const id = Number(internalId || 0);
    const recordName = str(name) || str(fallbackName) || `${role || type} ${id}`;
    return {
      role: String(role || ''),
      label: String(label || ''),
      type: String(type || ''),
      recordType: String(type || ''),
      name: recordName,
      internalId: String(id),
      id: String(id),
      url: buildNetSuiteRecordUrl(type, id)
    };
  }

  function readRecordDisplayName(type, id, fallbackName) {
    const rec = safeTryReturn(() => record.load({ type, id: Number(id), isDynamic: false }));
    if (!rec) return str(fallbackName);
    const fields = type === 'salesorder'
      ? ['tranid', 'memo']
      : (type === 'customer' ? ['companyname', 'entityid', 'altname'] : (type === 'bom' || type === 'bomrevision' || type === 'manufacturingrouting' ? ['name', 'displayname'] : ['displayname', 'itemid', 'salesdescription', 'name']));
    for (let i = 0; i < fields.length; i++) {
      const value = safeTryReturn(() => rec.getValue({ fieldId: fields[i] }));
      if (str(value)) return str(value);
    }
    return str(fallbackName);
  }

  function buildNetSuiteRecordUrl(type, id) {
    const n = Number(id || 0);
    if (!n) return '';
    const host = buildNetSuiteHost();
    if (type === 'customer') return `${host}/app/common/entity/custjob.nl?id=${n}`;
    if (type === 'salesorder') return `${host}/app/accounting/transactions/salesord.nl?id=${n}`;
    if (type === 'workorder') return `${host}/app/accounting/transactions/workord.nl?id=${n}`;
    if (type === 'bom') return `${host}/app/accounting/manufacturing/bom.nl?id=${n}`;
    if (type === 'bomrevision') return `${host}/app/accounting/manufacturing/bomrevision.nl?id=${n}`;
    if (type === 'manufacturingrouting') return `${host}/app/accounting/manufacturing/routing.nl?id=${n}`;
    return `${host}/app/common/item/item.nl?id=${n}`;
  }

  function buildNetSuiteHost() {
    const account = String(runtime.accountId || '').toLowerCase().replace(/_/g, '-').replace(/[^a-z0-9-]/g, '');
    return `https://${account || 'system'}.app.netsuite.com`;
  }

  function isSupportedIdbNetSuiteUrl(url) {
    const value = String(url || '');
    return /^https:\/\/[^/]+\.app\.netsuite\.com\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+$/i.test(value) ||
      /^\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+$/i.test(value);
  }

  function safeFileToken(value) {
    return String(value || '').replace(/[^A-Za-z0-9_\-]/g, '_').slice(0, 80) || 'missing_token';
  }

  function firstNonEmpty() {
    for (let i = 0; i < arguments.length; i++) {
      const value = str(arguments[i]);
      if (value) return value;
    }
    return '';
  }

  function guessFileTypeFromName(name) {
    const lower = String(name || '').toLowerCase();
    if (lower.endsWith('.html')) return file.Type.HTMLDOC;
    if (lower.endsWith('.json')) return file.Type.PLAINTEXT;
    return file.Type.PLAINTEXT;
  }


  function collectHeroCandidates({ html, pageUrl, names }) {
    const raw = String(html || '');
    const wanted = String(names && names.hero_item_name ? names.hero_item_name : '').toLowerCase();
    const industry = String(names && names.industry_category ? names.industry_category : '').toLowerCase();
    const productTerms = buildHeroWantedTerms({ wanted, industry });
    const candidates = [];

    const metaPatterns = [
      { re: /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/ig, source: 'og:image', score: 95 },
      { re: /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/ig, source: 'twitter:image', score: 85 },
      { re: /<meta[^>]+property=["']og:image:url["'][^>]+content=["']([^"']+)["']/ig, source: 'og:image:url', score: 90 }
    ];
    metaPatterns.forEach(function (p) {
      let m;
      while ((m = p.re.exec(raw)) !== null) {
        const url = absolutizeUrl(pageUrl, m[1]);
        if (url) candidates.push(scoreHeroCandidate({ url, source: p.source, baseScore: p.score, hint: '', wanted, industry, productTerms, width: 0, height: 0 }));
      }
    });

    const schemaImageRe = /["']image["']\s*:\s*(\[[^\]]+\]|["'][^"']+["'])/ig;
    let schemaMatch;
    while ((schemaMatch = schemaImageRe.exec(raw)) !== null) {
      const blob = String(schemaMatch[1] || '');
      const urls = [];
      blob.replace(/["'](https?:\/\/[^"']+|\/[^"']+)["']/ig, function (_, u) { urls.push(u); return _; });
      urls.forEach(function (u) {
        const url = absolutizeUrl(pageUrl, u);
        if (url) candidates.push(scoreHeroCandidate({ url, source: 'schema:image', baseScore: 82, hint: 'schema image', wanted, industry, productTerms, width: 0, height: 0 }));
      });
    }

    const sourceRe = /<source\b([^>]*?)>/ig;
    let sourceMatch;
    while ((sourceMatch = sourceRe.exec(raw)) !== null) {
      const attrs = String(sourceMatch[1] || '');
      const srcset = extractAttr(attrs, 'srcset') || extractAttr(attrs, 'data-srcset');
      const src = firstSrcsetUrl(srcset);
      if (!src) continue;
      const url = absolutizeUrl(pageUrl, src);
      if (!url) continue;
      const cls = (extractAttr(attrs, 'class') || '').toLowerCase();
      const hint = [cls, url.toLowerCase()].join(' ');
      candidates.push(scoreHeroCandidate({ url, source: 'source:srcset', baseScore: 20, hint, wanted, industry, productTerms, width: 0, height: 0 }));
    }

    const imgRe = /<img\b([^>]*?)>/ig;
    let imgMatch;
    while ((imgMatch = imgRe.exec(raw)) !== null) {
      const attrs = String(imgMatch[1] || '');
      const src = extractAttr(attrs, 'src') || extractAttr(attrs, 'data-src') || extractAttr(attrs, 'data-lazy-src') || firstSrcsetUrl(extractAttr(attrs, 'srcset')) || firstSrcsetUrl(extractAttr(attrs, 'data-srcset'));
      if (!src) continue;
      const url = absolutizeUrl(pageUrl, src);
      if (!url) continue;
      const alt = (extractAttr(attrs, 'alt') || '').toLowerCase();
      const cls = (extractAttr(attrs, 'class') || '').toLowerCase();
      const ident = (extractAttr(attrs, 'id') || '').toLowerCase();
      const width = Number(extractAttr(attrs, 'width') || 0);
      const height = Number(extractAttr(attrs, 'height') || 0);
      const hint = [alt, cls, ident, url.toLowerCase()].join(' ');
      candidates.push(scoreHeroCandidate({ url, source: 'img', baseScore: 0, hint, wanted, industry, productTerms, width, height, alt, cls, id: ident }));
    }

    const dedup = {};
    candidates.forEach(function (c) {
      if (!c || !c.url) return;
      if (!dedup[c.url] || Number(dedup[c.url].score || 0) < Number(c.score || 0)) dedup[c.url] = c;
    });

    return Object.keys(dedup).map(function (k) { return dedup[k]; }).sort(function (a, b) {
      return Number(b.score || 0) - Number(a.score || 0);
    });
  }

  function buildHeroWantedTerms({ wanted, industry }) {
    const base = [];
    String(wanted || '').split(/[^a-z0-9]+/i).forEach(function (t) { if (t && t.length > 2) base.push(t.toLowerCase()); });
    String(industry || '').split(/[^a-z0-9]+/i).forEach(function (t) { if (t && t.length > 3) base.push(t.toLowerCase()); });
    ['product','products','package','packaging','pack','flavor','cookie','cookies','ice','cream','pop','pops','bar','fudge','strip','stripes','shoe','sneaker','wallet','bag','assembly','finished','good'].forEach(function (t) { base.push(t); });
    const seen = {};
    return base.filter(function (t) { if (seen[t]) return false; seen[t]=true; return true; });
  }

  function scoreHeroCandidate({ url, source, baseScore, hint, wanted, industry, productTerms, width, height, alt, cls, id }) {
    const lowerUrl = String(url || '').toLowerCase();
    const lowerHint = String(hint || '').toLowerCase();
    let score = Number(baseScore || 0);

    productTerms.forEach(function (term) {
      if (term && (lowerHint.indexOf(term) !== -1 || lowerUrl.indexOf(term) !== -1)) score += 12;
    });

    if (/(product|products|gallery|pdp|plp|collection|collections|shop|sku|style|flavor|pack|package|hero|featured|item|detail|recipe)/.test(lowerHint)) score += 45;
    if (/(banner|carousel|slider|promo|promotion|nav|header|footer|sprite|icon|logo|wordmark|brandmark|badge)/.test(lowerHint)) score -= 55;
    if (/(thumbnail|thumb|swatch)/.test(lowerHint)) score -= 30;
    if (/(\bcdn\b|assets|images)/.test(lowerUrl)) score += 8;
    if (/\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(url)) score += 10;
    if (width >= 1200 || height >= 1200) score += 20;
    else if (width >= 600 || height >= 600) score += 12;
    else if (width >= 300 || height >= 300) score += 6;
    if (width && height && (width < 120 || height < 120)) score -= 25;
    if (wanted && lowerHint.indexOf(wanted.split(' ')[0]) !== -1) score += 20;
    if (industry && lowerHint.indexOf(industry.split(' ')[0]) !== -1) score += 10;

    return { url, source, score, hint: lowerHint, width: Number(width || 0), height: Number(height || 0), alt: alt || '', cls: cls || '', id: id || '' };
  }

  function discoverBestHeroCandidate({ html, pageUrl, names }) {
    const ranked = collectHeroCandidates({ html, pageUrl, names });
    const chosen = ranked.length ? ranked[0] : null;
    log.audit({
      title: `Hero candidate resolution [${VERSION}]`,
      details: JSON.stringify({ pageUrl, chosen: chosen || null, ranked: ranked.slice(0, 10) })
    });
    return chosen || { url: '', source: 'none', score: 0 };
  }

  function firstSrcsetUrl(srcset) {
    const raw = str(srcset);
    if (!raw) return '';
    const first = raw.split(',')[0] || '';
    return str(first.split(' ')[0] || '');
  }

  function buildHeroPreviewHtml({ prospect, extId, finalUrl, hero }) {
    const safeProspect = escapeHtml(prospect || '');
    const safeExt = escapeHtml(extId || '');
    const safePage = escapeHtml(finalUrl || '');
    const safeHero = escapeHtml((hero && hero.url) ? hero.url : '');
    const safeSource = escapeHtml((hero && hero.source) ? hero.source : '');
    const imgTag = safeHero ? `<img src="${safeHero}" alt="hero preview" style="max-width:600px;max-height:400px;border:1px solid #ccc;"/>` : '<p>No hero image candidate found.</p>';
    return `<!doctype html><html><head><meta charset="utf-8"><title>Hero Preview</title></head><body style="font-family:Arial,sans-serif; padding:16px;"><h2>Hero Preview</h2><p><strong>Prospect:</strong> ${safeProspect}<br/><strong>Ext ID:</strong> ${safeExt}<br/><strong>Page:</strong> ${safePage}<br/><strong>Source:</strong> ${safeSource}</p>${imgTag}<p style="margin-top:12px;word-break:break-all;">${safeHero}</p></body></html>`;
  }


  function collectAssemblyCandidates({ html, pageUrl, names, hero }) {
    const ranked = collectHeroCandidates({ html, pageUrl, names }).map(function (c) {
      const out = Object.assign({}, c);
      const hint = String(out.hint || '').toLowerCase();
      const url = String(out.url || '').toLowerCase();
      if (/(assembly|finished|pack|package|packaging|product|box|bottle|bag|dress|gown|shoe|cookie|popsicle|pop)/.test(hint) || /(pack|package|product|detail|pdp|sku|style)/.test(url)) out.score += 18;
      if (/(ingredient|component|raw|material|bulk|inside)/.test(hint) || /(ingredient|component|raw)/.test(url)) out.score -= 22;
      return out;
    }).sort(function (a, b) { return Number(b.score || 0) - Number(a.score || 0); });
    if (hero && hero.url) {
      const exists = ranked.some(function (x) { return String(x.url || '') === String(hero.url || ''); });
      if (!exists) ranked.unshift({ url: hero.url, source: (hero.source || 'hero-fallback') + '-assembly-fallback', score: Number(hero.score || 0) - 5, hint: 'hero fallback for assembly' });
    }
    return ranked;
  }

  function discoverBestAssemblyCandidate({ html, pageUrl, names, hero }) {
    const ranked = collectAssemblyCandidates({ html, pageUrl, names, hero });
    const chosen = ranked.length ? ranked[0] : null;
    log.audit({
      title: `Assembly candidate resolution [${VERSION}]`,
      details: JSON.stringify({ pageUrl, chosen: chosen || null, ranked: ranked.slice(0, 10) })
    });
    return chosen || { url: '', source: 'none', score: 0 };
  }

  function buildAssemblyPreviewHtml({ prospect, extId, finalUrl, assembly }) {
    const safeProspect = escapeHtml(prospect || '');
    const safeExt = escapeHtml(extId || '');
    const safePage = escapeHtml(finalUrl || '');
    const safeAssembly = escapeHtml((assembly && assembly.url) ? assembly.url : '');
    const safeSource = escapeHtml((assembly && assembly.source) ? assembly.source : '');
    const imgTag = safeAssembly ? `<img src="${safeAssembly}" alt="assembly preview" style="max-width:600px;max-height:400px;border:1px solid #ccc;"/>` : '<p>No assembly image candidate found.</p>';
    return `<!doctype html><html><head><meta charset="utf-8"><title>Assembly Preview</title></head><body style="font-family:Arial,sans-serif; padding:16px;"><h2>Assembly Preview</h2><p><strong>Prospect:</strong> ${safeProspect}<br/><strong>Ext ID:</strong> ${safeExt}<br/><strong>Page:</strong> ${safePage}<br/><strong>Source:</strong> ${safeSource}</p>${imgTag}<p style="margin-top:12px;word-break:break-all;">${safeAssembly}</p></body></html>`;
  }

  function discoverBestLogoCandidate({ html, pageUrl }) {
    const raw = String(html || '');
    const candidates = [];

    const metaPatterns = [
      { re: /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/ig, source: 'og:image', score: 85 },
      { re: /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/ig, source: 'twitter:image', score: 70 }
    ];
    metaPatterns.forEach(function (p) {
      let m;
      while ((m = p.re.exec(raw)) !== null) {
        const url = absolutizeUrl(pageUrl, m[1]);
        if (url) candidates.push({ url, source: p.source, score: p.score });
      }
    });

    const imgRe = /<img\b([^>]*?)>/ig;
    let imgMatch;
    while ((imgMatch = imgRe.exec(raw)) !== null) {
      const attrs = String(imgMatch[1] || '');
      const src = extractAttr(attrs, 'src') || extractAttr(attrs, 'data-src') || extractAttr(attrs, 'data-lazy-src');
      if (!src) continue;
      const url = absolutizeUrl(pageUrl, src);
      if (!url) continue;
      const alt = (extractAttr(attrs, 'alt') || '').toLowerCase();
      const cls = (extractAttr(attrs, 'class') || '').toLowerCase();
      const ident = (extractAttr(attrs, 'id') || '').toLowerCase();
      const width = Number(extractAttr(attrs, 'width') || 0);
      const height = Number(extractAttr(attrs, 'height') || 0);
      const hint = [alt, cls, ident, url.toLowerCase()].join(' ');
      let score = 0;
      if (hint.indexOf('logo') !== -1) score += 120;
      if (hint.indexOf('brand') !== -1) score += 25;
      if (hint.indexOf('header') !== -1 || hint.indexOf('navbar') !== -1) score += 12;
      if (width && width <= 900) score += 6;
      if (height && height <= 400) score += 6;
      if (/\.(svg|png|webp|jpg|jpeg)(\?|$)/i.test(url)) score += 10;
      if (url.indexOf('sprite') !== -1 || url.indexOf('icon') !== -1) score -= 15;
      candidates.push({ url, source: 'img', score, alt, cls, id: ident, width, height });
    }

    const linkRe = /<link\b([^>]*?)>/ig;
    let linkMatch;
    while ((linkMatch = linkRe.exec(raw)) !== null) {
      const attrs = String(linkMatch[1] || '');
      const rel = (extractAttr(attrs, 'rel') || '').toLowerCase();
      if (rel.indexOf('icon') === -1) continue;
      const href = extractAttr(attrs, 'href');
      const url = absolutizeUrl(pageUrl, href);
      if (url) candidates.push({ url, source: rel, score: 20 });
    }

    const dedup = {};
    candidates.forEach(function (c) {
      if (!c || !c.url) return;
      if (!dedup[c.url] || dedup[c.url].score < c.score) dedup[c.url] = c;
    });

    const ranked = Object.keys(dedup).map(function (k) { return dedup[k]; }).sort(function (a, b) {
      return Number(b.score || 0) - Number(a.score || 0);
    });

    const chosen = ranked.length ? ranked[0] : null;
    log.audit({
      title: `Logo candidate resolution [${VERSION}]`,
      details: JSON.stringify({
        pageUrl,
        chosen: chosen || null,
        ranked: ranked.slice(0, 10)
      })
    });
    return chosen || { url: '', source: 'none', score: 0 };
  }

  function extractAttr(attrString, attrName) {
    const re = new RegExp(attrName + `\\s*=\\s*["']([^"']+)["']`, 'i');
    const m = String(attrString || '').match(re);
    return m && m[1] ? String(m[1]) : '';
  }

  function absolutizeUrl(pageUrl, candidate) {
    const raw = str(candidate);
    if (!raw) return '';
    if (/^data:/i.test(raw)) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^\/\//.test(raw)) return 'https:' + raw;
    return normalizeUrl(resolveRedirectUrl(pageUrl, raw));
  }

  function buildLogoPreviewHtml({ prospect, extId, finalUrl, logo }) {
    const safeProspect = escapeHtml(prospect || '');
    const safeExt = escapeHtml(extId || '');
    const safePage = escapeHtml(finalUrl || '');
    const safeLogo = escapeHtml((logo && logo.url) ? logo.url : '');
    const safeSource = escapeHtml((logo && logo.source) ? logo.source : '');
    return `<!doctype html><html><head><meta charset="utf-8"><title>Logo Preview</title></head><body style="font-family:Arial,sans-serif;padding:24px;"><h2>SCAI Demo Asset Preview</h2><div><b>Prospect:</b> ${safeProspect}</div><div><b>External ID:</b> ${safeExt}</div><div><b>Final URL:</b> ${safePage}</div><div><b>Logo Source:</b> ${safeSource}</div>${safeLogo ? `<div style="margin-top:16px;"><img src="${safeLogo}" alt="Logo preview" style="max-width:420px;max-height:200px;border:1px solid #ccc;padding:8px;"></div><div style="margin-top:8px;font-size:12px;color:#666;">Remote preview only. Use discovered URL for later binary download / record attachment iteration.</div>` : `<div style="margin-top:16px;color:#900;">No logo URL detected.</div>`}</body></html>`;
  }


  function buildRasterDataUriPreviewHtml({ prospect, extId, pageUrl, logo, contentType, base64Data }) {
    const safeProspect = escapeHtml(prospect || '');
    const safeExt = escapeHtml(extId || '');
    const safePage = escapeHtml(pageUrl || '');
    const safeLogo = escapeHtml((logo && logo.url) ? logo.url : '');
    const safeSource = escapeHtml((logo && logo.source) ? logo.source : '');
    const mime = escapeHtml(contentType || 'image/png');
    const dataUri = `data:${contentType || 'image/png'};base64,${base64Data || ''}`;
    return `<!doctype html><html><head><meta charset="utf-8"><title>Logo Image Data URI Preview</title></head><body style="font-family:Arial,sans-serif;padding:24px;"><h2>Saved Raster Logo Preview</h2><div><b>Prospect:</b> ${safeProspect}</div><div><b>External ID:</b> ${safeExt}</div><div><b>Page:</b> ${safePage}</div><div><b>Logo Source:</b> ${safeSource}</div><div><b>MIME:</b> ${mime}</div><div style="margin-top:16px;"><img src="${dataUri}" alt="Saved raster logo preview" style="max-width:720px;max-height:320px;border:1px solid #ccc;padding:8px;background:#fff;"/></div><div style="margin-top:8px;font-size:12px;color:#666;word-break:break-all;">Remote logo URL: ${safeLogo}</div></body></html>`;
  }

  function mimeFromExt(ext) {
    const lower = String(ext || '').toLowerCase();
    if (lower === 'png') return 'image/png';
    if (lower === 'jpg' || lower === 'jpeg') return 'image/jpeg';
    if (lower === 'gif') return 'image/gif';
    return 'application/octet-stream';
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ----------------------------
  // Search helpers
  // ----------------------------
  function findByExternalId(type, externalId) {
    const s = search.create({ type, filters: [['externalid', 'is', externalId]], columns: ['internalid'] });
    const res = s.run().getRange({ start: 0, end: 1 });
    return (res && res.length) ? res[0].getValue({ name: 'internalid' }) : null;
  }

  function mustFindByExternalId(type, externalId) {
    const id = findByExternalId(type, externalId);
    if (!id) throw new Error(`Missing required anchor: ${type} externalid=${externalId}`);
    return Number(id);
  }

  // ----------------------------
  // Date helpers
  // ----------------------------
  function addMonths(d, m) { const x = new Date(d.getTime()); x.setMonth(x.getMonth() + m); return x; }
  function fmtDate(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yy = String(d.getFullYear());
    return `${mm}/${dd}/${yy}`;
  }

  // ----------------------------
  // Text helpers
  // ----------------------------
  function extractDomain(website) {
    try {
      const s = String(website || '').trim();
      if (!s) return '';
      const v = /^https?:\/\//i.test(s) ? s : `https://${s}`;
      const m = v.match(/^https?:\/\/([^\/?#]+)/i);
      return m && m[1] ? m[1].toLowerCase() : '';
    } catch (e) { return ''; }
  }

  function stripHtml(html) {
    return String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  function compactText(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  function clipToKeywords(text, keywords, maxLen) {
    const t = String(text || '');
    const lower = t.toLowerCase();
    let best = '';
    keywords.forEach(k => {
      const idx = lower.indexOf(k);
      if (idx !== -1) {
        const start = Math.max(0, idx - 500);
        const end = Math.min(t.length, idx + 1700);
        const slice = t.slice(start, end);
        if (slice.length > best.length) best = slice;
      }
    });
    if (!best) return '';
    return best.length <= maxLen ? best : best.slice(0, maxLen);
  }

  function extractJson(s) {
    const t = String(s || '').trim();
    const start = t.indexOf('{');
    const end = t.lastIndexOf('}');
    return (start === -1 || end === -1 || end <= start) ? t : t.slice(start, end + 1);
  }

  function safeJsonParse(s) { try { return JSON.parse(String(s || '')); } catch (e) { return null; } }
  function shortExtSuffix(extId) {
    const raw = String(extId || '').replace(/^SCAI_SO_/i, '').replace(/[^A-Za-z0-9]/g, '');
    if (!raw) return 'RUN';
    return raw.slice(-8).toUpperCase();
  }

  function buildDifferentiatedNames(baseName, extId, runUniqueSuffix) {
    const cleanBase = String(baseName || 'Demo').replace(/^SCAI\s*-\s*/i, '').trim() || 'Demo';
    const suffix = customerFacingRunSuffixW432(runUniqueSuffix || shortExtSuffix(extId)).slice(0, 20);
    return {
      displayName: trimLen(cleanBase, 120),
      itemIdName: buildUniqueRecordName(`SCAI - ${cleanBase}`, suffix, 60),
      suffix
    };
  }

  function trimLen(s, n) { const t = String(s || '').trim(); return t.length <= n ? t : t.slice(0, n).trim(); }
  function customerFacingRunSuffixW432(value) {
    return safeCode(String(value || '')
      .replace(/BEVERAGE/ig, 'SNACKS')
      .replace(/FOODMANUFACTURING/ig, 'SNACKS')
      .replace(/FOOD_BEVERAGE/ig, 'SNACKS')) || 'RUN';
  }
  function summarizeOneLine(text) { const t = String(text || '').replace(/\s+/g, ' ').trim(); return t.length <= 160 ? t : t.slice(0, 157) + '...'; }
  function recordFieldSafeText(text, maxLen) {
    const limit = Number(maxLen || 190);
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (normalized.length <= limit) return normalized;
    return normalized.slice(0, Math.max(0, limit - 3)).replace(/[ ,;:.-]+$/g, '').trim() + '...';
  }
  function firstSentenceFragment(text, fallback, maxLen) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    const sentence = (normalized.match(/^[^.!?]+[.!?]?/) || [normalized])[0] || fallback || '';
    return recordFieldSafeText(sentence, maxLen || 52);
  }
  function recordSafeDemoContextMemo({ prospect, website, notes, agenda }) {
    const combined = `${notes || ''} ${agenda || ''}`;
    const domain = extractDomain(website);
    const buyer = /regional sales|branch operations|vp sales|buyer|operations/i.test(combined)
      ? 'sales/branch ops'
      : firstSentenceFragment(combined, 'first call', 40);
    let pain = 'availability trust';
    if (/supplier|replenishment|lead[- ]?time/i.test(combined)) pain = 'branch/supplier availability';
    else if (/quote|order|promise/i.test(combined)) pain = 'quote/order confidence';
    let proof = 'Inventory/Fulfillment';
    if (/branch/i.test(combined)) proof = 'branch availability';
    let value = 'faster promise decisions';
    if (/margin/i.test(combined)) value = 'faster decisions and margin protection';
    const prefix = `IDB Demo: ${recordFieldSafeText(prospect || 'Prospect', 42)}${domain ? ` (${domain})` : ''}`;
    return recordFieldSafeText(`${prefix} | Buyer: ${buyer}; Pain: ${pain}; Proof: ${proof}; Value: ${value}.`, 190);
  }
  function resultCaptureFileNameW320({ buildAttemptId, extId }) {
    const attemptToken = safeFileToken(buildAttemptId || extId).slice(0, 56);
    const extToken = safeFileToken(extId || buildAttemptId).slice(0, 48);
    const stamp = String(new Date().getTime());
    return trimLen(`idb_runner_sidecar_${attemptToken}_${extToken}_${stamp}.json`, 180);
  }

  function csvQuote(s) {
    const t = String(s || '');
    if (t.indexOf(',') === -1 && t.indexOf('"') === -1 && t.indexOf('\n') === -1) return t;
    return `"${t.replace(/"/g, '""')}"`;
  }


  function binaryStringToBase64(input) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const str = String(input || '');
    let out = '';
    let i = 0;
    while (i < str.length) {
      const c1 = str.charCodeAt(i++) & 0xff;
      const hasC2 = i < str.length;
      const c2 = hasC2 ? (str.charCodeAt(i++) & 0xff) : NaN;
      const hasC3 = i < str.length;
      const c3 = hasC3 ? (str.charCodeAt(i++) & 0xff) : NaN;
      const e1 = c1 >> 2;
      const e2 = ((c1 & 3) << 4) | ((hasC2 ? c2 : 0) >> 4);
      const e3 = hasC2 ? (((c2 & 15) << 2) | ((hasC3 ? c3 : 0) >> 6)) : 64;
      const e4 = hasC3 ? (c3 & 63) : 64;
      out += chars.charAt(e1);
      out += chars.charAt(e2);
      out += (e3 === 64 ? '=' : chars.charAt(e3));
      out += (e4 === 64 ? '=' : chars.charAt(e4));
    }
    return out;
  }

  // ----------------------------
  // Small utils
  // ----------------------------
  function str(v) { return String(v || '').trim(); }
  function toIntOrNull(v) { if (v === null || v === undefined || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
  function safeTry(fn) { try { return fn(); } catch (e) {} }
  function safeTryReturn(fn) { try { return fn(); } catch (e) { return null; } }

  function firstExisting(allFields, candidates) {
    for (let i = 0; i < candidates.length; i++) {
      if (allFields.indexOf(candidates[i]) !== -1) return candidates[i];
    }
    return null;
  }

  function randInt(min, max) {
    const lo = Math.max(0, Number(min || 0));
    const hi = Math.max(lo, Number(max || lo));
    return Math.floor(lo + Math.random() * (hi - lo + 1));
  }

  function normalizeBool(v) {
    const s = String(v || '').trim().toUpperCase();
    if (!s) return false;
    return (s === 'T' || s === 'TRUE' || s === 'YES' || s === '1' || s === 'ON');
  }

  return {
    execute,
    __W432_TEST_HOOKS__: {
      extractWebsiteProductTermsW432,
      kettleProductBuildPlanFixtureW432,
      productBuildPlanW432,
      industryNativeManufacturingNamingW442,
      visibleProductNarrativeW439,
      confirmedBuildToggleValueW440,
      applyProductBuildPlanToNamingPackW432,
      validateProductBuildPlanForModeW432,
      generateNamingPack,
      applyToggleAwareNamingGuardrails,
      cleanCustomerFacingCreatedNameW441,
      customerFacingRunSuffixW432,
      resolveRoutingNames,
      validateRoutingForProductPlanW443
    }
  };
});
