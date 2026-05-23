# W28 Website Package Classifier V2

Decision: COMPLETE / CREATE STILL DISABLED

## Objective

Make website evidence more adaptive for new prospects. The website/domain/category signal now chooses the lane package, product seed, product family, and demand moment before conversation notes shape story, ROI, competitive positioning, objections, and run coaching.

## What Changed

- Added a `WEBSITE_CATEGORY_CLASSIFIERS` layer after known-domain hints and before fallback.
- Added `websiteCategoryHint` and `websitePackageClassifier` in the drawer.
- Split package naming into ordered passes:
  1. known website/domain signal
  2. website category classifier
  3. conversation-note product cue
  4. industry fallback
  5. N/LLM advisory enrichment
- Changed Dealer Hardgoods scoring so website bicycle/surf/skate/dealer signals add to website score instead of being counted as notes.
- Added the package classifier to N/LLM enrichment payloads so a future advisor can improve names without getting write authority.

## Adaptive Website Categories

| Category | Lane | Product Seed | Product Family |
|---|---|---|---|
| Apparel / Footwear / Accessories | Apparel & Accessories | Core Style Color-Size Matrix | Apparel and Footwear Style |
| Bicycle / Cycling Hardgoods | Dealer Hardgoods | Bicycle SKU | Bicycle Dealer Hardgoods |
| Surf / Skate Hardgoods | Dealer Hardgoods | Custom Surfboard and Skateboard SKU | Surf and Skate Hardgoods |
| Dealer Durable Hardgoods | Dealer Hardgoods | Dealer Hardgoods SKU | Dealer Durable Hardgoods |
| Packaged Food / Beverage | Food / Beverage | Finished Good Variety Pack | Packaged Food and Beverage |
| Pet Packaged CPG | Products CPG | Pet Treats Variety Pack | Pet Treats |
| Retail Packaged CPG | Products CPG | Retail Packaged Goods Assortment | Packaged Goods |
| Branch Industrial Distribution | Industrial Distribution | Inventory / Fulfillment | Branch Inventory Fulfillment |

## N/LLM Agent Role

Agent: N/LLM Website Package Advisor.

Use this agent when the website classifier is medium/low confidence, the website is unknown, the product seed is generic, or the consultant needs sharper customer-specific record names before a pilot write.

The agent may propose product seed, product family, demand moment, and confidence. It may not approve creation, invoke SuiteScript, change DCC toggles, change proof anchors, or claim unsupported website facts as verified.

## New Unknown-Site Expectations

- `examplecycling.com` / Summit Cycling should route to Dealer Hardgoods with `Bicycle SKU`, even if notes mention ingredient/lot language.
- `urbanfootwear.example` should route to Apparel & Accessories with `Core Style Color-Size Matrix`, even if notes mention branch or warehouse.
- `freshsnackco.example` should route to Food / Beverage with `Finished Good Variety Pack`, not generic demo demand.

## No Regression

- Main drawer remains create-disabled.
- Main Suitelet remains create-disabled.
- No automatic creation.
- No Sales Order write in main.
- No lane expansion.
- No proof-anchor or DCC toggle changes.
- N/LLM remains advisory only.
