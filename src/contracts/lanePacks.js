'use strict';

const LANE_PACK_SCHEMA_VERSION = 'forge.lane-pack.v1';

const NLLM_HARD_LIMITS = Object.freeze([
  'cannotCreateRecords',
  'cannotInvokeSuiteScriptOrWriteTransactions',
  'cannotSilentlyInstallTruth',
  'cannotOverrideWebsiteEvidence',
  'cannotOverrideConsultantToggles',
  'cannotHideUncertainty',
  'cannotInventVerifiedWebsiteFacts',
  'cannotClaimMeasuredRoiWithoutBaseline'
]);

const NLLM_ALLOWED_TASKS = Object.freeze([
  'summarizeWebsiteAndCategoryEvidence',
  'proposeRecordNames',
  'synthesizePainValueCompetitiveAndRoi',
  'draftSoWhatAndWhyItMatters',
  'draftLanePackSuggestionsForHumanReview'
]);

function pack(config) {
  return Object.freeze(Object.assign({
    schema: LANE_PACK_SCHEMA_VERSION,
    packVersion: '1.0.0',
    nllmAdvisory: {
      allowedTasks: NLLM_ALLOWED_TASKS.slice(),
      hardLimits: NLLM_HARD_LIMITS.slice(),
      writeAuthority: 'none',
      creationAllowed: false,
      uncertaintyPolicy: 'surface_uncertainty_and_request_confirmation'
    }
  }, config));
}

