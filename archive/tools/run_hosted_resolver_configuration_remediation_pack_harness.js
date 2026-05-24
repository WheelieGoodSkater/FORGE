const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w75_hosted_resolver_configuration_remediation_pack.json');
const w74TracePath = path.join(root, 'trace_samples', 'w74_remote_resolver_pilot_toggle_decision_consultant_smoke_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w75_hosted_resolver_configuration_remediation_pack_trace.json');
const reportPath = path.join(root, 'reports', 'w75_hosted_resolver_configuration_remediation_pack.md');

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
  const w74 = readJson(w74TracePath);
  const results = [];

  assertCase(results, 'w75_contract_schema_present', contract.schema === 'idb.w75-hosted-resolver-configuration-remediation-pack.v1', contract.schema);
  assertCase(results, 'w75_inherits_w74_no_go', w74.decision === 'PASS' && w74.pilotDecision === contract.sourceDecision.priorDecision && w74.hostedResolverPilotEnabled === false && contract.sourceDecision.hostedResolverPilotEnabled === false, JSON.stringify({ w74Decision: w74.pilotDecision, enabled: w74.hostedResolverPilotEnabled }));
  assertCase(results, 'w75_env_setup_complete', contract.remoteEndpointEnvSetup.length === 5 && contract.remoteEndpointEnvSetup.some((item) => item.name === 'IDB_REMOTE_RESOLVER_BASE_URL' && /HTTPS/.test(item.validation)) && contract.remoteEndpointEnvSetup.some((item) => item.name === 'IDB_REMOTE_RESOLVER_TOKEN' && /redacted/.test(item.validation)) && contract.remoteEndpointEnvSetup.some((item) => item.name === 'IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN'), JSON.stringify(contract.remoteEndpointEnvSetup));
  assertCase(results, 'w75_secret_handling_no_raw_values', contract.secretHandlingChecklist.some((item) => /Do not commit resolver tokens/.test(item)) && contract.secretHandlingChecklist.some((item) => /tokenConfigured true or false/.test(item)) && contract.secretHandlingChecklist.some((item) => /Never print Authorization/.test(item)), JSON.stringify(contract.secretHandlingChecklist));
  assertCase(results, 'w75_cors_origin_checklist_present', contract.corsOriginChecklist.approved.some((item) => /exact NetSuite staging account origin/.test(item)) && contract.corsOriginChecklist.approved.some((item) => /Do not use wildcard/.test(item)) && contract.corsOriginChecklist.blocked.some((item) => /no allow-origin echo/.test(item)), JSON.stringify(contract.corsOriginChecklist));
  assertCase(results, 'w75_deployment_owner_checklist_complete', contract.deploymentOwnerChecklist.length >= 5 && contract.deploymentOwnerChecklist.some((item) => item.ownerRole === 'Resolver Service Architect') && contract.deploymentOwnerChecklist.some((item) => item.ownerRole === 'Security Guard') && contract.deploymentOwnerChecklist.some((item) => item.ownerRole === 'Consultant UX Director'), JSON.stringify(contract.deploymentOwnerChecklist));
  assertCase(results, 'w75_w73r_rerun_command_pack_present', /run_remote_resolver_deployment_readiness_gate_harness\.js/.test(contract.w73rRerunCommandPack.remoteReadinessSmoke) && /run_approved_live_resolver_smoke_harness\.js/.test(contract.w73rRerunCommandPack.approvedLiveSmoke) && /npm run preflight/.test(contract.w73rRerunCommandPack.fullPreflight), JSON.stringify(contract.w73rRerunCommandPack));
  assertCase(results, 'w75_no_secret_trace_rules_present', contract.noSecretTraceRules.some((item) => /tokenConfigured/.test(item)) && contract.noSecretTraceRules.some((item) => /rawSecretsIncluded false/.test(item)) && contract.noSecretTraceRules.some((item) => /Authorization/.test(item)), JSON.stringify(contract.noSecretTraceRules));
  assertCase(results, 'w75_pilot_unlock_criteria_complete', contract.pilotUnlockCriteria.some((item) => /remoteSmokeExecuted true/.test(item)) && contract.pilotUnlockCriteria.some((item) => /zero false-confident-wrong/.test(item)) && contract.pilotUnlockCriteria.some((item) => /zero unsupported claims/.test(item)) && contract.pilotUnlockCriteria.some((item) => /Full preflight passes/.test(item)), JSON.stringify(contract.pilotUnlockCriteria));
  assertCase(results, 'w75_memory_points_prevent_context_corruption', contract.memoryPoints.some((item) => /Do not treat W72 readiness/.test(item)) && contract.memoryPoints.some((item) => /Only W73R with remoteSmokeExecuted true/.test(item)) && contract.memoryPoints.some((item) => /Website evidence remains identity authority/.test(item)), JSON.stringify(contract.memoryPoints));
  assertCase(results, 'w75_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.transactionWriteEnabled === false && contract.noRegression.hostedResolverPilotEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w75_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W76: Hosted Resolver Configured Remote Execution' && /Move through W76/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w75-hosted-resolver-configuration-remediation-pack-trace.v1',
    generated: new Date().toISOString(),
    decision,
    pilotDecision: 'no_go_until_w75_remediation_applied_and_w76_remote_execution_passes',
    hostedResolverPilotEnabled: false,
    inheritedW74: {
      decision: w74.decision,
      pilotDecision: w74.pilotDecision,
      hostedResolverPilotEnabled: w74.hostedResolverPilotEnabled,
      consultantSmokeExecuted: w74.consultantSmokeExecuted,
      blockedReason: w74.blockedReason
    },
    remoteEndpointEnvSetup: contract.remoteEndpointEnvSetup,
    secretHandlingChecklist: contract.secretHandlingChecklist,
    corsOriginChecklist: contract.corsOriginChecklist,
    deploymentOwnerChecklist: contract.deploymentOwnerChecklist,
    w73rRerunCommandPack: contract.w73rRerunCommandPack,
    noSecretTraceRules: contract.noSecretTraceRules,
    pilotUnlockCriteria: contract.pilotUnlockCriteria,
    memoryPoints: contract.memoryPoints,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const envRows = contract.remoteEndpointEnvSetup.map((item) => `| ${escapeTable(item.name)} | ${escapeTable(item.ownerRole)} | ${escapeTable(item.requiredValueShape)} | ${escapeTable(item.validation)} |`).join('\n');
  const ownerRows = contract.deploymentOwnerChecklist.map((item) => `| ${escapeTable(item.ownerRole)} | ${escapeTable(item.tasks.join('; '))} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W75 Hosted Resolver Configuration Remediation Pack

Decision: ${decision} / REMEDIATION PACK READY / HOSTED PILOT STILL NO-GO / NO WRITE AUTHORITY

## Objective

Create the exact remediation package needed before consultant hosted resolver pilot traffic can be enabled.

## Current Position

W74 remains no-go because W73R did not execute against a real hosted endpoint. Hosted resolver pilot traffic stays disabled until W75 is applied and W76 proves the configured remote endpoint.

## Required Environment

| Variable | Owner | Required Shape | Validation |
| --- | --- | --- | --- |
${envRows}

## Owner Checklist

| Role | Tasks |
| --- | --- |
${ownerRows}

## Rerun Command Pack

\`\`\`bash
${contract.w73rRerunCommandPack.remoteReadinessSmoke}
${contract.w73rRerunCommandPack.approvedLiveSmoke}
${contract.w73rRerunCommandPack.w73rExecution}
${contract.w73rRerunCommandPack.fullPreflight}
\`\`\`

## Pilot Unlock Criteria

${contract.pilotUnlockCriteria.map((item) => `- ${item}`).join('\n')}

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
  console.log(`W75 hosted resolver configuration remediation pack harness: ${decision} pilot_decision=no_go_until_w76_remote_execution_passes`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
