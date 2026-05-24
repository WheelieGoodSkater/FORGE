const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data', 'w132_final_names_live_navigation_evidence.json');
const tracePath = path.join(root, 'trace_samples', 'w132_final_names_live_navigation_evidence_trace.json');
const reportPath = path.join(root, 'reports', 'w132_final_names_live_navigation_evidence.md');

const evidenceFiles = [
  '/path/to/downloads/intelligent-demo-builder-trace-1778884146914.json',
  '/path/to/downloads/idb-dcc-runner-handoff-packet-1778884146362.json',
  '/path/to/downloads/intelligent-demo-builder-trace-1778884310622.json'
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isPreviewToken(value) {
  return /\bpreview[-_]/i.test(String(value || '')) || /\bid=preview/i.test(String(value || ''));
}

function hasRecordPath(url) {
  return /\/app\/(common\/entity\/custjob|accounting\/transactions\/salesord|common\/item\/item)\.nl\?/i.test(String(url || ''));
}

function classifyLink(item) {
  const url = item && item.url ? String(item.url) : '';
  const id = item && item.id ? String(item.id) : '';
  if (!url) return 'missing_url';
  if (isPreviewToken(url) || isPreviewToken(id)) return 'preview_placeholder_url';
  if (!hasRecordPath(url)) return 'unsupported_record_path';
  return 'candidate_openable_url';
}

function finalObjectsFromTrace(trace) {
  const finalNaming = trace.dccFinalNamingResultV1 || (trace.state && trace.state.dccFinalNamingResult) || {};
  return uniqueBy(
    arrayValue(finalNaming.displayObjects)
      .concat(arrayValue(finalNaming.componentItems), arrayValue(finalNaming.locationPlanningRecords))
      .filter((item) => item && item.source === 'dcc_final'),
    (item) => `${item.role || item.label}|${item.id || ''}|${item.name || ''}`
  );
}

function main() {
  const evidence = evidenceFiles.map((file) => ({ file, json: readJson(file) }));
  const traces = evidence.filter((item) => Array.isArray(item.json.events));
  const handoff = evidence.find((item) => item.json.schema === 'idb.dcc-runner-handoff-packet.v1');
  const latestTrace = traces[traces.length - 1].json;
  const finalObjects = finalObjectsFromTrace(latestTrace);
  const linkFindings = finalObjects.map((item) => ({
    role: item.role || '',
    label: item.label || '',
    name: item.name || '',
    id: item.id || '',
    url: item.url || '',
    linkStatus: classifyLink(item)
  }));
  const inactiveLinks = linkFindings.filter((item) => item.linkStatus !== 'candidate_openable_url');
  const displayReady = latestTrace.dccFinalNamingResultV1 && latestTrace.dccFinalNamingResultV1.finalNamesImported === true;
  const activeOpenReady = linkFindings.length > 0 && inactiveLinks.length === 0;
  const handoffReady = handoff && handoff.json.status === 'ready_for_dcc_suitelet_submission_review';

  const contract = {
    schema: 'idb.w132-final-names-live-navigation-evidence.v1',
    status: 'architectural_followup_required',
    decision: 'FINAL_NAMES_IMPORTED_BUT_LINKS_NOT_OPEN_READY',
    evidenceFiles,
    observedResult: {
      finalNamesDisplayReady: displayReady,
      activeOpenLinksReady: activeOpenReady,
      handoffReadyForOperatorReview: Boolean(handoffReady),
      userReportedLinksDoNotWork: true
    },
    linkFindings,
    rootCause: [
      'The drawer currently treats any imported final generated record URL as an active Open link.',
      'The submitted final generated names JSON used preview placeholder ids such as preview-customer-123 and preview-salesorder-456.',
      'Preview placeholder ids are useful for copy/navigation smoke, but they are not real NetSuite internal ids and should not be rendered as open-ready links.'
    ],
    architectureDecision: {
      splitFinalNameAuthorityFromLinkAuthority: true,
      finalNameAuthority: 'The internal build engine owns generated record names and may return display-ready names after preview/run.',
      linkAuthority: 'A record link is open-ready only when the build engine returns a verified NetSuite record URL or a real internal id that can be normalized to the current NetSuite account.',
      drawerBehavior: [
        'Import final generated names for display and script pivots.',
        'Classify each imported link as candidate_openable_url, preview_placeholder_url, missing_url, or unsupported_record_path.',
        'Render active Open links only for candidate_openable_url records.',
        'Render copy-safe name plus Needs real URL / Link pending for preview_placeholder_url, missing_url, or unsupported_record_path records.',
        'Preserve no drawer writes, no SuiteScript invocation from the drawer, and no transaction writes from the drawer.'
      ],
      buildEngineRequirement: [
        'Return real NetSuite internal ids after preview/run when records are actually generated by the internal build engine.',
        'Return absolute or account-relative NetSuite record URLs for customer, demo transaction, hero item, matrix/proof item, and component records.',
        'Mark preview-only samples with linkAuthority=preview_placeholder so the drawer does not present them as open-ready.'
      ]
    },
    noRegression: {
      noDrawerWrites: true,
      noSuiteScriptInvocationFromDrawer: true,
      noTransactionWritesFromDrawer: true,
      consultantConfirmationRequired: true,
      stateAuthorityPreserved: true,
      handoffParityPreserved: true,
      noSubmitRollbackPreserved: true,
      generatedRecordsOwnedByInternalBuildEngine: true
    },
    visualNetSuiteTestingRequiredNow: true,
    bestNextCodexPrompt: {
      block: 'W133: Verified Record Link Authority And Open-Link Gating',
      prompt: 'Move through W133: Verified Record Link Authority And Open-Link Gating. Use the W132 evidence showing imported final names but non-working preview links to split final-name display authority from record-link open authority. Add a drawer-side link authority model that classifies imported customer, demo transaction, hero item, matrix/proof item, and component links as verified openable, preview placeholder, missing URL, or unsupported path. Render active Open links only for verified openable NetSuite record URLs; render copy-safe names with Link pending / Needs real URL for preview or missing links. Update the import smoke harness, trace samples, and reports to prove preview ids do not become clickable, real NetSuite URLs remain clickable, no drawer writes are enabled, no SuiteScript is invoked from the drawer, no transactions are created from the drawer, consultant confirmation remains required, state authority and handoff parity are preserved, no-submit rollback remains intact, and generated records remain owned by the internal build engine. Output link authority contract, UI behavior contract, import smoke harness, trace samples, W133 report, whether visual NetSuite testing is required, and the best next Codex prompt.'
    }
  };

  const trace = {
    schema: 'idb.w132-final-names-live-navigation-evidence-trace.v1',
    decision: contract.decision,
    finalNamesDisplayReady: displayReady,
    activeOpenLinksReady: activeOpenReady,
    inactiveLinkCount: inactiveLinks.length,
    linkStatuses: linkFindings.map((item) => ({ label: item.label, name: item.name, linkStatus: item.linkStatus })),
    noRegression: contract.noRegression,
    next: contract.bestNextCodexPrompt
  };

  fs.writeFileSync(dataPath, `${JSON.stringify(contract, null, 2)}\n`);
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);
  fs.writeFileSync(reportPath, `# W132 Final Names Live Navigation Evidence

Status: ${contract.status}

## Decision

${contract.decision}

The manual NetSuite retest shows final generated names imported and displayed correctly, but the active links are not live-navigation ready.

## Evidence

- Final names display ready: ${displayReady}
- Active Open links ready: ${activeOpenReady}
- Handoff ready for operator review: ${Boolean(handoffReady)}
- User-reported link result: none of the links worked

## Link Findings

${linkFindings.map((item) => `- ${item.label}: ${item.name} -> ${item.linkStatus} (${item.url || 'no url'})`).join('\n')}

## Root Cause

${contract.rootCause.map((item) => `- ${item}`).join('\n')}

## Architecture Step

${contract.architectureDecision.drawerBehavior.map((item) => `- ${item}`).join('\n')}

## Build Engine Requirement

${contract.architectureDecision.buildEngineRequirement.map((item) => `- ${item}`).join('\n')}

## No Regression

${Object.entries(contract.noRegression).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Visual NetSuite Testing

Required now: Yes. The next pass must prove the drawer no longer presents preview placeholder URLs as working Open links and still presents real NetSuite URLs as clickable.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W132 evidence intake PASS: finalNamesDisplayReady=${displayReady} activeOpenLinksReady=${activeOpenReady} inactiveLinks=${inactiveLinks.length}`);
  console.log(`Wrote ${tracePath} and ${reportPath}.`);
}

main();