const LANE_PACKS = Object.freeze([
  pack({
    packId: 'industrial-manufacturing',
    laneId: 'industrial_equipment',
    subIndustryId: 'industrial-manufacturing',
    label: 'Industrial Manufacturing',
    operatingMode: 'discrete_manufacturing',
    websiteSignals: {
      domains: ['ariens.com'],
      categoryTerms: ['industrial manufacturing', 'assembly', 'component', 'production', 'plant'],
      evidenceTerms: ['component readiness', 'supplier timing', 'assembly confidence', 'delivery promise']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'finished_or_assembly_item', 'component_item'],
      optional: ['bom_or_assembly_structure', 'production_planning_context'],
      invalid: ['ingredient_batch_terms_without_food_mode', 'style_matrix_or_availability_flow']
    },
    vocabulary: {
      allowed: ['assembly', 'component', 'supplier timing', 'configured demand', 'delivery confidence'],
      forbidden: ['ingredient batch', 'flavor', 'style matrix', 'branch transfer']
    },
    liveDemo: {
      proofMove: 'Open the assembly item and prove component readiness, supplier timing, and build confidence against the sales order promise.',
      storyAnchor: 'The buyer needs confidence that the order can be built on time, not just that demand was captured.',
      roiSoWhat: 'Protect delivery revenue and reduce expedite risk by surfacing component gaps before they become missed commitments.',
      competitiveContrast: 'NetSuite keeps sales promise, component availability, and build readiness in one operating path instead of a planning handoff.'
    }
  }),
  pack({
    packId: 'equipment-manufacturing',
    laneId: 'industrial_equipment',
    subIndustryId: 'equipment-manufacturing',
    label: 'Equipment Manufacturing',
    operatingMode: 'wip_manufacturing',
    websiteSignals: {
      domains: ['cat.com', 'deere.com'],
      categoryTerms: ['equipment manufacturing', 'machine', 'configured equipment', 'service part', 'assembly'],
      evidenceTerms: ['configured order', 'component readiness', 'work order', 'routing', 'shipment control']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'finished_or_assembly_item', 'component_item'],
      optional: ['bom_or_assembly_structure', 'work_order_or_wip_object', 'routing', 'work_center'],
      invalid: ['formula_or_batch_structure', 'style_matrix_or_availability_flow']
    },
    vocabulary: {
      allowed: ['configured equipment', 'assembly', 'component availability', 'work order', 'routing'],
      forbidden: ['ingredient blend', 'case pack', 'style color size matrix']
    },
    liveDemo: {
      proofMove: 'Open the equipment assembly and prove component, WIP, or routing readiness behind the promised shipment.',
      storyAnchor: 'Configured equipment promises only hold when build status and component constraints are visible early.',
      roiSoWhat: 'Reduce expedite, reschedule, and missed-shipment risk by tying configured demand to build capacity and parts.',
      competitiveContrast: 'NetSuite connects sales promise, WIP, routing, and component constraints without a separate production tracker.'
    }
  }),
  pack({
    packId: 'industrial-distributor',
    laneId: 'industrial_distribution',
    subIndustryId: 'industrial-distributor',
    label: 'Industrial Distributor',
    operatingMode: 'distribution_replenishment',
    websiteSignals: {
      domains: ['grainger.com', 'uline.com', 'mcmaster.com', 'fastenal.com', 'ferguson.com'],
      categoryTerms: ['industrial supply', 'branch', 'warehouse', 'MRO', 'distribution', 'stocking location'],
      evidenceTerms: ['branch availability', 'supplier lead time', 'replenishment', 'transfer-aware inventory']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'branch_or_product_sku', 'replenishment_or_availability_flow'],
      optional: ['supporting_sku', 'location_planning_context'],
      invalid: ['assembly', 'work_order', 'ingredient', 'batch', 'style_matrix_or_availability_flow']
    },
    vocabulary: {
      allowed: ['branch availability', 'replenishment', 'supplier lead time', 'fulfillment confidence'],
      forbidden: ['production routing', 'ingredient batch', 'fashion collection']
    },
    liveDemo: {
      proofMove: 'Open the product or availability flow and prove branch promise, supplier timing, and replenishment action.',
      storyAnchor: 'The buyer needs to know which location can fulfill, when replenishment lands, and what exception needs action.',
      roiSoWhat: 'Protect service levels and margin by resolving supplier and branch exceptions before the order misses.',
      competitiveContrast: 'NetSuite shows branch availability, supplier timing, and fulfillment control instead of a generic warehouse snapshot.'
    }
  }),
  pack({
    packId: 'building-materials-contractor-supply-project-fulfillment',
    laneId: 'building_materials',
    subIndustryId: 'building-materials-contractor-supply-project-fulfillment',
    label: 'Building Materials Contractor Supply & Project Fulfillment',
    operatingMode: 'distribution_replenishment',
    websiteSignals: {
      domains: ['keystonebuildingsupply.com'],
      categoryTerms: ['building materials', 'lumber', 'doors', 'windows', 'fasteners', 'tools', 'contractor supply', 'special order materials', 'branch availability', 'jobsite delivery', 'will-call pickup', 'substitutions', 'project fulfillment', 'margin leakage'],
      evidenceTerms: ['contractor account demand', 'job order readiness', 'branch item availability', 'special order status', 'will-call pickup', 'jobsite delivery readiness', 'substitution readiness', 'project fulfillment confidence']
    },
    recordRoles: {
      required: ['customer', 'contractor_account', 'job_order', 'branch_item_availability'],
      optional: ['special_order_or_substitution', 'will_call_or_jobsite_delivery', 'margin_context', 'project_fulfillment_context', 'branch_transfer_context', 'contractor_promise_context'],
      invalid: [
        'dealer_allocation_or_channel_fulfillment_without_dealer_evidence',
        'style_matrix_or_size_color_variant_without_apparel_evidence',
        'work_order_or_dispatch_without_parts_service_evidence',
        'technician_truck_stock_without_parts_service_evidence',
        'clinic_supply_substitute_without_medical_dental_evidence',
        'lot_release_or_qa_validation_without_life_sciences_evidence',
        'food_formula_or_batch_without_food_evidence',
        'configured_equipment_assembly_without_industrial_evidence',
        'manufacturing_routing_or_wip_without_explicit_fabrication_evidence'
      ]
    },
    vocabulary: {
      allowed: ['contractor account demand', 'job order readiness', 'branch item availability', 'special order status', 'will-call pickup', 'jobsite delivery readiness', 'substitutions', 'project fulfillment confidence', 'margin leakage', 'contractor promise confidence'],
      forbidden: ['dealer allocation', 'channel fulfillment', 'style/color/size', 'store/ecommerce promise', 'technician truck stock', 'first-time fix', 'clinic supply substitutes', 'QA release', 'lot/release readiness', 'validation documentation', 'food batch', 'ingredient readiness', 'configured equipment assembly', 'manufacturing routing', 'WIP', 'work center']
    },
    liveDemo: {
      proofMove: 'Open the contractor account, job order, branch item availability, special order or substitution status, and will-call or jobsite delivery readiness before the contractor commitment is made.',
      storyAnchor: 'The buyer needs confidence that a contractor job promise is backed by branch availability, substitution status, special-order timing, and delivery readiness.',
      roiSoWhat: 'Protect job promise confidence and margin by proving branch availability, special order or substitution status, and delivery readiness before the contractor commitment.',
      competitiveContrast: 'NetSuite connects contractor account demand, job order readiness, branch availability, special orders, substitutions, will-call pickup, jobsite delivery, and margin context instead of splitting the promise across an old POS, spreadsheets, branch calls, Epicor, or Spruce.'
    }
  }),
  pack({
    packId: 'wholesale-janitorial-contract-replenishment',
    laneId: 'wholesale_janitorial',
    subIndustryId: 'wholesale-janitorial-contract-replenishment',
    label: 'Wholesale Janitorial Contract Replenishment',
    operatingMode: 'distribution_replenishment',
    websiteSignals: {
      domains: ['brightlinefacilitysupply.com', 'metrocarejanitorialsupply.com'],
      categoryTerms: ['wholesale janitorial', 'facility supply', 'janitorial supply', 'janitorial supplies', 'facility maintenance', 'restroom paper', 'soaps', 'cleaning chemicals', 'floor care', 'liners', 'dispensers', 'gloves', 'safety supplies', 'property management', 'schools', 'healthcare offices', 'contract replenishment', 'recurring order', 'route delivery', 'substitute product', 'backorder', 'replenishment cadence', 'contracted pricing', 'preferred items'],
      evidenceTerms: ['contract customer demand', 'recurring order readiness', 'facility/location supply availability', 'preferred item or contracted item context', 'substitute product readiness', 'backorder exposure', 'replenishment cadence', 'route/delivery readiness', 'margin leakage', 'customer promise confidence', 'contracted pricing context']
    },
    recordRoles: {
      required: ['customer', 'contract_account', 'recurring_order', 'facility_item_availability'],
      optional: ['preferred_or_substitute_item', 'backorder_or_replenishment_status', 'route_or_delivery_readiness', 'margin_context', 'customer_promise_context', 'contract_pricing_context'],
      invalid: [
        'contractor_job_order_without_building_materials_evidence',
        'will_call_or_jobsite_delivery_without_building_materials_evidence',
        'dealer_availability_or_channel_fulfillment_without_dealer_evidence',
        'style_matrix_or_store_ecommerce_without_retail_evidence',
        'work_order_or_dispatch_without_parts_service_evidence',
        'clinic_supply_substitute_without_medical_dental_evidence',
        'lot_release_or_qa_validation_without_life_sciences_evidence',
        'food_formula_or_batch_without_food_evidence',
        'configured_equipment_assembly_without_industrial_evidence',
        'manufacturing_routing_or_wip_without_explicit_manufacturing_evidence'
      ]
    },
    vocabulary: {
      allowed: ['contract customer demand', 'contract account', 'recurring order', 'facility/location supply availability', 'preferred item', 'contracted item', 'substitute product readiness', 'backorder exposure', 'replenishment cadence', 'route delivery readiness', 'delivery route readiness', 'margin leakage', 'customer promise confidence', 'contracted pricing context'],
      forbidden: ['contractor job order', 'will-call pickup', 'jobsite delivery', 'dealer allocation', 'channel fulfillment', 'style/color/size', 'store/ecommerce promise', 'technician truck stock', 'first-time fix', 'clinic supply substitutes', 'QA release', 'lot/release readiness', 'validation documentation', 'traceability', 'food batch', 'ingredient readiness', 'configured equipment assembly', 'manufacturing routing', 'WIP', 'work center']
    },
    liveDemo: {
      proofMove: 'Open the contract account, recurring order, facility item availability, preferred or substitute item, backorder or replenishment status, and route or delivery readiness before the recurring customer promise is made.',
      storyAnchor: 'The buyer needs confidence that recurring facility supply promises are backed by approved items, substitutions, backorder status, replenishment cadence, and delivery route readiness.',
      roiSoWhat: 'Protect recurring customer promise confidence and margin by proving facility availability, substitute readiness, backorder exposure, replenishment cadence, and delivery readiness before the next contract shipment.',
      competitiveContrast: 'NetSuite connects contract customer demand, recurring order readiness, preferred or substitute items, replenishment status, delivery route readiness, and margin context instead of splitting the promise across QuickBooks, spreadsheets, route sheets, route apps, or janitorial distributor software.'
    }
  }),
  pack({
    packId: 'cpg-distributor',
    laneId: 'products_cpg',
    subIndustryId: 'cpg-distributor',
    label: 'CPG Distributor',
    operatingMode: 'distribution_replenishment',
    websiteSignals: {
      domains: ['unfi.com', 'kehe.com'],
      categoryTerms: ['cpg distributor', 'grocery distribution', 'retail replenishment', 'consumer brands'],
      evidenceTerms: ['retail replenishment', 'case availability', 'promotion fulfillment', 'warehouse allocation']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'branch_or_product_sku', 'replenishment_or_availability_flow'],
      optional: ['supporting_sku', 'location_planning_context'],
      invalid: ['work_order_or_wip_object', 'routing', 'formula_or_batch_structure']
    },
    vocabulary: {
      allowed: ['retail replenishment', 'case availability', 'promotion fulfillment', 'warehouse allocation'],
      forbidden: ['assembly routing', 'work center', 'style matrix']
    },
    liveDemo: {
      proofMove: 'Open the CPG SKU and prove retailer replenishment, case availability, and allocation confidence without claiming production control.',
      storyAnchor: 'The distributor story is promotion-to-shelf reliability: the right cases available for the right retailer at the right time.',
      roiSoWhat: 'Protect retail revenue and service levels by catching replenishment and allocation risk before promotion demand lands.',
      competitiveContrast: 'NetSuite connects order promise, inventory, allocation, and replenishment action in one proof path.'
    }
  }),
  pack({
    packId: 'cpg-manufacturer',
    laneId: 'products_cpg',
    subIndustryId: 'cpg-manufacturer',
    label: 'CPG Manufacturer',
    operatingMode: 'discrete_manufacturing',
    websiteSignals: {
      domains: ['milkbone.com'],
      categoryTerms: ['consumer packaged goods', 'brand assortment', 'case pack', 'packaging', 'promotion'],
      evidenceTerms: ['packaging readiness', 'case-pack timing', 'finished goods', 'retail availability']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'finished_or_assembly_item', 'component_item'],
      optional: ['bom_or_assembly_structure', 'production_planning_context'],
      invalid: ['branch_or_product_sku_without_distribution_evidence', 'style_matrix_or_availability_flow']
    },
    vocabulary: {
      allowed: ['case pack', 'packaging readiness', 'finished goods', 'promotion demand'],
      forbidden: ['dealer network', 'branch transfer', 'regulated lot release']
    },
    liveDemo: {
      proofMove: 'Open the finished packaged good and prove packaging/component readiness against promotion demand and retail availability.',
      storyAnchor: 'Promotion demand is believable only when packaging, finished goods, and replenishment stay connected.',
      roiSoWhat: 'Reduce missed promotion, substitution, and chargeback risk by making readiness visible before fulfillment breaks.',
      competitiveContrast: 'NetSuite ties brand demand, packaging readiness, inventory, and manufacturing proof into one path.'
    }
  }),
  pack({
    packId: 'food-beverage-manufacturer',
    laneId: 'food_beverage',
    subIndustryId: 'food-beverage-manufacturer',
    label: 'Food/Beverage Manufacturer',
    operatingMode: 'food_batch_manufacturing',
    websiteSignals: {
      domains: ['mccormick.com', 'keebler.com', 'liquiddeath.com', 'yerbamadre.com', 'guayaki.com'],
      categoryTerms: ['food', 'beverage', 'ingredient', 'flavor', 'packaging', 'batch'],
      evidenceTerms: ['ingredient readiness', 'packaging timing', 'line continuity', 'finished-good availability']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'finished_food_or_batch_item', 'ingredient_or_component_item'],
      optional: ['formula_or_batch_structure', 'lot_or_availability_context', 'work_order_or_wip_object'],
      invalid: ['style_matrix_or_availability_flow', 'dealer_availability_or_replenishment_flow']
    },
    vocabulary: {
      allowed: ['ingredient readiness', 'formula', 'batch', 'packaging timing', 'finished-good availability'],
      forbidden: ['style matrix', 'dealer allocation', 'equipment routing unless WIP is explicit']
    },
    liveDemo: {
      proofMove: 'Open the finished food or beverage item and prove ingredient, packaging, formula/batch, and finished-good readiness.',
      storyAnchor: 'Food and beverage trust comes from showing the inputs and batch context that protect the shelf promise.',
      roiSoWhat: 'Protect promotion and service revenue by catching ingredient or packaging gaps before production misses demand.',
      competitiveContrast: 'NetSuite keeps demand, ingredients, batch readiness, and availability together without a disconnected production tracker.'
    }
  }),
  pack({
    packId: 'life-sciences-regulated-supply-release',
    laneId: 'life_sciences',
    subIndustryId: 'life-sciences-regulated-supply-release',
    label: 'Life Sciences Regulated Supply & Release',
    operatingMode: 'discrete_manufacturing',
    websiteSignals: {
      domains: ['meridianbiosystems.com'],
      categoryTerms: ['life sciences', 'diagnostic kits', 'lab instruments', 'reagents', 'regulated consumables', 'lot status', 'QA release', 'validation documentation', 'expiration', 'traceability'],
      evidenceTerms: ['lot/release readiness', 'approved inventory', 'expiration risk', 'QA/validation documentation', 'traceability', 'shipment confidence']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'lot_or_release_record', 'approved_inventory_item'],
      optional: ['expiration_or_shelf_life_context', 'qa_validation_documentation', 'traceability_context', 'shipment_confidence_context'],
      invalid: [
        'dealer_availability_or_replenishment_flow',
        'style_matrix_or_availability_flow',
        'work_order_or_dispatch_without_service_evidence',
        'clinic_supply_substitute_without_medical_dental_evidence',
        'food_formula_or_batch_without_food_evidence',
        'configured_equipment_assembly_without_industrial_evidence'
      ]
    },
    vocabulary: {
      allowed: ['regulated order demand', 'lot/release readiness', 'approved inventory', 'expiration risk', 'QA release', 'validation documentation', 'traceability', 'shipment confidence'],
      forbidden: ['dealer allocation', 'style/color/size', 'store/ecommerce promise', 'technician truck stock', 'first-time fix', 'clinic supply substitutes', 'food batch', 'configured equipment assembly']
    },
    liveDemo: {
      proofMove: 'Open the lot/release record and approved inventory item to prove QA release, expiration, validation documentation, traceability, and shipment confidence before the customer promise is made.',
      storyAnchor: 'The buyer needs confidence that regulated demand can ship from approved inventory with release status, expiration, and documentation visible.',
      roiSoWhat: 'Protect shipment confidence and rework exposure by finding lot, release, expiration, or validation gaps before customer service promises supply.',
      competitiveContrast: 'NetSuite connects regulated order demand, approved inventory, QA release, validation documentation, traceability, and shipment confidence without a separate spreadsheet or quality-system handoff.'
    }
  }),
  pack({
    packId: 'parts-service-field-operations',
    laneId: 'parts_service',
    subIndustryId: 'parts-service-field-operations',
    label: 'Parts & Service Field Operations',
    operatingMode: 'services_field',
    websiteSignals: {
      domains: ['bayviewkitchenservice.com'],
      categoryTerms: ['field service', 'service operations', 'repair service', 'commercial kitchen service', 'equipment service', 'installed equipment', 'work order', 'technician', 'service parts', 'truck stock', 'warehouse parts', 'emergency repair', 'warranty'],
      evidenceTerms: ['work order readiness', 'installed equipment history', 'truck/warehouse parts availability', 'backordered parts', 'warranty exposure', 'first-time fix risk', 'emergency response', 'service margin']
    },
    recordRoles: {
      required: ['customer', 'work_order', 'installed_equipment', 'service_part'],
      optional: ['truck_stock_context', 'warehouse_parts_context', 'backorder_context', 'warranty_context', 'emergency_response_context', 'service_margin_context'],
      invalid: [
        'dealer_availability_or_replenishment_flow',
        'style_matrix_or_availability_flow',
        'clinic_supply_substitute_without_medical_dental_evidence',
        'food_formula_or_batch_without_food_evidence',
        'lot_release_or_qa_validation_without_life_sciences_evidence',
        'configured_equipment_assembly_without_industrial_evidence'
      ]
    },
    vocabulary: {
      allowed: ['work order readiness', 'installed equipment history', 'technician readiness', 'truck stock', 'warehouse parts availability', 'backordered parts', 'warranty exposure', 'emergency response', 'first-time fix risk', 'service margin'],
      forbidden: ['dealer allocation', 'channel fulfillment', 'style/color/size', 'store/ecommerce promise', 'clinic supply substitutes', 'food batch', 'QA release', 'lot/release readiness', 'configured equipment assembly']
    },
    liveDemo: {
      proofMove: 'Open the work order, installed equipment, and service part to prove technician readiness, truck or warehouse parts availability, backorder exposure, warranty context, and first-time-fix risk.',
      storyAnchor: 'The buyer needs confidence that the technician can arrive with the right parts and service context before the customer promise is made.',
      roiSoWhat: 'Protect emergency response, service margin, and first-time-fix confidence by finding part, warranty, or backorder gaps before dispatch.',
      competitiveContrast: 'NetSuite connects work order demand, installed equipment, service parts, truck or warehouse availability, warranty context, and service-margin risk without a separate spreadsheet or dispatch handoff.'
    }
  }),
  pack({
    packId: 'medical-dental-supply-equipment',
    laneId: 'medical_dental_supply',
    subIndustryId: 'medical-dental-supply-equipment',
    label: 'Medical/Dental Supply & Equipment',
    operatingMode: 'distribution_replenishment',
    websiteSignals: {
      domains: ['northstardentalsupply.com'],
      categoryTerms: ['medical supply', 'dental supply', 'dental equipment', 'clinic supply', 'sterilization supplies', 'handpieces', 'chairs', 'small equipment', 'substitute products', 'backorders', 'multi-location stock', 'warranty', 'compliance context'],
      evidenceTerms: ['clinic supply availability', 'equipment availability', 'substitute product readiness', 'backorder risk', 'multi-location stock', 'warranty context', 'compliance-sensitive item context', 'customer promise confidence']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'clinic_supply_or_equipment_item', 'substitute_product'],
      optional: ['backorder_context', 'multi_location_stock_context', 'warranty_context', 'compliance_context', 'equipment_history_context', 'customer_promise_context'],
      invalid: [
        'dealer_availability_or_replenishment_flow',
        'style_matrix_or_availability_flow',
        'work_order_or_dispatch_without_service_evidence',
        'technician_truck_stock_without_parts_service_evidence',
        'food_formula_or_batch_without_food_evidence',
        'lot_release_or_qa_validation_without_life_sciences_evidence',
        'configured_equipment_assembly_without_industrial_evidence'
      ]
    },
    vocabulary: {
      allowed: ['clinic supply availability', 'dental equipment availability', 'substitute product readiness', 'backorder risk', 'multi-location stock', 'warranty context', 'compliance-sensitive item context', 'equipment history', 'customer promise confidence'],
      forbidden: ['dealer allocation', 'channel fulfillment', 'style/color/size', 'store/ecommerce promise', 'technician truck stock', 'first-time fix', 'food batch', 'QA release', 'lot/release readiness', 'configured equipment assembly']
    },
    liveDemo: {
      proofMove: 'Open the clinic supply or equipment item and substitute product to prove availability, backorder risk, multi-location stock, warranty context, and customer promise confidence.',
      storyAnchor: 'The buyer needs confidence that clinic supply or dental equipment demand can be promised with substitute, warranty, compliance-sensitive, and stock-position context visible.',
      roiSoWhat: 'Protect customer promise confidence and margin exposure by finding substitute, backorder, warranty, or multi-location stock gaps before the clinic commitment is made.',
      competitiveContrast: 'NetSuite connects clinic supply demand, equipment availability, substitute products, backorder risk, warranty context, and customer promise confidence without a separate spreadsheet or distributor-portal lookup.'
    }
  }),
  pack({
    packId: 'dealer-hardgoods',
    laneId: 'dealer_hardgoods',
    subIndustryId: 'dealer-hardgoods',
    label: 'Dealer Hardgoods',
    operatingMode: 'dealer_hardgoods_replenishment',
    websiteSignals: {
      domains: ['trekbikes.com', 'yeti.com', 'gordonandsmith.com'],
      categoryTerms: ['dealer', 'hardgoods', 'bicycle', 'outdoor gear', 'durable goods', 'channel'],
      evidenceTerms: ['dealer availability', 'allocation', 'channel replenishment', 'durable SKU']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'product_sku', 'dealer_availability_or_replenishment_flow'],
      optional: ['allocation_support_sku', 'channel_context'],
      invalid: ['ingredient', 'batch', 'assembly_without_manufacturing_evidence', 'style_matrix_or_availability_flow']
    },
    vocabulary: {
      allowed: ['dealer availability', 'allocation', 'channel replenishment', 'durable SKU'],
      forbidden: ['ingredient blend', 'batch formula', 'branch-only fulfillment']
    },
    liveDemo: {
      proofMove: 'Open the dealer SKU and prove channel availability, allocation, and replenishment timing.',
      storyAnchor: 'Dealer-channel promise depends on SKU availability and allocation, not generic branch inventory.',
      roiSoWhat: 'Protect dealer revenue and confidence by proving the product can be allocated and replenished.',
      competitiveContrast: 'NetSuite keeps channel availability and order promise visible in one SKU-centered path.'
    }
  }),
  pack({
    packId: 'apparel-style-matrix',
    laneId: 'apparel_accessories',
    subIndustryId: 'apparel-style-matrix',
    label: 'Apparel Style Matrix',
    operatingMode: 'apparel_style_matrix',
    websiteSignals: {
      domains: ['ariat.com', 'vans.com', 'patagonia.com', 'harborfinchoutfitters.com'],
      categoryTerms: ['apparel', 'footwear', 'style', 'size', 'color', 'collection', 'store availability', 'ecommerce', 'seasonal assortment', 'store transfer', 'replenishment', 'margin exposure'],
      evidenceTerms: ['style readiness', 'size color availability', 'allocation', 'seasonal launch', 'store/ecommerce promise', 'transfer risk', 'store availability', 'margin exposure']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'style_sku', 'style_matrix_or_availability_flow'],
      optional: ['supporting_style_or_color_sku', 'store_ecommerce_availability_context', 'transfer_risk_context', 'seasonal_assortment_context', 'margin_exposure_context'],
      invalid: [
        'finished_good_without_style_evidence',
        'work_order_or_dispatch_without_service_evidence',
        'ingredient_or_component_item',
        'dealer_availability_or_replenishment_flow',
        'clinic_supply_or_equipment_item_without_medical_dental_evidence',
        'lot_release_or_qa_validation_without_life_sciences_evidence',
        'configured_equipment_assembly_without_industrial_evidence'
      ]
    },
    vocabulary: {
      allowed: ['style', 'size', 'color', 'collection', 'variant availability', 'store availability', 'store/ecommerce promise', 'transfer risk', 'seasonal assortment', 'margin exposure'],
      forbidden: ['ingredient batch', 'industrial assembly', 'dealer allocation', 'technician truck stock', 'first-time fix', 'clinic supply substitutes', 'QA release', 'lot/release readiness', 'configured equipment assembly']
    },
    liveDemo: {
      proofMove: 'Open the style or matrix item and prove size/color availability, store/ecommerce promise, transfer risk, seasonal assortment readiness, and margin exposure.',
      storyAnchor: 'The consultant should show matrix truth for variants and channel promise before store or ecommerce availability is trusted.',
      roiSoWhat: 'Protect launch, margin, and customer promise confidence by exposing variant, transfer, and store/ecommerce availability gaps before customers encounter them.',
      competitiveContrast: 'NetSuite keeps style, variant availability, store/ecommerce promise, transfer risk, and replenishment context in one path instead of a spreadsheet or Shopify-report lookup.'
    }
  }),
  pack({
    packId: 'retail-availability',
    laneId: 'products_cpg',
    subIndustryId: 'retail-availability',
    label: 'Retail Availability',
    operatingMode: 'retail_availability',
    websiteSignals: {
      domains: ['rei.com', 'target.com', 'walmart.com'],
      categoryTerms: ['retail', 'store availability', 'ecommerce', 'pickup', 'ship to store'],
      evidenceTerms: ['store availability', 'channel availability', 'replenishment', 'customer promise']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'hero_sku', 'availability_or_replenishment_flow'],
      optional: ['supporting_sku', 'location_or_channel_context'],
      invalid: ['bom_or_assembly_structure', 'work_order_or_wip_object', 'routing']
    },
    vocabulary: {
      allowed: ['store availability', 'channel availability', 'replenishment', 'customer promise'],
      forbidden: ['production routing', 'batch formula', 'regulated release']
    },
    liveDemo: {
      proofMove: 'Open the SKU or availability flow and prove the channel promise from demand to replenishment.',
      storyAnchor: 'Retail confidence is whether the buyer can trust availability across channels.',
      roiSoWhat: 'Protect conversion and service levels by surfacing availability and replenishment risk early.',
      competitiveContrast: 'NetSuite connects order demand, inventory, and channel availability without a separate lookup story.'
    }
  })
]);

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function evidenceText(input) {
  const parts = [];
  if (input) {
    parts.push(input.website, input.websiteDomain, input.category, input.categoryText, input.websiteText, input.evidenceText);
    if (Array.isArray(input.signals)) parts.push(input.signals.join(' '));
  }
  return normalizeText(parts.filter(Boolean).join(' '));
}

