# W29: N/LLM Record Naming Advisory Contract

Decision: COMPLETE / CREATE STILL DISABLED

W29 turns the website-first naming work into an explicit N/LLM advisory contract. The advisor can propose sharper customer-specific Customer, transaction-context, proof-anchor, and supporting-proof names, but it has no write authority and cannot change lane, proof anchor, DCC toggles, packet order, or create blockers.

## Agent Roles

- N/LLM Record Naming Advisor: propose sharper record and field names from website/category evidence.
- Website Evidence Sentinel: keep website-owned product/package identity ahead of conversation-note story shaping.
- Packet Contract Agent: preserve record order, role, dependency, idempotency, rollback, and review state.
- No-Regression Sentinel: block hidden creation, lane changes, proof-anchor changes, DCC toggle changes, and blocker hiding.

## Contract Shape

- Export payload field: `recordNamingAdvisoryRequest`.
- Request schema: `idb.nllm-record-naming-advisory-request.v1`.
- Authority: `writeAuthority: none`.
- Creation: `creationAllowed: false`.
- Status: `nllm_optional` or `nllm_recommended`.

The advisor receives current packet records, website package classifier output, naming evidence, selected lane, proof anchor, and the strict note boundary. Conversation notes may sharpen pain and demand language; website evidence still owns the package and object naming foundation.

## Must Return

- `productSeed`
- `productFamily`
- `demandMoment`
- `recordNames`
- `websiteEvidenceSnippets`
- `reviewFlags`
- `sourceBasis`
- `confidence`
- `fallbackReason`
- `noRegressionDeclaration`

## No Regression

- No record creation.
- No SuiteScript invocation.
- No lane authority change.
- No proof-anchor change.
- No DCC toggle change.
- No packet-order change.
- No hiding create blockers.
- Main drawer and main Suitelet remain create-disabled.

## Next Recommendation

W30 should make advisory status visible in Review without adding scroll noise: show source basis, confidence, and whether naming came from website primary, website category, conversation notes, industry fallback, or N/LLM advisory.
