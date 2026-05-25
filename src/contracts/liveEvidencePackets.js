'use strict';

const LIVE_EVIDENCE_SCHEMA_VERSION = 'forge.w272.live-evidence-packets.v1';

const SIGNOFF_STATUSES = Object.freeze({
  READY_TO_KEEP: 'ready_to_keep',
  NEEDS_ATTENTION: 'needs_attention',
  ROLLBACK_RECOMMENDED: 'rollback_recommended'
});

const REVIEW_ONLY_POLICY = Object.freeze({
  archiveOnly: true,
  externalUploadAllowed: false,
  networkCallAllowed: false,
  trackingAllowed: false,
  localStorageWriteAllowed: false,
  installActionAllowed: false,
  runtimeDependencyAdded: false
});

const CONTRACT_SHAPES = Object.freeze({
  W260_INSTALL_READY_RELEASE_PACKET: Object.freeze({
    schema: 'forge.w260.install-ready-release-packet.v1',
    requiredFields: Object.freeze([
      'installTarget',
      'updateOnly',
      'doNotUpdate',
      'noLiveRunnerInvocationRequired',
      'drawerCreatedRecordsEnabled',
      'drawerTransactionWritesEnabled',
      'smokeScript',
      'rollbackNote'
    ])
  }),
  W261_POST_INSTALL_SMOKE_CAPTURE: Object.freeze({
    schema: 'forge.w261.post-install-smoke-evidence-capture-template.v1',
    requiredFieldIds: Object.freeze([
      'install_target_drawer_only',
      'protected_surfaces_not_updated',
      'runtime_authority_unchanged',
      'launcher_opens_drawer',
      'compact_header_visible',
      'feedback_placeholder_noop',
      'pre_import_fake_links_blocked',
      'valid_import_story_ready',
      'live_proof_cta_visible',
      'coaching_receipt_expandable',
      'weak_evidence_confirmation',
      'rollback_decision_recorded'
    ])
  }),
  W266_CONTROLLED_LIVE_BUILD_RUN: Object.freeze({
    schema: 'forge.w266.controlled-live-build-run-evidence-packet.v1',
    requiredFields: Object.freeze([
      'selectedAdapterProfile',
      'submitEvidence',
      'refreshEvidence',
      'w151Validation',
      'importEvidence',
      'liveRunDecision'
    ])
  }),
  W267_SCREENSHOT_RECONCILIATION: Object.freeze({
    schema: 'forge.w267.post-live-run-screenshot-evidence-reconciliation.v1',
    requiredEvidenceRowIds: Object.freeze([
      'build_records_clicked',
      'build_submitted_state_shown',
      'refresh_build_status_state_shown',
      'records_ready_finish_build_state_shown',
      'returned_names_lane_labels_shown',
      'supported_open_links_after_import',
      'review_run_story_surfaces_visible',
      'weak_uncertainty_visible'
    ])
  }),
  W268_INSTALLED_DRAWER_INTAKE: Object.freeze({
    schema: 'forge.w268.installed-drawer-live-evidence-intake-template.v1',
    requiredMapsToW267: Object.freeze([
      'build_records_clicked',
      'build_submitted_state_shown',
      'refresh_build_status_state_shown',
      'records_ready_finish_build_state_shown',
      'returned_names_lane_labels_shown',
      'supported_open_links_after_import',
      'review_run_story_surfaces_visible',
      'weak_uncertainty_visible',
      'rawDiagnosticsHidden'
    ])
  }),
  W268_RELEASE_KEEP_PACKET: Object.freeze({
    schema: 'forge.w268.v1-release-keep-packet.v1',
    requiredFields: Object.freeze([
      'installTarget',
      'adapterProfileUsed',
      'motionRunOutcome',
      'returnedRecords',
      'openLinkVerification',
      'storySurfaceReadiness',
      'decision'
    ])
  })
});

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = clone(value[key]);
      return acc;
    }, {});
  }
  return value;
}

function reviewOnlyPolicy(overrides) {
  return Object.freeze(Object.assign({}, REVIEW_ONLY_POLICY, overrides || {}));
}

