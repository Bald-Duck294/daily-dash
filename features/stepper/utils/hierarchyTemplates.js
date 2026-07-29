import { generateTempId } from "./hierarchyUtils";

/**
 * Hierarchy Templates Registry
 * Generates fresh node arrays with unique temp_ids for each operation structure.
 */

export const getTemplatesForStructure = (operationStructure, organizationType = "") => {
  const isHealthcare =
    organizationType?.toLowerCase().includes("hospital") ||
    organizationType?.toLowerCase().includes("health") ||
    organizationType?.toLowerCase().includes("clinic");

  const isEdu =
    organizationType?.toLowerCase().includes("school") ||
    organizationType?.toLowerCase().includes("college") ||
    organizationType?.toLowerCase().includes("university") ||
    organizationType?.toLowerCase().includes("education");

  // Base list of templates per operation structure
  switch (operationStructure) {
    case "Single Building":
      return [
        {
          id: "single_standard",
          label: "Standard Multi-Floor",
          icon: "🏢",
          desc: "Main building with 3 floors and zone partitions",
          isRecommended: !isHealthcare,
          buildNodes: () => buildSingleBuildingNodes(),
        },
        {
          id: "single_compact",
          label: "Single Floor / Small Facility",
          icon: "🏠",
          desc: "Flat hierarchy ideal for small offices or single floor space",
          isRecommended: false,
          buildNodes: () => buildCompactBuildingNodes(),
        },
        ...(isHealthcare
          ? [
              {
                id: "single_healthcare",
                label: "Hospital Tower",
                icon: "🏥",
                desc: "OPD, IPD, Emergency, and specialized wards",
                isRecommended: true,
                buildNodes: () => buildHealthcareSingleNodes(),
              },
            ]
          : []),
      ];

    case "Multiple Building Campus":
      return [
        {
          id: "campus_corporate",
          label: "Corporate Campus",
          icon: "🏘️",
          desc: "Admin Block, Tech Tower, and Operations Building",
          isRecommended: !isHealthcare && !isEdu,
          buildNodes: () => buildCorporateCampusNodes(),
        },
        {
          id: "campus_edu",
          label: "Academic Campus",
          icon: "🎓",
          desc: "Academic Block, Science Wing, and Admin Building",
          isRecommended: isEdu,
          buildNodes: () => buildEduCampusNodes(),
        },
        {
          id: "campus_medical",
          label: "Medical Center Campus",
          icon: "🏥",
          desc: "Main Hospital, Trauma Center, and Outpatient Pavilion",
          isRecommended: isHealthcare,
          buildNodes: () => buildMedicalCampusNodes(),
        },
      ];

    case "Multiple Locations":
      return [
        {
          id: "locations_city",
          label: "City Branch Network",
          icon: "📍",
          desc: "Central HQ with North, South, and Downtown branches",
          isRecommended: true,
          buildNodes: () => buildCityNetworkNodes(),
        },
        {
          id: "locations_retail",
          label: "Multi-Store Facility",
          icon: "🏪",
          desc: "Distributed retail or service outlets across city",
          isRecommended: false,
          buildNodes: () => buildMultiStoreNodes(),
        },
      ];

    case "Regional Network":
    case "National Network":
      return [
        {
          id: "network_regional",
          label: "Regional Operations Network",
          icon: "🗺️",
          desc: "Regional HQs, District Hubs, and Local Branches",
          isRecommended: true,
          buildNodes: () => buildRegionalNetworkNodes(),
        },
        {
          id: "network_national",
          label: "National Network",
          icon: "🌐",
          desc: "Zonal HQs across North, South, East, and West divisions",
          isRecommended: operationStructure === "National Network",
          buildNodes: () => buildNationalNetworkNodes(),
        },
      ];

    default:
      return [
        {
          id: "default_building",
          label: "Standard Facility",
          icon: "🏢",
          desc: "Main building with ground and 1st floor",
          isRecommended: true,
          buildNodes: () => buildSingleBuildingNodes(),
        },
      ];
  }
};

/* ====================================================================
   NODE BUILDER HELPERS (Always return fresh arrays with unique IDs)
   ==================================================================== */

