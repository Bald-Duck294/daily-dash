import { generateTempId } from "./hierarchyUtils.js";

/**
 * Hierarchy Templates Registry
 *
 * getTemplatesForStructure(operationStructure, organizationType)
 * Returns: { recommended, primary[], allTemplates{} }
 *
 * - recommended: the single best-fit template object
 * - primary: 2–3 curated, context-tailored templates
 * - allTemplates: all templates grouped by category for the "Browse All" drawer
 */

/* ====================================================================
   TEMPLATE METADATA + NODE BUILDERS
   ==================================================================== */

const TEMPLATES = {
  // ─── SINGLE BUILDING ────────────────────────────────────────────
  single_standard: {
    id: "single_standard",
    label: "Standard Multi-Floor Office",
    icon: "🏢",
    desc: "Main building with floors and workspace zones",
    stats: { levels: 3, areas: 9 },
    tags: ["corporate", "government", "general"],
    buildNodes: buildSingleBuildingNodes,
  },
  single_compact: {
    id: "single_compact",
    label: "Small / Single-Floor Facility",
    icon: "🏠",
    desc: "Flat, single-level ideal for small offices or shops",
    stats: { levels: 1, areas: 4 },
    tags: ["general", "other"],
    buildNodes: buildCompactBuildingNodes,
  },
  single_healthcare: {
    id: "single_healthcare",
    label: "Hospital Tower",
    icon: "🏥",
    desc: "Emergency, OPD, and IPD wards across dedicated floors",
    stats: { levels: 3, areas: 9 },
    tags: ["healthcare"],
    buildNodes: buildHealthcareSingleNodes,
  },
  single_clinic: {
    id: "single_clinic",
    label: "Outpatient Clinic & Diagnostic Centre",
    icon: "🩺",
    desc: "Consultation rooms, diagnostic labs, and patient reception",
    stats: { levels: 1, areas: 5 },
    tags: ["healthcare"],
    buildNodes: buildClinicNodes,
  },
  single_mall: {
    id: "single_mall",
    label: "Shopping Mall",
    icon: "🛍️",
    desc: "Basement food court, retail floors, and cinema/entertainment",
    stats: { levels: 4, areas: 10 },
    tags: ["commercial"],
    buildNodes: buildMallNodes,
  },
  single_office_tower: {
    id: "single_office_tower",
    label: "Commercial Office Tower",
    icon: "🏙️",
    desc: "Lobby, multi-tenant office floors, and a rooftop amenity",
    stats: { levels: 3, areas: 7 },
    tags: ["commercial", "corporate"],
    buildNodes: buildOfficeTowerNodes,
  },
  single_government: {
    id: "single_government",
    label: "Civic / Administrative Office",
    icon: "🏛️",
    desc: "Public service hall, department offices, and record rooms",
    stats: { levels: 2, areas: 7 },
    tags: ["government"],
    buildNodes: buildGovernmentOfficeNodes,
  },
  single_judicial: {
    id: "single_judicial",
    label: "Municipal / Judicial Centre",
    icon: "⚖️",
    desc: "Public registry, courtrooms, and administrative offices",
    stats: { levels: 2, areas: 6 },
    tags: ["government"],
    buildNodes: buildJudicialCentreNodes,
  },
  single_transit: {
    id: "single_transit",
    label: "Transit Terminal / Station Hub",
    icon: "🚉",
    desc: "Concourse & ticketing, platforms/bays, and passenger lounges",
    stats: { levels: 2, areas: 7 },
    tags: ["public_infra"],
    buildNodes: buildTransitTerminalNodes,
  },
  single_airport: {
    id: "single_airport",
    label: "Airport Terminal",
    icon: "✈️",
    desc: "Departure hall, security, gate concourse, and baggage claim",
    stats: { levels: 2, areas: 8 },
    tags: ["public_infra"],
    buildNodes: buildAirportTerminalNodes,
  },
  single_hotel: {
    id: "single_hotel",
    label: "Hotel & Resort Facility",
    icon: "🏨",
    desc: "Grand lobby & banquet, guest room floors, and spa & amenities",
    stats: { levels: 4, areas: 9 },
    tags: ["hotel"],
    buildNodes: buildHotelNodes,
  },
  single_boutique_hotel: {
    id: "single_boutique_hotel",
    label: "Boutique Hotel / Restaurant-Lounge",
    icon: "🍽️",
    desc: "Restaurant & bar, guest rooms floor, and rooftop lounge",
    stats: { levels: 3, areas: 7 },
    tags: ["hotel"],
    buildNodes: buildBoutiqueHotelNodes,
  },

  // ─── MULTIPLE BUILDING CAMPUS ────────────────────────────────────
  campus_corporate: {
    id: "campus_corporate",
    label: "Corporate Business Campus",
    icon: "🏘️",
    desc: "Admin block, tech tower, and ops building across a campus",
    stats: { levels: 3, areas: 6 },
    tags: ["corporate", "general"],
    buildNodes: buildCorporateCampusNodes,
  },
  campus_edu: {
    id: "campus_edu",
    label: "Academic Campus",
    icon: "🎓",
    desc: "Academic block, science wing, hostel, and admin building",
    stats: { levels: 3, areas: 7 },
    tags: ["general", "government"],
    buildNodes: buildEduCampusNodes,
  },
  campus_medical: {
    id: "campus_medical",
    label: "Multi-Speciality Medical Campus",
    icon: "🏥",
    desc: "Main hospital, trauma care, and OPD & diagnostics pavilion",
    stats: { levels: 3, areas: 8 },
    tags: ["healthcare"],
    buildNodes: buildMedicalCampusNodes,
  },
  campus_research: {
    id: "campus_research",
    label: "Speciality Hospital & Research Complex",
    icon: "🔬",
    desc: "Clinical wing, research block, and administrative tower",
    stats: { levels: 3, areas: 7 },
    tags: ["healthcare"],
    buildNodes: buildResearchHospitalNodes,
  },
  campus_govt: {
    id: "campus_govt",
    label: "Secretariat & Civic Campus",
    icon: "🏛️",
    desc: "Ministry block, citizen services annex, and admin building",
    stats: { levels: 3, areas: 7 },
    tags: ["government"],
    buildNodes: buildSecretariatCampusNodes,
  },
  campus_district: {
    id: "campus_district",
    label: "District Administrative Complex",
    icon: "📜",
    desc: "Collectorate block, treasury wing, and public relations office",
    stats: { levels: 3, areas: 7 },
    tags: ["government"],
    buildNodes: buildDistrictComplexNodes,
  },
  campus_commercial: {
    id: "campus_commercial",
    label: "Commercial Business Park",
    icon: "🏗️",
    desc: "Tower A, Tower B, and central amenities & food court",
    stats: { levels: 3, areas: 8 },
    tags: ["commercial"],
    buildNodes: buildBusinessParkNodes,
  },
  campus_retail_entertainment: {
    id: "campus_retail_entertainment",
    label: "Retail & Entertainment Complex",
    icon: "🎬",
    desc: "Mall building, parking complex, and multiplex block",
    stats: { levels: 3, areas: 7 },
    tags: ["commercial"],
    buildNodes: buildRetailEntertainmentNodes,
  },
  campus_hotel: {
    id: "campus_hotel",
    label: "Luxury Resort Complex",
    icon: "🌴",
    desc: "Main clubhouse, villas/cottages wing, and events pavilion",
    stats: { levels: 3, areas: 7 },
    tags: ["hotel"],
    buildNodes: buildLuxuryResortNodes,
  },
  campus_hotel_convention: {
    id: "campus_hotel_convention",
    label: "Hotel & Convention Centre",
    icon: "🎪",
    desc: "Hotel tower, grand convention hall, and recreation block",
    stats: { levels: 3, areas: 7 },
    tags: ["hotel"],
    buildNodes: buildHotelConventionNodes,
  },

  // ─── MULTIPLE LOCATIONS ──────────────────────────────────────────
  locations_city: {
    id: "locations_city",
    label: "City Branch Network",
    icon: "📍",
    desc: "Central HQ with North, South, and Downtown city branches",
    stats: { levels: 2, areas: 4 },
    tags: ["general", "corporate"],
    buildNodes: buildCityNetworkNodes,
  },
  locations_retail: {
    id: "locations_retail",
    label: "Retail Outlet Chain",
    icon: "🏪",
    desc: "Distributed retail or service outlets across the city",
    stats: { levels: 2, areas: 4 },
    tags: ["commercial", "general"],
    buildNodes: buildMultiStoreNodes,
  },
  locations_transit: {
    id: "locations_transit",
    label: "Transit Network / Multi-Station",
    icon: "🚇",
    desc: "Central hub station and multiple line stations across the city",
    stats: { levels: 2, areas: 5 },
    tags: ["public_infra"],
    buildNodes: buildTransitNetworkNodes,
  },
  locations_public_restrooms: {
    id: "locations_public_restrooms",
    label: "Municipal Public Facilities Network",
    icon: "🏙️",
    desc: "North zone hub, downtown hub, and south hub public facilities",
    stats: { levels: 2, areas: 5 },
    tags: ["public_infra", "government"],
    buildNodes: buildPublicFacilitiesNetworkNodes,
  },

  // ─── REGIONAL / NATIONAL ─────────────────────────────────────────
  network_regional: {
    id: "network_regional",
    label: "Regional Operations Network",
    icon: "🗺️",
    desc: "Regional HQ with district hubs and local branch facilities",
    stats: { levels: 3, areas: 6 },
    tags: ["general", "corporate", "government"],
    buildNodes: buildRegionalNetworkNodes,
  },
  network_national: {
    id: "network_national",
    label: "National Network",
    icon: "🌐",
    desc: "Zonal HQs across North, South, East, and West divisions",
    stats: { levels: 3, areas: 8 },
    tags: ["general", "corporate"],
    buildNodes: buildNationalNetworkNodes,
  },
  network_healthcare_regional: {
    id: "network_healthcare_regional",
    label: "Hospital Chain Network",
    icon: "🏥",
    desc: "Flagship hospital, regional centres, and satellite clinics",
    stats: { levels: 3, areas: 7 },
    tags: ["healthcare"],
    buildNodes: buildHealthcareNetworkNodes,
  },
  network_govt_state: {
    id: "network_govt_state",
    label: "State Government Field Offices",
    icon: "🏛️",
    desc: "State HQ, divisional offices, and district/taluka field offices",
    stats: { levels: 3, areas: 7 },
    tags: ["government"],
    buildNodes: buildStateGovtNetworkNodes,
  },
};