function domainFromWebsite(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname.replace(/^www\./i, '').toLowerCase();
  } catch (err) {
    return raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  }
}

function validateLanePack(packToValidate) {
  const errors = [];
  const requiredStringFields = ['schema', 'packVersion', 'packId', 'laneId', 'subIndustryId', 'label', 'operatingMode'];
  requiredStringFields.forEach((field) => {
    if (!packToValidate || typeof packToValidate[field] !== 'string' || !packToValidate[field]) errors.push(`${field} required`);
  });
  if (packToValidate && packToValidate.schema !== LANE_PACK_SCHEMA_VERSION) errors.push('schema mismatch');
  ['websiteSignals', 'recordRoles', 'vocabulary', 'liveDemo', 'nllmAdvisory'].forEach((field) => {
    if (!packToValidate || !packToValidate[field] || typeof packToValidate[field] !== 'object') errors.push(`${field} required`);
  });
  ['required', 'optional', 'invalid'].forEach((field) => {
    if (!Array.isArray(packToValidate && packToValidate.recordRoles && packToValidate.recordRoles[field])) errors.push(`recordRoles.${field} array required`);
  });
  ['allowed', 'forbidden'].forEach((field) => {
    if (!Array.isArray(packToValidate && packToValidate.vocabulary && packToValidate.vocabulary[field])) errors.push(`vocabulary.${field} array required`);
  });
  ['proofMove', 'storyAnchor', 'roiSoWhat', 'competitiveContrast'].forEach((field) => {
    if (!packToValidate || !packToValidate.liveDemo || typeof packToValidate.liveDemo[field] !== 'string' || !packToValidate.liveDemo[field]) errors.push(`liveDemo.${field} required`);
  });
  if (!packToValidate || !packToValidate.nllmAdvisory || packToValidate.nllmAdvisory.writeAuthority !== 'none') errors.push('nllmAdvisory.writeAuthority must be none');
  if (!packToValidate || !packToValidate.nllmAdvisory || packToValidate.nllmAdvisory.creationAllowed !== false) errors.push('nllmAdvisory.creationAllowed must be false');
  NLLM_HARD_LIMITS.forEach((limit) => {
    if (!packToValidate || !packToValidate.nllmAdvisory || !Array.isArray(packToValidate.nllmAdvisory.hardLimits) || !packToValidate.nllmAdvisory.hardLimits.includes(limit)) {
      errors.push(`missing hard limit ${limit}`);
    }
  });
  return { valid: errors.length === 0, errors };
}

