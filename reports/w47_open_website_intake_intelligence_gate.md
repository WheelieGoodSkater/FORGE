# W47 Open-Website Intake Intelligence Gate

Decision: PASS / CREATE STILL DISABLED

## Objective

Make IDB handle websites we did not harden manually by classifying lane, proof anchor, product seed, product family, demand moment, confidence, and source. Weak website evidence must ask for confirmation or additional evidence instead of guessing.

## Harness Results

| Status | Prospect | Lane | Product Signal | Confidence State | Resolver | Failure |
| --- | --- | --- | --- | --- | --- | --- |
| PASS | Vans | apparel_accessories | Core Skate Shoe Style Matrix | recommended | known_domain_website_primary / high | None |
| PASS | Gordon and Smith | dealer_hardgoods | Custom Surfboard and Skateboard SKU | recommended | known_domain_website_primary / high | None |
| PASS | Trek Bikes | dealer_hardgoods | Bicycle SKU | recommended | known_domain_website_primary / high | None |
| PASS | Yeti | dealer_hardgoods | Outdoor Drinkware and Cooler SKU | recommended | known_domain_website_primary / high | None |
| PASS | Keebler | food_beverage | Cookie Variety Pack | recommended | known_domain_website_primary / high | None |
| PASS | Liquid Death | food_beverage | Sparkling Water Variety 12-Pack | recommended | known_domain_website_primary / high | None |
| PASS | Yerba Madre | food_beverage | Yerba Mate Beverage Variety Pack | recommended | known_domain_website_primary / high | None |
| PASS | Milk-Bone | products_cpg | Original Dog Biscuits Variety Pack | recommended | known_domain_website_primary / high | None |
| PASS | Acme Branch Supply | industrial_distribution | Branch Inventory Fulfillment Position | needs_confirmation | website_category_classifier / low | None |
| PASS | Summit Cycling | dealer_hardgoods | Bicycle SKU | needs_confirmation | website_category_classifier / low | None |
| PASS | Urban Footwear | apparel_accessories | Core Style Color-Size Matrix | needs_confirmation | website_category_classifier / low | None |
| PASS | Fresh Snack Co | food_beverage | Finished Good Variety Pack | needs_confirmation | website_category_classifier / low | None |
| PASS | Opaque Outdoor Brand | dealer_hardgoods | Dealer Hardgoods SKU | needs_confirmation | website_category_classifier / low | None |
| PASS | Opaque Footwear Brand | apparel_accessories | Core Style Color-Size Matrix | needs_confirmation | website_category_classifier / low | None |
| PASS | Thin Unknown Prospect |  |  | insufficient_evidence | none / medium | None |

## Findings

- Local URL/domain/category resolution works when the domain or URL contains useful category evidence, or when a known official domain hint exists.
- Open websites now resolve into three states: recommended, needs_confirmation, or insufficient_evidence.
- Local-only resolution cannot reliably classify opaque domains whose brand names do not expose product category. Those cases require pasted website evidence, SC website notes, or N/LLM website evidence review before the lane can be accepted.
- Conversation notes must stay downstream. They can make the story more relevant, but they cannot own product identity or pull a lane away from website evidence.

## Failures

- None

## No Regression

- Main drawer remains create-disabled.
- SuiteScript creation remains disabled from the drawer.
- N/LLM remains advisory-only and cannot create records or silently change packet order.
- Notes drive story, ROI, competitive, objections, and run coaching only.

## Next Logical Block

W48: Consultant Review Compression + Write Result UX. Make the Review surface show the selected confidence state, what can write now, what is blocked, and what the consultant should verify next.