/* ====================================================================
   INDUSTRY TAG RESOLVER
   ==================================================================== */

function resolveOrgTag(organizationType = "") {
  const t = organizationType.toLowerCase();
  if (t.includes("hospital") || t.includes("health") || t.includes("clinic") || t.includes("medical"))
    return "healthcare";
  if (t.includes("mall") || t.includes("commercial") || t.includes("retail") || t.includes("shop"))
    return "commercial";
  if (t.includes("government") || t.includes("govt") || t.includes("municipal") || t.includes("public office"))
    return "government";
  if (t.includes("infrastructure") || t.includes("airport") || t.includes("metro") || t.includes("transit") || t.includes("railway") || t.includes("station"))
    return "public_infra";
  if (t.includes("hotel") || t.includes("hospitality") || t.includes("resort") || t.includes("restaurant"))
    return "hotel";
  return "general";
}

/* ====================================================================
   MAIN EXPORT: getTemplatesForStructure
   ==================================================================== */

/**
 * Returns:
 * {
 *   recommended: Template,
 *   primary: Template[],      // 2–3 best-fit for this combo
 *   allTemplates: {           // grouped for "Browse All" drawer
 *     [categoryLabel]: Template[]
 *   }
 * }
 */
export const getTemplatesForStructure = (operationStructure, organizationType = "") => {
  const orgTag = resolveOrgTag(organizationType);

  let primaryIds = [];

  switch (operationStructure) {
    case "Single Building":
      if (orgTag === "healthcare")  primaryIds = ["single_healthcare", "single_clinic"];
      else if (orgTag === "commercial") primaryIds = ["single_mall", "single_office_tower"];
      else if (orgTag === "government") primaryIds = ["single_government", "single_judicial"];
      else if (orgTag === "public_infra") primaryIds = ["single_transit", "single_airport"];
      else if (orgTag === "hotel")  primaryIds = ["single_hotel", "single_boutique_hotel"];
      else                          primaryIds = ["single_standard", "single_compact"];
      break;

    case "Multiple Building Campus":
      if (orgTag === "healthcare")  primaryIds = ["campus_medical", "campus_research"];
      else if (orgTag === "commercial") primaryIds = ["campus_commercial", "campus_retail_entertainment"];
      else if (orgTag === "government") primaryIds = ["campus_govt", "campus_district"];
      else if (orgTag === "public_infra") primaryIds = ["campus_commercial", "campus_govt"];
      else if (orgTag === "hotel")  primaryIds = ["campus_hotel", "campus_hotel_convention"];
      else                          primaryIds = ["campus_corporate", "campus_edu"];
      break;

    case "Multiple Locations":
      if (orgTag === "healthcare")  primaryIds = ["network_healthcare_regional", "locations_city"];
      else if (orgTag === "commercial") primaryIds = ["locations_retail", "locations_city"];
      else if (orgTag === "government") primaryIds = ["locations_public_restrooms", "locations_city"];
      else if (orgTag === "public_infra") primaryIds = ["locations_transit", "locations_public_restrooms"];
      else if (orgTag === "hotel")  primaryIds = ["locations_city", "locations_retail"];
      else                          primaryIds = ["locations_city", "locations_retail"];
      break;

    case "Regional Network":
      if (orgTag === "healthcare")  primaryIds = ["network_healthcare_regional", "network_regional"];
      else if (orgTag === "government") primaryIds = ["network_govt_state", "network_regional"];
      else                          primaryIds = ["network_regional", "network_national"];
      break;

    case "National Network":
      if (orgTag === "healthcare")  primaryIds = ["network_healthcare_regional", "network_national"];
      else if (orgTag === "government") primaryIds = ["network_govt_state", "network_national"];
      else                          primaryIds = ["network_national", "network_regional"];
      break;

    default:
      primaryIds = ["single_standard", "single_compact"];
  }

  const primary = primaryIds.map((id) => TEMPLATES[id]).filter(Boolean);
  const recommended = primary[0] || TEMPLATES["single_standard"];

  // Build grouped "Browse All" list
  const allTemplates = {
    "Single Building": [
      TEMPLATES.single_standard,
      TEMPLATES.single_compact,
      TEMPLATES.single_healthcare,
      TEMPLATES.single_clinic,
      TEMPLATES.single_mall,
      TEMPLATES.single_office_tower,
      TEMPLATES.single_government,
      TEMPLATES.single_judicial,
      TEMPLATES.single_transit,
      TEMPLATES.single_airport,
      TEMPLATES.single_hotel,
      TEMPLATES.single_boutique_hotel,
    ],
    "Multi-Building Campus": [
      TEMPLATES.campus_corporate,
      TEMPLATES.campus_edu,
      TEMPLATES.campus_medical,
      TEMPLATES.campus_research,
      TEMPLATES.campus_govt,
      TEMPLATES.campus_district,
      TEMPLATES.campus_commercial,
      TEMPLATES.campus_retail_entertainment,
      TEMPLATES.campus_hotel,
      TEMPLATES.campus_hotel_convention,
    ],
    "Multiple Locations": [
      TEMPLATES.locations_city,
      TEMPLATES.locations_retail,
      TEMPLATES.locations_transit,
      TEMPLATES.locations_public_restrooms,
    ],
    "Regional / National": [
      TEMPLATES.network_regional,
      TEMPLATES.network_national,
      TEMPLATES.network_healthcare_regional,
      TEMPLATES.network_govt_state,
    ],
  };

  return { recommended, primary, allTemplates };
};

