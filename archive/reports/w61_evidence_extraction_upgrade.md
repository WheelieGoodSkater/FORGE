# W61 Evidence Extraction Upgrade

Decision: PASS / EXTRACTION UPGRADE READY / NO WRITE AUTHORITY

## Objective

Fix obvious real-site misses.

## Completed

- Added Ariat website-primary apparel/footwear/workwear evidence.
- Expanded apparel/footwear/workwear terms.
- Added industrial distribution domain evidence for Uline, McMaster, Fastenal, and Ferguson.
- Added hardgoods evidence for Home Depot, Milwaukee Tool, and DEWALT.
- Added Thermo Fisher life-sciences evidence.
- Proved known weak cases classify from website evidence, not notes.

## Results

| Status | Case | Lane | Product Seed | Authority | Confidence | Failures |
| --- | --- | --- | --- | --- | --- | --- |
| PASS | ariat_website_owned_apparel | apparel_accessories | Core Boot and Apparel Style Matrix | website_evidence_v1 | recommended | None |
| PASS | uline_website_owned_distribution | industrial_distribution | Distributor SKU | website_evidence_v1 | recommended | None |
| PASS | mcmaster_website_owned_distribution | industrial_distribution | Distributor SKU | website_evidence_v1 | recommended | None |
| PASS | homedepot_website_owned_hardgoods | dealer_hardgoods | Tool and Hardgoods SKU | website_evidence_v1 | recommended | None |
| PASS | thermofisher_website_owned_life_sciences | life_sciences | Lab Instrument and Reagent Lot | website_evidence_v1 | recommended | None |

## Next Block

W62: Consultant UX Compression V2.