function resolveLanePackFromEvidence(input) {
  const domain = domainFromWebsite(input && (input.websiteDomain || input.website));
  const text = evidenceText(Object.assign({}, input, { websiteDomain: domain }));
  const scored = LANE_PACKS.map((lanePack) => {
    let score = 0;
    const matched = [];
    (lanePack.websiteSignals.domains || []).forEach((knownDomain) => {
      if (domain && (domain === knownDomain || domain.endsWith(`.${knownDomain}`))) {
        score += 100;
        matched.push(`domain:${knownDomain}`);
      }
    });
    (lanePack.websiteSignals.categoryTerms || []).forEach((term) => {
      if (text.includes(normalizeText(term))) {
        score += 18;
        matched.push(`category:${term}`);
      }
    });
    (lanePack.websiteSignals.evidenceTerms || []).forEach((term) => {
      if (text.includes(normalizeText(term))) {
        score += 12;
        matched.push(`evidence:${term}`);
      }
    });
    return { lanePack, score, matched };
  }).sort((a, b) => b.score - a.score);
  const winner = scored[0] || { lanePack: null, score: 0, matched: [] };
  return {
    schema: 'forge.lane-pack-resolution.v1',
    status: winner.score >= 100 ? 'resolved' : winner.score >= 36 ? 'needs_confirmation' : 'insufficient_evidence',
    lanePack: winner.lanePack,
    packId: winner.lanePack ? winner.lanePack.packId : '',
    confidence: winner.score >= 100 ? 'high' : winner.score >= 36 ? 'medium' : 'low',
    score: winner.score,
    matchedSignals: winner.matched,
    notesOverrideIdentityAllowed: false,
    sourceAuthority: winner.score >= 100 ? 'website_domain' : winner.score >= 36 ? 'website_category' : 'insufficient'
  };
}