/* ====================================================================
   NODE BUILDER HELPERS (Always return fresh arrays with unique IDs)
   ==================================================================== */

// ─── SINGLE BUILDING ──────────────────────────────────────────────

function buildSingleBuildingNodes() {
  const rootId = generateTempId("node");
  const f1Id = generateTempId("node");
  const f2Id = generateTempId("node");
  const f3Id = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Main Building",            type: "building", parent_temp_id: null },
    { temp_id: f1Id,                    name: "Ground Floor",             type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Reception & Lobby",        type: "zone",     parent_temp_id: f1Id },
    { temp_id: generateTempId("node"),  name: "West Wing Restrooms",      type: "zone",     parent_temp_id: f1Id },
    { temp_id: f2Id,                    name: "1st Floor",                type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Executive Suite",          type: "zone",     parent_temp_id: f2Id },
    { temp_id: generateTempId("node"),  name: "East Wing Office Zone",    type: "zone",     parent_temp_id: f2Id },
    { temp_id: f3Id,                    name: "2nd Floor",                type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Cafeteria & Lounge",       type: "zone",     parent_temp_id: f3Id },
  ];
}

function buildCompactBuildingNodes() {
  const rootId = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Main Office Facility",     type: "building", parent_temp_id: null },
    { temp_id: generateTempId("node"),  name: "Reception & Lobby",        type: "zone",     parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Main Workspace",           type: "zone",     parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Cafeteria",                type: "zone",     parent_temp_id: rootId },
  ];
}

function buildHealthcareSingleNodes() {
  const rootId = generateTempId("node");
  const emgId = generateTempId("node");
  const opdId = generateTempId("node");
  const ipdId = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Main Hospital Tower",              type: "building", parent_temp_id: null },
    { temp_id: emgId,                   name: "Ground Floor — Emergency",         type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Triage & Emergency Ward",          type: "ward",     parent_temp_id: emgId },
    { temp_id: generateTempId("node"),  name: "ICU & Critical Care",              type: "ward",     parent_temp_id: emgId },
    { temp_id: opdId,                   name: "1st Floor — Outpatient (OPD)",     type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "General OPD Consultation",         type: "zone",     parent_temp_id: opdId },
    { temp_id: generateTempId("node"),  name: "Diagnostic Lab & Radiology",       type: "zone",     parent_temp_id: opdId },
    { temp_id: ipdId,                   name: "2nd Floor — Inpatient (IPD)",      type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "General Ward",                     type: "ward",     parent_temp_id: ipdId },
    { temp_id: generateTempId("node"),  name: "Private & Semi-Private Rooms",     type: "ward",     parent_temp_id: ipdId },
  ];
}

function buildClinicNodes() {
  const rootId = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Outpatient Clinic & Diagnostics",  type: "building", parent_temp_id: null },
    { temp_id: generateTempId("node"),  name: "Patient Reception & Waiting",      type: "zone",     parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Consultation Rooms",               type: "zone",     parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Diagnostic Lab",                   type: "zone",     parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Pharmacy & Billing",               type: "zone",     parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Restrooms",                        type: "zone",     parent_temp_id: rootId },
  ];
}