function reviewOnlyPolicyViolations(policy) {
  const checked = Object.assign({}, REVIEW_ONLY_POLICY, policy || {});
  const violations = [];
  [
    'externalUploadAllowed',
    'networkCallAllowed',
    'trackingAllowed',
    'localStorageWriteAllowed',
    'installActionAllowed',
    'runtimeDependencyAdded'
  ].forEach((key) => {
    if (checked[key] !== false) violations.push(key);
  });
  return violations;
}

function isReviewOnlyPolicySafe(policy) {
  return reviewOnlyPolicyViolations(policy).length === 0;
}

function contractShape(name) {
  return CONTRACT_SHAPES[name] || null;
}

function packetMatchesContractShape(packet, shape) {
  const target = shape || {};
  const source = packet || {};
  if (target.schema && source.schema !== target.schema) return false;
  if (Array.isArray(target.requiredFields) && !target.requiredFields.every((field) => Object.prototype.hasOwnProperty.call(source, field))) return false;
  if (Array.isArray(target.requiredFieldIds)) {
    const fields = Array.isArray(source.fields) ? source.fields : [];
    const ids = fields.map((field) => field.id);
    if (!target.requiredFieldIds.every((id) => ids.indexOf(id) >= 0)) return false;
  }
  if (Array.isArray(target.requiredEvidenceRowIds)) {
    const rows = Array.isArray(source.reviewerEvidenceRows) ? source.reviewerEvidenceRows : [];
    const ids = rows.map((row) => row.id);
    if (!target.requiredEvidenceRowIds.every((id) => ids.indexOf(id) >= 0)) return false;
  }
  if (Array.isArray(target.requiredMapsToW267)) {
    const fields = Array.isArray(source.evidenceFields) ? source.evidenceFields : [];
    const ids = fields.map((field) => field.mapsToW267);
    if (!target.requiredMapsToW267.every((id) => ids.indexOf(id) >= 0)) return false;
  }
  return true;
}

function normalizeEvidenceEntries(capture) {
  if (Array.isArray(capture)) return capture.slice();
  return Object.keys(capture || {}).map((id) => {
    const value = capture[id];
    return value && typeof value === 'object' && !Array.isArray(value)
      ? Object.assign({ id }, value)
      : { id, pass: value };
  });
}

function releaseSignoffFromEvidence(capture, fields) {
  const evidenceFields = Array.isArray(fields) ? fields : [];
  const entries = normalizeEvidenceEntries(capture);
  const byId = entries.reduce((map, item) => {
    if (item && item.id) map[item.id] = item;
    return map;
  }, {});
  const required = evidenceFields.filter((field) => field.required !== false);
  const results = required.map((field) => {
    const item = byId[field.id];
    const value = item ? item.pass : undefined;
    const pass = value === true || value === 'pass' || value === 'passed';
    return {
      id: field.id,
      label: field.label || field.id,
      pass,
      missing: !item,
      rollbackCritical: field.rollbackCritical === true,
      note: item && item.note ? String(item.note) : ''
    };
  });
  const failed = results.filter((item) => !item.pass);
  const rollbackFailures = failed.filter((item) => item.rollbackCritical);
  const status = rollbackFailures.length
    ? SIGNOFF_STATUSES.ROLLBACK_RECOMMENDED
    : failed.length
      ? SIGNOFF_STATUSES.NEEDS_ATTENTION
      : SIGNOFF_STATUSES.READY_TO_KEEP;
  return {
    schema: 'forge.w272.release-signoff.v1',
    status,
    requiredPassed: failed.length === 0,
    missingRequired: results.filter((item) => item.missing).map((item) => item.id),
    failedRequired: failed.map((item) => item.id),
    rollbackCriticalFailures: rollbackFailures.map((item) => item.id),
    reviewOnlyPolicy: reviewOnlyPolicy(),
    nextAction: status === SIGNOFF_STATUSES.READY_TO_KEEP
      ? 'Keep the reviewed release installed.'
      : status === SIGNOFF_STATUSES.ROLLBACK_RECOMMENDED
        ? 'Rollback before further demo use.'
        : 'Review failed or missing evidence before release signoff.'
  };
}

