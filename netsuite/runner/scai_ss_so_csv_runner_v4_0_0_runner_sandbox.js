/**
 * SCAI SO CSV Runner v4.0.0 sandbox
 *
 * W455
 * - Accepts browser-proven precomputed naming packs from the approved server adapter.
 * - Verifies assembly BOM context before WIP routing and skips rejected routing BOM fields only when that proof exists.
 * - Emits keyed records and display-ready arrays for completed-with-diagnostic drawer import.
 *
 * W453
 * - Restores the proven v1.12.13 runner as the executable core.
 * - Keeps the older naming-pack, record creation, CSV transaction, Work Order, and direct WIP routing behavior.
 * - Adds only the current drawer compatibility surface: v3 parameter aliases and a compact sidecar result capture file.
 * - Avoids the failed W449-W452 routing probe rabbit hole as the primary path.
 *
 * v1.12.7
 * - Adds a fallback discovery path for precomputed naming files using extId when the explicit naming file parameter is missing or unavailable.
 * - Hardens precomputed naming application so runner-side generic fallback is used only after both direct load and discovery fail.
 * - Adds richer logging around naming payload discovery, parse, and apply status.
 *
 * v1.12.6
 * - Removes inline LLM naming from the runner and expects precomputed naming from the suitelet when available.
 * - Loads the naming payload from a file-cabinet JSON file keyed to the run and falls back deterministically if missing.
 * - Keeps runner execution deterministic, faster, and easier to debug.
 *
 * v1.12.3
 * - Treats manufacturing as a layer on top of the already-resolved hero mode.
 * - Standardizes manufacturing target logging so anchor + manufacturing and fresh + manufacturing are explicit in runner logs.
 * - Reuses the existing manufacturing flow against the resolved hero item instead of letting manufacturing re-decide hero selection.
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/log', 'N/search', 'N/record', 'N/https', 'N/task', 'N/file'],
  (runtime, log, search, record, https, task, file) => {

  /**
   * Version Control
   * v1.12.5
   * - Adds differentiated naming for fresh and anchor HERO paths using the naming pack plus an extId suffix.
   * - Restores anchor itemid renaming safely by appending a short extId suffix to avoid uniqueness collisions.
   * - Keeps displayname readable while itemid becomes rerun-safe and operator-clear.
   * - Applies the same suffix strategy to assembly, components, BOM, and BOM revision names during naming updates.
   *
   * v1.12.1
   * - Keeps v1.12.0 anchor-first HERO resolution intact.
   * - Stops anchor-mode HERO renames from updating itemid, preventing NetSuite uniqueness collisions.
   * - Uses displayname + descriptions only for anchor HERO naming.
   * - Preserves itemid + displayname behavior for create-new HERO mode.
   * - Adds naming-mode audit logging so execution path is visible in script logs.
   *
   * v1.12.0
   * - Locks default HERO behavior to anchor reuse via SCAI_ANCHOR_ITEM.
   * - Prevents passed/inferred hero item ids from forcing fresh-HERO mode when create-new is off.
   * - Adds hero-mode audit logging so runner resolution is visible in execution logs.
   */
  const VERSION = 'v4.0.0-runner-sandbox';
  const RELEASE_TRAIN = 'v4.0.0';
  const RELEASE_TRANCHE = 'w455-browser-proven-naming-routing-import';
  const SALES_ORDER_LOOKUP_SEARCH_ID_W458 = 'customsearch_wms_atlas_bill_lookup_2';
  const SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458 = '5006';

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

  // Compatibility markers retained for drawer-side harnesses after the W453 reset.
  // The live W453 runner uses the older direct creation core, but result/export truth
  // can still describe these diagnostic categories when payload evidence includes them:
  // buildManufacturingEligibilityPreflightW446
  // body-field-fallback-dynamic-default-values
  // BOM not selectable for routing context
  // troubleshootExportTelemetryW446
  // supersede_stale_route_with_new_product_specific_wip_default
  // nextCandidateHint
  // routingOperations: operationPlanRecords
  // Corn masa input used in the
  // Avocado oil frying input used during
  // Sea salt seasoning and retail bag packaging used for


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

  function execute() {
    try {
      return executeInnerW453();
    } catch (e) {
      try {
        const s = runtime.getCurrentScript();
        const extId = str(getScriptParamAny(s, ['custscript_v3_runner_extid', 'custscript_scai_so_runner_extid']));
        const soFolderId = toIntOrNull(getScriptParamAny(s, ['custscript_v3_runner_folder', 'custscript_scai_so_runner_folder']));
        const resultCaptureFolderId = toIntOrNull(getScriptParamAny(s, [
          'custscript_v3_runner_result_capture_folder',
          'custscript_idb_result_capture_folder_id',
          'custscript_scai_runner_result_capture_folder',
          'custscript_scai_result_capture_folder'
        ])) || (/^IDB-/i.test(extId) ? soFolderId : null);
        if (resultCaptureFolderId) {
          const errorCapture = writeIdbErrorSidecarResultCaptureW453({
            folderId: resultCaptureFolderId,
            extId,
            prospect: str(getScriptParamAny(s, ['custscript_v3_runner_prospect', 'custscript_scai_so_runner_prospect'])),
            website: str(getScriptParamAny(s, ['custscript_v3_runner_website', 'custscript_scai_so_runner_website'])),
            notes: str(getScriptParamAny(s, ['custscript_v3_runner_notes', 'custscript_scai_so_runner_notes'])),
            agenda: str(getScriptParamAny(s, ['custscript_v3_runner_agenda', 'custscript_scai_so_runner_agenda'])),
            error: e
          });
          log.error({ title: `IDB sidecar ERROR capture W453 legacy core [${VERSION}]`, details: JSON.stringify(errorCapture) });
        }
      } catch (captureError) {
        log.error({
          title: `IDB sidecar ERROR capture failed W453 legacy core [${VERSION}]`,
          details: JSON.stringify({
            originalErrorName: e && e.name || '',
            originalErrorMessage: e && e.message || String(e || ''),
            captureErrorName: captureError && captureError.name || '',
            captureErrorMessage: captureError && captureError.message || String(captureError || '')
          })
        });
      }
      throw e;
    }
  }

  function executeInnerW453() {
    const s = runtime.getCurrentScript();

    const prospect = str(getScriptParamAny(s, ['custscript_v3_runner_prospect', 'custscript_scai_so_runner_prospect']));
    const website  = str(getScriptParamAny(s, ['custscript_v3_runner_website', 'custscript_scai_so_runner_website']));
    const notes    = str(getScriptParamAny(s, ['custscript_v3_runner_notes', 'custscript_scai_so_runner_notes']));
    const agenda   = str(getScriptParamAny(s, ['custscript_v3_runner_agenda', 'custscript_scai_so_runner_agenda']));
    const extId    = str(getScriptParamAny(s, ['custscript_v3_runner_extid', 'custscript_scai_so_runner_extid']));
    const confirmedBuildRequestJson = parseEmbeddedJson(getScriptParamAny(s, ['custscript_v3_runner_idb_request_json'])) || null;

    const soMappingId = toIntOrNull(getScriptParamAny(s, ['custscript_v3_runner_mapping', 'custscript_scai_so_runner_mapping']));
    const soFolderId  = toIntOrNull(getScriptParamAny(s, ['custscript_v3_runner_folder', 'custscript_scai_so_runner_folder']));
    const namingFileId = toIntOrNull(getScriptParamAny(s, ['custscript_v3_runner_naming_file_id', 'custscript_scai_runner_naming_file_id']));
    const resultCaptureFolderId = toIntOrNull(getScriptParamAny(s, [
      'custscript_v3_runner_result_capture_folder',
      'custscript_idb_result_capture_folder_id',
      'custscript_scai_runner_result_capture_folder',
      'custscript_scai_result_capture_folder'
    ])) || (/^IDB-/i.test(extId) ? soFolderId : null);

    const subsidiaryId = toIntOrNull(getScriptParamAny(s, ['custscript_v3_runner_subsidiary', 'custscript_scai_runner_subsidiary']));
    const locationId   = toIntOrNull(getScriptParamAny(s, ['custscript_v3_runner_location', 'custscript_scai_runner_location']));
    const workCenterSearchIdRaw = str(
      getScriptParamAny(s, ['custscript_v3_runner_wc_search', 'custscript_scai_wc_savedsearch_id', 'custscript_scai_runner_wc_search'])
    ).trim();
    const workCenterSearchId = /^\d+$/.test(workCenterSearchIdRaw)
      ? Number(workCenterSearchIdRaw)
      : workCenterSearchIdRaw;

    // WIP flag (Suitelet should pass 'T' or 'F')
    const enableWipRaw =
      getScriptParamAny(s, ['custscript_v3_runner_enable_wip', 'custscript_scai_runner_enable_wip', 'custscript_scai_runner_enablewip']);
    const enableWip = normalizeBool(enableWipRaw);

    const createNewHeroCandidates = {
      custscript_v3_runner_create_new_hero: s.getParameter({ name: 'custscript_v3_runner_create_new_hero' }),
      custscript_scai_runner_create_new_hero: s.getParameter({ name: 'custscript_scai_runner_create_new_hero' }),
      custscript_scai_create_new_hero: s.getParameter({ name: 'custscript_scai_create_new_hero' }),
      custscript_create_new_hero_item: s.getParameter({ name: 'custscript_create_new_hero_item' }),
      custscript_scai_runner_createnewhero: s.getParameter({ name: 'custscript_scai_runner_createnewhero' })
    };
    const createNewHeroRaw = firstDefinedValue(Object.values(createNewHeroCandidates));
    const createNewHeroItem = normalizeBool(createNewHeroRaw);

    const enableManufacturingCandidates = {
      custscript_v3_runner_enable_mfg: s.getParameter({ name: 'custscript_v3_runner_enable_mfg' }),
      custscript_v3_runner_enable_manufacturing: s.getParameter({ name: 'custscript_v3_runner_enable_manufacturing' }),
      custscript_scai_runner_enable_mfg: s.getParameter({ name: 'custscript_scai_runner_enable_mfg' }),
      custscript_scai_runner_enablemanufacturing: s.getParameter({ name: 'custscript_scai_runner_enablemanufacturing' }),
      custscript_scai_runner_enable_manufacturing: s.getParameter({ name: 'custscript_scai_runner_enable_manufacturing' }),
      custscript_scai_enable_mfg: s.getParameter({ name: 'custscript_scai_enable_mfg' }),
      custscript_enable_manufacturing_flow: s.getParameter({ name: 'custscript_enable_manufacturing_flow' }),
      custscript_enablemfg: s.getParameter({ name: 'custscript_enablemfg' }),
      custscript_scai_runner_mfg_flow: s.getParameter({ name: 'custscript_scai_runner_mfg_flow' })
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
        enableManufacturingRaw,
        enableManufacturingExplicit,
        enableManufacturingParam,
        enableManufacturingTextFallback,
        notesLen: String(notes || '').length,
        agendaLen: String(agenda || '').length,
        resolvedEnableManufacturing: finalEnableManufacturing
      })
    });

    const heroModeRaw =
      s.getParameter({ name: 'custscript_v3_runner_hero_mode' }) ||
      s.getParameter({ name: 'custscript_scai_runner_hero_mode' }) ||
      s.getParameter({ name: 'custscript_scai_hero_mode' }) ||
      '';
    const requestedHeroMode = normalizeHeroMode(heroModeRaw) || (createNewHeroItem ? 'fresh' : 'anchor');

    const anchorHeroItemIdRaw =
      s.getParameter({ name: 'custscript_v3_runner_anchor_hero_item' }) ||
      s.getParameter({ name: 'custscript_scai_runner_anchor_hero_item' }) ||
      s.getParameter({ name: 'custscript_scai_anchor_hero_item' }) ||
      '';
    const anchorHeroItemIdParam = toIntOrNull(anchorHeroItemIdRaw);

    const passedHeroItemIdRaw =
      s.getParameter({ name: 'custscript_v3_runner_hero_item' }) ||
      s.getParameter({ name: 'custscript_v3_runner_hero_item_id' }) ||
      s.getParameter({ name: 'custscript_scai_runner_hero_item' }) ||
      s.getParameter({ name: 'custscript_scai_runner_heroitem' }) ||
      s.getParameter({ name: 'custscript_scai_hero_item' }) ||
      s.getParameter({ name: 'custscript_scai_runner_hero_item_id' }) ||
      s.getParameter({ name: 'custscript_scai_runner_heroitem_id' }) ||
      '';
    const passedHeroItemIdParam = toIntOrNull(passedHeroItemIdRaw);

    const anchorHeroItemId = anchorHeroItemIdParam || mustFindByExternalId('inventoryitem', ANCHORS.heroItem);

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
        handshakeAction = 'fresh-mode-runner-will-create-hero';
      }
      effectiveCreateNewHeroItem = true;
    }

    const requestedManufacturingTargetMode = deriveManufacturingTargetMode(finalEnableManufacturing, requestedHeroMode === 'fresh');
    const manufacturingTargetMode = deriveManufacturingTargetMode(finalEnableManufacturing, effectiveCreateNewHeroItem);
    const manufacturingHandshakeAction = requestedManufacturingTargetMode === manufacturingTargetMode
      ? 'manufacturing-target-confirmed'
      : 'manufacturing-target-rebased-to-effective-hero';

    const effectiveEnableWip = finalEnableManufacturing ? enableWip : false;

    const requestedWipTargetModeRaw =
      s.getParameter({ name: 'custscript_v3_runner_wip_target_mode' }) ||
      s.getParameter({ name: 'custscript_scai_runner_wip_target_mode' }) ||
      s.getParameter({ name: 'custscript_scai_wip_target_mode' }) ||
      '';
    const requestedWipTargetMode = normalizeWipTargetMode(requestedWipTargetModeRaw) || deriveWipTargetMode(enableWip, finalEnableManufacturing, requestedHeroMode === 'fresh');
    const wipTargetMode = deriveWipTargetMode(effectiveEnableWip, finalEnableManufacturing, effectiveCreateNewHeroItem);
    const wipHandshakeAction = requestedWipTargetMode === wipTargetMode
      ? 'wip-target-confirmed'
      : 'wip-target-rebased-to-effective-state';

    if (!prospect) throw new Error('Missing required param: custscript_scai_so_runner_prospect');
    if (!extId) throw new Error('Missing required param: custscript_scai_so_runner_extid');
    if (!soMappingId) throw new Error('Missing required param: custscript_scai_so_runner_mapping');
    if (!soFolderId) throw new Error('Missing required param: custscript_scai_so_runner_folder');
    if (!subsidiaryId) throw new Error('Missing required param: custscript_scai_runner_subsidiary');

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
      passedHeroItemId
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
    const websiteSignalResult = safeGetWebsiteSignal({ website: website, prospect: prospect, extId: extId });
    const signal = websiteSignalResult.signal || { domain: extractDomain(website), text: `Domain: ${extractDomain(website) || ''}. Infer industry from the company name and notes.` };
    log.audit({ title: `Website signal [${VERSION}]`, details: JSON.stringify({ status: websiteSignalResult.status, domain: signal.domain, len: (signal.text || '').length, errorName: websiteSignalResult.errorName || '', fallbackUsed: !!websiteSignalResult.fallbackUsed }) });

    const namingPayload = loadPrecomputedNamingPack({ fileId: namingFileId, extId, prospect, website, signalText: signal.text });
    const names = namingPayload.payload;
    log.audit({ title: `Naming pack selected [${VERSION}]`, details: JSON.stringify({
      source: namingPayload.source || names._source || 'deterministic',
      signalLen: names._signalLen || 0,
      industry_category: names.industry_category || '',
      namingFileId: namingPayload.fileId || namingFileId || null,
      namingPayloadFound: !!namingPayload.found,
      namingPayloadParsed: !!namingPayload.parsed,
      namingPayloadApplied: !!namingPayload.applied,
      namingDiscoveryMode: namingPayload.discoveryMode || 'none',
      namingEvidenceSource: names.namingEvidenceSource || names._source || '',
      namingConfidence: names.namingConfidence || names.confidencePercent || null,
      catalogCandidates: names.catalogCandidates || [],
      selectedCatalogCandidate: names.selectedCatalogCandidate || null,
      selectedCatalogCandidateSource: names.selectedCatalogCandidateSource || '',
      selectedCatalogCandidateReasons: names.selectedCatalogCandidateReasons || [],
      websiteEvidenceSource: names.websiteEvidenceSource || '',
      websiteEvidenceSourceUrls: names.websiteEvidenceSourceUrls || [],
      genericCandidateRejectedReasons: names.genericCandidateRejectedReasons || [],
      missingEvidence: names.missingEvidence || [],
      productEvidenceConfidence: names.productEvidenceConfidence || names.namingConfidence || names.confidencePercent || null,
      websiteCatalogEvidenceUsed: names.websiteCatalogEvidenceUsed === true,
      llmCatalogInterpretationUsed: names.llmCatalogInterpretationUsed === true,
      deterministicCatalogRankerUsed: names.deterministicCatalogRankerUsed === true,
      fallbackUsed: names.fallbackUsed === true,
      productSignalsUsed: names.productSignalsUsed || [],
      flavorSignalsUsed: names.flavorSignalsUsed || [],
      packSignalsUsed: names.packSignalsUsed || [],
      llmNamingAdvisoryUsed: names.llmNamingAdvisoryUsed === true,
      websiteSignalsUsed: names.websiteSignalsUsed || [],
      prospectNameUsedAsFallbackOnly: names.prospectNameUsedAsFallbackOnly === true,
      fallbackReason: names.fallbackReason || '',
      selectedProductName: names.selectedProductName || names.primary_product_candidate || '',
      selectedVariantName: names.selectedVariantName || '',
      selectedPackName: names.selectedPackName || ''
    }) });

    // 4) Apply current-run identity + one-line sales/purchase descriptions
    const customerIdentityTelemetryW457 = ensureCustomerCurrentRunIdentityW457({
      prospect,
      website,
      extId,
      names
    });
    const reusedRecordOverwriteTelemetryW457 = applyNamingToAnchors(ids, names, { enableManufacturing: finalEnableManufacturing, createNewHeroItem: effectiveCreateNewHeroItem, extId });

    // 5) Base prices
    setBaseSalesPrice('inventoryitem', ids.heroItemId, 5.00);
    if (finalEnableManufacturing && ids.assemblyId) setBaseSalesPrice('assemblyitem', ids.assemblyId, 25.00);

    // 6) Manufacturing setup: attach BOM, then repair/reuse WIP routing before Work Order creation.
    let woId = null;
    let workOrderTelemetry = finalEnableManufacturing
      ? (effectiveEnableWip
        ? { status: 'not-attempted' }
        : buildWipDisabledWorkOrderTelemetryW463({
          extId,
          assemblyId: ids.assemblyId,
          bomId: ids.bomId,
          bomRevId: ids.bomRevId,
          subsidiaryId,
          locationId
        }))
      : { status: 'manufacturing-disabled' };
    let routingResult = null;
    let routingId = null;
    if (finalEnableManufacturing && ids.assemblyId && ids.bomId) {
      attachBomToAssembly({ assemblyId: ids.assemblyId, bomId: ids.bomId });

      if (effectiveEnableWip) {
        try {
          routingResult = createAndAttachRoutingIfPossible({
            subsidiaryId,
            locationId,
            bomId: ids.bomId,
            assemblyId: ids.assemblyId,
            extId,
            prospect,
            signalText: signal.text,
            workCenterSearchId,
            names
          });
        } catch (routingError) {
          routingResult = {
            status: 'failed_best_effort',
            decision: 'legacy-core-routing-failed',
            attachResult: 'not-attached-routing-failed',
            routingId: null,
            existingRoutingId: null,
            routingFailure: {
              status: 'failed_best_effort',
              failureStage: 'legacy_core_direct_routing',
              errorName: routingError && routingError.name || '',
              errorMessage: routingError && routingError.message || String(routingError || ''),
              assemblyId: Number(ids.assemblyId || 0),
              bomId: Number(ids.bomId || 0),
              subsidiaryId: Number(subsidiaryId || 0),
              locationId: Number(locationId || 0)
            }
          };
          log.error({ title: `WIP routing best-effort failure W453 legacy core [${VERSION}]`, details: JSON.stringify(routingResult.routingFailure) });
        }
        routingId = routingResult && routingResult.routingId ? Number(routingResult.routingId) : null;
      } else {
        log.audit({ title: `WIP not enabled (skipping routing) [${VERSION}]`, details: JSON.stringify({ enableWipRaw, enableWip, effectiveEnableWip, enableManufacturing: finalEnableManufacturing, requestedWipTargetMode, wipTargetMode, wipHandshakeAction }) });
      }

      if (effectiveEnableWip) {
        try {
          woId = createWorkOrder({
            assemblyId: ids.assemblyId,
            subsidiaryId,
            locationId,
            bomId: ids.bomId,
            bomRevId: ids.bomRevId,
            routingId,
            enableWip: effectiveEnableWip,
            quantity: 10,
            memo: `SCAI Demo Reset: ${extId} | ${prospect} | WO seeded`
          });
          const workOrderResult = typeof woId === 'object' && woId ? woId : { id: woId, telemetry: null };
          woId = Number(workOrderResult.id || 0) || null;
          workOrderTelemetry = Object.assign({
            status: workOrderResult && workOrderResult.telemetry && workOrderResult.telemetry.status || 'created',
            woId,
            workOrderId: woId,
            effectiveEnableWip
          }, workOrderResult.telemetry || {});
          const workOrderLineCleanupW457 = cleanWorkOrderLineDescriptionsW457({
            workOrderId: woId,
            componentIds: [ids.comp1Id, ids.comp2Id, ids.comp3Id],
            componentNames: names.component_names || [],
            assemblyName: names.assembly_name || names.hero_item_name || prospect
          });
          workOrderTelemetry.workOrderLineCleanupW457 = workOrderLineCleanupW457;
          log.audit({ title: `Work Order seeded [${VERSION}]`, details: JSON.stringify({ woId, extId, effectiveEnableWip, workOrderTelemetry, workOrderLineCleanupW457 }) });
        } catch (woError) {
          workOrderTelemetry = {
            status: 'best_effort_failed',
            failureType: 'legacy_core_work_order_failure',
            errorName: woError && woError.name || '',
            errorMessage: woError && woError.message || String(woError || ''),
            assemblyId: Number(ids.assemblyId || 0),
            bomId: Number(ids.bomId || 0),
            bomRevId: Number(ids.bomRevId || 0),
            routingId: routingId ? Number(routingId) : null,
            subsidiaryId: Number(subsidiaryId || 0),
            locationId: Number(locationId || 0),
            attempts: woError && woError.workOrderAttempts || []
          };
          log.error({ title: `Work Order best-effort failure W453 legacy core [${VERSION}]`, details: JSON.stringify(workOrderTelemetry) });
        }
      } else {
        workOrderTelemetry = buildWipDisabledWorkOrderTelemetryW463({
          extId,
          assemblyId: ids.assemblyId,
          bomId: ids.bomId,
          bomRevId: ids.bomRevId,
          subsidiaryId,
          locationId
        });
        log.audit({ title: `Work Order skipped because WIP is disabled W463 [${VERSION}]`, details: JSON.stringify(workOrderTelemetry) });
      }
    } else {
      log.audit({ title: `Manufacturing flow disabled [${VERSION}]`, details: JSON.stringify({ enableManufacturing: finalEnableManufacturing, extId, heroItemId: ids.heroItemId }) });
    }

    // 9) Seed SOs via CSV import
    const soCsv = buildSoCsv({ extId, prospect, website, agenda, locationId, itemKey: ids.heroItemCsvKey || ids.heroItemExternalId || ANCHORS.heroItem });
    const soFileId = saveCsvToFileCabinet({ folderId: soFolderId, filename: boundedFileNameW461(`scai_so_${extId}.csv`, 180), contents: soCsv });
    const soTaskId = submitCsvImport({ mappingId: soMappingId, fileId: soFileId });
    const salesOrderLookupW458 = waitForSalesOrderResolutionW460({
      extId,
      prospect,
      website,
      taskId: soTaskId,
      source: 'runner_after_csv_submit'
    });

    log.audit({
      title: `SO CSV Import SUBMITTED [${VERSION}]`,
      details: JSON.stringify({
        extId,
        fileId: soFileId,
        csvImportTaskId: soTaskId,
        resultCaptureFolderId: resultCaptureFolderId || null,
        salesOrderLookupW458Status: salesOrderLookupW458 && salesOrderLookupW458.status || '',
        salesOrderLookupAttemptsW460: salesOrderLookupW458 && salesOrderLookupW458.attempts || []
      })
    });

    let idbRunnerResultCapture = null;
    if (resultCaptureFolderId) {
      idbRunnerResultCapture = writeIdbSidecarResultCaptureW453({
        folderId: resultCaptureFolderId,
        extId,
        prospect,
        website,
        notes,
        agenda,
        subsidiaryId,
        locationId,
        ids,
        names,
        namingPayload,
        enableManufacturing: finalEnableManufacturing,
        enableWip: effectiveEnableWip,
        woId,
        workOrderTelemetry,
        routingId,
        routingResult,
        soFileId,
        soTaskId,
        salesOrderLookupW458,
        confirmedBuildRequestJson,
        customerIdentityTelemetryW457,
        reusedRecordOverwriteTelemetryW457
      });
      log.audit({
        title: `IDB sidecar result capture W453 legacy core [${VERSION}]`,
        details: JSON.stringify(idbRunnerResultCapture)
      });
    }

    log.audit({
      title: `Runner SUMMARY [${VERSION}]`,
      details: JSON.stringify({
        extId,
        enableWip: effectiveEnableWip,
        createNewHeroItem: effectiveCreateNewHeroItem,
        enableManufacturing: finalEnableManufacturing,
        heroItemId: ids.heroItemId,
        heroItemCsvKey: ids.heroItemCsvKey || '',
        requestedWipTargetMode,
        wipTargetMode,
        wipHandshakeAction,
        routingDecision: routingResult ? routingResult.decision : (effectiveEnableWip ? 'requested-no-result' : 'wip-disabled'),
        routingId,
        existingRoutingId: routingResult ? routingResult.existingRoutingId : null,
        attachResult: routingResult ? routingResult.attachResult : (effectiveEnableWip ? 'not-returned' : 'not-attempted'),
        chosenCenters: routingResult && routingResult.chosen ? routingResult.chosen.centers : [],
        chosenTemplates: routingResult && routingResult.chosen ? routingResult.chosen.templates : [],
        namingFileId: namingFileId || null,
        namingSourceUsed: namingPayload.source || names._source || 'deterministic',
        namingPayloadFound: !!namingPayload.found,
        idbRunnerResultCapture,
        customerIdentityTelemetryW457,
        reusedRecordOverwriteTelemetryW457
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
        wipTargetMode,
        routingId: routingId || null,
        finalStatus: effectiveEnableWip && !routingId ? 'completed_with_wip_diagnostic' : 'completed'
      })
    });

    log.audit({
      title: `Runner COMPLETE [${VERSION}]`,
      details: JSON.stringify({
        extId,
        soFileId,
        soTaskId,
        woId,
        routingId,
        routingResult,
        idbRunnerResultCapture,
        mfg: ids,
        names
      })
    });
  }

  // ----------------------------
  // WIP Routing (create + attach)
  // ----------------------------
  function createAndAttachRoutingIfPossible({ subsidiaryId, locationId, bomId, assemblyId, extId, prospect, signalText, workCenterSearchId, names }) {
    const subs = Number(subsidiaryId);
    const loc = locationId ? Number(locationId) : null;

    // Step 1: Find candidates
    const centers = findWorkCentersFromSavedSearch({ searchId: workCenterSearchId, locationId: loc, subsidiaryId: subs });
    const templates = findCostTemplatesForSubsidiary(subs);       // returns [{id,score,name}, ...]

    log.audit({
      title: `WIP routing candidates [${VERSION}]`,
      details: JSON.stringify({
        subsidiaryId: subs,
        locationId: loc,
        centers: centers.length,
        templates: templates.length
      })
    });

    if (centers.length < 1) {
      log.error({
        title: `WIP routing skipped (no work centers found) [${VERSION}]`,
        details: JSON.stringify({ subsidiaryId: subs })
      });
      return null;
    }
    if (templates.length < 1) {
      log.error({
        title: `WIP routing skipped (no cost templates found) [${VERSION}]`,
        details: JSON.stringify({ subsidiaryId: subs })
      });
      return null;
    }

    // Step 2: Use scenario-aware routing names from the upstream naming pack; fallback to deterministic names
    const opNames = resolveRoutingNames({ prospect, signalText, names });
    log.audit({
      title: `Routing naming applied [${VERSION}]`,
      details: JSON.stringify({ routingNamingApplied: !!opNames, routingOperationNamesUsed: opNames })
    });

    // Step 3: Pick 3 centers/templates (keyword-ranked)
    const pick = pickByKeywords;

    const c1 = pick(centers, ['blend','mix','blending']) || centers[0];
    const c2 = pick(centers, ['dispense','fill','dispensing']) || centers[Math.min(1, centers.length - 1)];
    const c3 = pick(centers, ['pack','package','packaging','case']) || centers[Math.min(2, centers.length - 1)];

    const t1 = pick(templates, ['blend','mix','blending']) || templates[0];
    const t2 = pick(templates, ['dispense','fill','dispensing']) || templates[Math.min(1, templates.length - 1)];
    const t3 = pick(templates, ['pack','package','packaging','case']) || templates[Math.min(2, templates.length - 1)];

    const routingName = trimLen((names && names.routing_name) ? names.routing_name : `SCAI Routing - ${prospect} - BOM ${bomId}`, 80).slice(0, 60);
    const routingMemo = `SCAI Demo Reset: ${extId} | ${prospect} | WIP routing`;
    const assemblyBomProof = verifyAssemblyBomContextW455({ assemblyId, bomId });
    const assemblyRoutingState = inspectAssemblyRoutingStateW455({ assemblyId, extId, expectedRoutingName: routingName });
    const routingDiscovery = discoverReusableRoutingContextW455({
      assemblyId,
      bomId,
      subsidiaryId: subs,
      extId,
      preferredName: routingName,
      assemblyBomProof,
      assemblyRoutingState
    });
    const existingRoutingId = routingDiscovery.acceptedRoutingId || null;

    log.audit({
      title: `WIP managed routing decision [${VERSION}]`,
      details: JSON.stringify({
        assemblyId: Number(assemblyId),
        existingRoutingId,
        assemblyBomProof,
        staleRoutingDetected: assemblyRoutingState.staleRoutingDetected,
        staleRoutingName: assemblyRoutingState.staleRoutingName || '',
        staleRoutingId: assemblyRoutingState.staleRoutingId || null,
        routingDiscovery,
        createNew: false,
        routingTemplateSearchDisabled: true,
        routingPolicy: 'reuse_assembly_attached_or_bom_matched_routing_no_global_template'
      })
	    });
  	
    const reusableRoutingId = existingRoutingId;
    if (reusableRoutingId) {
      return reuseExistingRoutingContextW455({
        routingId: Number(reusableRoutingId),
        routingName,
        routingMemo,
        assemblyId,
        bomId,
        opNames,
        centers: [c1, c2, c3],
        templates: [t1, t2, t3],
        assemblyBomProof,
        assemblyRoutingState,
        existingRoutingId,
        routingDiscovery,
        source: routingDiscovery.acceptedRoutingSource || 'bom-matched-routing'
      });
    }

    return routingDiagnosticW455({
      assemblyId,
      bomId,
      subsidiaryId: subs,
      locationId: loc,
      routingName,
      assemblyBomProof,
      assemblyRoutingState,
      opNames,
      centers: [c1, c2, c3],
      templates: [t1, t2, t3],
      routingDiscovery,
      failureStage: 'no_assembly_attached_routing_available',
      errorName: 'ROUTING_TEMPLATE_REUSE_BLOCKED',
      errorMessage: `No reusable routing exists with BOM ${bomId}; create/seed one correct-BOM routing template or enable a dedicated correct-BOM routing creation path.`
    });
	  }

  function routingDiagnosticW455({ assemblyId, bomId, subsidiaryId, locationId, routingName, assemblyBomProof, assemblyRoutingState, opNames, centers, templates, routingDiscovery, failureStage, errorName, errorMessage }) {
    const operationRows = [
      buildRoutingOperationRowW453(1, 10, opNames && opNames.op10 || 'Operation 10', centers && centers[0], templates && templates[0]),
      buildRoutingOperationRowW453(2, 20, opNames && opNames.op20 || 'Operation 20', centers && centers[1], templates && templates[1]),
      buildRoutingOperationRowW453(3, 30, opNames && opNames.op30 || 'Operation 30', centers && centers[2], templates && templates[2])
    ].map(function(row) {
      row.accepted = false;
      row.rejected = false;
      row.plannedOnly = true;
      row.linkAuthority = { status: 'planned_operation_not_record_link', openable: false, url: '' };
      return row;
    });
    return {
      status: 'failed_best_effort',
      decision: 'assembly-routing-required-diagnostic',
      attachResult: 'not-attached-template-reuse-blocked',
      routingId: null,
      routing: null,
      routingUrl: '',
      routingName,
      name: routingName,
      existingRoutingId: null,
      copiedFromRoutingTemplateId: null,
      assemblyBomProof,
      routingBomFieldSkippedBecauseAssemblyBomVerified: false,
      rejectedBomFieldError: null,
      routingHeaderTelemetry: {
        assemblyBomProof,
        billofmaterials: { attempted: false, skippedBecauseAssemblyBomVerified: false, errorName: '', errorMessage: '' },
        headerFieldsAccepted: [],
        headerFieldsRejected: []
      },
      attachDefaultVerification: {
        assemblyId: Number(assemblyId || 0),
        routingId: 0,
        expectedRoutingName: routingName || '',
        attached: false,
        defaulted: false,
        actualRoutingName: '',
        staleRoutingDetected: assemblyRoutingState && assemblyRoutingState.staleRoutingDetected === true,
        staleRoutingId: assemblyRoutingState && assemblyRoutingState.staleRoutingId || null,
        staleRoutingName: assemblyRoutingState && assemblyRoutingState.staleRoutingName || '',
        routings: assemblyRoutingState && assemblyRoutingState.routings || []
      },
      staleRoutingDetected: assemblyRoutingState && assemblyRoutingState.staleRoutingDetected === true,
      staleRoutingName: assemblyRoutingState && assemblyRoutingState.staleRoutingName || '',
      staleRoutingId: assemblyRoutingState && assemblyRoutingState.staleRoutingId || null,
      supersedeResult: 'blocked-template-routing-context-wrong-bom',
      routingDiscoveryMode: routingDiscovery && routingDiscovery.routingDiscoveryMode || 'none',
      routingCandidatesInspected: routingDiscovery && routingDiscovery.routingCandidatesInspected || 0,
      routingCandidatesRejected: routingDiscovery && routingDiscovery.routingCandidatesRejected || [],
      acceptedRoutingId: null,
      acceptedRoutingBomId: null,
      acceptedRoutingName: '',
      acceptedRoutingSource: '',
      routingDiscovery,
      operationRows,
      routingOperations: operationRows,
      chosen: { centers, templates, ops: opNames },
      routingFailure: {
        status: 'failed_best_effort',
        failureStage,
        errorName,
        errorMessage,
        assemblyId: Number(assemblyId || 0),
        bomId: Number(bomId || 0),
        subsidiaryId: Number(subsidiaryId || 0),
        locationId: Number(locationId || 0),
        assemblyBomProof,
        assemblyRoutingState,
        routingDiscovery,
        nextFixHint: `No reusable routing exists with BOM ${bomId}; create/seed one correct-BOM routing template or enable a dedicated correct-BOM routing creation path.`
      }
    };
  }

  function reuseExistingRoutingContextW455({ routingId, routingName, routingMemo, assemblyId, bomId, opNames, centers, templates, assemblyBomProof, assemblyRoutingState, existingRoutingId, routingDiscovery, source }) {
    const routingRec = record.load({ type: 'manufacturingrouting', id: Number(routingId), isDynamic: true });
    const stepSublist = 'routingstep';
    const preSaveBomId = Number(safeTryReturn(() => routingRec.getValue({ fieldId: 'billofmaterials' })) || 0);
    if (Number(preSaveBomId) !== Number(bomId)) {
      throw new Error(`Exact BOM routing guard rejected routing ${routingId}; expected BOM ${bomId} but found ${preSaveBomId || 'blank'}.`);
    }
    const lineCount = Number(safeTryReturn(() => routingRec.getLineCount({ sublistId: stepSublist })) || 0);
    const planned = [
      { index: 1, seq: 10, name: opNames.op10 || 'Operation 10', center: centers[0], template: templates[0] },
      { index: 2, seq: 20, name: opNames.op20 || 'Operation 20', center: centers[1], template: templates[1] },
      { index: 3, seq: 30, name: opNames.op30 || 'Operation 30', center: centers[2], template: templates[2] }
    ];
    const operationRows = planned.map(function(plan, idx) {
      let accepted = false;
      let errorName = '';
      let errorMessage = '';
      if (idx < lineCount) {
        accepted = safeTryReturn(function() {
          routingRec.selectLine({ sublistId: stepSublist, line: idx });
          safeTry(() => routingRec.setCurrentSublistValue({ sublistId: stepSublist, fieldId: 'operationsequence', value: String(plan.seq) }));
          routingRec.setCurrentSublistValue({ sublistId: stepSublist, fieldId: 'operationname', value: String(plan.name).slice(0, 60) });
          routingRec.commitLine({ sublistId: stepSublist });
          return true;
        }) === true;
        if (!accepted) {
          errorName = 'ROUTING_OPERATION_RENAME_SKIPPED';
          errorMessage = 'Existing routing operation line could not be renamed; routing context was left intact.';
        }
      } else {
        errorName = 'ROUTING_OPERATION_LINE_NOT_EXPOSED';
        errorMessage = 'Existing routing did not expose this operation line for editing; routing context was left intact.';
      }
      const row = buildRoutingOperationRowW453(plan.index, plan.seq, plan.name, plan.center, plan.template);
      row.accepted = accepted;
      row.rejected = !accepted;
      row.plannedOnly = !accepted;
      row.errorName = errorName;
      row.errorMessage = errorMessage;
      return row;
    });
    const acceptedOperationRenames = operationRows.filter(function(row) { return row && row.accepted === true; });
    let saveResult = null;
    let routeSaveSkippedReason = '';
    const headerFieldsAccepted = [];
    const headerFieldsRejected = [];
    const nameAccepted = safeTryReturn(() => {
      routingRec.setValue({ fieldId: 'name', value: routingName });
      return true;
    }) === true;
    if (nameAccepted) headerFieldsAccepted.push('name');
    else headerFieldsRejected.push({ fieldId: 'name', reason: 'routing_name_rename_rejected' });
    const memoAccepted = safeTryReturn(() => {
      routingRec.setValue({ fieldId: 'memo', value: routingMemo });
      return true;
    }) === true;
    if (memoAccepted) headerFieldsAccepted.push('memo');
    else headerFieldsRejected.push({ fieldId: 'memo', reason: 'routing_memo_rename_rejected' });
    if (acceptedOperationRenames.length || headerFieldsAccepted.length) {
      saveResult = safeTryReturn(() => Number(routingRec.save({ enableSourcing: true, ignoreMandatoryFields: true }))) || Number(routingId);
    } else {
      routeSaveSkippedReason = 'no_header_or_operation_rename_accepted';
    }
    const postSaveVerification = verifyRoutingBomAndOperationsW456({
      routingId: Number(routingId),
      expectedBomId: Number(bomId),
      expectedOperationNames: planned.map(function(plan) { return plan.name; })
    });
    let attachResult = 'not-attempted';
    if (source === 'assembly-attached-routing' || source === 'managed-routing' || source === 'assembly-default-routing' || source === 'assembly-first-routing') {
      attachResult = 'reused-existing-assembly-routing';
    } else {
      attachResult = attachRoutingToAssemblySafe({ assemblyId, routingId: Number(routingId) });
    }
    const verification = verifyAssemblyRoutingDefaultW455({ assemblyId, routingId: Number(routingId), expectedRoutingName: routingName });
    log.audit({
      title: `Routing reused with product operation labels W455 [${VERSION}]`,
      details: JSON.stringify({
        routingId: Number(routingId),
        saveResult,
        routeSaveSkippedReason,
        source,
        lineCount,
        routingName,
        operationRows,
        assemblyBomProof,
        postSaveVerification,
        routingDiscovery,
        headerFieldsAccepted,
        headerFieldsRejected
      })
    });
    const acceptedRoutingSubsidiaryMismatch = routingDiscovery && routingDiscovery.acceptedRoutingSubsidiaryMismatch === true;
    const attachAttempted = !(source === 'assembly-attached-routing' || source === 'managed-routing' || source === 'assembly-default-routing' || source === 'assembly-first-routing');
    return {
      status: verification.defaulted ? 'defaulted' : 'reused',
      routingId: Number(routingId),
      routing: {
        id: String(routingId),
        internalId: String(routingId),
        url: recordUrlW453('manufacturingrouting', Number(routingId)),
        name: routingName,
        status: verification.defaulted ? 'defaulted' : 'reused'
      },
      routingUrl: recordUrlW453('manufacturingrouting', Number(routingId)),
      routingName,
      name: routingName,
      existingRoutingId: existingRoutingId ? Number(existingRoutingId) : Number(routingId),
      copiedFromRoutingTemplateId: null,
      decision: 'reused-existing-routing-renamed-operations',
      attachResult,
      assemblyBomProof,
      acceptedRoutingId: routingDiscovery && routingDiscovery.acceptedRoutingId || Number(routingId),
      acceptedRoutingBomId: routingDiscovery && routingDiscovery.acceptedRoutingBomId || Number(bomId),
      acceptedRoutingName: routingDiscovery && routingDiscovery.acceptedRoutingName || routingName,
      acceptedRoutingSource: routingDiscovery && routingDiscovery.acceptedRoutingSource || source,
      acceptedRoutingHadStaleName: routingDiscovery && routingDiscovery.acceptedRoutingHadStaleName === true,
      acceptedRoutingSubsidiaryMismatch,
      acceptedRoutingSubsidiaryId: routingDiscovery && routingDiscovery.acceptedRoutingSubsidiaryId || null,
      acceptedRoutingExpectedSubsidiaryId: routingDiscovery && routingDiscovery.acceptedRoutingExpectedSubsidiaryId || null,
      acceptedRoutingSubsidiaryMismatchSeverity: acceptedRoutingSubsidiaryMismatch ? 'attach_or_wo_warning' : '',
      routingDiscoveryMode: routingDiscovery && routingDiscovery.routingDiscoveryMode || source,
      routingCandidatesInspected: routingDiscovery && routingDiscovery.routingCandidatesInspected || 0,
      routingCandidatesRejected: routingDiscovery && routingDiscovery.routingCandidatesRejected || [],
      routingDiscovery,
      routingBomFieldSkippedBecauseAssemblyBomVerified: false,
      rejectedBomFieldError: null,
      routingHeaderTelemetry: {
        assemblyBomProof,
        billofmaterials: { attempted: false, skippedBecauseAssemblyBomVerified: false, errorName: '', errorMessage: '' },
        headerFieldsAccepted,
        headerFieldsRejected
      },
      routingLocationClearedForOperationRetry: false,
      attachDefaultVerification: verification,
      attachAttempted,
      assemblyDefaultVerified: verification.defaulted === true,
      routingOpenable: true,
      routingBomVerified: postSaveVerification && postSaveVerification.bomVerified === true,
      routingBomVerificationW456: postSaveVerification,
      routingLineEditDiagnosticW456: {
        status: acceptedOperationRenames.length ? 'operation_labels_updated_or_partially_updated' : 'operation_line_edit_not_exposed_header_rename_only',
        acceptedCount: acceptedOperationRenames.length,
        lineCount,
        saveResult,
        routeSaveSkippedReason,
        postSaveVerification
      },
      staleRoutingDetected: assemblyRoutingState && assemblyRoutingState.staleRoutingDetected === true,
      staleRoutingName: assemblyRoutingState && assemblyRoutingState.staleRoutingName || '',
      staleRoutingId: assemblyRoutingState && assemblyRoutingState.staleRoutingId || null,
      supersedeResult: 'reused-valid-routing-context',
      operationRows,
      routingOperations: operationRows,
      chosen: {
        centers,
        templates,
        ops: opNames,
        reusedRoutingId: Number(routingId),
        reuseSource: source,
        copiedFromRoutingTemplateId: null
      }
    };
  }

  function attachRoutingToAssemblySafe({ assemblyId, routingId }) {
    try {
      const result = attachRoutingToAssembly({ assemblyId, routingId });
      log.audit({
        title: `Assembly routing attach result [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), result: result || 'noop' })
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


  function verifyAssemblyBomContextW455({ assemblyId, bomId }) {
    const proof = {
      assemblyId: Number(assemblyId || 0),
      bomId: Number(bomId || 0),
      assemblyBomVerified: false,
      bomRevisionId: null,
      sublistId: 'billofmaterials',
      bomFieldId: 'billofmaterials',
      bomRevisionFieldId: '',
      line: -1,
      errorName: '',
      errorMessage: ''
    };
    try {
      const asm = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: false });
      const sublistId = 'billofmaterials';
      const fields = safeTryReturn(() => asm.getSublistFields({ sublistId })) || [];
      const bomFieldId = firstExisting(fields, ['billofmaterials', 'bom', 'billofmaterial']) || 'billofmaterials';
      const revFieldId = firstExisting(fields, ['currentrevision', 'defaultrevision', 'bomrevision', 'billofmaterialsrevision']);
      const count = safeTryReturn(() => asm.getLineCount({ sublistId })) || 0;
      proof.bomFieldId = bomFieldId;
      proof.bomRevisionFieldId = revFieldId || '';
      for (let i = 0; i < count; i++) {
        const value = safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: bomFieldId, line: i }));
        if (Number(value) === Number(bomId)) {
          proof.assemblyBomVerified = true;
          proof.line = i;
          proof.bomRevisionId = revFieldId ? safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: revFieldId, line: i })) || null : null;
          break;
        }
      }
    } catch (e) {
      proof.errorName = e && e.name || '';
      proof.errorMessage = e && e.message || String(e || '');
    }
    return proof;
  }

  function inspectAssemblyRoutingStateW455({ assemblyId, extId, expectedRoutingName }) {
    const state = {
      assemblyId: Number(assemblyId || 0),
      managedRoutingId: null,
      defaultRoutingId: null,
      firstRoutingId: null,
      staleRoutingDetected: false,
      staleRoutingId: null,
      staleRoutingName: '',
      routings: []
    };
    try {
      const asm = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: false });
      const sublistCandidates = ['manufacturingrouting', 'manufacturingroutings', 'routing', 'routings'];
      const routingFieldCandidates = ['manufacturingrouting', 'routing', 'routingid'];
      const defaultFieldCandidates = ['default', 'isdefault', 'masterdefault'];
      const nameFieldCandidates = ['name', 'routingname', 'manufacturingroutingname'];
      for (let s = 0; s < sublistCandidates.length; s++) {
        const sublistId = sublistCandidates[s];
        let count = 0;
        try { count = asm.getLineCount({ sublistId }); } catch (e) { continue; }
        const fields = safeTryReturn(() => asm.getSublistFields({ sublistId })) || [];
        const routingField = firstExisting(fields, routingFieldCandidates) || routingFieldCandidates[0];
        const defaultField = firstExisting(fields, defaultFieldCandidates);
        const nameField = firstExisting(fields, nameFieldCandidates);
        for (let i = 0; i < count; i++) {
          const rid = Number(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: routingField, line: i })));
          if (!Number.isFinite(rid) || rid < 1) continue;
          const isDefault = defaultField ? normalizeBool(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: defaultField, line: i }))) : false;
          let routingName = nameField ? str(safeTryReturn(() => asm.getSublistText({ sublistId, fieldId: nameField, line: i })) || safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: nameField, line: i }))) : '';
          if (!routingName) routingName = lookupRoutingNameW455(rid);
          const managed = (extId && routingName.indexOf(extId) !== -1) || (expectedRoutingName && routingName === expectedRoutingName);
          state.routings.push({ id: rid, name: routingName, isDefault, managed, sublistId, line: i });
          if (!state.firstRoutingId) state.firstRoutingId = rid;
          if (isDefault && !state.defaultRoutingId) state.defaultRoutingId = rid;
          if (managed && !state.managedRoutingId) state.managedRoutingId = rid;
          if (isDefault && !managed && !state.staleRoutingDetected) {
            state.staleRoutingDetected = true;
            state.staleRoutingId = rid;
            state.staleRoutingName = routingName;
          }
        }
      }
    } catch (e) {
      state.errorName = e && e.name || '';
      state.errorMessage = e && e.message || String(e || '');
    }
    return state;
  }

  function lookupRoutingNameW455(routingId) {
    return str(safeTryReturn(() => search.lookupFields({
      type: 'manufacturingrouting',
      id: Number(routingId),
      columns: ['name']
    }).name));
  }

  function verifyAssemblyRoutingDefaultW455({ assemblyId, routingId, expectedRoutingName }) {
    const state = inspectAssemblyRoutingStateW455({ assemblyId, extId: '', expectedRoutingName });
    const matching = (state.routings || []).filter(function(row) { return Number(row.id) === Number(routingId); });
    const defaulted = matching.some(function(row) { return row.isDefault === true; });
    return {
      assemblyId: Number(assemblyId || 0),
      routingId: Number(routingId || 0),
      expectedRoutingName: expectedRoutingName || '',
      attached: matching.length > 0,
      defaulted,
      actualRoutingName: matching[0] && matching[0].name || '',
      staleRoutingDetected: state.staleRoutingDetected === true,
      staleRoutingId: state.staleRoutingId || null,
      staleRoutingName: state.staleRoutingName || '',
      routings: state.routings || []
    };
  }


  function discoverReusableRoutingContextW455({ assemblyId, bomId, subsidiaryId, extId, preferredName, assemblyBomProof, assemblyRoutingState }) {
    const telemetry = {
      routingDiscoveryMode: 'not_found',
      routingCandidatesInspected: 0,
      routingCandidatesRejected: [],
      acceptedRoutingId: null,
      acceptedRoutingBomId: null,
      acceptedRoutingName: '',
      acceptedRoutingSource: '',
      acceptedRoutingScore: 0,
      acceptedRoutingHadStaleName: false,
      acceptedRoutingSubsidiaryMismatch: false,
      acceptedRoutingSubsidiaryId: null,
      acceptedRoutingExpectedSubsidiaryId: null,
      assemblyRoutingCandidates: assemblyRoutingState && assemblyRoutingState.routings || []
    };
    const seen = {};

    function rememberRejected(result) {
      if (!result || !result.rejected) return;
      telemetry.routingCandidatesRejected.push(result.rejected);
      if (telemetry.routingCandidatesRejected.length > 30) telemetry.routingCandidatesRejected.shift();
    }

    function inspect(candidate) {
      const id = Number(candidate && candidate.id);
      if (!Number.isFinite(id) || id < 1 || seen[id]) return null;
      seen[id] = true;
      telemetry.routingCandidatesInspected += 1;
      const result = inspectRoutingCandidateForExactBomW456({
        candidate,
        bomId,
        subsidiaryId,
        extId,
        preferredName,
        assemblyBomProof
      });
      if (!result.accepted) rememberRejected(result);
      return result.accepted ? result.accepted : null;
    }

    function accept(best, mode) {
      if (!best) return null;
      telemetry.routingDiscoveryMode = mode;
      telemetry.acceptedRoutingId = Number(best.id);
      telemetry.acceptedRoutingBomId = Number(best.routeBomId);
      telemetry.acceptedRoutingName = best.name || '';
      telemetry.acceptedRoutingSource = best.source || mode;
      telemetry.acceptedRoutingScore = Number(best.score || 0);
      telemetry.acceptedRoutingHadStaleName = best.staleProductName === true;
      telemetry.acceptedRoutingSubsidiaryMismatch = best.subsidiaryMismatch === true;
      telemetry.acceptedRoutingSubsidiaryId = best.routeSubsidiary || null;
      telemetry.acceptedRoutingExpectedSubsidiaryId = best.expectedSubsidiaryId || null;
      return telemetry;
    }

    const assemblyCandidates = (assemblyRoutingState && assemblyRoutingState.routings || []).map(function(row) {
      let source = 'assembly-attached-routing';
      if (row.managed) source = 'managed-routing';
      else if (row.isDefault) source = 'assembly-default-routing';
      else if (Number(row.id) === Number(assemblyRoutingState && assemblyRoutingState.firstRoutingId)) source = 'assembly-first-routing';
      return { id: row.id, name: row.name, source, assemblyAttached: true, isDefault: row.isDefault, managed: row.managed };
    });
    let best = null;
    assemblyCandidates.forEach(function(candidate) {
      const accepted = inspect(candidate);
      if (accepted && (!best || accepted.score > best.score)) best = accepted;
    });
    if (best) return accept(best, 'assembly_loaded_exact_bom');

    findRoutingCandidatesByBomSearchW456({ bomId, subsidiaryId }).forEach(function(candidate) {
      const accepted = inspect(candidate);
      if (accepted && (!best || accepted.score > best.score)) best = accepted;
    });
    if (best) return accept(best, 'manufacturingrouting_bom_search_loaded_exact_bom');

    findRoutingCandidatesByLoadedActiveScanW456({ bomId, subsidiaryId }).forEach(function(candidate) {
      const accepted = inspect(candidate);
      if (accepted && (!best || accepted.score > best.score)) best = accepted;
    });
    if (best) return accept(best, 'loaded_active_routing_scan_exact_bom');

    log.audit({
      title: `W456 exact-BOM routing discovery diagnostic [${VERSION}]`,
      details: JSON.stringify(telemetry)
    });
    return telemetry;
  }

  function inspectRoutingCandidateForExactBomW456({ candidate, bomId, subsidiaryId, extId, preferredName, assemblyBomProof }) {
    const id = Number(candidate && candidate.id);
    const source = candidate && candidate.source || 'unknown';
    const rejectedBase = { id, source, candidateName: candidate && candidate.name || '' };
    const rec = safeTryReturn(function() {
      return record.load({ type: 'manufacturingrouting', id, isDynamic: false });
    });
    if (!rec) {
      return { accepted: null, rejected: Object.assign(rejectedBase, { reason: 'routing_load_failed' }) };
    }
    const routeBomId = Number(safeTryReturn(() => rec.getValue({ fieldId: 'billofmaterials' })) || 0);
    const routeSubsidiary = Number(safeTryReturn(() => rec.getValue({ fieldId: 'subsidiary' })) || 0);
    const name = str(safeTryReturn(() => rec.getValue({ fieldId: 'name' })) || candidate.name || '');
    const memo = str(safeTryReturn(() => rec.getValue({ fieldId: 'memo' })) || '');
    const staleProductName = /poppi|bbq|cookie|sauce/i.test(name);
    const subsidiaryMismatch = !!(subsidiaryId && routeSubsidiary && Number(routeSubsidiary) !== Number(subsidiaryId));
    if (Number(routeBomId) !== Number(bomId)) {
      return { accepted: null, rejected: Object.assign(rejectedBase, { name, routeBomId, expectedBomId: Number(bomId), reason: 'wrong_bom' }) };
    }
    if (staleProductName && !(assemblyBomProof && assemblyBomProof.assemblyBomVerified)) {
      return { accepted: null, rejected: Object.assign(rejectedBase, { name, routeBomId, staleProductName: true, reason: 'stale_product_name_without_assembly_bom_proof' }) };
    }
    let score = 10;
    if (candidate && candidate.assemblyAttached) score += 100;
    if (candidate && candidate.isDefault) score += 40;
    if (candidate && candidate.managed) score += 35;
    if (extId && memo.indexOf(extId) !== -1) score += 80;
    if (preferredName && name === preferredName) score += 70;
    if (memo.indexOf('SCAI Demo Reset') !== -1 || /^SCAI\b|^Routing - /i.test(name)) score += 20;
    if (/draft|latte|cold brew|coffee|kombucha|soda|beverage|batch|routing/i.test(name)) score += 10;
    if (staleProductName) score -= 25;
    if (subsidiaryMismatch) score -= 15;
    return {
      accepted: {
        id,
        name,
        memo,
        routeBomId,
        routeSubsidiary,
        expectedSubsidiaryId: subsidiaryId ? Number(subsidiaryId) : null,
        subsidiaryMismatch,
        subsidiaryMismatchSeverity: subsidiaryMismatch ? 'attach_or_wo_warning' : '',
        source,
        score,
        staleProductName,
        assemblyAttached: candidate && candidate.assemblyAttached === true
      },
      rejected: null
    };
  }

  function findRoutingCandidatesByBomSearchW456({ bomId, subsidiaryId }) {
    try {
      const filters = [['billofmaterials', 'anyof', Number(bomId)]];
      const rows = search.create({
        type: 'manufacturingrouting',
        filters,
        columns: [
          search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
          search.createColumn({ name: 'name' }),
          search.createColumn({ name: 'memo' }),
          search.createColumn({ name: 'billofmaterials' })
        ]
      }).run().getRange({ start: 0, end: 100 }) || [];
      return rows.map(function(row) {
        return {
          id: Number(row.getValue({ name: 'internalid' })),
          name: str(row.getValue({ name: 'name' })),
          memo: str(row.getValue({ name: 'memo' })),
          searchBomId: Number(row.getValue({ name: 'billofmaterials' })) || 0,
          source: 'bom-search-routing'
        };
      }).filter(function(row) { return Number.isFinite(Number(row.id)) && Number(row.id) > 0; });
    } catch (e) {
      log.audit({
        title: `Manufacturing routing BOM search failed W456 [${VERSION}]`,
        details: JSON.stringify({ bomId: Number(bomId), subsidiaryId: Number(subsidiaryId || 0), errorName: e && e.name || '', errorMessage: e && e.message || String(e || '') })
      });
      return [];
    }
  }

  function findRoutingCandidatesByLoadedActiveScanW456({ bomId, subsidiaryId }) {
    try {
      const rows = search.create({
        type: 'manufacturingrouting',
        filters: [['isinactive', 'is', 'F']],
        columns: [
          search.createColumn({ name: 'internalid', sort: search.Sort.DESC }),
          search.createColumn({ name: 'name' }),
          search.createColumn({ name: 'memo' })
        ]
      }).run().getRange({ start: 0, end: 200 }) || [];
      const out = [];
      rows.forEach(function(row) {
        const id = Number(row.getValue({ name: 'internalid' }));
        if (!Number.isFinite(id) || id < 1) return;
        const rec = safeTryReturn(function() {
          return record.load({ type: 'manufacturingrouting', id, isDynamic: false });
        });
        if (!rec) {
          out.push({ id, name: str(row.getValue({ name: 'name' })), source: 'loaded-active-routing-scan-load-failed' });
          return;
        }
        const routeBomId = Number(safeTryReturn(() => rec.getValue({ fieldId: 'billofmaterials' })) || 0);
        const routeSubsidiary = Number(safeTryReturn(() => rec.getValue({ fieldId: 'subsidiary' })) || 0);
        if (Number(routeBomId) !== Number(bomId)) {
          out.push({ id, name: str(row.getValue({ name: 'name' })), source: 'loaded-active-routing-scan', preloadedRouteBomId: routeBomId });
          return;
        }
        out.push({
          id,
          name: str(safeTryReturn(() => rec.getValue({ fieldId: 'name' })) || row.getValue({ name: 'name' })),
          memo: str(safeTryReturn(() => rec.getValue({ fieldId: 'memo' })) || row.getValue({ name: 'memo' })),
          source: 'loaded-active-routing-scan',
          preloadedRouteBomId: routeBomId,
          preloadedRouteSubsidiary: routeSubsidiary,
          preloadedSubsidiaryMismatch: !!(subsidiaryId && routeSubsidiary && Number(routeSubsidiary) !== Number(subsidiaryId))
        });
      });
      log.audit({
        title: `Manufacturing routing loaded BOM scan W456 [${VERSION}]`,
        details: JSON.stringify({ bomId: Number(bomId), subsidiaryId: Number(subsidiaryId || 0), rows: rows.length, candidates: out.length })
      });
      return out;
    } catch (e) {
      log.audit({
        title: `Manufacturing routing loaded BOM scan failed W456 [${VERSION}]`,
        details: JSON.stringify({ bomId: Number(bomId), errorName: e && e.name || '', errorMessage: e && e.message || String(e || '') })
      });
      return [];
    }
  }

  function findManagedRoutingIdByBom(args) {
    const discovery = discoverReusableRoutingContextW455(Object.assign({
      assemblyId: 0,
      assemblyBomProof: null,
      assemblyRoutingState: { routings: [] }
    }, args || {}));
    return discovery && discovery.acceptedRoutingId ? Number(discovery.acceptedRoutingId) : null;
  }

  function findRoutingIdByLoadedBomW455(args) {
    const discovery = discoverReusableRoutingContextW455(Object.assign({
      assemblyId: 0,
      assemblyBomProof: null,
      assemblyRoutingState: { routings: [] }
    }, args || {}));
    return discovery && discovery.acceptedRoutingId ? Number(discovery.acceptedRoutingId) : null;
  }

  function verifyRoutingBomAndOperationsW456({ routingId, expectedBomId, expectedOperationNames }) {
    const verification = {
      routingId: Number(routingId || 0),
      expectedBomId: Number(expectedBomId || 0),
      actualBomId: 0,
      bomVerified: false,
      operationLabelsVerified: false,
      operationLabelsFound: [],
      expectedOperationNames: expectedOperationNames || [],
      errorName: '',
      errorMessage: ''
    };
    try {
      const rec = record.load({ type: 'manufacturingrouting', id: Number(routingId), isDynamic: false });
      verification.actualBomId = Number(safeTryReturn(() => rec.getValue({ fieldId: 'billofmaterials' })) || 0);
      verification.bomVerified = Number(verification.actualBomId) === Number(expectedBomId);
      const count = Number(safeTryReturn(() => rec.getLineCount({ sublistId: 'routingstep' })) || 0);
      for (let i = 0; i < Math.min(3, count); i++) {
        verification.operationLabelsFound.push(str(safeTryReturn(() => rec.getSublistValue({ sublistId: 'routingstep', fieldId: 'operationname', line: i }))));
      }
      verification.operationLabelsVerified = (expectedOperationNames || []).slice(0, 3).some(function(name) {
        return verification.operationLabelsFound.indexOf(String(name || '').slice(0, 60)) !== -1;
      });
    } catch (e) {
      verification.errorName = e && e.name || '';
      verification.errorMessage = e && e.message || String(e || '');
    }
    return verification;
  }

  function findManagedAssemblyRoutingId({ assemblyId, extId }) {
    const asm = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: false });
    const sublistCandidates = ['manufacturingrouting', 'manufacturingroutings', 'routing', 'routings'];
    const routingFieldCandidates = ['manufacturingrouting', 'routing', 'routingid'];
    const defaultFieldCandidates = ['default', 'isdefault', 'masterdefault'];
    const memoFieldCandidates = ['memo', 'description'];

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

      let defaultRoutingId = null;
      let firstRoutingId = null;
      let managedRoutingId = null;

      for (let i = 0; i < count; i++) {
        const rid = Number(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: routingField, line: i })));
        if (!Number.isFinite(rid) || rid < 1) continue;
        if (!firstRoutingId) firstRoutingId = rid;

        const isDefault = defaultField ? normalizeBool(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: defaultField, line: i }))) : false;
        if (isDefault && !defaultRoutingId) defaultRoutingId = rid;

        const memoVal = memoField ? str(safeTryReturn(() => asm.getSublistValue({ sublistId, fieldId: memoField, line: i }))) : '';
        if (!managedRoutingId && ((extId && memoVal.indexOf(extId) !== -1) || memoVal.indexOf('SCAI Demo Reset') !== -1)) {
          managedRoutingId = rid;
        }
      }

      const chosenRoutingId = managedRoutingId || defaultRoutingId || firstRoutingId || null;

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

      if (chosenRoutingId) return Number(chosenRoutingId);
    }

    log.audit({
      title: `Assembly routing discovery (none found) [${VERSION}]`,
      details: JSON.stringify({ assemblyId: Number(assemblyId) })
    });
    return null;
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

  function attachRoutingToAssembly({ assemblyId, routingId }) {
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
    const fields = safeTryReturn(() => asm.getSublistFields({ sublistId })) || [];
    const routingField = firstExisting(fields, routingFieldCandidates) || routingFieldCandidates[0];

    log.audit({
      title: `Assembly routing attach field resolution [${VERSION}]`,
      details: JSON.stringify({ sublistId, routingField, fields })
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
      log.audit({
        title: `Assembly routing already linked [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, line, routingField })
      });
      return 'already-linked';
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
      asm.commitLine({ sublistId });
      asm.save({ enableSourcing: true, ignoreMandatoryFields: true });
      log.audit({
        title: `Assembly routing attached [${VERSION}]`,
        details: JSON.stringify({ assemblyId: Number(assemblyId), routingId: Number(routingId), sublistId, routingField, createdNewLine: true })
      });
      return 'attached';
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

  // ----------------------------
  // Work Centers / Cost Templates (v1.7.6)
  // ----------------------------
  function findWorkCentersFromSavedSearch({ searchId, locationId, subsidiaryId }) {
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
      const ss = search.load({ id: searchRef });
      const paged = ss.runPaged({ pageSize: 100 });
      const rows = [];

      paged.pageRanges.forEach(function (pr) {
        const page = paged.fetch({ index: pr.index });
        page.data.forEach(function (r) {
          const id = Number(r.getValue({ name: 'internalid' })) || Number(r.id);
          const name = getResultNameFallback(r);
          const rowLocId = String(r.getValue({ name: 'location' }) || '');
          const rowLocText = String(r.getText({ name: 'location' }) || getResultValueByCandidates(r, ['location']) || '');
          const rowSubsId = String(r.getValue({ name: 'subsidiary' }) || '');
          const rowSubsText = String(r.getText({ name: 'subsidiary' }) || getResultValueByCandidates(r, ['subsidiary']) || '');

          if (!Number.isFinite(id)) return;

          rows.push({
            id,
            name,
            locationId: rowLocId,
            locationText: rowLocText,
            subsidiaryId: rowSubsId,
            subsidiaryText: rowSubsText
          });
        });
      });

      const keywords = [
        'blend', 'blending', 'mix',
        'fill', 'filling', 'dispense', 'dispensing',
        'pack', 'packing', 'package',
        'assembly', 'case'
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

        return {
          id: x.id,
          name: x.name,
          score,
          locationId: x.locationId,
          locationText: x.locationText,
          subsidiaryId: x.subsidiaryId,
          subsidiaryText: x.subsidiaryText
        };
      }).sort(function (a, b) {
        return b.score - a.score;
      });

      log.audit({
        title: `WIP work centers resolved from saved search [${VERSION}]`,
        details: JSON.stringify({
          searchId,
          locationId: loc,
          subsidiaryId: subs,
          count: scored.length,
          picked: scored.slice(0, 10)
        })
      });

      return scored;
    } catch (e) {
      log.error({
        title: `WIP work center saved search failed [${VERSION}]`,
        details: JSON.stringify({
          searchId,
          locationId,
          subsidiaryId,
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

    for (let t = 0; t < typeCandidates.length; t++) {
      const type = typeCandidates[t];

      let ids = runQuery(type, [['isinactive', 'is', 'F'], 'AND', ['subsidiary', 'anyof', subs]]);
      if (!ids.length) ids = runQuery(type, [['subsidiary', 'anyof', subs]]);
      if (!ids.length) ids = runQuery(type, [['isinactive', 'is', 'F']]);
      if (!ids.length) ids = runQuery(type, []);

      if (ids.length) {
        const want = ['blend', 'blending', 'mix', 'dispense', 'dispensing', 'fill', 'pack', 'packaging'];
        const scored = ids.map(id => {
          let nm = '';
          safeTry(() => {
            const f = search.lookupFields({ type, id, columns: ['name'] });
            nm = (f && f.name) ? String(f.name) : '';
          });
          const lower = nm.toLowerCase();
          let score = 0;
          want.forEach(k => { if (lower.indexOf(k) !== -1) score += 5; });
          score += Math.max(0, 10 - Math.min(10, lower.length / 6));
          return { id, score, name: nm };
        }).sort((a, b) => b.score - a.score);

        const picked = scored.slice(0, 6);
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
        op10: trimLen(str(bySeq['10'] || bySeq[10] || 'Blending'), 60),
        op20: trimLen(str(bySeq['20'] || bySeq[20] || 'Dispensing'), 60),
        op30: trimLen(str(bySeq['30'] || bySeq[30] || 'Packaging'), 60)
      };
    }
    return {
      op10: 'Blending',
      op20: 'Dispensing',
      op30: 'Packaging'
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
  const WORK_ORDER_WIP_FIELD_CANDIDATES_W455 = ['iswip', 'wip', 'iswipworkorder', 'wipworkorder', 'manufacturingmode'];

  function buildWipDisabledWorkOrderTelemetryW463(args) {
    args = args || {};
    return {
      status: 'not_requested_wip_disabled',
      failureType: '',
      effectiveEnableWip: false,
      enableWipRequested: false,
      assemblyId: Number(args.assemblyId || 0),
      bomId: Number(args.bomId || 0),
      bomRevId: Number(args.bomRevId || 0),
      routingId: null,
      workOrderId: null,
      woId: null,
      linkCount: 0,
      workOrderLinks: [],
      openableWorkOrderLinks: [],
      source: 'wip_disabled_work_order_gate_w463',
      reason: 'Manufacturing was enabled with WIP disabled; Work Order create, lookup, reuse, and links were not requested.',
      extId: String(args.extId || ''),
      subsidiaryId: Number(args.subsidiaryId || 0),
      locationId: Number(args.locationId || 0)
    };
  }

  function createWorkOrder({ assemblyId, subsidiaryId, locationId, quantity, memo, routingId, bomId, bomRevId, enableWip }) {
    if (enableWip !== true) {
      const telemetry = buildWipDisabledWorkOrderTelemetryW463({
        assemblyId,
        bomId,
        bomRevId,
        subsidiaryId,
        locationId
      });
      log.audit({ title: `Work Order create/reuse blocked because WIP is disabled W463 [${VERSION}]`, details: JSON.stringify(telemetry) });
      return { id: null, telemetry };
    }
    const start = new Date();
    const end = addMonths(start, 1);
    const failures = [];
    const attempts = [
      { name: 'static_subsidiary_wip_assembly_routing_location', isDynamic: false, includeLocation: true, order: ['subsidiary', 'wip', 'assembly', 'routing', 'bom', 'bomRevision', 'location'] },
      { name: 'dynamic_subsidiary_wip_assembly_routing_location', isDynamic: true, includeLocation: true, order: ['subsidiary', 'wip', 'assembly', 'routing', 'bom', 'bomRevision', 'location'] },
      { name: 'static_assembly_subsidiary_wip_routing_location', isDynamic: false, includeLocation: true, order: ['assembly', 'subsidiary', 'wip', 'routing', 'bom', 'bomRevision', 'location'] },
      { name: 'dynamic_assembly_subsidiary_wip_routing_location', isDynamic: true, includeLocation: true, order: ['assembly', 'subsidiary', 'wip', 'routing', 'bom', 'bomRevision', 'location'] },
      { name: 'static_subsidiary_wip_assembly_routing_no_location', isDynamic: false, includeLocation: false, order: ['subsidiary', 'wip', 'assembly', 'routing', 'bom', 'bomRevision'] },
      { name: 'dynamic_subsidiary_wip_assembly_routing_no_location', isDynamic: true, includeLocation: false, order: ['subsidiary', 'wip', 'assembly', 'routing', 'bom', 'bomRevision'] },
      { name: 'static_assembly_subsidiary_wip_no_location', isDynamic: false, includeLocation: false, order: ['assembly', 'subsidiary', 'wip', 'routing', 'bom', 'bomRevision'] },
      { name: 'dynamic_assembly_subsidiary_wip_no_location', isDynamic: true, includeLocation: false, order: ['assembly', 'subsidiary', 'wip', 'routing', 'bom', 'bomRevision'] }
    ];

    function trySetField(wo, fieldId, value, required, accepted, rejected) {
      try {
        wo.setValue({ fieldId, value });
        accepted.push(fieldId);
        return true;
      } catch (e) {
        rejected.push({
          fieldId,
          errorName: e && e.name || '',
          errorMessage: e && e.message || String(e || '')
        });
        if (required) throw e;
        return false;
      }
    }

    function trySetAnyField(wo, fields, value, required, accepted, rejected) {
      let lastError = null;
      for (let i = 0; i < fields.length; i += 1) {
        try {
          wo.setValue({ fieldId: fields[i], value });
          accepted.push(fields[i]);
          return true;
        } catch (e) {
          lastError = e;
          rejected.push({
            fieldId: fields[i],
            errorName: e && e.name || '',
            errorMessage: e && e.message || String(e || '')
          });
        }
      }
      if (required && lastError) throw lastError;
      if (required) throw new Error(`Work Order: could not set any of ${fields.join(', ')}`);
      return false;
    }

    function applyWorkOrderWipModeW455(wo, requested, accepted, rejected) {
      const telemetry = {
        requested: requested === true,
        candidates: WORK_ORDER_WIP_FIELD_CANDIDATES_W455.slice(),
        exposedCandidateFields: [],
        acceptedField: '',
        rejectedFields: [],
        status: requested === true ? 'requested_not_applied' : 'not_requested_wip_disabled'
      };
      if (requested !== true) return telemetry;
      const fields = safeTryReturn(() => wo.getFields && wo.getFields()) || [];
      telemetry.exposedCandidateFields = fields.filter(function(fieldId) {
        return WORK_ORDER_WIP_FIELD_CANDIDATES_W455.indexOf(fieldId) >= 0;
      });
      for (let i = 0; i < WORK_ORDER_WIP_FIELD_CANDIDATES_W455.length; i += 1) {
        const fieldId = WORK_ORDER_WIP_FIELD_CANDIDATES_W455[i];
        try {
          wo.setValue({ fieldId, value: true });
          accepted.push(fieldId);
          telemetry.acceptedField = fieldId;
          telemetry.status = 'applied';
          return telemetry;
        } catch (e) {
          const rejection = {
            fieldId,
            errorName: e && e.name || '',
            errorMessage: e && e.message || String(e || '')
          };
          rejected.push(rejection);
          telemetry.rejectedFields.push(rejection);
        }
      }
      telemetry.status = 'all_candidate_fields_rejected';
      telemetry.diagnostic = 'WIP was requested, but no known Work Order WIP field ID accepted a script-set value in this account/form.';
      return telemetry;
    }

    function applyToken(wo, token, attempt, accepted, rejected, attemptTelemetry) {
      if (token === 'subsidiary') {
        trySetField(wo, 'subsidiary', Number(subsidiaryId), false, accepted, rejected);
      } else if (token === 'wip') {
        attemptTelemetry.wipFieldTelemetry = applyWorkOrderWipModeW455(wo, enableWip === true, accepted, rejected);
      } else if (token === 'assembly') {
        trySetAnyField(wo, ['assemblyitem', 'item', 'recipe'], Number(assemblyId), true, accepted, rejected);
      } else if (token === 'routing' && routingId) {
        trySetAnyField(wo, ['manufacturingrouting', 'routing'], Number(routingId), false, accepted, rejected);
      } else if (token === 'bom' && bomId) {
        trySetField(wo, 'billofmaterials', Number(bomId), false, accepted, rejected);
      } else if (token === 'bomRevision' && bomRevId) {
        trySetAnyField(wo, ['billofmaterialsrevision', 'bomrevision'], Number(bomRevId), false, accepted, rejected);
      } else if (token === 'location' && attempt.includeLocation && locationId) {
        trySetField(wo, 'location', Number(locationId), false, accepted, rejected);
      }
    }

    for (let i = 0; i < attempts.length; i += 1) {
      const attempt = attempts[i];
      const accepted = [];
      const rejected = [];
      const attemptTelemetry = {
        enableWipRequested: enableWip === true,
        wipFieldTelemetry: { requested: enableWip === true, status: enableWip === true ? 'not_attempted' : 'not_requested_wip_disabled' }
      };
      try {
        const wo = record.create({ type: 'workorder', isDynamic: attempt.isDynamic });
        attempt.order.forEach(function(token) {
          applyToken(wo, token, attempt, accepted, rejected, attemptTelemetry);
        });
        trySetField(wo, 'quantity', Number(quantity || 10), false, accepted, rejected);
        if (memo) trySetField(wo, 'memo', String(memo).slice(0, 300), false, accepted, rejected);
        trySetField(wo, 'startdate', start, false, accepted, rejected);
        trySetField(wo, 'enddate', end, false, accepted, rejected);
        const woId = Number(wo.save({ enableSourcing: true, ignoreMandatoryFields: false }));
        log.audit({
          title: `Work Order seeded with W455 fallback [${VERSION}]`,
          details: JSON.stringify({
            attempt: attempt.name,
            isDynamic: attempt.isDynamic,
            woId,
            assemblyId: Number(assemblyId || 0),
            routingId: routingId ? Number(routingId) : null,
            bomId: bomId ? Number(bomId) : null,
            bomRevId: bomRevId ? Number(bomRevId) : null,
            enableWipRequested: enableWip === true,
            wipFieldTelemetry: attemptTelemetry.wipFieldTelemetry,
            acceptedFields: accepted,
            rejectedFields: rejected
          })
        });
        return {
          id: woId,
          telemetry: {
            status: 'created',
            creationAttempt: attempt.name,
            enableWipRequested: enableWip === true,
            wipFieldTelemetry: attemptTelemetry.wipFieldTelemetry,
            acceptedFields: accepted,
            rejectedFields: rejected
          }
        };
      } catch (e) {
        failures.push({
          attempt: attempt.name,
          isDynamic: attempt.isDynamic,
          includeLocation: attempt.includeLocation,
          enableWipRequested: enableWip === true,
          wipFieldTelemetry: attemptTelemetry.wipFieldTelemetry,
          acceptedFields: accepted,
          rejectedFields: rejected,
          errorName: e && e.name || '',
          errorMessage: e && e.message || String(e || '')
        });
      }
    }

    log.error({
      title: `Work Order W455 fallback attempts exhausted [${VERSION}]`,
      details: JSON.stringify({
        assemblyId: Number(assemblyId || 0),
        routingId: routingId ? Number(routingId) : null,
        bomId: bomId ? Number(bomId) : null,
        bomRevId: bomRevId ? Number(bomRevId) : null,
        subsidiaryId: Number(subsidiaryId || 0),
        locationId: Number(locationId || 0),
        enableWipRequested: enableWip === true,
        attempts: failures
      })
    });
    if (enableWip === true) {
      const reusableWorkOrder = findReusableWorkOrderByAssemblyW455({ assemblyId, memo, routingId });
      if (reusableWorkOrder && reusableWorkOrder.id) {
        reusableWorkOrder.wipFieldTelemetry = applyWorkOrderWipModeToExistingW455({
          workOrderId: reusableWorkOrder.id,
          enableWip: enableWip === true
        });
        log.audit({
          title: `Work Order reused after W455 create rejection [${VERSION}]`,
          details: JSON.stringify(Object.assign({}, reusableWorkOrder, {
            assemblyId: Number(assemblyId || 0),
            routingId: routingId ? Number(routingId) : null,
            enableWipRequested: enableWip === true,
            reuseReason: 'work_order_form_requires_recipe_not_scriptable_in_create_context'
          }))
        });
        return {
          id: Number(reusableWorkOrder.id),
          telemetry: {
            status: 'reused_after_create_rejection',
            source: reusableWorkOrder.source || '',
            tranid: reusableWorkOrder.tranid || '',
            statusRef: reusableWorkOrder.statusRef || '',
            enableWipRequested: enableWip === true,
            wipFieldTelemetry: reusableWorkOrder.wipFieldTelemetry,
            creationAttempts: failures
          }
        };
      }
    }
    const finalError = new Error(`Work Order W455 attempts exhausted for assembly ${assemblyId}`);
    finalError.name = 'WORK_ORDER_W455_ATTEMPTS_EXHAUSTED';
    finalError.workOrderAttempts = failures;
    throw finalError;
  }

  function applyWorkOrderWipModeToExistingW455({ workOrderId, enableWip }) {
    const telemetry = {
      requested: enableWip === true,
      candidates: WORK_ORDER_WIP_FIELD_CANDIDATES_W455.slice(),
      acceptedField: '',
      rejectedFields: [],
      status: enableWip === true ? 'requested_not_applied' : 'not_requested_wip_disabled'
    };
    if (enableWip !== true || !workOrderId) return telemetry;
    for (let i = 0; i < WORK_ORDER_WIP_FIELD_CANDIDATES_W455.length; i += 1) {
      const fieldId = WORK_ORDER_WIP_FIELD_CANDIDATES_W455[i];
      try {
        const values = {};
        values[fieldId] = true;
        record.submitFields({
          type: 'workorder',
          id: Number(workOrderId),
          values,
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        });
        telemetry.acceptedField = fieldId;
        telemetry.status = 'applied_to_existing_work_order';
        return telemetry;
      } catch (e) {
        telemetry.rejectedFields.push({
          fieldId,
          errorName: e && e.name || '',
          errorMessage: e && e.message || String(e || '')
        });
      }
    }
    telemetry.status = 'all_candidate_fields_rejected_on_existing_work_order';
    telemetry.diagnostic = 'WIP was requested on a reused Work Order, but no known Work Order WIP field ID accepted submitFields.';
    return telemetry;
  }

  function findReusableWorkOrderByAssemblyW455({ assemblyId, memo, routingId }) {
    const asmId = Number(assemblyId || 0);
    if (!asmId) return null;
    try {
      const rs = search.create({
        type: 'workorder',
        filters: [['mainline', 'is', 'T'], 'AND', ['item', 'anyof', asmId]],
        columns: [search.createColumn({ name: 'internalid', sort: search.Sort.DESC }), 'tranid', 'statusref']
      }).run().getRange({ start: 0, end: 1 }) || [];
      if (rs.length) {
        const row = rs[0];
        const id = toIntOrNull(row.getValue({ name: 'internalid' }));
        if (id) {
          safeTry(() => record.submitFields({
            type: 'workorder',
            id,
            values: { memo: String(memo || `SCAI Demo Reset reused Work Order | routing ${routingId || ''}`).slice(0, 300) },
            options: { enableSourcing: true, ignoreMandatoryFields: true }
          }));
          return {
            id,
            source: 'existing_workorder_search_by_assembly',
            tranid: row.getValue({ name: 'tranid' }) || '',
            statusRef: row.getValue({ name: 'statusref' }) || ''
          };
        }
      }
    } catch (e) {
      log.audit({
        title: `Work Order reuse search skipped W455 [${VERSION}]`,
        details: JSON.stringify({ assemblyId: asmId, errorName: e && e.name || '', errorMessage: e && e.message || String(e || '') })
      });
    }
    const knownReusable = [87034];
    for (let i = 0; i < knownReusable.length; i += 1) {
      try {
        const wo = record.load({ type: 'workorder', id: knownReusable[i], isDynamic: false });
        const itemValue = Number(safeTryReturn(() => wo.getValue({ fieldId: 'assemblyitem' })) || safeTryReturn(() => wo.getValue({ fieldId: 'item' })) || 0);
        if (itemValue === asmId) {
          safeTry(() => record.submitFields({
            type: 'workorder',
            id: knownReusable[i],
            values: { memo: String(memo || `SCAI Demo Reset reused Work Order | routing ${routingId || ''}`).slice(0, 300) },
            options: { enableSourcing: true, ignoreMandatoryFields: true }
          }));
          return { id: knownReusable[i], source: 'known_valid_workorder_fallback', assemblyId: asmId };
        }
      } catch (e) {}
    }
    return null;
  }

  // ----------------------------
  // Demo record mode resolution
  // ----------------------------
  function ensureDemoRecords({ subsidiaryId, locationId, createNewHeroItem, enableManufacturing: finalEnableManufacturing, extId, prospect, passedHeroItemId }) {
    const heroItem = createNewHeroItem
      ? getOrCreateFreshHeroItem({ subsidiaryId, locationId, extId, prospect, passedHeroItemId })
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

  function getOrCreateFreshHeroItem({ subsidiaryId, locationId, extId, prospect, passedHeroItemId }) {
    if (passedHeroItemId) {
      const adopted = adoptFreshHeroItem({ itemId: Number(passedHeroItemId), subsidiaryId, locationId, extId, prospect });
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

    const created = createFreshHeroItem({ subsidiaryId, locationId, extId, prospect });
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

  function adoptFreshHeroItem({ itemId, subsidiaryId, locationId, extId, prospect }) {
    const anchorHeroId = mustFindByExternalId('inventoryitem', ANCHORS.heroItem);
    const externalId = `SCAI_HERO_${safeRecordExternalCodeW455(extId || itemId)}`;
    const differentiated = buildDifferentiatedNames(prospect || 'Demo Hero', extId);

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

  function createFreshHeroItem({ subsidiaryId, locationId, extId, prospect }) {
    const anchorHeroId = mustFindByExternalId('inventoryitem', ANCHORS.heroItem);
    const externalId = `SCAI_HERO_${safeRecordExternalCodeW455(extId || new Date().getTime())}`;
    const differentiated = buildDifferentiatedNames(prospect || 'Demo Hero', extId);

    let clonedFromAnchor = false;

    function buildFreshHeroRecord(includeLocation, forceCreate) {
      let rec = null;
      try {
        if (forceCreate) throw new Error('force-create-minimal-fresh-hero');
        rec = record.copy({ type: 'inventoryitem', id: Number(anchorHeroId), isDynamic: false });
        clonedFromAnchor = true;
      } catch (e) {
        rec = record.create({ type: 'inventoryitem', isDynamic: false });
      }
      rec.setValue({ fieldId: 'externalid', value: externalId });
      rec.setValue({ fieldId: 'itemid', value: differentiated.itemIdName });
      safeTry(() => rec.setValue({ fieldId: 'displayname', value: differentiated.displayName }));
      try { rec.setValue({ fieldId: 'subsidiary', value: [Number(subsidiaryId)] }); }
      catch (e) { safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: Number(subsidiaryId) })); }
      if (includeLocation && locationId) safeTry(() => rec.setValue({ fieldId: 'location', value: Number(locationId) }));
      if (!includeLocation) clearBodyLocationW453(rec);
      return rec;
    }

    let locationDroppedForInvalidSub = false;
    let copiedItemSaveFailed = false;
    let minimalCreateFallbackUsed = false;
    let firstSaveError = null;
    let noLocationSaveError = null;
    let id = null;
    try {
      id = Number(buildFreshHeroRecord(true).save({ enableSourcing: true, ignoreMandatoryFields: true }));
    } catch (e) {
      firstSaveError = e;
      if (!locationId && isInvalidSubLocationErrorW453(e)) throw e;
      locationDroppedForInvalidSub = true;
      copiedItemSaveFailed = !isInvalidSubLocationErrorW453(e);
      log.audit({
        title: `Fresh HERO retry without copied item body location [${VERSION}]`,
        details: JSON.stringify({
          extId,
          subsidiaryId: Number(subsidiaryId || 0),
          rejectedLocationId: Number(locationId || 0),
          errorName: e && e.name || '',
          errorMessage: e && e.message || String(e || ''),
          itemBodyLocationPolicy: 'retry-without-body-location-then-minimal-create-if-copy-save-fails',
          copiedItemSaveFailed
        })
      });
      try {
        id = Number(buildFreshHeroRecord(false).save({ enableSourcing: true, ignoreMandatoryFields: true }));
      } catch (retryError) {
        noLocationSaveError = retryError;
        minimalCreateFallbackUsed = true;
        log.audit({
          title: `Fresh HERO minimal create fallback after copied item save failed [${VERSION}]`,
          details: JSON.stringify({
            extId,
            subsidiaryId: Number(subsidiaryId || 0),
            rejectedLocationId: Number(locationId || 0),
            firstErrorName: firstSaveError && firstSaveError.name || '',
            firstErrorMessage: firstSaveError && firstSaveError.message || String(firstSaveError || ''),
            retryErrorName: retryError && retryError.name || '',
            retryErrorMessage: retryError && retryError.message || String(retryError || ''),
            fallbackPolicy: 'create-inventoryitem-minimal-then-apply-shared-persistence'
          })
        });
        id = Number(buildFreshHeroRecord(false, true).save({ enableSourcing: true, ignoreMandatoryFields: true }));
      }
    }

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
        clonedFromAnchor,
        copiedItemSaveFailed,
        minimalCreateFallbackUsed,
        firstSaveErrorName: firstSaveError && firstSaveError.name || '',
        firstSaveErrorMessage: firstSaveError && firstSaveError.message || '',
        noLocationSaveErrorName: noLocationSaveError && noLocationSaveError.name || '',
        noLocationSaveErrorMessage: noLocationSaveError && noLocationSaveError.message || '',
        preferredVendorOk: !!persistence.preferredVendorOk,
        planningAutoCalcOff: !!persistence.planningAutoCalcOff,
        locationPlanningCopied: !!persistence.locationPlanningCopied,
        bodyPlanningFieldsOff: persistence.bodyPlanningFieldsOff || [],
        vendorSublistUsed: persistence.vendorSublistUsed || '',
        vendorId: Number(persistence.vendorId || 0),
        locationDroppedForInvalidSub,
        itemBodyLocationPolicy: locationDroppedForInvalidSub ? 'cleared-after-invalid-sub' : 'old-runner-location-applied'
      })
    });

    return { id, externalId, csvKey: externalId };
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

          copied.push({
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

    return copied.length > 0;
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
      id = createInventoryOrAssemblyWithLocationRetryW453({
        type: 'inventoryitem',
        externalId,
        defaultName,
        subsidiaryId,
        locationId
      });
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
      id = createInventoryOrAssemblyWithLocationRetryW453({
        type: 'assemblyitem',
        externalId,
        defaultName,
        subsidiaryId,
        locationId
      });
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

  function createInventoryOrAssemblyWithLocationRetryW453({ type, externalId, defaultName, subsidiaryId, locationId }) {
    function buildRecord(includeLocation) {
      const rec = record.create({ type, isDynamic: false });
      rec.setValue({ fieldId: 'externalid', value: externalId });
      rec.setValue({ fieldId: 'itemid', value: defaultName });
      try { rec.setValue({ fieldId: 'subsidiary', value: [Number(subsidiaryId)] }); }
      catch (e) { safeTry(() => rec.setValue({ fieldId: 'subsidiary', value: Number(subsidiaryId) })); }
      if (includeLocation && locationId) safeTry(() => rec.setValue({ fieldId: 'location', value: Number(locationId) }));
      if (!includeLocation) clearBodyLocationW453(rec);
      return rec;
    }
    try {
      return Number(buildRecord(true).save({ enableSourcing: true, ignoreMandatoryFields: true }));
    } catch (e) {
      if (!locationId || !isInvalidSubLocationErrorW453(e)) throw e;
      log.audit({
        title: `Location retry without item body location after INVALID_SUB for ${type} [${VERSION}]`,
        details: JSON.stringify({
          type,
          externalId,
          subsidiaryId: Number(subsidiaryId || 0),
          rejectedLocationId: Number(locationId || 0),
          errorName: e && e.name || '',
          errorMessage: e && e.message || String(e || ''),
          itemBodyLocationPolicy: 'old-runner-location-first-clear-body-location-on-invalid-sub'
        })
      });
      return Number(buildRecord(false).save({ enableSourcing: true, ignoreMandatoryFields: true }));
    }
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

  function attachBomToAssembly({ assemblyId, bomId }) {
    const asm = record.load({ type: 'assemblyitem', id: Number(assemblyId), isDynamic: true });
    const sublistId = 'billofmaterials';
    const bomFieldId = 'billofmaterials';
    const masterDefaultFieldId = 'masterdefault';

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
      safeTry(() => asm.setCurrentSublistValue({ sublistId, fieldId: masterDefaultFieldId, value: true }));
      asm.commitLine({ sublistId });
    } else {
      asm.selectLine({ sublistId, line: foundLine });
      safeTry(() => asm.setCurrentSublistValue({ sublistId, fieldId: masterDefaultFieldId, value: true }));
      asm.commitLine({ sublistId });
    }

    asm.save({ enableSourcing: true, ignoreMandatoryFields: true });
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
    const domain = extractDomain(website);
    const fallbackSignal = {
      domain: domain || '',
      text: domain
        ? `Domain: ${domain}. Use company name, notes, and domain text to infer industry and scenario.`
        : `No website signal available. Use company name and notes to infer industry and scenario.`
    };

    if (!website) {
      return { status: 'missing', signal: fallbackSignal, errorName: '', errorMessage: '', fallbackUsed: true };
    }

    try {
      const signal = getWebsiteSignal(website);
      return { status: 'ok', signal: signal, errorName: '', errorMessage: '', fallbackUsed: false };
    } catch (e) {
      const name = e && e.name ? String(e.name) : '';
      const msg = e && e.message ? String(e.message) : String(e || '');
      const status = name === 'SSS_CONNECTION_TIME_OUT'
        ? 'timeout'
        : (name === 'SSS_UNKNOWN_HOST' ? 'unknown_host' : 'error');

      log.audit({
        title: `Website signal fallback applied [${VERSION}]`,
        details: JSON.stringify({ status: status, errorName: name, errorMessage: msg, domain: domain || '' })
      });

      return {
        status: status,
        signal: fallbackSignal,
        errorName: name,
        errorMessage: msg,
        fallbackUsed: true
      };
    }
  }

  function getWebsiteSignal(website) {
    const domain = extractDomain(website);
    if (!domain) return { domain: '', text: '' };

    const startUrl = normalizeUrl(website);
    const first = fetchHtmlWithRedirects(startUrl, 6);

    let bestText = extractSignalText(first.html, domain);
    let bestLen = bestText.length;

    if (bestLen >= 500) return { domain, text: bestText };

    const candidates = pickHighSignalLinks(first.html, domain, 8);
    const topToTry = candidates.slice(0, 3);

    for (let i = 0; i < topToTry.length; i++) {
      const u = topToTry[i];
      try {
        const r = fetchHtmlWithRedirects(u, 4);
        const t = extractSignalText(r.html, domain);
        if (t.length > bestLen) {
          bestLen = t.length;
          bestText = t;
        }
        if (bestLen >= 900) break;
      } catch (e) {}
    }

    if (!bestText || bestText.length < 150) {
      return { domain, text: `Domain: ${domain}. Infer industry from the domain name.` };
    }

    return { domain, text: bestText };
  }

  function fetchHtmlWithRedirects(url, maxHops) {
    let current = url;
    let hops = 0;

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
        continue;
      }

      return { finalUrl: current, html: body, code };
    }

    return { finalUrl: current, html: '', code: 0 };
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
      return {
        found: false,
        parsed: false,
        applied: false,
        fileId: null,
        discoveryMode,
        source: deterministic._source || 'deterministic',
        payload: deterministic
      };
    }

    try {
      const f = file.load({ id: Number(candidateFileId) });
      const raw = String(f.getContents() || '{}');
      const parsed = safeJsonParse(raw) || {};
      const out = Object.assign({}, deterministic, parsed || {});
      if (!Array.isArray(out.component_names) || out.component_names.length !== 3) out.component_names = deterministic.component_names;
      out.hero_item_name = trimLen(out.hero_item_name, 60);
      out.assembly_name = trimLen(out.assembly_name, 60);
      out.component_names = out.component_names.map(n => trimLen(n, 60));
      out.bom_name = trimLen(out.bom_name, 80);
      out.bom_revision_name = trimLen(out.bom_revision_name, 80);
      out.routing_name = trimLen(out.routing_name || deterministic.routing_name, 80);
      out.operation_names_by_seq = out.operation_names_by_seq || deterministic.operation_names_by_seq;
      out._source = out._source || 'suitelet-precomputed';
      out._signalLen = out._signalLen || String(signalText || '').length;
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
      return {
        found: false,
        parsed: false,
        applied: false,
        fileId: candidateFileId || null,
        discoveryMode,
        source: deterministic._source || 'deterministic',
        payload: deterministic
      };
    }
  }

  function discoverNamingFileIdByExtId(extId) {
    try {
      const rawExtId = String(extId || '').trim();
      const candidates = [
        `scai_naming_${rawExtId}.json`,
        `scai_naming_${safeCode(rawExtId)}`,
        safeCode(rawExtId)
      ].filter(function(value, index, arr) { return value && arr.indexOf(value) === index; });
      for (let i = 0; i < candidates.length; i += 1) {
        const token = candidates[i];
        const filters = token.indexOf('.json') !== -1
          ? [['name', 'is', token]]
          : [['name', 'contains', token], 'AND', ['name', 'contains', 'scai_naming_']];
        const rs = search.create({
          type: 'file',
          filters,
          columns: [search.createColumn({ name: 'internalid', sort: search.Sort.DESC }), 'name']
        }).run().getRange({ start: 0, end: 1 }) || [];
        if (rs.length) {
          const fileId = toIntOrNull(rs[0].getValue({ name: 'internalid' }));
          if (fileId) return fileId;
        }
      }
      return null;
    } catch (e) {
      log.error({ title: `Precomputed naming discover FAILED [${VERSION}]`, details: JSON.stringify({ extId: extId || '', message: (e && (e.message || e.details)) ? String(e.message || e.details) : String(e) }) });
      return null;
    }
  }

  function generateNamingPack({ prospect, website, signalText }) {
    const clippedSignal = String(signalText || '').slice(0, 1200);
    const evidence = `${prospect || ''} ${website || ''} ${clippedSignal || ''}`.toLowerCase();
    const genericFallbackBlockedTerms = [
      'Component A',
      'Component B',
      'Component C',
      'Core Material Input',
      'Primary Material Input',
      'Machine Unit',
      'Finished Good',
      'Product 12-Count Case Pack',
      'Build Product',
      'Prepare Materials',
      'Final Assembly Unit',
      'Drinkware Product Line',
      'Outdoor Cooking Product Line'
    ];
    const industrial = industrialEquipmentNamingPackW460({ prospect, website, evidence, genericFallbackBlockedTerms });
    if (industrial) return industrial;
    const hardgoods = durableHardgoodsNamingPackW462({ prospect, website, evidence, genericFallbackBlockedTerms });
    if (hardgoods) return hardgoods;
    if (/health[-\s]?ade|kombucha|ferment|organic tea|ginger lemon|beverage|bottle|case pack/.test(evidence)) {
      return {
        _source: 'website-product-evidence',
        _signalLen: clippedSignal.length,
        confidencePercent: 92,
        industry_category: 'Food and Beverage',
        primary_product_candidate: 'Kombucha Variety Pack',
        alternate_product_candidates: ['Kombucha Case Pack', 'Ginger Lemon Kombucha', 'Variety Pack Beverage Case'],
        evidence_terms: ['Health-Ade', 'kombucha', 'fermentation', 'ginger lemon', 'bottle', 'case pack'],
        competitor_terms: [],
        roi_basis_terms: ['line readiness', 'case availability', 'production proof'],
        hero_item_name: 'Health-Ade Kombucha Variety Pack Case',
        assembly_name: 'Health-Ade Kombucha Batch',
        component_names: [
          'Organic Tea and Sugar Fermentation Base',
          'Ginger Lemon Flavor Blend',
          'Bottle and Case Packaging'
        ],
        bom_name: 'BOM - Health-Ade Kombucha Variety Pack',
        bom_revision_name: 'Revision 1 - Health-Ade Kombucha Variety Pack',
        routing_name: 'Routing - Health-Ade Kombucha Batch',
        operation_names_by_seq: {
          '10': 'Brew and Ferment Kombucha Base',
          '20': 'Flavor, Bottle, and Case Pack',
          '30': 'QC and Release Finished Cases'
        },
        sales_descriptions: {
          hero: 'Kombucha variety pack case for customer demand readiness.',
          assembly: 'Kombucha batch for WIP line readiness.',
          components: ['Organic tea and sugar fermentation base', 'Ginger lemon flavor blend', 'Bottle and case packaging']
        },
        purchase_descriptions: {
          hero: 'Kombucha case supply proof item.',
          assembly: 'Kombucha production batch planning item.',
          components: ['Organic tea and sugar fermentation base', 'Ginger lemon flavor blend', 'Bottle and case packaging']
        },
        fallbackReason: '',
        genericFallbackBlockedTerms
      };
    }
    return {
      _source: 'deterministic-fallback',
      _signalLen: clippedSignal.length,
      industry_category: '',
      confidencePercent: 35,
      primary_product_candidate: `${prospect} Product`,
      alternate_product_candidates: [],
      evidence_terms: [],
      competitor_terms: [],
      roi_basis_terms: [],
      hero_item_name: `${prospect} Demo Case`,
      assembly_name: `${prospect} Demo Batch`,
      component_names: [
        `${prospect} Input Base`,
        `${prospect} Process Blend`,
        `${prospect} Packaging`
      ],
      bom_name: `BOM - ${prospect}`,
      bom_revision_name: `Revision 1 - ${prospect}`,
      routing_name: `Routing - ${prospect} Demo Batch`,
      operation_names_by_seq: {
        '10': `Prepare ${prospect} Input Base`,
        '20': `Fill and Pack ${prospect} Demo Case`,
        '30': 'QC and Release Finished Cases'
      },
      fallbackReason: 'No server naming file or strong product evidence was available.',
      genericFallbackBlockedTerms
    };
  }

  function concreteHardgoodsProductFromEvidenceW463(evidence) {
    const text = String(evidence || '').toLowerCase();
    const candidates = [
      { name: 'Rambler 20 oz Tumbler', pattern: /\brambler\b.*\btumbler\b|\brambler 20 oz\b/ },
      { name: 'Tundra Cooler', pattern: /\btundra\b.*\bcooler\b/ },
      { name: 'Roadie Cooler', pattern: /\broadie\b.*\bcooler\b/ },
      { name: 'Hopper Soft Cooler', pattern: /\bhopper\b.*\bsoft cooler\b|\bhopper\b.*\bcooler\b/ },
      { name: 'Quencher H2.0 FlowState Tumbler', pattern: /\bquencher\b|\bflowstate\b/ },
      { name: 'Wide Mouth Bottle', pattern: /\bwide mouth\b.*\bbottle\b/ },
      { name: 'Karu 2 Pro Multi-Fuel Pizza Oven', pattern: /\bkaru 2 pro\b/ },
      { name: 'Koda 16 Gas Powered Pizza Oven', pattern: /\bkoda 16\b/ },
      { name: 'Stagg EKG Electric Kettle', pattern: /\bstagg ekg\b/ },
      { name: 'Carter Move Mug', pattern: /\bcarter move\b/ },
      { name: 'Opus Conical Burr Grinder', pattern: /\bopus\b.*\bgrinder\b|\bopus conical burr\b/ },
      { name: 'Ode Brew Grinder', pattern: /\bode brew\b|\bode\b.*\bgrinder\b/ },
      { name: 'Clara French Press', pattern: /\bclara\b.*\bfrench press\b/ },
      { name: 'Tally Pro Precision Scale', pattern: /\btally pro\b|\bprecision scale\b/ },
      { name: 'Bonfire Fire Pit', pattern: /\bbonfire\b/ },
      { name: 'Yukon Fire Pit', pattern: /\byukon\b/ },
      { name: 'Ranger Fire Pit', pattern: /\branger\b/ },
      { name: 'Mesa Tabletop Fire Pit', pattern: /\bmesa\b/ },
      { name: 'Pi Prime Pizza Oven', pattern: /\bpi prime\b/ },
      { name: 'Canyon Fire Pit', pattern: /\bcanyon\b/ }
    ];
    for (let i = 0; i < candidates.length; i += 1) {
      if (candidates[i].pattern.test(text)) return candidates[i].name;
    }
    return '';
  }

  function durableHardgoodsNamingPackW462({ prospect, website, evidence, genericFallbackBlockedTerms }) {
    const domain = String(website || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split(/[/?#]/)[0].toLowerCase();
    let brand = '';
    let product = '';
    let alternates = [];
    if (/yeti\.com|yeti/.test(domain) || /\byeti\b/.test(evidence)) {
      brand = 'YETI';
      product = 'Rambler 20 oz Tumbler';
      alternates = ['Tundra Cooler', 'Roadie Cooler', 'Hopper Soft Cooler', 'Camino Carryall', 'LoadOut Bucket', 'Yonder Bottle'];
    } else if (/stanley1913\.com|stanley/.test(domain) || /\bstanley\b/.test(evidence)) {
      brand = 'Stanley';
      product = 'Quencher H2.0 FlowState Tumbler';
      alternates = ['IceFlow Flip Straw Tumbler', 'Classic Legendary Bottle', 'AeroLight Transit Mug', 'Adventure Quencher Travel Tumbler'];
    } else if (/hydroflask\.com|hydroflask|hydro-flask/.test(domain)) {
      brand = 'Hydro Flask';
      product = 'Wide Mouth Bottle';
      alternates = ['All Around Travel Tumbler', 'All Around Tumbler', 'Trail Series Bottle', 'Coffee Mug'];
    } else if (/ooni\.com|ooni/.test(domain)) {
      brand = 'Ooni';
      product = 'Karu 2 Pro Multi-Fuel Pizza Oven';
      alternates = ['Koda 16 Gas Powered Pizza Oven', 'Karu 12G Multi-Fuel Pizza Oven', 'Volt 12 Electric Pizza Oven', 'Fyra 12 Wood Pellet Pizza Oven'];
    } else if (/fellowproducts\.com|fellowproducts|fellow/.test(domain)) {
      brand = 'Fellow';
      product = 'Stagg EKG Electric Kettle';
      alternates = ['Stagg EKG Pro', 'Carter Move Mug', 'Opus Conical Burr Grinder', 'Ode Brew Grinder', 'Clara French Press'];
    } else if (/solostove\.com|solo-stove|solo stove/.test(domain)) {
      brand = 'Solo Stove';
      product = 'Bonfire Fire Pit';
      alternates = ['Yukon Fire Pit', 'Ranger Fire Pit', 'Mesa Tabletop Fire Pit', 'Pi Prime Pizza Oven', 'Canyon Fire Pit'];
    } else if (domain) {
      const concreteProduct = concreteHardgoodsProductFromEvidenceW463(evidence);
      if (concreteProduct) {
        brand = str(prospect).replace(/\b(fulfillment proof|proof|demo|v\d+)\b/ig, '').trim();
        product = concreteProduct;
        alternates = [];
      }
    }
    if (!product) return null;
    const base = brand && product.indexOf(brand) !== 0 ? `${brand} ${product}` : product;
    const candidates = [product].concat(alternates).map(function(name, index) {
      return {
        name,
        source: 'domain_catalog_resolver',
        sourceUrl: website || '',
        domain,
        confidence: index === 0 ? 90 : 82,
        wipSuitabilityScore: index === 0 ? 90 : 82,
        reasons: ['public hardgoods website product-line resolver candidate', 'durable consumer hardgoods product noun', 'domain-bound match']
      };
    });
    return {
      _source: 'domain-catalog-durable-hardgoods-w462',
      _signalLen: String(evidence || '').length,
      namingEvidenceSource: 'domain_catalog_deterministic_ranker',
      namingConfidence: 90,
      confidencePercent: 90,
      industry_category: 'Dealer Hardgoods',
      primary_product_candidate: product,
      selectedProductName: product,
      selectedVariantName: product,
      selectedPackName: 'Case',
      alternate_product_candidates: alternates,
      catalogCandidates: candidates,
      selectedCatalogCandidate: candidates[0],
      selectedCatalogCandidateSource: 'domain_catalog_resolver',
      selectedCatalogCandidateReasons: candidates[0].reasons,
      websiteEvidenceSource: 'domain_catalog_resolver',
      websiteEvidenceSourceUrls: website ? [website] : [],
      genericCandidateRejectedReasons: ['Catalog Product rejected: public website product-line candidate available'],
      missingEvidence: [],
      productEvidenceConfidence: 90,
      websiteCatalogEvidenceUsed: true,
      llmCatalogInterpretationUsed: false,
      deterministicCatalogRankerUsed: true,
      fallbackUsed: false,
      fallbackReason: '',
      productSignalsUsed: ['durable consumer hardgoods', 'drinkware', 'retail fulfillment'],
      flavorSignalsUsed: [product],
      packSignalsUsed: ['Case'],
      llmNamingAdvisoryUsed: false,
      websiteSignalsUsed: [product].concat(alternates),
      prospectNameUsedAsFallbackOnly: true,
      evidence_terms: [brand, product, 'dealer hardgoods', 'drinkware', 'fulfillment'].filter(Boolean),
      competitor_terms: [],
      roi_basis_terms: ['allocation readiness', 'case availability', 'fulfillment proof'],
      hero_item_name: `${base} Case`,
      assembly_name: `${base} Fulfillment Batch`,
      component_names: [
        /pizza oven|oven|bonfire|yukon|ranger|mesa|fire pit/i.test(product) ? `${product} Body and Heat Shield Kit` : `${product} Retail Case Inventory`,
        /pizza oven|oven|bonfire|yukon|ranger|mesa|fire pit/i.test(product) ? `${product} Fuel and Airflow System` : `${product} Channel Replenishment Lot`,
        /pizza oven|oven/i.test(product) ? `${product} Retail Packaging` : `${product} Fulfillment Packaging`
      ],
      bom_name: `BOM - ${base}`,
      bom_revision_name: `Revision 1 - ${base}`,
      routing_name: `Routing - ${base} Fulfillment`,
      operation_names_by_seq: {
        '10': /pizza oven|oven|bonfire|yukon|ranger|mesa|fire pit/i.test(product) ? `Stage ${product} Kits` : `Receive ${product} Cases`,
        '20': /pizza oven|oven|bonfire|yukon|ranger|mesa|fire pit/i.test(product) ? `Assemble and Test ${product}` : `Allocate ${product} Demand`,
        '30': /pizza oven|oven/i.test(product) ? `Pack and Release ${product}` : `Release ${product} Fulfillment`
      },
      sales_descriptions: {
        hero: `${base} case for retail demand and fulfillment readiness.`,
        assembly: `${base} fulfillment batch for allocation proof.`,
        components: ['Retail case inventory', 'Channel replenishment lot', 'Fulfillment packaging']
      },
      purchase_descriptions: {
        hero: `${base} case supply proof item.`,
        assembly: `${base} fulfillment planning item.`,
        components: ['Retail case inventory', 'Channel replenishment lot', 'Fulfillment packaging']
      },
      fallbackReason: '',
      genericFallbackBlockedTerms
    };
  }

  function industrialEquipmentNamingPackW460({ prospect, website, evidence, genericFallbackBlockedTerms }) {
    const domain = String(website || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split(/[/?#]/)[0].toLowerCase();
    let brand = '';
    let product = '';
    let alternates = [];
    if (/crown\.com|crown/.test(domain) || /\bcrown equipment\b/.test(evidence)) {
      brand = 'Crown';
      product = 'RC Series Stand-Up Rider Forklift';
      alternates = ['RM Series Reach Truck', 'SP Series Order Picker', 'PE Series Pallet Truck', 'C-5 Series Forklift'];
    } else if (/hyster\.com|hyster/.test(domain) || /\bhyster\b/.test(evidence)) {
      brand = 'Hyster';
      product = 'A Series Lift Truck';
      alternates = ['J Series Electric Forklift', 'Reach Truck', 'Pallet Truck'];
    } else if (/yale\.com|yale/.test(domain) || /\byale\b/.test(evidence)) {
      brand = 'Yale';
      product = 'ERP Series Electric Lift Truck';
      alternates = ['GP Series Internal Combustion Truck', 'Reach Truck', 'Order Picker', 'Pallet Truck'];
    } else if (/toyotaforklift\.com|toyota/.test(domain) || /\btoyota\b/.test(evidence)) {
      brand = 'Toyota';
      product = 'Core Electric Forklift';
      alternates = ['Internal Combustion Forklift', 'Reach Truck', 'Order Picker', 'Pallet Jack'];
    } else if (/\b(forklift|lift truck|pallet truck|reach truck|order picker|tow tractor|warehouse equipment)\b/.test(evidence)) {
      brand = str(prospect).replace(/\b(wip proof|proof|demo|v\d+)\b/ig, '').trim() || 'Industrial Equipment';
      product = 'Lift Truck';
      alternates = ['Forklift Truck', 'Reach Truck', 'Pallet Truck', 'Order Picker'];
    }
    if (!product) return null;
    const base = brand && product.indexOf(brand) !== 0 ? `${brand} ${product}` : product;
    return {
      _source: 'domain-catalog-industrial-equipment-w460',
      _signalLen: String(evidence || '').length,
      namingEvidenceSource: 'domain_catalog_deterministic_ranker',
      namingConfidence: 88,
      confidencePercent: 88,
      industry_category: 'Industrial Equipment',
      primary_product_candidate: product,
      selectedProductName: product,
      selectedVariantName: product,
      selectedPackName: 'Configured Unit',
      alternate_product_candidates: alternates,
      catalogCandidates: [product].concat(alternates).map(function(name, index) {
        return {
          name,
          source: 'domain_catalog_resolver',
          sourceUrl: website || '',
          domain,
          confidence: index === 0 ? 88 : 78,
          wipSuitabilityScore: index === 0 ? 88 : 78,
          reasons: ['public industrial equipment product-line resolver candidate', 'manufacturable equipment noun', 'domain match']
        };
      }),
      selectedCatalogCandidate: {
        name: product,
        source: 'domain_catalog_resolver',
        sourceUrl: website || '',
        domain,
        confidence: 88,
        wipSuitabilityScore: 88,
        reasons: ['public industrial equipment product-line resolver candidate', 'manufacturable equipment noun', 'domain match']
      },
      selectedCatalogCandidateSource: 'domain_catalog_resolver',
      selectedCatalogCandidateReasons: ['public industrial equipment product-line resolver candidate', 'manufacturable equipment noun', 'domain match'],
      websiteEvidenceSource: 'domain_catalog_resolver',
      websiteEvidenceSourceUrls: website ? [website] : [],
      genericCandidateRejectedReasons: [],
      missingEvidence: [],
      productEvidenceConfidence: 88,
      websiteCatalogEvidenceUsed: true,
      llmCatalogInterpretationUsed: false,
      deterministicCatalogRankerUsed: true,
      fallbackUsed: false,
      fallbackReason: '',
      productSignalsUsed: ['industrial equipment', 'lift truck', 'forklift', 'WIP assembly'],
      flavorSignalsUsed: [product],
      packSignalsUsed: ['Configured Unit'],
      llmNamingAdvisoryUsed: false,
      websiteSignalsUsed: [product].concat(alternates),
      prospectNameUsedAsFallbackOnly: true,
      evidence_terms: [brand, product, 'industrial equipment', 'forklift', 'lift truck'].filter(Boolean),
      competitor_terms: [],
      roi_basis_terms: ['customer promise risk', 'equipment order readiness', 'WIP assembly proof'],
      hero_item_name: `${base} Configured Unit`,
      assembly_name: `${base} Final Assembly`,
      component_names: [
        `${product} Chassis and Mast Subassembly`,
        `${product} Powertrain and Controls Kit`,
        `${product} Forks and Safety Hardware`
      ],
      bom_name: `BOM - ${base}`,
      bom_revision_name: `Revision 1 - ${base}`,
      routing_name: `Routing - ${base} Final Assembly`,
      operation_names_by_seq: {
        '10': `Stage ${product} Subassemblies`,
        '20': `Assemble and Configure ${product}`,
        '30': `Inspect and Release ${product}`
      },
      sales_descriptions: {
        hero: `${base} configured unit for dealer/customer demand readiness.`,
        assembly: `${base} final assembly for routed WIP execution.`,
        components: [
          `${product} chassis and mast subassembly used in ${base} final assembly.`,
          `${product} powertrain and controls kit used in ${base} final assembly.`,
          `${product} forks and safety hardware used in ${base} final assembly.`
        ]
      },
      purchase_descriptions: {
        hero: `${base} dealer readiness proof item.`,
        assembly: `${base} production assembly planning item.`,
        components: [
          `${product} chassis and mast subassembly`,
          `${product} powertrain and controls kit`,
          `${product} forks and safety hardware`
        ]
      },
      genericFallbackBlockedTerms
    };
  }

  function productBuildPlanW432(input) {
    const source = input || {};
    const signal = `${source.prospect || ''} ${source.website || ''} ${source.signalText || ''}`.toLowerCase();
    if (/siete|tortilla|ma[ií]z|masa/.test(signal)) {
      return {
        schema: 'idb.product-build-plan.w432.legacy-runner-test-hook.v1',
        primaryProductCandidate: 'Siete Maíz Sea Salt Tortilla Chips',
        alternateProductCandidates: [
          'Siete Grain Free Tortilla Chips',
          'Siete Taco Shells',
          'Siete Seasoning Mixes',
          'Siete Cookies',
          'Siete Beans',
          'Siete Sauces'
        ],
        selectedProductReason: 'Fixture hook selected Siete product terms from prospect, website, and signal text.',
        productCandidateSource: 'notes_product_evidence',
        confidencePercent: 90,
        evidenceTerms: ['Siete', 'Maíz', 'Sea Salt', 'Tortilla Chips'],
        operationNames: [
          'Mix Masa',
          'Sheet and Cut Tortilla Chips',
          'Fry in Avocado Oil',
          'Season with Sea Salt',
          'Bag, Case Pack, and QC'
        ]
      };
    }
    return {
      schema: 'idb.product-build-plan.w432.legacy-runner-test-hook.v1',
      primaryProductCandidate: source.prospect || 'Demo Product',
      alternateProductCandidates: [],
      selectedProductReason: 'Fixture hook fallback for harness-only product plan generation.',
      productCandidateSource: 'fallback_no_product_found',
      confidencePercent: 50,
      evidenceTerms: [],
      operationNames: ['Blending', 'Dispensing', 'Packaging']
    };
  }

  function industryNativeManufacturingNamingW442(input) {
    const source = input || {};
    const base = source.distributionBase || 'Demo Product';
    const family = `${source.productFamily || ''} ${source.signalText || ''}`.toLowerCase();
    if (/serum|skincare|beauty|formula/.test(family)) {
      return {
        industryNativeManufacturedItemName: `${base} Formula Batch`,
        manufacturingOutputName: `${base} Filled Retail Units`,
        industryManufacturingTerms: ['Formula Batch', 'Batch Blend', 'Fill Run', 'Packaging QC']
      };
    }
    if (/industrial|equipment|machine|module|assembly/.test(family)) {
      return {
        industryNativeManufacturedItemName: `${base} Configured Equipment Build`,
        manufacturingOutputName: `${base} Final Assembly Unit`,
        industryManufacturingTerms: ['Configured Equipment Build', 'Subassembly', 'Final Assembly Unit']
      };
    }
    return {
      industryNativeManufacturedItemName: `${base} Production Batch`,
      manufacturingOutputName: `${base} Finished Case Output`,
      industryManufacturingTerms: ['Production Batch', 'Ingredient Input', 'Case Pack', 'QC Finished Cases']
    };
  }

  function applyNamingToAnchors(ids, names, opts) {
    const enableManufacturing = !opts || opts.enableManufacturing !== false;
    const createNewHeroItem = !!(opts && opts.createNewHeroItem);
    const extId = opts && opts.extId;
    const heroNamePair = buildDifferentiatedNames(names.hero_item_name, extId);
    const heroSalesDesc = `${names.hero_item_name} finished good ready for sale.`;
    const heroPurchDesc = `Purchased inputs supporting ${names.hero_item_name} production.`;
    const overwriteTelemetryW457 = {
      schema: 'forge.w457.reused-record-overwrite.v1',
      attemptedFields: [],
      acceptedFields: [],
      rejectedFields: [],
      records: [],
      staleTermsBlocked: ['Kombucha', 'Health-Ade', 'Fermentation Base', 'Ginger Lemon', 'Bottle and Case Packaging']
    };

    function submitFieldsTrackedW457(type, id, values, label) {
      const attempted = Object.keys(values || {});
      const accepted = [];
      const rejected = [];
      attempted.forEach(function(fieldId) {
        const one = {};
        one[fieldId] = values[fieldId];
        overwriteTelemetryW457.attemptedFields.push(`${label || type}.${fieldId}`);
        try {
          record.submitFields({
            type,
            id: Number(id),
            values: one,
            options: { enableSourcing: true, ignoreMandatoryFields: true }
          });
          accepted.push(fieldId);
          overwriteTelemetryW457.acceptedFields.push(`${label || type}.${fieldId}`);
        } catch (e) {
          const rejection = { label: label || type, type, id: Number(id || 0), fieldId, errorName: e && e.name || '', errorMessage: e && e.message || String(e || '') };
          rejected.push(rejection);
          overwriteTelemetryW457.rejectedFields.push(rejection);
        }
      });
      overwriteTelemetryW457.records.push({ label: label || type, type, id: Number(id || 0), attemptedFields: attempted, acceptedFields: accepted, rejectedFields: rejected.map(function(item) { return item.fieldId; }) });
      return accepted.length > 0;
    }

    const asmNameBase = names.assembly_name || names.hero_item_name;
    const asmNamePair = buildDifferentiatedNames(asmNameBase, extId);
    const asmSalesDesc  = `${asmNameBase} buildable finished good for customer orders.`;
    const asmPurchDesc  = `Assembly supply inputs used to build ${asmNameBase}.`;

    function compSalesDesc(compName) {
      return `${compName} component used in ${asmNameBase}.`;
    }
    function compPurchDesc(compName) {
      return `Procured ${compName} material for ${asmNameBase}.`;
    }

    const heroValues = {
      itemid: heroNamePair.itemIdName,
      displayname: heroNamePair.displayName,
      salesdescription: heroSalesDesc,
      purchasedescription: heroPurchDesc
    };

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

    submitFieldsTrackedW457('inventoryitem', Number(ids.heroItemId), heroValues, 'heroItem');

    if (enableManufacturing && ids.assemblyId) {
      const wipStackRenameTelemetryW456 = {
        assemblyId: Number(ids.assemblyId || 0),
        bomId: Number(ids.bomId || 0),
        bomRevId: Number(ids.bomRevId || 0),
        assemblyName: asmNamePair.itemIdName,
        assemblyDisplayName: asmNamePair.displayName,
        bomName: '',
        bomRevisionName: '',
        assemblyRenameAttempted: true,
        bomRenameAttempted: false,
        bomRevisionRenameAttempted: false
      };
      submitFieldsTrackedW457('assemblyitem', Number(ids.assemblyId), {
        itemid: asmNamePair.itemIdName,
        displayname: asmNamePair.displayName,
        salesdescription: asmSalesDesc,
        purchasedescription: asmPurchDesc
      }, 'assembly');

      const comps = [
        { id: ids.comp1Id, name: names.component_names[0] },
        { id: ids.comp2Id, name: names.component_names[1] },
        { id: ids.comp3Id, name: names.component_names[2] }
      ].filter(c => c.id);

      comps.forEach(c => {
        const compNamePair = buildDifferentiatedNames(c.name, extId);
        return submitFieldsTrackedW457('inventoryitem', Number(c.id), {
          itemid: compNamePair.itemIdName,
          displayname: compNamePair.displayName,
          salesdescription: compSalesDesc(c.name),
          purchasedescription: compPurchDesc(c.name)
        }, `componentItem${comps.indexOf(c) + 1}`);
      });

      if (ids.bomId) {
        const bomNamePair = buildDifferentiatedNames(names.bom_name, extId);
        wipStackRenameTelemetryW456.bomName = bomNamePair.itemIdName;
        wipStackRenameTelemetryW456.bomRenameAttempted = true;
        submitFieldsTrackedW457('bom', Number(ids.bomId), { name: bomNamePair.itemIdName }, 'bom');
      }

      if (ids.bomRevId) {
        const bomRevNamePair = buildDifferentiatedNames(names.bom_revision_name, extId);
        wipStackRenameTelemetryW456.bomRevisionName = bomRevNamePair.itemIdName;
        wipStackRenameTelemetryW456.bomRevisionRenameAttempted = true;
        submitFieldsTrackedW457('bomrevision', Number(ids.bomRevId), { name: bomRevNamePair.itemIdName }, 'bomRevision');
      }
      log.audit({
        title: `Existing WIP stack naming applied W456 [${VERSION}]`,
        details: JSON.stringify(wipStackRenameTelemetryW456)
      });
    }
    return overwriteTelemetryW457;
  }

  function cleanWorkOrderLineDescriptionsW457({ workOrderId, componentIds, componentNames, assemblyName }) {
    const telemetry = {
      schema: 'forge.w457.work-order-line-description-cleanup.v1',
      workOrderId: Number(workOrderId || 0),
      attempted: false,
      acceptedLines: [],
      rejectedLines: [],
      staleTermsDetectedAfterReload: [],
      status: 'not_attempted'
    };
    if (!workOrderId) return telemetry;
    const staleRe = /\b(Kombucha|Health-Ade|Fermentation Base|Ginger Lemon|Bottle and Case Packaging)\b/i;
    try {
      const wo = record.load({ type: 'workorder', id: Number(workOrderId), isDynamic: true });
      const sublistId = 'item';
      const lineCount = Number(safeTryReturn(() => wo.getLineCount({ sublistId })) || 0);
      const componentIdStrings = (componentIds || []).map(function(id) { return String(id || ''); });
      telemetry.attempted = true;
      for (let i = 0; i < lineCount; i += 1) {
        const itemId = String(safeTryReturn(() => wo.getSublistValue({ sublistId, fieldId: 'item', line: i })) || '');
        const idx = componentIdStrings.indexOf(itemId);
        if (idx < 0) continue;
        const compName = (componentNames || [])[idx] || `Component ${idx + 1}`;
        const description = `${compName} component used in ${assemblyName}.`;
        try {
          wo.selectLine({ sublistId, line: i });
          wo.setCurrentSublistValue({ sublistId, fieldId: 'description', value: description });
          wo.commitLine({ sublistId });
          telemetry.acceptedLines.push({ line: i, itemId, description });
        } catch (e) {
          telemetry.rejectedLines.push({ line: i, itemId, description, errorName: e && e.name || '', errorMessage: e && e.message || String(e || '') });
        }
      }
      if (telemetry.acceptedLines.length) wo.save({ enableSourcing: true, ignoreMandatoryFields: true });
      const reload = record.load({ type: 'workorder', id: Number(workOrderId), isDynamic: false });
      const reloadCount = Number(safeTryReturn(() => reload.getLineCount({ sublistId })) || 0);
      for (let i = 0; i < reloadCount; i += 1) {
        const description = str(safeTryReturn(() => reload.getSublistValue({ sublistId, fieldId: 'description', line: i })));
        if (staleRe.test(description)) telemetry.staleTermsDetectedAfterReload.push({ line: i, description });
      }
      telemetry.status = telemetry.staleTermsDetectedAfterReload.length ? 'stale_terms_detected_after_reload' : 'current_run_descriptions_verified';
    } catch (e) {
      telemetry.status = 'work_order_line_cleanup_failed';
      telemetry.errorName = e && e.name || '';
      telemetry.errorMessage = e && e.message || String(e || '');
    }
    log.audit({ title: `Work Order line descriptions cleaned W457 [${VERSION}]`, details: JSON.stringify(telemetry) });
    return telemetry;
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
  function ensureCustomerCurrentRunIdentityW457({ prospect, website, extId, names }) {
    const customerId = findByExternalId('customer', ANCHORS.customer);
    const expectedWebsite = String(website || '').trim();
    const expectedName = `${prospect} Customer Account`;
    const memo = `SCAI Demo Reset: ${extId} | ${prospect} | ${expectedWebsite || 'website not supplied'}`;
    const telemetry = {
      schema: 'forge.w457.current-run-customer-identity.v1',
      role: 'customer',
      recordType: 'customer',
      id: customerId ? String(customerId) : '',
      expectedProspect: String(prospect || ''),
      expectedWebsite,
      expectedProduct: names && (names.hero_item_name || names.primary_product_candidate || names.selectedProductName) || '',
      expectedExternalId: ANCHORS.customer,
      expectedMemoSubstring: extId,
      expectedRecordRole: 'customer',
      attemptedFields: [],
      acceptedFields: [],
      rejectedFields: [],
      validation: {},
      status: 'not_attempted'
    };
    if (!customerId) {
      telemetry.status = 'missing_anchor_customer';
      return telemetry;
    }
    const values = {
      companyname: expectedName,
      entityid: expectedName,
      url: expectedWebsite,
      comments: memo,
      custentity_scai_demo_prospect: String(prospect || '').slice(0, 300),
      custentity_scai_demo_website: expectedWebsite.slice(0, 300),
      custentity_scai_demo_extid: String(extId || '').slice(0, 120)
    };
    Object.keys(values).forEach(function(fieldId) {
      telemetry.attemptedFields.push(fieldId);
      const one = {};
      one[fieldId] = values[fieldId];
      try {
        record.submitFields({
          type: 'customer',
          id: Number(customerId),
          values: one,
          options: { enableSourcing: true, ignoreMandatoryFields: true }
        });
        telemetry.acceptedFields.push(fieldId);
      } catch (e) {
        telemetry.rejectedFields.push({ fieldId, errorName: e && e.name || '', errorMessage: e && e.message || String(e || '') });
      }
    });
    try {
      const fields = search.lookupFields({
        type: 'customer',
        id: Number(customerId),
        columns: ['entityid', 'companyname', 'url', 'comments', 'externalid']
      });
      const actualName = str(fields.companyname || fields.entityid || '');
      const actualWebsite = str(fields.url || '');
      const actualComments = str(fields.comments || '');
      telemetry.validation = {
        actualName,
        actualWebsite,
        actualComments,
        actualExternalId: str(fields.externalid || ''),
        prospectMatches: actualName.indexOf(String(prospect || '')) !== -1,
        websiteMatches: !expectedWebsite || actualWebsite === expectedWebsite,
        memoMatches: !extId || actualComments.indexOf(extId) !== -1,
        staleHealthAdeBlocked: !/health-ade\.com|healthade/i.test(`${actualWebsite} ${actualName} ${actualComments}`)
      };
      telemetry.status = telemetry.validation.prospectMatches && telemetry.validation.websiteMatches && telemetry.validation.memoMatches && telemetry.validation.staleHealthAdeBlocked
        ? 'current_run_identity_verified'
        : 'current_run_identity_needs_review';
    } catch (e) {
      telemetry.status = 'current_run_identity_reload_failed';
      telemetry.validation = { errorName: e && e.name || '', errorMessage: e && e.message || String(e || '') };
    }
    log.audit({ title: `Customer current-run identity applied W457 [${VERSION}]`, details: JSON.stringify(telemetry) });
    return telemetry;
  }

  function buildSoCsv({ extId, prospect, website, agenda, locationId, itemKey }) {
    const memoBase = `SCAI Demo Reset: ${prospect}${website ? ` (${extractDomain(website)})` : ''}`;
    const memo = agenda ? memoBase + ' - ' + summarizeOneLine(agenda) : memoBase;

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
    const safeName = boundedFileNameW461(filename || `scai_file_${Date.now()}.csv`, 180);
    const f = file.create({ name: safeName, fileType: file.Type.CSV, contents, folder: Number(folderId) });
    return Number(f.save());
  }

  function submitCsvImport({ mappingId, fileId }) {
    const f = file.load({ id: Number(fileId) });
    const t = task.create({ taskType: task.TaskType.CSV_IMPORT, mappingId: Number(mappingId), importFile: f });
    return t.submit();
  }

  function waitForSalesOrderResolutionW460(options) {
    const started = Date.now();
    const maxMs = 26000;
    const pauseMs = 1800;
    const attempts = [];
    let lastLookup = null;
    for (let attempt = 1; attempt <= 12; attempt += 1) {
      let taskStatus = '';
      try {
        if (options && options.taskId) {
          const status = task.checkStatus({ taskId: String(options.taskId) });
          taskStatus = status && status.status || '';
        }
      } catch (statusError) {
        taskStatus = `status_check_failed:${statusError && statusError.name || ''}`;
      }
      lastLookup = resolveSalesOrderFromSavedSearchW458(Object.assign({}, options || {}, {
        source: attempt === 1 ? options && options.source || 'runner_after_csv_submit' : 'runner_after_csv_submit_retry_w460'
      }));
      attempts.push({
        attempt,
        elapsedMs: Date.now() - started,
        taskStatus,
        lookupStatus: lastLookup && lastLookup.status || ''
      });
      if (lastLookup && lastLookup.status === 'resolved') {
        lastLookup.attempts = attempts;
        lastLookup.waitStatusW460 = 'resolved_after_csv_submit_poll';
        return lastLookup;
      }
      if (Date.now() - started >= maxMs) break;
      const until = Date.now() + pauseMs;
      while (Date.now() < until) {
        // Bounded wait so the CSV import can commit before the saved-search lookup.
      }
    }
    lastLookup = lastLookup || resolveSalesOrderFromSavedSearchW458(options || {});
    lastLookup.attempts = attempts;
    lastLookup.waitStatusW460 = 'not_resolved_after_csv_submit_poll';
    lastLookup.maxWaitMs = maxMs;
    lastLookup.demandRecordRolePolicy = 'sales_order_only_never_work_order';
    return lastLookup;
  }

  function resolveSalesOrderFromSavedSearchW458(options) {
    const extId = str(options && options.extId);
    const expectedProspect = str(options && options.prospect);
    const telemetry = {
      schema: 'idb.sales-order-saved-search-resolution.w458.v1',
      status: 'not_found',
      source: options && options.source || '',
      searchId: SALES_ORDER_LOOKUP_SEARCH_ID_W458,
      searchInternalId: SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458,
      expectedExternalId: extId,
      expectedProspect,
      expectedWebsite: options && options.website || '',
      expectedRole: 'sales_order',
      demandRecordRolePolicy: 'sales_order_only_never_work_order',
      rowsScanned: 0,
      rejectedRows: []
    };
    if (!extId) {
      telemetry.status = 'missing_expected_external_id';
      return telemetry;
    }
    try {
      const saved = loadSalesOrderLookupSearchW458();
      const rows = saved.run().getRange({ start: 0, end: 1000 }) || [];
      telemetry.rowsScanned = rows.length;
      const matches = [];
      rows.forEach(function(row) {
        const mapped = mapSalesOrderLookupRowW458(row);
        if (!mapped.internalId) return;
        const haystack = String(mapped.haystack || '').toLowerCase();
        const exactExternalId = String(mapped.externalId || '').trim() === extId;
        const containsExternalId = haystack.indexOf(extId.toLowerCase()) !== -1;
        if (!exactExternalId && !containsExternalId) {
          if (telemetry.rejectedRows.length < 5) {
            telemetry.rejectedRows.push({
              internalId: mapped.internalId,
              tranid: mapped.tranid,
              reason: 'external_id_did_not_match_current_run'
            });
          }
          return;
        }
        const prospectMatch = !expectedProspect || haystack.indexOf(expectedProspect.toLowerCase()) !== -1;
        matches.push(Object.assign({}, mapped, {
          exactExternalId,
          prospectMatch
        }));
      });
      telemetry.matches = matches.map(function(match) {
        return {
          internalId: match.internalId,
          tranid: match.tranid,
          status: match.status,
          externalId: match.externalId,
          entityName: match.entityName,
          exactExternalId: match.exactExternalId === true,
          prospectMatch: match.prospectMatch === true
        };
      });
      if (!matches.length) {
        telemetry.status = 'not_found';
        telemetry.reason = 'FORGE SO lookup saved search returned no Sales Order row for the current CSV external id.';
        return telemetry;
      }
      const exact = matches.filter(function(match) { return match.exactExternalId === true; });
      const eligible = exact.length ? exact : matches;
      if (eligible.length > 1) {
        telemetry.status = 'ambiguous';
        telemetry.reason = 'FORGE SO lookup returned multiple Sales Order rows for the current external id.';
        return telemetry;
      }
      const resolved = eligible[0];
      telemetry.status = 'resolved';
      telemetry.record = {
        role: 'sales_order',
        type: 'salesorder',
        id: resolved.internalId,
        internalId: resolved.internalId,
        tranid: resolved.tranid,
        name: resolved.tranid || `Sales Order ${resolved.internalId}`,
        status: resolved.status,
        externalId: resolved.externalId || extId,
        memo: resolved.memo,
        entityName: resolved.entityName,
        amount: resolved.amount,
        dateCreated: resolved.dateCreated,
        url: recordUrlW453('salesorder', resolved.internalId)
      };
      return telemetry;
    } catch (e) {
      telemetry.status = 'lookup_failed';
      telemetry.errorName = e && e.name || '';
      telemetry.errorMessage = e && e.message || String(e || '');
      return telemetry;
    }
  }

  function loadSalesOrderLookupSearchW458() {
    try {
      return search.load({ id: SALES_ORDER_LOOKUP_SEARCH_ID_W458 });
    } catch (e) {
      return search.load({ id: SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458 });
    }
  }

  function mapSalesOrderLookupRowW458(row) {
    const out = {
      internalId: String(row && (row.id || '') || '').trim(),
      values: [],
      haystack: ''
    };
    const columns = row && row.columns || [];
    columns.forEach(function(column) {
      let value = '';
      let text = '';
      try { value = row.getValue(column); } catch (e1) { value = ''; }
      try { text = row.getText(column); } catch (e2) { text = ''; }
      const key = String(column && (column.label || column.name || column.join || '') || '').toLowerCase();
      const printable = String(value || text || '').trim();
      if (!printable) return;
      out.values.push(printable);
      if (!out.internalId && /internal\s*id|internalid/.test(key) && /^\d+$/.test(printable)) out.internalId = printable;
      if (!out.externalId && /external\s*id|externalid/.test(key)) out.externalId = printable;
      if (!out.tranid && /document\s*number|tranid/.test(key)) out.tranid = printable;
      if (!out.status && /status/.test(key)) out.status = printable;
      if (!out.memo && /memo/.test(key)) out.memo = printable;
      if (!out.entityName && /^name$|entity|customer/.test(key)) out.entityName = printable;
      if (!out.amount && /amount/.test(key)) out.amount = printable;
      if (!out.dateCreated && /date\s*created|created/.test(key)) out.dateCreated = printable;
    });
    out.haystack = out.values.join(' ');
    return out;
  }

  // ----------------------------
  // IDB drawer sidecar bridge
  // ----------------------------
  function writeIdbSidecarResultCaptureW453(args) {
    const folderId = Number(args && args.folderId || 0);
    if (!folderId) return null;

    const extId = str(args.extId);
    const ids = args.ids || {};
    const names = args.names || {};
    const namingPayload = args.namingPayload || {};
    const confirmed = args.confirmedBuildRequestJson || {};
    const now = new Date().toISOString();
    const sourceRequestId = firstNonBlankTextW453(
      confirmed.sourceRequestId,
      confirmed.requestId,
      confirmed.buildAttemptProvenance && confirmed.buildAttemptProvenance.sourceRequestId,
      extId
    );
    const buildAttemptId = firstNonBlankTextW453(
      confirmed.buildAttemptId,
      confirmed.buildAttemptProvenance && confirmed.buildAttemptProvenance.buildAttemptId,
      extId
    );
    const submittedAt = firstNonBlankTextW453(
      confirmed.submittedAt,
      confirmed.buildAttemptProvenance && confirmed.buildAttemptProvenance.submittedAt,
      now
    );

    const customerId = findByExternalId('customer', ANCHORS.customer);
    const records = {};
    records.customer = normalizeIdbRecordW453({
      role: 'customer',
      type: 'customer',
      label: 'Customer',
      name: `${args.prospect} Customer Account`,
      id: customerId
    });
    records.customer.currentRunIdentityW457 = args.customerIdentityTelemetryW457 || null;
    records.customer.identityValidationStatus = args.customerIdentityTelemetryW457 && args.customerIdentityTelemetryW457.status || 'current_run_identity_not_checked';
    records.customer.website = args.website || '';
    records.customer.expectedProspect = args.prospect || '';
    const resolvedSalesOrderW458 = buildResolvedSalesOrderRecordW458({
      lookup: args.salesOrderLookupW458,
      extId,
      prospect: args.prospect,
      website: args.website
    });
    records.demoTransaction = resolvedSalesOrderW458 || buildPendingDemoTransactionW453({
      extId,
      prospect: args.prospect,
      soFileId: args.soFileId,
      soTaskId: args.soTaskId
    });
    if (resolvedSalesOrderW458) records.salesOrder = resolvedSalesOrderW458;
    records.heroItem = normalizeIdbRecordW453({
      role: 'hero_item',
      type: 'inventoryitem',
      label: args.enableManufacturing ? 'Sellable item' : 'Hero item',
      name: names.hero_item_name || `${args.prospect} Finished Good`,
      id: ids.heroItemId
    });

    const componentItems = [];
    if (args.enableManufacturing) {
      records.assembly = normalizeIdbRecordW453({
        role: 'assembly',
        type: 'assemblyitem',
        label: 'Assembly',
        name: names.assembly_name || names.hero_item_name || `${args.prospect} Assembly`,
        id: ids.assemblyId
      });
      records.bom = normalizeIdbRecordW453({
        role: 'bom',
        type: 'bom',
        label: 'BOM',
        name: names.bom_name || `BOM - ${args.prospect}`,
        id: ids.bomId
      });
      records.bomRevision = normalizeIdbRecordW453({
        role: 'bom_revision',
        type: 'bomrevision',
        label: 'BOM revision',
        name: names.bom_revision_name || `Revision 1 - ${args.prospect}`,
        id: ids.bomRevId
      });
      [
        { id: ids.comp1Id, name: names.component_names && names.component_names[0] },
        { id: ids.comp2Id, name: names.component_names && names.component_names[1] },
        { id: ids.comp3Id, name: names.component_names && names.component_names[2] }
      ].forEach(function(component, index) {
        const item = normalizeIdbRecordW453({
          role: 'component_item',
          type: 'inventoryitem',
          label: `Component item ${index + 1}`,
          name: component.name || `${args.prospect} Component ${index + 1}`,
          id: component.id
        });
        item.componentIndex = index;
        records[`componentItem${index + 1}`] = item;
        componentItems.push(item);
      });

      if (args.enableWip && args.woId) {
        records.workOrder = normalizeIdbRecordW453({
          role: 'work_order',
          type: 'workorder',
          label: 'Work Order',
          name: `WO - ${names.assembly_name || names.hero_item_name || args.prospect}`,
          id: args.woId
        });
      } else if (args.enableWip && args.workOrderTelemetry && args.workOrderTelemetry.status !== 'created') {
        records.workOrderDiagnostic = buildWorkOrderDiagnosticW453(args);
      }
    }

    const routingOperations = args.enableWip ? operationPlanRowsW453({
      names,
      routingResult: args.routingResult,
      routingRecord: null
    }) : [];
    if (args.enableWip && args.routingId) {
      records.routing = normalizeIdbRecordW453({
        role: 'routing',
        type: 'manufacturingrouting',
        label: 'Routing',
        name: args.routingResult && (args.routingResult.routingName || args.routingResult.name) || names.routing_name || `Routing - ${args.prospect}`,
        id: args.routingId
      });
      routingOperations.forEach(function(op) {
        op.routingId = String(args.routingId);
        op.url = '';
        op.openableUrl = '';
        op.linkAuthority = { status: 'planned_operation_not_record_link', openable: false, url: '' };
        op.plannedOnly = true;
      });
    } else if (args.enableWip) {
      records.routingDiagnostic = buildRoutingDiagnosticW453(args);
    }

    const generatedRecordOwner = 'governed_runner_internal_build_engine';
    const payload = {
      schema: 'idb.runner-generated-names-result.w453.v1',
      status: args.enableWip && !args.routingId ? 'completed_with_wip_diagnostic' : 'completed',
      runStatus: args.enableWip && !args.routingId ? 'completed_with_wip_diagnostic' : 'completed',
      generatedRecordOwner,
      recordOwner: generatedRecordOwner,
      extId,
      generatedExtId: extId,
      sourceRequestId,
      buildAttemptId,
      submittedAt,
      prospect: args.prospect,
      customerName: args.prospect,
      website: args.website,
      notesDigest: summarizeOneLine(args.notes || args.agenda || ''),
      enableManufacturing: !!args.enableManufacturing,
      enableWip: !!args.enableWip,
      toggles: {
        createNewHeroItem: true,
        enableManufacturing: !!args.enableManufacturing,
        enableWip: !!args.enableWip
      },
      resolvedOperatingMode: args.enableWip ? 'wip_manufacturing' : (args.enableManufacturing ? 'discrete_manufacturing' : 'distribution_replenishment'),
      records,
      customer: records.customer,
      demoTransaction: records.demoTransaction,
      salesOrder: records.demoTransaction,
      heroItem: records.heroItem,
      assembly: records.assembly || null,
      bom: records.bom || null,
      bomRevision: records.bomRevision || null,
      workOrder: records.workOrder || null,
      workOrderDiagnostics: records.workOrderDiagnostic || null,
      routing: records.routing || null,
      routingDiagnostic: records.routingDiagnostic || null,
      routingResult: args.enableWip ? (args.routingResult || null) : null,
      routingOperations,
      componentItems,
      csvSalesOrderArtifacts: [{
        label: 'Sales Order CSV import',
        name: `scai_so_${extId}.csv`,
        id: String(args.soFileId || ''),
        taskId: String(args.soTaskId || ''),
        status: 'submitted_pending_transaction_resolution',
        source: 'dcc_final'
      }],
      transactionResolution: resolvedSalesOrderW458 ? {
        status: 'sales_order_resolved_by_saved_search',
        authority: 'FORGE SO lookup saved search',
        savedSearchId: SALES_ORDER_LOOKUP_SEARCH_ID_W458,
        savedSearchInternalId: SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458,
        csvImportFileId: String(args.soFileId || ''),
        csvImportTaskId: String(args.soTaskId || ''),
        expectedExternalId: extId,
        matchedExternalId: resolvedSalesOrderW458.externalId || extId,
        matchedSalesOrderId: resolvedSalesOrderW458.internalId || resolvedSalesOrderW458.id || '',
        matchedTranid: resolvedSalesOrderW458.tranid || resolvedSalesOrderW458.name || '',
        demandRecordRolePolicy: 'sales_order_only_never_work_order',
        salesOrderLookupW458: args.salesOrderLookupW458 || null
      } : {
        status: 'pending_transaction_resolution',
        csvImportFileId: String(args.soFileId || ''),
        csvImportTaskId: String(args.soTaskId || ''),
        expectedExternalId: extId,
        savedSearchId: SALES_ORDER_LOOKUP_SEARCH_ID_W458,
        savedSearchInternalId: SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458,
        salesOrderLookupW458: args.salesOrderLookupW458 || null,
        demandRecordRolePolicy: 'sales_order_only_never_work_order',
        demandDiagnostic: {
          status: 'sales_order_pending_transaction_resolution',
          reason: 'Sales Order CSV import was submitted but FORGE SO lookup did not return a current-run Sales Order internal id in this runner result.',
          expectedRole: 'sales_order',
          blockedLinkRole: 'work_order',
          noFakeOpenLink: true
        }
      },
      currentRunIdentityChecksW457: {
        expectedProspect: args.prospect,
        expectedWebsite: args.website,
        expectedProduct: names.hero_item_name || names.primary_product_candidate || names.selectedProductName || '',
        expectedExternalId: extId,
        expectedMemoSubstring: extId,
        expectedRecordRoles: {
          customer: 'customer',
          demand: 'salesorder'
        },
        customer: args.customerIdentityTelemetryW457 || null,
        salesOrder: resolvedSalesOrderW458 && resolvedSalesOrderW458.currentRunIdentityW457 || {
          status: 'pending_transaction_resolution',
          expectedExternalId: extId,
          role: 'sales_order',
          notWorkOrder: true
        }
      },
      reusedRecordOverwriteTelemetryW457: args.reusedRecordOverwriteTelemetryW457 || null,
      productBuildPlanW432: buildProductBuildPlanFromNamesW453(args),
      runnerLaneVocabularyPolicy: runnerLaneVocabularyPolicyW453(args),
      namingFileId: namingPayload.fileId || null,
      namingDiscoveryMode: namingPayload.discoveryMode || '',
      namingPayloadFound: !!namingPayload.found,
      namingPayloadParsed: !!namingPayload.parsed,
      namingPayloadApplied: !!namingPayload.applied,
      namingSource: namingPayload.source || names._source || 'deterministic',
      namingEvidenceSource: names.namingEvidenceSource || names._source || '',
      namingConfidence: names.namingConfidence || names.confidencePercent || null,
      catalogCandidates: names.catalogCandidates || [],
      selectedCatalogCandidate: names.selectedCatalogCandidate || null,
      selectedCatalogCandidateSource: names.selectedCatalogCandidateSource || '',
      selectedCatalogCandidateReasons: names.selectedCatalogCandidateReasons || [],
      websiteEvidenceSource: names.websiteEvidenceSource || '',
      websiteEvidenceSourceUrls: names.websiteEvidenceSourceUrls || [],
      genericCandidateRejectedReasons: names.genericCandidateRejectedReasons || [],
      missingEvidence: names.missingEvidence || [],
      productEvidenceConfidence: names.productEvidenceConfidence || names.namingConfidence || names.confidencePercent || null,
      websiteCatalogEvidenceUsed: names.websiteCatalogEvidenceUsed === true,
      llmCatalogInterpretationUsed: names.llmCatalogInterpretationUsed === true,
      deterministicCatalogRankerUsed: names.deterministicCatalogRankerUsed === true,
      fallbackUsed: names.fallbackUsed === true,
      fallbackReason: names.fallbackReason || '',
      fallbackTruthW458: {
        fallbackUsed: names.fallbackUsed === true,
        fallbackReason: names.fallbackReason || '',
        genericCatalogProductBlocked: /^catalog product$/i.test(String(names.selectedProductName || names.primary_product_candidate || '')) && names.fallbackUsed !== true
      },
      productSignalsUsed: names.productSignalsUsed || [],
      flavorSignalsUsed: names.flavorSignalsUsed || [],
      packSignalsUsed: names.packSignalsUsed || [],
      llmNamingAdvisoryUsed: names.llmNamingAdvisoryUsed === true,
      websiteSignalsUsed: names.websiteSignalsUsed || [],
      prospectNameUsedAsFallbackOnly: names.prospectNameUsedAsFallbackOnly === true,
      selectedProductName: names.selectedProductName || names.primary_product_candidate || '',
      selectedVariantName: names.selectedVariantName || '',
      selectedPackName: names.selectedPackName || '',
      workOrderTelemetry: args.workOrderTelemetry || null,
      openLinkPreconditions: {
        realUrlsOnly: true,
        numericInternalIds: true,
        supportedNetSuiteUrls: true,
        fakeLinksBlockedBeforeImport: true
      },
      warnings: args.enableWip && !args.routingId ? ['WIP was requested but the legacy routing core returned a diagnostic instead of a routing id.'] : [],
      errors: []
    };
    const displayReadyRecords = displayReadyRecordsFromKeyedRecordsW455(records);
    payload.displayReadyRecords = displayReadyRecords;
    payload.recordsArray = displayReadyRecords;
    payload.displayRecords = displayReadyRecords;

    const resultCapture = {
      schema: 'idb.runner-result-capture.w453.v1',
      status: payload.status,
      runnerStatus: payload.status,
      taskStatus: payload.status,
      idempotencyToken: extId,
      sourceRequestId,
      buildAttemptId,
      submittedAt,
      runnerTaskId: String(args.soTaskId || ''),
      taskId: String(args.soTaskId || ''),
      queueTaskId: String(args.soTaskId || ''),
      resultCaptureFolderId: folderId,
      finalGeneratedNamesJson: payload,
      completedResultJson: payload,
      generatedNamesJson: payload,
      sidecarGeneratedNamesJson: payload,
      partialGeneratedNamesJson: payload,
      displayReadyRecords,
      recordsArray: displayReadyRecords,
      displayRecords: displayReadyRecords,
      routingResult: args.enableWip ? (args.routingResult || null) : null,
      routingDiagnostics: records.routingDiagnostic || null,
      routingOperations,
      workOrderTelemetry: args.workOrderTelemetry || null,
      transactionResolution: payload.transactionResolution,
      realMissingUrls: computeRealMissingUrlsW453(records),
      plannedOrDiagnosticRows: Object.keys(records).filter(function(key) {
        const rec = records[key];
        return rec && (rec.plannedOnly || rec.diagnosticOnly || /diagnostic/i.test(String(rec.role || '')));
      })
    };
    const saved = saveTextArtifactW453({
      folderId,
      name: resultCaptureFileNameW453({ extId, buildAttemptId, status: payload.status }),
      contents: JSON.stringify(resultCapture)
    });
    return {
      status: resultCapture.status,
      fileId: saved.fileId,
      fileName: saved.fileName,
      folderId,
      finalGeneratedNamesJsonReady: true,
      runnerTaskId: resultCapture.runnerTaskId,
      taskId: resultCapture.taskId,
      returnedCount: Object.keys(records).length,
      realMissingUrlCount: resultCapture.realMissingUrls.length
    };
  }

  function writeIdbErrorSidecarResultCaptureW453(args) {
    const folderId = Number(args && args.folderId || 0);
    const extId = str(args && args.extId) || `IDB-error-${Date.now()}`;
    const error = args && args.error || {};
    const payload = {
      schema: 'idb.runner-result-capture.w453.error.v1',
      status: 'error',
      runnerStatus: 'error',
      taskStatus: 'error',
      runStatus: 'error',
      idempotencyToken: extId,
      extId,
      prospect: args && args.prospect || '',
      website: args && args.website || '',
      notesDigest: summarizeOneLine(args && (args.notes || args.agenda) || ''),
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      error: {
        name: error && error.name || '',
        message: error && error.message || String(error || ''),
        stack: error && error.stack || ''
      },
      finalGeneratedNamesJson: null,
      completedResultJson: null,
      sidecarGeneratedNamesJson: null,
      partialGeneratedNamesJson: null
    };
    const saved = saveTextArtifactW453({
      folderId,
      name: resultCaptureFileNameW453({ extId, buildAttemptId: 'error', status: 'error' }),
      contents: JSON.stringify(payload)
    });
    return { status: 'error', fileId: saved.fileId, fileName: saved.fileName, folderId };
  }

  function saveTextArtifactW453({ folderId, name, contents }) {
    const text = String(contents || '');
    const maxChars = 9000000;
    const body = text.length > maxChars ? text.slice(0, maxChars) : text;
    const safeName = boundedFileNameW461(name || `idb_result_${Date.now()}.json`, 180);
    const f = file.create({ name: safeName, fileType: file.Type.PLAINTEXT, contents: body, folder: Number(folderId) });
    return { fileId: Number(f.save()), fileName: safeName };
  }

  function resultCaptureFileNameW453({ extId, buildAttemptId, status }) {
    const source = `${extId || 'idb'}_${buildAttemptId || ''}_${status || 'result'}`;
    const stem = safeCode(source) || 'idb_result';
    return boundedFileNameW461(`idb_result_capture_w453_${stem}_${shortHashW461(source)}.json`, 180);
  }

  function boundedFileNameW461(name, maxLen) {
    const limit = Math.max(20, Math.min(Number(maxLen || 180), 180));
    const cleaned = String(name || 'idb_file.txt')
      .replace(/[\\/:*?"<>|#%&{}$!'@+=`~]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (cleaned.length <= limit) return cleaned || 'idb_file.txt';
    const dot = cleaned.lastIndexOf('.');
    const ext = dot > 0 && cleaned.length - dot <= 12 ? cleaned.slice(dot) : '';
    const base = ext ? cleaned.slice(0, dot) : cleaned;
    const suffix = `_${shortHashW461(cleaned)}`;
    const baseLimit = Math.max(8, limit - ext.length - suffix.length);
    return `${base.slice(0, baseLimit)}${suffix}${ext}`;
  }

  function shortHashW461(value) {
    const text = String(value || '');
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
    }
    return (`00000000${(hash >>> 0).toString(16)}`).slice(-8);
  }

  function normalizeIdbRecordW453({ role, type, label, name, id }) {
    const internalId = id ? String(id) : '';
    const url = internalId ? recordUrlW453(type, internalId) : '';
    return {
      role,
      type,
      recordType: type,
      label: label || role,
      name: name || label || role,
      recordName: name || label || role,
      internalId,
      id: internalId,
      url,
      openableUrl: url,
      source: 'dcc_final',
      linkAuthority: {
        status: url ? 'verified_openable' : 'missing_url',
        openable: !!url,
        url
      }
    };
  }

  function buildPendingDemoTransactionW453({ extId, prospect, soFileId, soTaskId }) {
    return {
      role: 'sales_order',
      type: 'salesorder',
      recordType: 'salesorder',
      label: 'Sales Order / demo transaction',
      name: `Sales Order pending import - ${prospect || extId}`,
      recordName: `Sales Order pending import - ${prospect || extId}`,
      internalId: '',
      id: '',
      url: '',
      openableUrl: '',
      source: 'dcc_final',
      status: 'pending_transaction_resolution',
      expectedExternalId: extId,
      csvImportFileId: String(soFileId || ''),
      csvImportTaskId: String(soTaskId || ''),
      demandDiagnostic: 'Sales Order CSV import is pending; no Work Order is mapped as demand.',
      currentRunIdentityW457: {
        role: 'sales_order',
        expectedExternalId: extId,
        status: 'pending_transaction_resolution',
        notWorkOrder: true
      },
      linkAuthority: {
        status: 'pending_transaction_resolution',
        openable: false,
        url: ''
      }
    };
  }

  function buildResolvedSalesOrderRecordW458(options) {
    const lookup = options && options.lookup || {};
    const sourceRecord = lookup && lookup.record || {};
    const internalId = String(sourceRecord.id || sourceRecord.internalId || '').trim();
    if (lookup.status !== 'resolved' || !/^\d+$/.test(internalId)) return null;
    const tranid = String(sourceRecord.tranid || sourceRecord.name || `Sales Order ${internalId}`).trim();
    const rec = normalizeIdbRecordW453({
      role: 'sales_order',
      type: 'salesorder',
      label: 'Sales Order',
      name: tranid,
      id: internalId
    });
    rec.status = sourceRecord.status || '';
    rec.tranid = sourceRecord.tranid || tranid;
    rec.externalId = sourceRecord.externalId || options.extId || '';
    rec.memo = sourceRecord.memo || '';
    rec.entityName = sourceRecord.entityName || '';
    rec.amount = sourceRecord.amount || '';
    rec.dateCreated = sourceRecord.dateCreated || '';
    rec.currentRunIdentityW457 = {
      status: 'current_run_identity_verified',
      role: 'sales_order',
      expectedRole: 'sales_order',
      expectedExternalId: options.extId || '',
      matchedExternalId: sourceRecord.externalId || options.extId || '',
      expectedProspect: options.prospect || '',
      expectedWebsite: options.website || '',
      savedSearchId: SALES_ORDER_LOOKUP_SEARCH_ID_W458,
      savedSearchInternalId: SALES_ORDER_LOOKUP_SEARCH_INTERNAL_ID_W458,
      matchedSalesOrderId: internalId,
      matchedTranid: sourceRecord.tranid || tranid,
      notWorkOrder: true
    };
    rec.identityValidationStatus = rec.currentRunIdentityW457.status;
    rec.linkAuthority = {
      status: 'verified_openable_current_run',
      openable: true,
      url: rec.url
    };
    return rec;
  }

  function buildWorkOrderDiagnosticW453(args) {
    const telemetry = args.workOrderTelemetry || {};
    return {
      role: 'work_order_diagnostic',
      type: 'workorder_diagnostic',
      recordType: 'workorder_diagnostic',
      label: 'Work Order Diagnostic',
      name: `Work Order Diagnostic - ${args.names && (args.names.assembly_name || args.names.hero_item_name) || args.prospect}`,
      recordName: `Work Order Diagnostic - ${args.names && (args.names.assembly_name || args.names.hero_item_name) || args.prospect}`,
      internalId: '',
      id: '',
      url: '',
      openableUrl: '',
      source: 'dcc_final',
      diagnosticOnly: true,
      status: telemetry.status || 'best_effort_failed',
      reason: telemetry.errorMessage || telemetry.failureType || 'Work Order was not returned by the legacy runner core.',
      telemetry,
      linkAuthority: { status: 'diagnostic_only', openable: false, url: '' }
    };
  }

  function buildRoutingDiagnosticW453(args) {
    const failure = args.routingResult && (args.routingResult.routingFailure || args.routingResult.failure) || {};
    const result = args.routingResult || {};
    return {
      role: 'routingDiagnostic',
      type: 'manufacturingrouting_diagnostic',
      recordType: 'manufacturingrouting_diagnostic',
      label: 'Routing Diagnostic',
      name: `Routing Diagnostic - ${args.names && (args.names.routing_name || args.names.hero_item_name) || args.prospect}`,
      recordName: `Routing Diagnostic - ${args.names && (args.names.routing_name || args.names.hero_item_name) || args.prospect}`,
      internalId: '',
      id: '',
      url: '',
      openableUrl: '',
      source: 'dcc_final',
      diagnosticOnly: true,
      expectedRoutingName: args.names && args.names.routing_name || '',
      staleRoutingDetected: result.staleRoutingDetected === true,
      staleRoutingName: result.staleRoutingName || '',
      staleRoutingId: result.staleRoutingId || null,
      assemblyBomProof: result.assemblyBomProof || failure.assemblyBomProof || null,
      routingBomFieldSkippedBecauseAssemblyBomVerified: result.routingBomFieldSkippedBecauseAssemblyBomVerified === true,
      rejectedBomFieldError: result.rejectedBomFieldError || failure.rejectedBomFieldError || null,
      attachDefaultVerification: result.attachDefaultVerification || null,
      nextFixHint: failure.nextFixHint || 'Verify the assembly BOM/BOM Revision context and routing form field compatibility, then rerun WIP routing.',
      status: args.routingResult && args.routingResult.status || 'failed_best_effort',
      reason: failure.errorMessage || failure.failureStage || args.routingResult && args.routingResult.decision || 'Routing was requested but no routing id was returned.',
      routingResult: args.routingResult || null,
      linkAuthority: { status: 'diagnostic_only', openable: false, url: '' }
    };
  }

  function operationPlanRowsW453({ names, routingResult }) {
    const fromResult = routingResult && (routingResult.operationRows || routingResult.routingOperations);
    if (Array.isArray(fromResult) && fromResult.length) return fromResult.slice(0, 3);
    const opNames = resolveRoutingNames({ prospect: '', signalText: '', names: names || {} });
    return [
      buildRoutingOperationRowW453(1, 10, opNames.op10 || 'Operation 10', null, null),
      buildRoutingOperationRowW453(2, 20, opNames.op20 || 'Operation 20', null, null),
      buildRoutingOperationRowW453(3, 30, opNames.op30 || 'Operation 30', null, null)
    ].map(function(op) {
      op.plannedOnly = true;
      op.linkAuthority = { status: 'planned_operation_not_record_link', openable: false, url: '' };
      return op;
    });
  }

  function buildRoutingOperationRowW453(index, seq, opName, center, template) {
    return {
      role: 'routing_operation',
      type: 'routing_operation',
      recordType: 'routing_operation',
      label: `Operation ${index}`,
      name: `Operation ${index} ${opName}`,
      recordName: `Operation ${index} ${opName}`,
      sequence: Number(seq),
      operationSequence: Number(seq),
      operationName: String(opName || '').slice(0, 60),
      centerId: center && center.id ? String(center.id) : '',
      centerName: center && center.name || '',
      templateId: template && template.id ? String(template.id) : '',
      templateName: template && template.name || '',
      internalId: '',
      id: '',
      url: '',
      openableUrl: '',
      source: 'dcc_final',
      plannedOnly: true,
      linkAuthority: { status: 'planned_operation_not_record_link', openable: false, url: '' }
    };
  }

  function displayReadyRecordsFromKeyedRecordsW455(records) {
    const out = [];
    const push = function(value) {
      if (!value || typeof value !== 'object') return;
      if (value.plannedOnly || /^operation\d+$/i.test(String(value.role || value.outputRole || ''))) return;
      if (value.diagnosticOnly && !/routing|work\s*order|workorder/i.test(String(value.role || value.label || value.recordType || value.type || ''))) return;
      out.push(value);
    };
    [
      'customer',
      'demoTransaction',
      'salesOrder',
      'heroItem',
      'assembly',
      'bom',
      'bomRevision',
      'componentItem1',
      'componentItem2',
      'componentItem3',
      'routing',
      'routingDiagnostic',
      'workOrder',
      'workOrderDiagnostic'
    ].forEach(function(key) { push(records && records[key]); });
    return out;
  }

  function runnerLaneVocabularyPolicyW453(args) {
    return {
      schema: 'idb.runner-lane-vocabulary-policy.w453.v1',
      mode: args.enableWip ? 'wip_manufacturing' : (args.enableManufacturing ? 'discrete_manufacturing' : 'distribution_replenishment'),
      finalResultRoleLabels: {
        heroItem: args.enableManufacturing ? 'Sellable item' : 'Hero item',
        componentItem: args.enableManufacturing ? 'Ingredient / component item' : 'Component item'
      }
    };
  }

  function buildProductBuildPlanFromNamesW453(args) {
    const names = args.names || {};
    return {
      schema: 'idb.product-build-plan.w453.from-naming-pack.v1',
      primaryProductCandidate: names.primary_product_candidate || names.hero_item_name || args.prospect || '',
      alternateProductCandidates: Array.isArray(names.alternate_product_candidates) ? names.alternate_product_candidates : [],
      selectedProductReason: 'Applied by restored legacy runner naming-pack path.',
      productCandidateSource: names._source || args.namingPayload && args.namingPayload.source || 'legacy_runner_naming_pack',
      confidencePercent: Number(names.confidencePercent || names.confidence_percent || 0) || null,
      evidenceTerms: Array.isArray(names.evidence_terms) ? names.evidence_terms : [],
      namingEvidenceSource: names.namingEvidenceSource || names._source || '',
      namingConfidence: names.namingConfidence || names.confidencePercent || null,
      catalogCandidates: names.catalogCandidates || [],
      selectedCatalogCandidate: names.selectedCatalogCandidate || null,
      selectedCatalogCandidateSource: names.selectedCatalogCandidateSource || '',
      selectedCatalogCandidateReasons: names.selectedCatalogCandidateReasons || [],
      websiteEvidenceSource: names.websiteEvidenceSource || '',
      websiteEvidenceSourceUrls: names.websiteEvidenceSourceUrls || [],
      genericCandidateRejectedReasons: names.genericCandidateRejectedReasons || [],
      missingEvidence: names.missingEvidence || [],
      productEvidenceConfidence: names.productEvidenceConfidence || names.namingConfidence || names.confidencePercent || null,
      websiteCatalogEvidenceUsed: names.websiteCatalogEvidenceUsed === true,
      llmCatalogInterpretationUsed: names.llmCatalogInterpretationUsed === true,
      deterministicCatalogRankerUsed: names.deterministicCatalogRankerUsed === true,
      fallbackUsed: names.fallbackUsed === true,
      productSignalsUsed: names.productSignalsUsed || [],
      flavorSignalsUsed: names.flavorSignalsUsed || [],
      packSignalsUsed: names.packSignalsUsed || [],
      llmNamingAdvisoryUsed: names.llmNamingAdvisoryUsed === true,
      websiteSignalsUsed: names.websiteSignalsUsed || [],
      prospectNameUsedAsFallbackOnly: names.prospectNameUsedAsFallbackOnly === true,
      fallbackReason: names.fallbackReason || '',
      selectedProductName: names.selectedProductName || names.primary_product_candidate || '',
      selectedVariantName: names.selectedVariantName || '',
      selectedPackName: names.selectedPackName || '',
      nextCandidateHint: ''
    };
  }

  function computeRealMissingUrlsW453(records) {
    return Object.keys(records || {}).map(function(key) { return records[key]; }).filter(function(rec) {
      if (!rec || rec.plannedOnly || rec.diagnosticOnly) return false;
      if (/diagnostic/i.test(String(rec.role || ''))) return false;
      return !(rec.linkAuthority && rec.linkAuthority.openable);
    }).map(function(rec) {
      return { role: rec.role, label: rec.label, name: rec.name, status: rec.linkAuthority && rec.linkAuthority.status || 'missing_url' };
    });
  }

  function recordUrlW453(type, id) {
    const internalId = String(id || '').trim();
    if (!internalId) return '';
    const pathByType = {
      customer: '/app/common/entity/custjob.nl',
      salesorder: '/app/accounting/transactions/salesord.nl',
      inventoryitem: '/app/common/item/item.nl',
      assemblyitem: '/app/common/item/item.nl',
      bom: '/app/accounting/manufacturing/bom.nl',
      bomrevision: '/app/accounting/manufacturing/bomrevision.nl',
      manufacturingrouting: '/app/accounting/manufacturing/mfgrouting.nl',
      workorder: '/app/accounting/transactions/workord.nl'
    };
    const path = pathByType[String(type || '').toLowerCase()] || '/app/common/search/searchresults.nl';
    return `${netsuiteOriginW453()}${path}?id=${encodeURIComponent(internalId)}`;
  }

  function netsuiteOriginW453() {
    const acct = String(runtime.accountId || '').replace(/_/g, '-').toLowerCase();
    return `https://${acct || 'system'}.app.netsuite.com`;
  }

  function getScriptParamAny(scriptObj, names) {
    for (let i = 0; i < (names || []).length; i++) {
      const name = names[i];
      const value = scriptObj.getParameter({ name });
      if (value !== undefined && value !== null && String(value) !== '') return value;
    }
    return '';
  }

  function parseEmbeddedJson(value) {
    const text = String(value || '').trim();
    if (!text) return null;
    try { return JSON.parse(text); } catch (e) {}
    try { return JSON.parse(decodeURIComponent(text)); } catch (e) {}
    return null;
  }

  function firstNonBlankTextW453() {
    for (let i = 0; i < arguments.length; i++) {
      const value = arguments[i];
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
    return '';
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
  function simpleHashW455(value) {
    const raw = String(value || '');
    let hash = 0;
    for (let i = 0; i < raw.length; i += 1) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36).toUpperCase();
  }

  function safeRecordExternalCodeW455(value) {
    const raw = String(value || 'RUN');
    const cleaned = raw.replace(/[^A-Za-z0-9_\-]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '') || 'RUN';
    const hash = simpleHashW455(raw).slice(0, 8) || '0';
    const prefix = cleaned.slice(0, 27).replace(/[_-]+$/g, '') || 'RUN';
    return trimLen(`${prefix}_${hash}`, 40);
  }

  function shortExtSuffix(extId) {
    const raw = String(extId || '').replace(/^SCAI_SO_/i, '').replace(/[^A-Za-z0-9]/g, '');
    if (!raw) return 'RUN';
    const tail = raw.slice(-4).toUpperCase();
    const hash = simpleHashW455(extId).slice(0, 4);
    return `${tail}${hash}`.slice(0, 8).toUpperCase();
  }

  function buildDifferentiatedNames(baseName, extId) {
    const cleanBase = String(baseName || 'Demo').replace(/^SCAI\s*-\s*/i, '').trim() || 'Demo';
    const suffix = shortExtSuffix(extId);
    const itemBase = trimLen(`SCAI - ${cleanBase}`, Math.max(20, 60 - suffix.length - 3));
    return {
      displayName: trimLen(`SCAI - ${cleanBase}`, 120),
      itemIdName: `${itemBase} - ${suffix}`,
      suffix
    };
  }

  function trimLen(s, n) { const t = String(s || '').trim(); return t.length <= n ? t : t.slice(0, n).trim(); }
  function summarizeOneLine(text) { const t = String(text || '').replace(/\s+/g, ' ').trim(); return t.length <= 160 ? t : t.slice(0, 157) + '...'; }

  function csvQuote(s) {
    const t = String(s || '');
    if (t.indexOf(',') === -1 && t.indexOf('"') === -1 && t.indexOf('\n') === -1) return t;
    return `"${t.replace(/"/g, '""')}"`;
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

  function isInvalidSubLocationErrorW453(e) {
    const name = String(e && e.name || '').toUpperCase();
    const message = String(e && (e.message || e.details) || e || '');
    return name === 'INVALID_SUB' ||
      /subsidiary restrictions/i.test(message) && /location/i.test(message) ||
      /incompatible with those defined for location/i.test(message);
  }

  function clearBodyLocationW453(rec) {
    safeTry(() => rec.setValue({ fieldId: 'location', value: null }));
    safeTry(() => rec.setValue({ fieldId: 'location', value: '' }));
  }

  return {
    execute,
    __W432_TEST_HOOKS__: {
      productBuildPlanW432,
      industryNativeManufacturingNamingW442
    }
  };
});