function buildMallNodes() {
  const rootId = generateTempId("node");
  const basId = generateTempId("node");
  const gfId  = generateTempId("node");
  const f1Id  = generateTempId("node");
  const f2Id  = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "City Shopping Mall",               type: "building", parent_temp_id: null },
    { temp_id: basId,                   name: "Basement — Food Court & Parking",  type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Food Court",                       type: "zone",     parent_temp_id: basId },
    { temp_id: generateTempId("node"),  name: "Parking Level B1",                 type: "zone",     parent_temp_id: basId },
    { temp_id: gfId,                    name: "Ground Floor — Anchor Stores",     type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Anchor Store East Wing",           type: "zone",     parent_temp_id: gfId },
    { temp_id: generateTempId("node"),  name: "Anchor Store West Wing",           type: "zone",     parent_temp_id: gfId },
    { temp_id: f1Id,                    name: "1st Floor — Fashion & Lifestyle",  type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Retail Galleria",                  type: "zone",     parent_temp_id: f1Id },
    { temp_id: f2Id,                    name: "2nd Floor — Entertainment",        type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Multiplex Cinema",                 type: "zone",     parent_temp_id: f2Id },
  ];
}

function buildOfficeTowerNodes() {
  const rootId = generateTempId("node");
  const gfId  = generateTempId("node");
  const f1Id  = generateTempId("node");
  const f2Id  = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Commercial Office Tower",          type: "building", parent_temp_id: null },
    { temp_id: gfId,                    name: "Ground Floor — Lobby & Amenities", type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Grand Lobby & Reception",          type: "zone",     parent_temp_id: gfId },
    { temp_id: generateTempId("node"),  name: "Café & Co-working Lounge",         type: "zone",     parent_temp_id: gfId },
    { temp_id: f1Id,                    name: "Floors 1–5 — Tenant Offices",      type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Office Wing A",                    type: "zone",     parent_temp_id: f1Id },
    { temp_id: generateTempId("node"),  name: "Office Wing B",                    type: "zone",     parent_temp_id: f1Id },
    { temp_id: f2Id,                    name: "Top Floor — Amenities & Terrace",  type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Sky Lounge & Meeting Rooms",       type: "zone",     parent_temp_id: f2Id },
  ];
}

function buildGovernmentOfficeNodes() {
  const rootId = generateTempId("node");
  const gfId  = generateTempId("node");
  const f1Id  = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Civic Administrative Office",      type: "building", parent_temp_id: null },
    { temp_id: gfId,                    name: "Ground Floor — Public Services",   type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Citizen Help Desk & Reception",    type: "zone",     parent_temp_id: gfId },
    { temp_id: generateTempId("node"),  name: "Document Submission Counter",      type: "zone",     parent_temp_id: gfId },
    { temp_id: generateTempId("node"),  name: "Public Waiting Area",              type: "zone",     parent_temp_id: gfId },
    { temp_id: f1Id,                    name: "1st Floor — Department Offices",   type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Revenue Department",               type: "zone",     parent_temp_id: f1Id },
    { temp_id: generateTempId("node"),  name: "Records & Archives Room",          type: "zone",     parent_temp_id: f1Id },
  ];
}

function buildJudicialCentreNodes() {
  const rootId = generateTempId("node");
  const gfId  = generateTempId("node");
  const f1Id  = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Municipal / Judicial Centre",      type: "building", parent_temp_id: null },
    { temp_id: gfId,                    name: "Ground Floor — Public Registry",   type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Public Registry & Filing Counter", type: "zone",     parent_temp_id: gfId },
    { temp_id: generateTempId("node"),  name: "Waiting Hall",                    type: "zone",     parent_temp_id: gfId },
    { temp_id: f1Id,                    name: "1st Floor — Courtrooms",           type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Courtroom A",                      type: "zone",     parent_temp_id: f1Id },
    { temp_id: generateTempId("node"),  name: "Administrative Chambers",          type: "zone",     parent_temp_id: f1Id },
  ];
}

function buildTransitTerminalNodes() {
  const rootId = generateTempId("node");
  const gfId  = generateTempId("node");
  const f1Id  = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Transit Terminal / Station Hub",   type: "building", parent_temp_id: null },
    { temp_id: gfId,                    name: "Ground Floor — Concourse",         type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Ticketing & Customer Service",     type: "zone",     parent_temp_id: gfId },
    { temp_id: generateTempId("node"),  name: "Passenger Waiting Lounge",         type: "zone",     parent_temp_id: gfId },
    { temp_id: generateTempId("node"),  name: "Restrooms & Amenities",            type: "zone",     parent_temp_id: gfId },
    { temp_id: f1Id,                    name: "Platform / Bay Level",             type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Platform / Bay A",                 type: "zone",     parent_temp_id: f1Id },
    { temp_id: generateTempId("node"),  name: "Platform / Bay B",                 type: "zone",     parent_temp_id: f1Id },
  ];
}

function buildAirportTerminalNodes() {
  const rootId = generateTempId("node");
  const depId = generateTempId("node");
  const arrId = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Airport Terminal",                 type: "building", parent_temp_id: null },
    { temp_id: depId,                   name: "Departures Level",                 type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Check-in Counters & Lobby",        type: "zone",     parent_temp_id: depId },
    { temp_id: generateTempId("node"),  name: "Security & Passport Control",      type: "zone",     parent_temp_id: depId },
    { temp_id: generateTempId("node"),  name: "Gate Concourse A & B",             type: "zone",     parent_temp_id: depId },
    { temp_id: generateTempId("node"),  name: "Duty Free & Retail Zone",          type: "zone",     parent_temp_id: depId },
    { temp_id: arrId,                   name: "Arrivals Level",                   type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Baggage Claim Hall",               type: "zone",     parent_temp_id: arrId },
    { temp_id: generateTempId("node"),  name: "Customs & Immigration",            type: "zone",     parent_temp_id: arrId },
  ];
}

function buildHotelNodes() {
  const rootId = generateTempId("node");
  const gfId  = generateTempId("node");
  const f1Id  = generateTempId("node");
  const f2Id  = generateTempId("node");
  const topId = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Hotel & Resort",                   type: "building", parent_temp_id: null },
    { temp_id: gfId,                    name: "Ground Floor — Lobby & Banquet",   type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Grand Lobby & Reception",          type: "zone",     parent_temp_id: gfId },
    { temp_id: generateTempId("node"),  name: "Banquet Hall & Conference Rooms",  type: "zone",     parent_temp_id: gfId },
    { temp_id: f1Id,                    name: "Floors 1–3 — Guest Rooms",         type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Standard & Deluxe Rooms",          type: "zone",     parent_temp_id: f1Id },
    { temp_id: generateTempId("node"),  name: "Suite & Premium Rooms",            type: "zone",     parent_temp_id: f1Id },
    { temp_id: f2Id,                    name: "Wellness Floor — Spa & Fitness",   type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Spa & Treatment Rooms",            type: "zone",     parent_temp_id: f2Id },
    { temp_id: topId,                   name: "Rooftop — Pool & Dining",          type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Infinity Pool & Sundeck",          type: "zone",     parent_temp_id: topId },
  ];
}

function buildBoutiqueHotelNodes() {
  const rootId = generateTempId("node");
  const gfId  = generateTempId("node");
  const f1Id  = generateTempId("node");
  const topId = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Boutique Hotel & Lounge",          type: "building", parent_temp_id: null },
    { temp_id: gfId,                    name: "Ground Floor — Restaurant & Bar",  type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Restaurant Dining Hall",           type: "zone",     parent_temp_id: gfId },
    { temp_id: generateTempId("node"),  name: "Bar & Lounge",                     type: "zone",     parent_temp_id: gfId },
    { temp_id: f1Id,                    name: "1st Floor — Guest Rooms",          type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Classic & Deluxe Rooms",           type: "zone",     parent_temp_id: f1Id },
    { temp_id: topId,                   name: "Rooftop Lounge & Event Space",     type: "floor",    parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Open-Air Rooftop Lounge",          type: "zone",     parent_temp_id: topId },
  ];
}

// ─── CAMPUS ─────────────────────────────────────────────────────────

function buildCorporateCampusNodes() {
  const rootId = generateTempId("node");
  const b1Id  = generateTempId("node");
  const b2Id  = generateTempId("node");
  const b3Id  = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Corporate Campus HQ",              type: "building", parent_temp_id: null },
    { temp_id: b1Id,                    name: "Block A — Admin & Management",     type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Ground Floor — Visitor Lobby",     type: "floor",    parent_temp_id: b1Id },
    { temp_id: b2Id,                    name: "Block B — Engineering & Tech",     type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "1st Floor — R&D Labs",             type: "floor",    parent_temp_id: b2Id },
    { temp_id: b3Id,                    name: "Block C — Operations",             type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Ground Floor — Operations Hall",   type: "floor",    parent_temp_id: b3Id },
  ];
}

function buildEduCampusNodes() {
  const rootId = generateTempId("node");
  const acadId = generateTempId("node");
  const sciId  = generateTempId("node");
  const adminId = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Main University Campus",           type: "building", parent_temp_id: null },
    { temp_id: acadId,                  name: "Academic Block",                   type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Lecture Halls",                    type: "floor",    parent_temp_id: acadId },
    { temp_id: sciId,                   name: "Science & Lab Tower",              type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Chemistry & Biology Labs",         type: "zone",     parent_temp_id: sciId },
    { temp_id: adminId,                 name: "Admin & Library Block",            type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Central Library",                  type: "zone",     parent_temp_id: adminId },
  ];
}

function buildMedicalCampusNodes() {
  const rootId = generateTempId("node");
  const h1Id  = generateTempId("node");
  const h2Id  = generateTempId("node");
  const opd   = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Multi-Speciality Medical Campus",  type: "building", parent_temp_id: null },
    { temp_id: h1Id,                    name: "Main Hospital Building",           type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Emergency & ICU Block",            type: "floor",    parent_temp_id: h1Id },
    { temp_id: generateTempId("node"),  name: "Operation Theatres",               type: "ward",     parent_temp_id: h1Id },
    { temp_id: h2Id,                    name: "Trauma Care Centre",               type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Trauma & Burn Unit",               type: "ward",     parent_temp_id: h2Id },
    { temp_id: opd,                     name: "OPD & Diagnostics Pavilion",       type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Specialist Clinics Floor",         type: "floor",    parent_temp_id: opd },
  ];
}

function buildResearchHospitalNodes() {
  const rootId = generateTempId("node");
  const clinId = generateTempId("node");
  const resId  = generateTempId("node");
  const admId  = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Speciality Hospital & Research Complex", type: "building", parent_temp_id: null },
    { temp_id: clinId,                  name: "Clinical Wing",                          type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "IPD & Surgical Wards",                  type: "ward",     parent_temp_id: clinId },
    { temp_id: resId,                   name: "Research & Academics Block",             type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Research Labs",                          type: "zone",     parent_temp_id: resId },
    { temp_id: admId,                   name: "Administrative Tower",                   type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Management & Finance Floor",             type: "floor",    parent_temp_id: admId },
  ];
}

function buildSecretariatCampusNodes() {
  const rootId = generateTempId("node");
  const minId  = generateTempId("node");
  const csId   = generateTempId("node");
  const admId  = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Secretariat & Civic Campus",       type: "building", parent_temp_id: null },
    { temp_id: minId,                   name: "Ministry Block",                   type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Departmental Offices",             type: "floor",    parent_temp_id: minId },
    { temp_id: csId,                    name: "Citizen Services Annex",           type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Public Help Desk & Counters",      type: "zone",     parent_temp_id: csId },
    { temp_id: admId,                   name: "Admin & IT Block",                 type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Server Room & Admin Offices",      type: "zone",     parent_temp_id: admId },
  ];
}

function buildDistrictComplexNodes() {
  const rootId = generateTempId("node");
  const colId  = generateTempId("node");
  const treId  = generateTempId("node");
  const prId   = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "District Administrative Complex",  type: "building", parent_temp_id: null },
    { temp_id: colId,                   name: "Collectorate Block",               type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Revenue & Land Records",           type: "floor",    parent_temp_id: colId },
    { temp_id: treId,                   name: "Treasury Wing",                    type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Accounts & Finance",               type: "zone",     parent_temp_id: treId },
    { temp_id: prId,                    name: "Public Relations Office",          type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Grievance & Information Centre",   type: "zone",     parent_temp_id: prId },
  ];
}

function buildBusinessParkNodes() {
  const rootId = generateTempId("node");
  const t1Id   = generateTempId("node");
  const t2Id   = generateTempId("node");
  const amenId = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Commercial Business Park",         type: "building", parent_temp_id: null },
    { temp_id: t1Id,                    name: "Tower A — Corporate Offices",      type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Floors 1–6 — Tenant Suites",       type: "floor",    parent_temp_id: t1Id },
    { temp_id: t2Id,                    name: "Tower B — Corporate Offices",      type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Floors 1–6 — Tenant Suites",       type: "floor",    parent_temp_id: t2Id },
    { temp_id: amenId,                  name: "Central Amenities Block",          type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Food Court & Cafeteria",           type: "zone",     parent_temp_id: amenId },
    { temp_id: generateTempId("node"),  name: "Parking & Lobby",                  type: "zone",     parent_temp_id: amenId },
  ];
}

function buildRetailEntertainmentNodes() {
  const rootId = generateTempId("node");
  const mallId = generateTempId("node");
  const mplxId = generateTempId("node");
  const parkId = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Retail & Entertainment Complex",   type: "building", parent_temp_id: null },
    { temp_id: mallId,                  name: "Shopping Mall Building",           type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Retail & Brand Stores Floor",      type: "floor",    parent_temp_id: mallId },
    { temp_id: mplxId,                  name: "Multiplex & Entertainment Block",  type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Cinema Screens & Gaming Zone",     type: "zone",     parent_temp_id: mplxId },
    { temp_id: parkId,                  name: "Parking Complex",                  type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Multi-Level Parking",              type: "floor",    parent_temp_id: parkId },
  ];
}

function buildLuxuryResortNodes() {
  const rootId = generateTempId("node");
  const mainId = generateTempId("node");
  const villaId = generateTempId("node");
  const evtId  = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Luxury Resort Complex",            type: "building", parent_temp_id: null },
    { temp_id: mainId,                  name: "Main Clubhouse & Lobby",           type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Lobby, Spa & Dining",              type: "zone",     parent_temp_id: mainId },
    { temp_id: villaId,                 name: "Villas & Cottages Wing",           type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Premium Villas — Block A",         type: "zone",     parent_temp_id: villaId },
    { temp_id: generateTempId("node"),  name: "Garden Cottages — Block B",        type: "zone",     parent_temp_id: villaId },
    { temp_id: evtId,                   name: "Events & Wedding Pavilion",        type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Grand Banquet Hall",               type: "zone",     parent_temp_id: evtId },
  ];
}

function buildHotelConventionNodes() {
  const rootId = generateTempId("node");
  const htlId  = generateTempId("node");
  const convId = generateTempId("node");
  const recId  = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Hotel & Convention Centre",        type: "building", parent_temp_id: null },
    { temp_id: htlId,                   name: "Hotel Tower",                      type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Lobby & Check-in",                 type: "zone",     parent_temp_id: htlId },
    { temp_id: generateTempId("node"),  name: "Guest Rooms Floors",               type: "floor",    parent_temp_id: htlId },
    { temp_id: convId,                  name: "Grand Convention Hall",            type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Main Convention Hall",             type: "zone",     parent_temp_id: convId },
    { temp_id: generateTempId("node"),  name: "Breakout & Meeting Rooms",         type: "zone",     parent_temp_id: convId },
    { temp_id: recId,                   name: "Recreation & F&B Block",           type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Pool, Gym & Spa",                  type: "zone",     parent_temp_id: recId },
  ];
}

// ─── MULTIPLE LOCATIONS ──────────────────────────────────────────────

function buildCityNetworkNodes() {
  const rootId = generateTempId("node");
  const b1Id   = generateTempId("node");
  const b2Id   = generateTempId("node");
  const b3Id   = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "City Branch Network",              type: "building", parent_temp_id: null },
    { temp_id: b1Id,                    name: "Headquarters — Central",           type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Main Operations Floor",            type: "floor",    parent_temp_id: b1Id },
    { temp_id: b2Id,                    name: "North Branch Office",              type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Service Floor",                    type: "floor",    parent_temp_id: b2Id },
    { temp_id: b3Id,                    name: "South Branch Office",              type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Service Floor",                    type: "floor",    parent_temp_id: b3Id },
  ];
}

function buildMultiStoreNodes() {
  const rootId = generateTempId("node");
  const s1     = generateTempId("node");
  const s2     = generateTempId("node");
  const s3     = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Retail Stores Network",            type: "building", parent_temp_id: null },
    { temp_id: s1,                      name: "Outlet #101 — Downtown",           type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Retail Floor & Restrooms",         type: "zone",     parent_temp_id: s1 },
    { temp_id: s2,                      name: "Outlet #102 — Mall Location",      type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Storefront & Storage",             type: "zone",     parent_temp_id: s2 },
    { temp_id: s3,                      name: "Outlet #103 — Suburbs",            type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Retail Floor & Restrooms",         type: "zone",     parent_temp_id: s3 },
  ];
}

function buildTransitNetworkNodes() {
  const rootId = generateTempId("node");
  const s1     = generateTempId("node");
  const s2     = generateTempId("node");
  const s3     = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Transit Network",                  type: "building", parent_temp_id: null },
    { temp_id: s1,                      name: "Central Hub Station",              type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Concourse & Platforms",            type: "floor",    parent_temp_id: s1 },
    { temp_id: s2,                      name: "Line 1 — North Station",           type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Platform & Waiting Area",          type: "floor",    parent_temp_id: s2 },
    { temp_id: s3,                      name: "Line 2 — South Station",           type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Platform & Waiting Area",          type: "floor",    parent_temp_id: s3 },
  ];
}

function buildPublicFacilitiesNetworkNodes() {
  const rootId = generateTempId("node");
  const n1     = generateTempId("node");
  const n2     = generateTempId("node");
  const n3     = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Municipal Public Facilities",      type: "building", parent_temp_id: null },
    { temp_id: n1,                      name: "North Zone Hub",                   type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Public Facility Area",             type: "zone",     parent_temp_id: n1 },
    { temp_id: n2,                      name: "Downtown Central Hub",             type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Public Facility Area",             type: "zone",     parent_temp_id: n2 },
    { temp_id: n3,                      name: "South Zone Hub",                   type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Public Facility Area",             type: "zone",     parent_temp_id: n3 },
  ];
}

// ─── REGIONAL / NATIONAL ────────────────────────────────────────────

function buildRegionalNetworkNodes() {
  const rootId = generateTempId("node");
  const reg1   = generateTempId("node");
  const reg2   = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "State Regional HQ",                type: "building", parent_temp_id: null },
    { temp_id: reg1,                    name: "Northern District Hub",            type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "District Operations Facility",     type: "floor",    parent_temp_id: reg1 },
    { temp_id: generateTempId("node"),  name: "Branch Office A",                  type: "zone",     parent_temp_id: reg1 },
    { temp_id: reg2,                    name: "Southern District Hub",            type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "District Operations Facility",     type: "floor",    parent_temp_id: reg2 },
    { temp_id: generateTempId("node"),  name: "Branch Office B",                  type: "zone",     parent_temp_id: reg2 },
  ];
}

function buildNationalNetworkNodes() {
  const rootId = generateTempId("node");
  const z1     = generateTempId("node");
  const z2     = generateTempId("node");
  const z3     = generateTempId("node");
  const z4     = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "National Operations HQ",           type: "building", parent_temp_id: null },
    { temp_id: z1,                      name: "North Zone Division",              type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Regional Hub Facility",            type: "floor",    parent_temp_id: z1 },
    { temp_id: z2,                      name: "South Zone Division",              type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Regional Hub Facility",            type: "floor",    parent_temp_id: z2 },
    { temp_id: z3,                      name: "East Zone Division",               type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Regional Hub Facility",            type: "floor",    parent_temp_id: z3 },
    { temp_id: z4,                      name: "West Zone Division",               type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Regional Hub Facility",            type: "floor",    parent_temp_id: z4 },
  ];
}

function buildHealthcareNetworkNodes() {
  const rootId = generateTempId("node");
  const flag   = generateTempId("node");
  const reg1   = generateTempId("node");
  const reg2   = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "Hospital Chain Network",           type: "building", parent_temp_id: null },
    { temp_id: flag,                    name: "Flagship Hospital",                type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Emergency & Speciality Floors",    type: "floor",    parent_temp_id: flag },
    { temp_id: reg1,                    name: "Regional Medical Centre — North",  type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "OPD & General Ward",               type: "floor",    parent_temp_id: reg1 },
    { temp_id: reg2,                    name: "Regional Medical Centre — South",  type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "OPD & General Ward",               type: "floor",    parent_temp_id: reg2 },
  ];
}

function buildStateGovtNetworkNodes() {
  const rootId = generateTempId("node");
  const hq     = generateTempId("node");
  const div1   = generateTempId("node");
  const div2   = generateTempId("node");
  return [
    { temp_id: rootId,                  name: "State Government Field Offices",   type: "building", parent_temp_id: null },
    { temp_id: hq,                      name: "State Headquarters",               type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "Administrative Floors",            type: "floor",    parent_temp_id: hq },
    { temp_id: div1,                    name: "Divisional Office — North",        type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "District & Taluka Offices",        type: "zone",     parent_temp_id: div1 },
    { temp_id: div2,                    name: "Divisional Office — South",        type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"),  name: "District & Taluka Offices",        type: "zone",     parent_temp_id: div2 },
  ];
}
