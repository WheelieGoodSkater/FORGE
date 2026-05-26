# W310 Review-Only Candidate Lane Pack Source Diff Packet

Status: `review_only_source_diff_packet_ready`

## Summary

W310 drafts the exact future `src/contracts/lanePacks.js` source mutation for the Electrical Components Distributor candidate as an archived, review-only packet.

This packet does not apply the mutation, does not install the proposed pack, and does not wire the candidate into drawer runtime.

Candidate:

- Proposed pack id: `electrical-components-distributor`
- Label: Electrical Components Distributor
- Source base: `industrial-distributor`
- Source file target: `src/contracts/lanePacks.js`
- Lane id for source patch: `industrial_distribution`
- Sub-industry id: `electrical-components-distributor`
- Operating mode: `distribution_replenishment`
- Pack version: `1.0.0` through the existing `pack()` default

## Proposed Future Source Patch

Review-only. Do not apply in W310.

```diff
@@
   pack({
     packId: 'industrial-distributor',
@@
     }
   }),
+  pack({
+    packId: 'electrical-components-distributor',
+    laneId: 'industrial_distribution',
+    subIndustryId: 'electrical-components-distributor',
+    label: 'Electrical Components Distributor',
+    operatingMode: 'distribution_replenishment',
+    websiteSignals: {
+      domains: ['example-electrical-distributor.com'],
+      categoryTerms: ['electrical components', 'wire', 'cable', 'switchgear', 'industrial distributor', 'electrical supply'],
+      evidenceTerms: ['branch availability', 'supplier lead time', 'replenishment', 'project fulfillment', 'component SKU']
+    },
+    recordRoles: {
+      required: ['customer', 'sales_order', 'branch_or_product_sku', 'replenishment_or_availability_flow'],
+      optional: ['supporting_sku', 'supplier_lead_time_context', 'location_planning_context'],
+      invalid: ['formula_or_batch_structure', 'work_order_or_wip_object', 'style_matrix_or_availability_flow']
+    },
+    vocabulary: {
+      allowed: ['branch availability', 'supplier lead time', 'project fulfillment', 'replenishment', 'component SKU'],
+      forbidden: ['ingredient batch', 'style matrix', 'production routing', 'measured ROI', 'guaranteed savings']
+    },
+    liveDemo: {
+      proofMove: 'Open the electrical component SKU and prove branch availability, supplier timing, and replenishment confidence for the project promise.',
+      storyAnchor: 'The buyer needs confidence that project-critical components can be promised from the right location.',
+      roiSoWhat: 'Protect service levels and margin by catching supplier and branch exceptions before project fulfillment misses.',
+      competitiveContrast: 'NetSuite connects order promise, branch inventory, and replenishment action without a separate lookup path.'
+    }
+  }),
   pack({
     packId: 'cpg-distributor',
```

## Expected Diff Against Industrial Distributor

- Narrows the base distribution lane to electrical components, wire, cable, switchgear, electrical supply, and project fulfillment evidence.
- Keeps distribution record roles: customer, sales order, product SKU, and replenishment or availability flow.
- Adds optional supplier lead-time context while keeping location planning context.
- Keeps manufacturing, food batch, WIP, and style-matrix roles invalid unless independent evidence supports a different lane.
- Keeps ROI copy outcome-safe and avoids measured or guaranteed claims.
- Keeps N/LLM advisory-only limits from the source `pack()` default.

## W309 Source-Change Blockers Still Open

- Real website/category evidence is not yet confirmed.
- Explicit human code-review approval has not been recorded.
- This packet is a draft diff only and cannot become source truth without a future reviewed source-change block.

## Human Code-Review Placeholder

Decision: `not_approved_yet`

Reviewer:

Date:

Notes:

## Post-Install Smoke Plan If Later Approved

If a future human-reviewed block lands this pack in `src/contracts/lanePacks.js`, smoke testing must verify:

- Standard consultant inputs still require only prospect, website, notes, and toggles.
- Electrical distributor evidence resolves to the new pack only when website/category evidence is strong or consultant confirmation is explicit.
- Weak/conflicting evidence remains confirmation-gated.
- Returned records preserve Product SKU / availability labels, supported Open-link authority, W218 success wording, and W220 recovery wording.
- Normal consultant UI hides raw diagnostics and admin-only proposal review.
- Connected build submit/refresh/import remains unchanged.

## Diff-Readiness Acceptance Packet

- Diff drafted: yes.
- Diff applied: no.
- Source pack mutated: no.
- Runtime wired: no.
- Installable: no.
- Source truth: no.
- Auto-install: no.
- Normal consultant UI changed: no.
- Runtime authority changed: no.

## Guardrails

- Do not mutate `src/contracts/lanePacks.js`.
- Do not install the proposed pack.
- Do not add auto-install behavior.
- Do not wire the candidate into drawer runtime.
- Do not change lane behavior, visible UI, story copy, connected build, returned-record import, endpoint behavior, dataset switching, or runtime authority.
- Keep N/LLM advisory-only and uncertainty visible.

## Visual Testing Decision

Broad visual testing is not required because W310 is an archived review-only diff packet with no runtime or UI change.