function nllmAdvisoryPayloadForLanePack(input, lanePack) {
  const selected = lanePack || resolveLanePackFromEvidence(input).lanePack;
  return {
    schema: 'forge.lane-pack-nllm-advisory.v1',
    lanePackSchema: LANE_PACK_SCHEMA_VERSION,
    packId: selected ? selected.packId : '',
    writeAuthority: 'none',
    creationAllowed: false,
    allowedTasks: NLLM_ALLOWED_TASKS.slice(),
    hardLimits: NLLM_HARD_LIMITS.slice(),
    websiteEvidence: {
      website: input && input.website,
      websiteDomain: domainFromWebsite(input && (input.websiteDomain || input.website)),
      signals: input && input.signals ? input.signals : []
    },
    conversationNotesUse: 'Use notes for pain, ROI, competitive framing, objections, and run coaching only. Do not override website-owned lane or naming identity.',
    requiredUncertaintyBehavior: 'If evidence is weak or conflicting, ask for confirmation and keep uncertainty visible.'
  };
}

function arrayDiff(before, after) {
  const oldValues = Array.isArray(before) ? before : [];
  const newValues = Array.isArray(after) ? after : [];
  return {
    added: newValues.filter((value) => oldValues.indexOf(value) === -1),
    removed: oldValues.filter((value) => newValues.indexOf(value) === -1)
  };
}

