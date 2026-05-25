# W245: Canonical Import Result Normalization

## Decision

Status: ready for targeted harness validation.

W245 creates one canonical display-ready record collection for completed runner imports so Build, Review, and Run can use the same returned names, supported NetSuite URLs, link authority, and live-demo coaching answers.

## Scope

- Accept legacy five-record completed result payloads.
- Accept canonical `records[]` completed result payloads.
- Accept mixed payloads with legacy aliases.
- Preserve W244 legacy slot to canonical role interpretation.
- Preserve W237 food batch completed-result repair behavior.
- Preserve W218/W220 wording boundaries.
- Preserve fake Open-link blocking before valid import.
- Keep non-openable records hidden from normal consultant UI.

## Live Demo Coaching Contract

After valid import, the normalized model must answer:

- What should I open?
- What should I prove?
- What is safe to say?
- What should I not claim?
- What is the buyer-facing so what?

## Validation

Run:

```bash
npm run harness:canonical-import-result-normalization-w245
npm run harness:contract-generated-legacy-slot-mapping-w244
npm run check
npm run validate
```

## Visual Testing Decision

No broad visual testing. W245 changes the import/result model and targeted Review/Run data path only; it does not intentionally change layout or live runner behavior.
