const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w74_remote_resolver_pilot_toggle_decision_consultant_smoke.json');
const w73rTracePath = path.join(root, 'trace_samples', 'w73r_execute_remote_hosted_resolver_smoke_with_config_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w74_remote_resolver_pilot_toggle_decision_consultant_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w74_remote_resolver_pilot_toggle_decision_consultant_smoke.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function main() {
  const contract = readJson(contractPath);
  const w73r = readJson(w73rTracePath);
  const results = [];
  const w73rPassedRemote = w73r.decision === 'PASS'
    && w73r.remoteSmokeExecuted === true
    && w73r.pilotDecision === 'go_if_all_remote_trace_gates_remain_green';
  const shouldEnableHostedPilot = w73rPassedRemote;
  const consultantSmokeExecuted = shouldEnableHostedPilot;

  assertCase(results, 'w74_contract_schema_present', contract.schema === 'idb.w74-remote-resolver-pilot-toggle-decision-consultant-smoke.v1', contract.schema);
  assertCase(results, 'w74_inherits_w73r_result', w73r.decision === 'PASS' && w73r.remoteSmokeExecuted === contract.decisionInputs.actualObservedW73R.remoteSmokeExecuted && w73r.pilotDecision === contract.decisionInputs.actualObservedW73R.pilotDecision, JSON.stringify({ w73rRemoteSmokeExecuted: w73r.remoteSmokeExecuted, w73rPilotDecision: w73r.pilotDecision }));
  assertCase(results, 'w74_no_go_when_w73r_blocked', !w73rPassedRemote && contract.pilotToggleDecision.decision === 'no_go_do_not_enable_hosted_resolver_for_consultant_pilot' && contract.pilotToggleDecision.hostedOnlyResolverModeAllowed === false && contract.pilotToggleDecision.consultantPilotTrafficAllowed === false, JSON.stringify(contract.pilotToggleDecision));
  assertCase(results, 'w74_consultant_smoke_not_substituted', contract.consultantSmokeDecision.consultantSmokeExecuted === false && contract.consultantSmokeDecision.notSubstitutedWith.includes('local staging resolver smoke') && contract.consultantSmokeDecision.notSubstitutedWith.includes('synthetic fixtures'), JSON.stringify(contract.consultantSmokeDecision));
  assertCase(results, 'w74_remediation_checklist_complete', contract.remediationChecklist.length >= 6 && contract.remediationChecklist.some((item) => item.ownerRole === 'Resolver Service Architect' && /IDB_REMOTE_RESOLVER_BASE_URL/.test(item.doneWhen)) && contract.remediationChecklist.some((item) => item.ownerRole === 'Security Guard' && /IDB_REMOTE_RESOLVER_TOKEN/.test(item.doneWhen)) && contract.remediationChecklist.some((item) => item.ownerRole === 'Consultant UX Director'), JSON.stringify(contract.remediationChecklist));
  assertCase(results, 'w74_blocked_consultant_trace_shape_present', contract.blockedConsultantSmokeTraceShape.plan.visibleSummaryRequired.some((item) => /not enabled/.test(item)) && contract.blockedConsultantSmokeTraceShape.review.visibleSummaryRequired.some((item) => /Blocked/.test(item)) && contract.blockedConsultantSmokeTraceShape.trace.visibleSummaryRequired.includes('No raw secrets'), JSON.stringify(contract.blockedConsultantSmokeTraceShape));
  assertCase(results, 'w74_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.transactionWriteEnabled === false && contract.noRegression.hostedResolverPilotEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w74_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W75: Hosted Resolver Configuration Remediation Pack' && /Move through W75/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const pilotDecision = shouldEnableHostedPilot ? 'go_hosted_resolver_consultant_smoke_ready' : 'no_go_w73r_remote_smoke_not_executed';
  const trace = {
    schema: 'idb.w74-remote-resolver-pilot-toggle-decision-consultant-smoke-trace.v1',
    generated: new Date().toISOString(),
    decision,
    pilotDecision,
    hostedResolverPilotEnabled: false,
    consultantSmokeExecuted,
    blockedReason: shouldEnableHostedPilot ? null : 'w73r_remote_smoke_not_executed',
    inheritedW73R: {
      decision: w73r.decision,
      remoteSmokeExecuted: w73r.remoteSmokeExecuted,
      pilotDecision: w73r.pilotDecision,
      blockedReason: w73r.blockedReason,
      environmentObserved: w73r.environmentObserved,
      rawSecretsIncluded: false
    },
    toggleDecision: contract.pilotToggleDecision,
    consultantSmokeDecision: contract.consultantSmokeDecision,
    remediationChecklist: contract.remediationChecklist,
    blockedConsultantSmokeTraceShape: contract.blockedConsultantSmokeTraceShape,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const remediationRows = contract.remediationChecklist.map((item) => `| ${escapeTable(item.ownerRole)} | ${escapeTable(item.goal)} | ${escapeTable(item.doneWhen)} |`).join('\n');
  const report = `# W74 Remote Resolver Pilot Toggle Decision And Consultant Smoke

Decision: ${decision} / ${pilotDecision} / HOSTED PILOT NOT ENABLED / NO WRITE AUTHORITY

## Objective

Use the W73R result to decide whether hosted resolver mode can be enabled for consultant pilot traffic.

## Result

${shouldEnableHostedPilot ? 'W73R passed against the real hosted endpoint, so consultant hosted resolver smoke can proceed.' : 'W73R did not execute against a real remote hosted endpoint. Hosted resolver consultant pilot traffic remains no-go, and the hosted resolver toggle must not be enabled.'}

## Consultant Smoke

- Executed: \`${consultantSmokeExecuted}\`
- Reason: \`${consultantSmokeExecuted ? 'w73r_passed_remote_endpoint' : 'w73r_remote_smoke_not_executed'}\`
- Hosted resolver pilot enabled: \`false\`

## Remediation Checklist

| Role | Goal | Done When |
| --- | --- | --- |
${remediationRows}

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.
- Hosted resolver pilot traffic remains disabled.

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`W74 remote resolver pilot toggle decision harness: ${decision} pilot_decision=${pilotDecision} consultant_smoke_executed=${consultantSmokeExecuted}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