function buildSingleBuildingNodes() {
  const rootId = generateTempId("node");
  const f1Id = generateTempId("node");
  const f2Id = generateTempId("node");
  const f3Id = generateTempId("node");

  return [
    { temp_id: rootId, name: "Main Building", type: "building", parent_temp_id: null },
    { temp_id: f1Id, name: "Ground Floor", type: "floor", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Reception & Lobby", type: "zone", parent_temp_id: f1Id },
    { temp_id: generateTempId("node"), name: "West Wing Restrooms", type: "zone", parent_temp_id: f1Id },
    { temp_id: f2Id, name: "1st Floor", type: "floor", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Executive Suite", type: "zone", parent_temp_id: f2Id },
    { temp_id: generateTempId("node"), name: "East Wing Office Zone", type: "zone", parent_temp_id: f2Id },
    { temp_id: f3Id, name: "2nd Floor", type: "floor", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Cafeteria & Lounge", type: "zone", parent_temp_id: f3Id },
  ];
}

function buildCompactBuildingNodes() {
  const rootId = generateTempId("node");

  return [
    { temp_id: rootId, name: "Main Office Facility", type: "building", parent_temp_id: null },
    { temp_id: generateTempId("node"), name: "Reception & Lobby", type: "zone", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Main Workspace", type: "zone", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Cafeteria", type: "zone", parent_temp_id: rootId },
  ];
}

function buildHealthcareSingleNodes() {
  const rootId = generateTempId("node");
  const opdId = generateTempId("node");
  const ipdId = generateTempId("node");
  const emgId = generateTempId("node");

  return [
    { temp_id: rootId, name: "Main Hospital Tower", type: "building", parent_temp_id: null },
    { temp_id: emgId, name: "Ground Floor (Emergency)", type: "floor", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Triage & Emergency Ward", type: "ward", parent_temp_id: emgId },
    { temp_id: opdId, name: "1st Floor (Outpatient OPD)", type: "floor", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "General OPD Ward", type: "ward", parent_temp_id: opdId },
    { temp_id: generateTempId("node"), name: "Pediatric Consultation", type: "zone", parent_temp_id: opdId },
    { temp_id: ipdId, name: "2nd Floor (Inpatient IPD)", type: "floor", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "ICU Ward", type: "ward", parent_temp_id: ipdId },
    { temp_id: generateTempId("node"), name: "Special Private Wards", type: "ward", parent_temp_id: ipdId },
  ];
}

function buildCorporateCampusNodes() {
  const rootId = generateTempId("node");
  const b1Id = generateTempId("node");
  const b2Id = generateTempId("node");
  const b1f1Id = generateTempId("node");

  return [
    { temp_id: rootId, name: "Corporate Campus HQ", type: "building", parent_temp_id: null },
    { temp_id: b1Id, name: "Block A (Admin & Management)", type: "building", parent_temp_id: rootId },
    { temp_id: b1f1Id, name: "Ground Floor", type: "floor", parent_temp_id: b1Id },
    { temp_id: generateTempId("node"), name: "Visitor Lobby & Audit Room", type: "zone", parent_temp_id: b1f1Id },
    { temp_id: b2Id, name: "Block B (Engineering & Tech)", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "1st Floor R&D Labs", type: "floor", parent_temp_id: b2Id },
  ];
}

function buildEduCampusNodes() {
  const rootId = generateTempId("node");
  const acadId = generateTempId("node");
  const sciId = generateTempId("node");

  return [
    { temp_id: rootId, name: "Main University Campus", type: "building", parent_temp_id: null },
    { temp_id: acadId, name: "Academic Block", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Lecture Halls (Floor 1)", type: "floor", parent_temp_id: acadId },
    { temp_id: sciId, name: "Science & Lab Tower", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Chemistry & Bio Labs", type: "zone", parent_temp_id: sciId },
  ];
}

function buildMedicalCampusNodes() {
  const rootId = generateTempId("node");
  const h1Id = generateTempId("node");
  const h2Id = generateTempId("node");

  return [
    { temp_id: rootId, name: "Medicare Health Campus", type: "building", parent_temp_id: null },
    { temp_id: h1Id, name: "Main Hospital Building", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Emergency & ICU Block", type: "floor", parent_temp_id: h1Id },
    { temp_id: h2Id, name: "Outpatient Pavilion", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Specialist Clinics Floor", type: "floor", parent_temp_id: h2Id },
  ];
}

function buildCityNetworkNodes() {
  const rootId = generateTempId("node");
  const b1Id = generateTempId("node");
  const b2Id = generateTempId("node");

  return [
    { temp_id: rootId, name: "Metropolitan Network", type: "building", parent_temp_id: null },
    { temp_id: b1Id, name: "Central Downtown Branch", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Customer Service Floor", type: "floor", parent_temp_id: b1Id },
    { temp_id: b2Id, name: "Northside Branch", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Main Facility Area", type: "floor", parent_temp_id: b2Id },
  ];
}

function buildMultiStoreNodes() {
  const rootId = generateTempId("node");
  const s1 = generateTempId("node");
  const s2 = generateTempId("node");

  return [
    { temp_id: rootId, name: "Retail Stores Network", type: "building", parent_temp_id: null },
    { temp_id: s1, name: "Store #101 (Downtown)", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Retail Floor & Washrooms", type: "zone", parent_temp_id: s1 },
    { temp_id: s2, name: "Store #102 (Mall Location)", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Storefront & Storage", type: "zone", parent_temp_id: s2 },
  ];
}

function buildRegionalNetworkNodes() {
  const rootId = generateTempId("node");
  const reg1 = generateTempId("node");
  const reg2 = generateTempId("node");

  return [
    { temp_id: rootId, name: "State Regional HQ", type: "building", parent_temp_id: null },
    { temp_id: reg1, name: "Northern District Hub", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Main District Operations", type: "floor", parent_temp_id: reg1 },
    { temp_id: reg2, name: "Southern District Hub", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Regional Service Facility", type: "floor", parent_temp_id: reg2 },
  ];
}

function buildNationalNetworkNodes() {
  const rootId = generateTempId("node");
  const z1 = generateTempId("node");
  const z2 = generateTempId("node");

  return [
    { temp_id: rootId, name: "National Operations HQ", type: "building", parent_temp_id: null },
    { temp_id: z1, name: "North Zone Division", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Regional Hub Facility", type: "floor", parent_temp_id: z1 },
    { temp_id: z2, name: "South Zone Division", type: "building", parent_temp_id: rootId },
    { temp_id: generateTempId("node"), name: "Regional Hub Facility", type: "floor", parent_temp_id: z2 },
  ];
}