function fieldDiff(before, after) {
  return JSON.stringify(before || null) === JSON.stringify(after || null)
    ? null
    : { from: before, to: after };
}

function existingLanePackForProposal(proposal, candidate) {
  const basePackId = proposal && (proposal.basePackId || proposal.replacesPackId);
  return LANE_PACKS.find((lanePack) => lanePack.packId === basePackId) ||
    LANE_PACKS.find((lanePack) => candidate && lanePack.packId === candidate.packId) ||
    null;
}

function lanePackProposedChangeDiff(proposal) {
  const candidate = proposal && proposal.candidatePack || null;
  const base = existingLanePackForProposal(proposal, candidate);
  const changes = [];
  function addArray(area, field, before, after) {
    const diff = arrayDiff(before, after);
    if (diff.added.length || diff.removed.length) changes.push(Object.assign({ area, field }, diff));
  }
  function addField(area, field, before, after) {
    const diff = fieldDiff(before, after);
    if (diff) changes.push(Object.assign({ area, field }, diff));
  }
  if (!candidate) {
    return {
      schema: 'forge.lane-pack-proposed-change-diff.v1',
      status: 'missing_candidate',
      basePackId: base && base.packId || '',
      candidatePackId: '',
      changes
    };
  }
  ['domains', 'categoryTerms', 'evidenceTerms'].forEach((field) => {
    addArray('websiteSignals', field, base && base.websiteSignals && base.websiteSignals[field], candidate.websiteSignals && candidate.websiteSignals[field]);
  });
  ['required', 'optional', 'invalid'].forEach((field) => {
    addArray('recordRoles', field, base && base.recordRoles && base.recordRoles[field], candidate.recordRoles && candidate.recordRoles[field]);
  });
  ['allowed', 'forbidden'].forEach((field) => {
    addArray('vocabulary', field, base && base.vocabulary && base.vocabulary[field], candidate.vocabulary && candidate.vocabulary[field]);
  });
  ['proofMove', 'storyAnchor', 'roiSoWhat', 'competitiveContrast'].forEach((field) => {
    addField('liveDemo', field, base && base.liveDemo && base.liveDemo[field], candidate.liveDemo && candidate.liveDemo[field]);
  });
  addArray('nllmAdvisory', 'allowedTasks', base && base.nllmAdvisory && base.nllmAdvisory.allowedTasks, candidate.nllmAdvisory && candidate.nllmAdvisory.allowedTasks);
  addArray('nllmAdvisory', 'hardLimits', base && base.nllmAdvisory && base.nllmAdvisory.hardLimits, candidate.nllmAdvisory && candidate.nllmAdvisory.hardLimits);
  ['writeAuthority', 'creationAllowed', 'uncertaintyPolicy'].forEach((field) => {
    addField('nllmAdvisory', field, base && base.nllmAdvisory && base.nllmAdvisory[field], candidate.nllmAdvisory && candidate.nllmAdvisory[field]);
  });
  return {
    schema: 'forge.lane-pack-proposed-change-diff.v1',
    status: base ? 'compared_to_existing_pack' : 'new_pack_review',
    basePackId: base && base.packId || '',
    candidatePackId: candidate.packId || '',
    changes
  };
}