function liveRunDecision(evidence) {
  const packet = evidence || {};
  const guardrails = packet.guardrails || {};
  const validation = packet.w151Validation || packet.completedResultGuard || {};
  const importEvidence = packet.importEvidence || {};
  const submitOk = !!(packet.submitEvidence && packet.submitEvidence.runnerTaskId);
  const refreshOk = !!(packet.refreshEvidence && packet.refreshEvidence.completed && packet.refreshEvidence.completed.finalGeneratedNamesJsonReady === true);
  const validationOk = validation.completedResultAcceptedByW151 === true || validation.valid === true;
  const importOk = importEvidence.imported === true && Array.isArray(importEvidence.returnedRecords) && importEvidence.returnedRecords.length > 0;
  const openLinksOk = importEvidence.supportedOpenLinksOnly === true;
  const rollbackReasons = [];
  if (guardrails.noDrawerCreatedRecords !== true || guardrails.noDrawerTransactionWrites !== true || guardrails.approvedServerAdapterPathOnly !== true || guardrails.noW144DeploymentUpdateInThisBlock !== true) {
    rollbackReasons.push('runtime_authority_boundary_failed');
  }
  if (guardrails.fakeOpenLinksBlockedBeforeImport !== true || importEvidence.fakeOpenLinksSeen === true) rollbackReasons.push('fake_open_link_boundary_failed');
  if (validation.completedResultAcceptedByW151 === false && importEvidence.imported === true) rollbackReasons.push('invalid_completed_result_imported');
  if (importEvidence.supportedOpenLinksOnly === false) rollbackReasons.push('unsupported_open_url_detected');
  const missingRequiredEvidence = [];
  if (!submitOk) missingRequiredEvidence.push('submit_runner_task');
  if (!refreshOk) missingRequiredEvidence.push('completed_refresh');
  if (!validationOk) missingRequiredEvidence.push('w151_validation');
  if (!importOk) missingRequiredEvidence.push('imported_records');
  if (!openLinksOk) missingRequiredEvidence.push('supported_open_links');
  const newSafeShapeObserved = !!(packet.responseReconciliation && packet.responseReconciliation.safeAliasesOnly === true && packet.responseReconciliation.newAliasesObserved === true);
  const status = rollbackReasons.length
    ? SIGNOFF_STATUSES.ROLLBACK_RECOMMENDED
    : missingRequiredEvidence.length || newSafeShapeObserved
      ? SIGNOFF_STATUSES.NEEDS_ATTENTION
      : SIGNOFF_STATUSES.READY_TO_KEEP;
  return {
    schema: 'forge.w272.live-run-decision.v1',
    status,
    missingRequiredEvidence,
    rollbackReasons,
    newSafeShapeObserved,
    nextAction: status === SIGNOFF_STATUSES.READY_TO_KEEP
      ? 'Keep the connected build path enabled for the approved profile.'
      : status === SIGNOFF_STATUSES.ROLLBACK_RECOMMENDED
        ? 'Rollback or disable the connected build path before further demo use.'
        : 'Review archived live-run evidence and reconcile only safe aliases.'
  };
}

