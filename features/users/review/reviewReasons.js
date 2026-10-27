// Mapping of reason IDs from the public QR user review submission form
export const commonIndianWashroomIssues = [
  { id: 1, text: "Dirty or unflushed toilets (Western or Indian)", shortText: "Dirty / Unflushed Toilets", category: "hygiene", severity: "high" },
  { id: 2, text: "Wet, slippery, or muddy floors", shortText: "Slippery / Wet Floors", category: "safety", severity: "medium" },
  { id: 3, text: "Unpleasant or strong odor", shortText: "Foul Odor", category: "hygiene", severity: "medium" },
  { id: 4, text: "Paan / Gutka spit stains", shortText: "Paan / Spit Stains", category: "cleanliness", severity: "high" },
  { id: 5, text: "Overflowing dustbins", shortText: "Overflowing Dustbins", category: "waste", severity: "medium" },
  { id: 6, text: "General grime (stained walls, dirty mirrors)", shortText: "Dirty Walls / Mirrors", category: "cleanliness", severity: "medium" },
  { id: 7, text: "No water in taps or for flush", shortText: "No Running Water", category: "water", severity: "critical" },
  { id: 8, text: "Leaking taps, pipes, or cisterns", shortText: "Water Leakage", category: "maintenance", severity: "medium" },
  { id: 9, text: "Broken or missing health faucet (jet spray)", shortText: "Broken Jet Spray", category: "fixtures", severity: "medium" },
  { id: 10, text: "No mug or lota available", shortText: "No Mug / Lota", category: "amenities", severity: "low" },
  { id: 11, text: "Broken or missing toilet seat", shortText: "Broken Toilet Seat", category: "fixtures", severity: "medium" },
  { id: 12, text: "Faulty or broken door lock/latch", shortText: "Broken Door Lock", category: "safety", severity: "high" },
  { id: 13, text: "Low water pressure", shortText: "Low Water Pressure", category: "water", severity: "low" },
  { id: 14, text: "No hand-washing soap", shortText: "No Soap Available", category: "supplies", severity: "medium" },
  { id: 15, text: "No toilet paper available", shortText: "No Toilet Paper", category: "supplies", severity: "low" },
  { id: 16, text: "Faulty hand dryer or no paper towels", shortText: "No Hand Dryer / Towels", category: "amenities", severity: "low" },
  { id: 17, text: "Poor or no lighting", shortText: "Poor / No Lighting", category: "safety", severity: "high" },
  { id: 18, text: "No hooks for bags or clothes", shortText: "No Bag Hooks", category: "amenities", severity: "low" },
  { id: 19, text: "Poor ventilation (no fan or window)", shortText: "Poor Ventilation", category: "hygiene", severity: "medium" },
  { id: 0, text: "No Issues", shortText: "Clean & Well-Maintained", category: "positive", severity: "none" },
];

const issueMap = new Map(commonIndianWashroomIssues.map((item) => [item.id, item]));

export const getReasonById = (id) => {
  const numId = Number(id);
  return issueMap.get(numId) || {
    id: numId,
    text: `Issue #${numId}`,
    shortText: `Issue #${numId}`,
    category: "general",
    severity: "medium"
  };
};

export const getReasonText = (id) => {
  return getReasonById(id).text;
};

export const getReasonsList = (reasonIds) => {
  if (!Array.isArray(reasonIds) || reasonIds.length === 0) return [];
  return reasonIds.map((id) => getReasonById(id));
};