function reviewProposedLanePackChange(proposal) {
  const errors = [];
  const warnings = [];
  const candidate = proposal && proposal.candidatePack;
  const proposedChangeDiff = lanePackProposedChangeDiff(proposal);
  const validation = validateLanePack(candidate);
  validation.errors.forEach((error) => errors.push(error));
  if (!proposal || proposal.proposedBy !== 'nllm_advisory') errors.push('proposal.proposedBy must be nllm_advisory');
  if (!proposal || proposal.installRequested !== true) warnings.push('proposal is review-only until a human requests install');
  if (proposal && proposal.autoInstall === true) errors.push('autoInstall is forbidden');
  if (candidate && candidate.nllmAdvisory && candidate.nllmAdvisory.writeAuthority !== 'none') errors.push('candidate cannot grant write authority');
  if (candidate && candidate.nllmAdvisory && candidate.nllmAdvisory.creationAllowed !== false) errors.push('candidate cannot allow creation');
  if (candidate && candidate.websiteSignals && (!Array.isArray(candidate.websiteSignals.categoryTerms) || candidate.websiteSignals.categoryTerms.length < 2)) {
    errors.push('candidate needs at least two category evidence terms');
  }
  if (candidate && candidate.liveDemo && /guarantee|guaranteed|measured roi|will increase/i.test([
    candidate.liveDemo.proofMove,
    candidate.liveDemo.storyAnchor,
    candidate.liveDemo.roiSoWhat,
    candidate.liveDemo.competitiveContrast
  ].join(' '))) {
    errors.push('candidate story cannot make guaranteed or measured ROI claims');
  }
  if (candidate && LANE_PACKS.some((lanePack) => lanePack.packId === candidate.packId)) {
    warnings.push('candidate pack id already exists and would require an explicit replacement review');
  }
  if (candidate && candidate.nllmAdvisory && candidate.nllmAdvisory.uncertaintyPolicy !== 'surface_uncertainty_and_request_confirmation') {
    errors.push('candidate cannot remove uncertainty visibility');
  }
  return {
    schema: 'forge.lane-pack-authoring-review.v1',
    status: errors.length ? 'rejected' : 'review_ready',
    installAllowed: false,
    humanReviewRequired: true,
    nllmAdvisoryOnly: true,
    errors,
    warnings,
    candidatePackId: candidate && candidate.packId || '',
    proposedChangeDiff,
    reviewCopy: {
      headline: errors.length ? 'Lane-pack proposal rejected.' : 'Lane-pack proposal is ready for human review.',
      summary: proposedChangeDiff.changes.length
        ? `${proposedChangeDiff.changes.length} proposed changes require evidence and human confirmation before install.`
        : 'No material lane-pack changes were detected.',
      installGuidance: 'Do not install from N/LLM output automatically. Keep the proposal archived until a human-reviewed change updates the contract source.'
    }
  };
}