function openLinkVerificationCapture(records, reviewerOpenLinks) {
  const evidence = reviewerOpenLinks || {};
  const rows = (Array.isArray(records) ? records : []).map((record) => {
    const keyCandidates = [
      record.role,
      record.name,
      String(record.internalId || ''),
      `${record.recordType || ''}:${record.internalId || ''}`
    ].filter(Boolean);
    const matched = keyCandidates.reduce((found, key) => found || evidence[key], null) || {};
    return {
      role: record.role || '',
      label: record.label || '',
      recordName: record.name || record.recordName || '',
      netSuiteRecordType: record.recordType || record.netSuiteRecordType || '',
      internalId: record.internalId || '',
      url: record.openUrl || record.url || '',
      expectedSupportedOpenUrl: Boolean((record.openUrl || record.url) && /^https:\/\/[^/]+\.app\.netsuite\.com\//i.test(record.openUrl || record.url)),
      openedSuccessfully: matched.openedSuccessfully === true || matched.pass === true,
      note: matched.note || matched.notes || ''
    };
  });
  return {
    schema: 'forge.w272.open-link-verification-capture.v1',
    rows,
    allExpectedRecordsCaptured: rows.length > 0 && rows.every((row) => row.openedSuccessfully === true),
    unsupportedUrlSeen: rows.some((row) => row.expectedSupportedOpenUrl !== true)
  };
}

function screenshotSignoff(reconciliation) {
  const packet = reconciliation || {};
  const w266 = packet.w266Packet || {};
  const rows = Array.isArray(packet.reviewerEvidenceRows) ? packet.reviewerEvidenceRows : [];
  const comparison = packet.comparison || {};
  const openLinks = packet.openLinkVerification || {};
  const policy = packet.reviewOnlyPolicy || {};
  const missingRequiredEvidence = rows.filter((row) => row.required !== false && row.pass !== true).map((row) => row.id);
  const rollbackReasons = [];
  if (w266.guardrails && (w266.guardrails.noDrawerCreatedRecords !== true || w266.guardrails.noDrawerTransactionWrites !== true || w266.guardrails.approvedServerAdapterPathOnly !== true)) {
    rollbackReasons.push('runtime_authority_boundary_failed');
  }
  if (comparison.fakeOpenLinksVisible === true) rollbackReasons.push('fake_open_links_visible');
  if (comparison.unsupportedUrlsVisible === true || openLinks.unsupportedUrlSeen === true) rollbackReasons.push('unsupported_open_url_visible');
  if (comparison.invalidImportVisible === true) rollbackReasons.push('invalid_import_visible');
  if (!isReviewOnlyPolicySafe(policy)) rollbackReasons.push('review_packet_introduced_external_action');
  const requiredPass = missingRequiredEvidence.length === 0;
  const recordsAgree = comparison.expectedRecordsShown === true && comparison.laneAwareLabelsShown === true;
  const linksAgree = comparison.supportedOpenLinksOnlyAfterImport === true && openLinks.allExpectedRecordsCaptured === true;
  const hiddenDiagnostics = comparison.rawDiagnosticsHidden === true;
  const w266Ready = !!(w266.liveRunDecision && w266.liveRunDecision.status === SIGNOFF_STATUSES.READY_TO_KEEP);
  const status = rollbackReasons.length
    ? SIGNOFF_STATUSES.ROLLBACK_RECOMMENDED
    : requiredPass && recordsAgree && linksAgree && hiddenDiagnostics && w266Ready
      ? SIGNOFF_STATUSES.READY_TO_KEEP
      : SIGNOFF_STATUSES.NEEDS_ATTENTION;
  return {
    schema: 'forge.w272.screenshot-signoff.v1',
    status,
    missingRequiredEvidence,
    rollbackReasons,
    comparison: { w266Ready, recordsAgree, linksAgree, hiddenDiagnostics, requiredPass },
    nextAction: status === SIGNOFF_STATUSES.READY_TO_KEEP
      ? 'Keep the installed drawer build path enabled for the approved flow.'
      : status === SIGNOFF_STATUSES.ROLLBACK_RECOMMENDED
        ? 'Rollback or disable the installed drawer build path before further demo use.'
        : 'Review screenshot/Open-link evidence and polish UI copy or labels before signoff.'
  };
}

function exportedContractSummary() {
  return {
    schema: LIVE_EVIDENCE_SCHEMA_VERSION,
    signoffStatuses: clone(SIGNOFF_STATUSES),
    reviewOnlyPolicy: clone(REVIEW_ONLY_POLICY),
    contractShapes: clone(CONTRACT_SHAPES)
  };
}

module.exports = {
  LIVE_EVIDENCE_SCHEMA_VERSION,
  SIGNOFF_STATUSES,
  REVIEW_ONLY_POLICY,
  CONTRACT_SHAPES,
  reviewOnlyPolicy,
  reviewOnlyPolicyViolations,
  isReviewOnlyPolicySafe,
  contractShape,
  packetMatchesContractShape,
  releaseSignoffFromEvidence,
  liveRunDecision,
  openLinkVerificationCapture,
  screenshotSignoff,
  exportedContractSummary
};
