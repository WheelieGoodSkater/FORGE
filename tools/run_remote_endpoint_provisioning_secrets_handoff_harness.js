const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w77_remote_endpoint_provisioning_secrets_handoff.json');
const w76rTracePath = path.join(root, 'trace_samples', 'w76r_apply_hosted_resolver_env_and_rerun_remote_execution_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w77_remote_endpoint_provisioning_secrets_handoff_trace.json');
const reportPath = path.join(root, 'reports', 'w77_remote_endpoint_provisioning_secrets_handoff.md');

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
  const w76r = readJson(w76rTracePath);
  const results = [];

  assertCase(results, 'w77_contract_schema_present', contract.schema === 'idb.w77-remote-endpoint-provisioning-secrets-handoff.v1', contract.schema);
  assertCase(results, 'w77_inherits_w76r_no_go', w76r.decision === 'PASS' && w76r.pilotDecision === contract.sourceDecision.priorDecision && w76r.remoteSmokeExecuted === false && contract.sourceDecision.hostedResolverPilotEnabled === false, JSON.stringify({ w76rDecision: w76r.pilotDecision, remoteSmokeExecuted: w76r.remoteSmokeExecuted }));
  assertCase(results, 'w77_provisioning_checklist_complete', contract.provisioningChecklist.length >= 6 && contract.provisioningChecklist.some((item) => item.requiredOutput === 'IDB_REMOTE_RESOLVER_BASE_URL') && contract.provisioningChecklist.some((item) => item.requiredOutput === 'IDB_REMOTE_RESOLVER_TOKEN') && contract.provisioningChecklist.some((item) => item.requiredOutput === 'IDB_REMOTE_RESOLVER_SMOKE=1'), JSON.stringify(contract.provisioningChecklist));
  assertCase(results, 'w77_secret_handoff_safe', contract.secretHandoffInstructions.some((item) => /Do not paste the resolver token/.test(item)) && contract.secretHandoffInstructions.some((item) => /outside Codex and outside git/.test(item)) && contract.secretHandoffInstructions.some((item) => /tokenConfigured is true/.test(item)), JSON.stringify(contract.secretHandoffInstructions));
  assertCase(results, 'w77_operator_env_template_present', contract.operatorEnvTemplate.length === 5 && contract.operatorEnvTemplate.some((item) => /IDB_REMOTE_RESOLVER_BASE_URL/.test(item)) && contract.operatorEnvTemplate.some((item) => /set-from-secret-manager-or-protected-shell/.test(item)), JSON.stringify(contract.operatorEnvTemplate));
  assertCase(results, 'w77_rerun_commands_present', contract.rerunCommands.includes('npm run harness:apply-hosted-resolver-env-rerun') && contract.rerunCommands.includes('npm run harness:hosted-resolver-configured-remote-execution') && contract.rerunCommands.includes('npm run preflight'), JSON.stringify(contract.rerunCommands));
  assertCase(results, 'w77_pilot_unlock_gate_complete', contract.pilotUnlockGate.some((item) => /remoteSmokeExecuted true/.test(item)) && contract.pilotUnlockGate.some((item) => /zero false-confident-wrong/.test(item)) && contract.pilotUnlockGate.some((item) => /No raw token/.test(item)) && contract.pilotUnlockGate.some((item) => /W74 must rerun/.test(item)), JSON.stringify(contract.pilotUnlockGate));
  assertCase(results, 'w77_blocked_until_provisioned', contract.blockedUntilProvisioned.hostedResolverPilotEnabled === false && contract.blockedUntilProvisioned.consultantSmokeEligible === false && contract.blockedUntilProvisioned.remoteSmokeExecutable === false, JSON.stringify(contract.blockedUntilProvisioned));
  assertCase(results, 'w77_no_regression_boundaries_present', contract.noRegression.writeAuthority === 'none' && contract.noRegression.suiteScriptInvocation === false && contract.noRegression.nllmAdvisoryOnly === true && contract.noRegression.notesCannotOwnIdentification === true && contract.noRegression.hostedResolverPilotEnabled === false, JSON.stringify(contract.noRegression));
  assertCase(results, 'w77_best_next_prompt_present', contract.bestNextCodexPrompt.block === 'W78: Secret-Safe Remote Smoke Operator Runbook' && /Move through W78/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w77-remote-endpoint-provisioning-secrets-handoff-trace.v1',
    generated: new Date().toISOString(),
    decision,
    pilotDecision: 'no_go_until_operator_provisions_remote_endpoint_and_secret',
    remoteSmokeExecuted: false,
    hostedResolverPilotEnabled: false,
    inheritedW76R: {
      decision: w76r.decision,
      pilotDecision: w76r.pilotDecision,
      remoteSmokeExecuted: w76r.remoteSmokeExecuted,
      blockedReason: w76r.blockedReason
    },
    provisioningChecklist: contract.provisioningChecklist,
    secretHandoffInstructions: contract.secretHandoffInstructions,
    operatorEnvTemplate: contract.operatorEnvTemplate,
    rerunCommands: contract.rerunCommands,
    pilotUnlockGate: contract.pilotUnlockGate,
    blockedUntilProvisioned: contract.blockedUntilProvisioned,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const provisionRows = contract.provisioningChecklist.map((item) => `| ${escapeTable(item.ownerRole)} | ${escapeTable(item.requiredOutput)} | ${escapeTable(item.item)} | ${escapeTable(item.acceptance)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W77 Remote Endpoint Provisioning And Secrets Handoff

Decision: ${decision} / PROVISIONING HANDOFF READY / HOSTED PILOT STILL NO-GO / NO WRITE AUTHORITY

## Objective

Provision or identify the real hosted staging \`websiteResolverServiceV1\` endpoint and establish the secret handoff needed for W76R.

## Current Position

W76R remains no-go because the operator-provided endpoint URL, resolver token, approved origin, blocked origin, and remote smoke opt-in are not available. This handoff does not store secrets and does not enable hosted resolver pilot traffic.

## Provisioning Checklist

| Role | Required Output | Item | Acceptance |
| --- | --- | --- | --- |
${provisionRows}

## Secret Handoff Instructions

${contract.secretHandoffInstructions.map((item) => `- ${item}`).join('\n')}

## Rerun Commands

\`\`\`bash
${contract.operatorEnvTemplate.join('\n')}
${contract.rerunCommands.join('\n')}
\`\`\`

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
  console.log(`W77 remote endpoint provisioning secrets handoff harness: ${decision} pilot_decision=no_go_until_operator_provisions_remote_endpoint_and_secret`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