function consultantStorySurfaceFromLanePack(input, lanePack, normalizedImport) {
  const resolution = resolveLanePackFromEvidence(input || {});
  const selected = lanePack || (resolution.status === 'insufficient_evidence' ? null : resolution.lanePack);
  const records = normalizedImport && Array.isArray(normalizedImport.displayReadyRecords)
    ? normalizedImport.displayReadyRecords
    : [];
  const visibleRecords = records.filter((record) => record && record.normalConsultantVisible !== false && record.linkAuthorityStatus !== 'blocked_invalid_internal_id');
  const firstProof = visibleRecords.find((record) => record && record.canonicalRole && !/customer|sales_order/.test(record.canonicalRole)) || visibleRecords[0] || null;
  const advisory = nllmAdvisoryPayloadForLanePack(input || {}, selected);
  if (!selected) {
    return {
      schema: 'forge.consultant-story-surface.v1',
      status: 'needs_lane_confirmation',
      openTarget: 'Confirm lane before opening proof records.',
      proofMove: 'Prove only what the imported records and website evidence support.',
      safeClaim: 'Evidence is not strong enough for a lane claim yet.',
      doNotClaim: 'Do not claim industry fit, ROI, record creation, or availability without confirmed evidence.',
      buyerFacingSoWhat: 'Keep the buyer story grounded in confirmed evidence and visible uncertainty.',
      nllmAdvisory: {
        confidence: 'low',
        uncertainty: 'Lane evidence is insufficient; ask for confirmation.',
        allowedTasks: advisory.allowedTasks,
        hardLimits: advisory.hardLimits
      }
    };
  }
  return {
    schema: 'forge.consultant-story-surface.v1',
    status: firstProof ? 'story_ready' : 'story_ready_without_open_target',
    packId: selected.packId,
    laneLabel: selected.label,
    openTarget: firstProof ? `Open ${firstProof.name}${firstProof.consultantLabel ? ` (${firstProof.consultantLabel})` : ''}.` : selected.liveDemo.proofMove,
    openUrl: firstProof && firstProof.supportedOpenUrl || '',
    proofMove: selected.liveDemo.proofMove,
    safeClaim: selected.liveDemo.storyAnchor,
    doNotClaim: `Do not claim ${selected.vocabulary.forbidden.join(', ')} or measured ROI without evidence.`,
    buyerFacingSoWhat: selected.liveDemo.roiSoWhat,
    competitiveContrast: selected.liveDemo.competitiveContrast,
    nllmAdvisory: {
      confidence: resolution.confidence,
      uncertainty: resolution.status === 'resolved' ? 'Low uncertainty: website evidence resolved the lane pack.' : 'Visible uncertainty: ask for confirmation before treating the pack as truth.',
      writeAuthority: 'none',
      creationAllowed: false,
      allowedTasks: advisory.allowedTasks,
      hardLimits: advisory.hardLimits
    }
  };
}

module.exports = {
  LANE_PACK_SCHEMA_VERSION,
  NLLM_ALLOWED_TASKS,
  NLLM_HARD_LIMITS,
  LANE_PACKS,
  validateLanePack,
  resolveLanePackFromEvidence,
  nllmAdvisoryPayloadForLanePack,
  reviewProposedLanePackChange,
  lanePackProposedChangeDiff,
  consultantStorySurfaceFromLanePack,
  domainFromWebsite
};
