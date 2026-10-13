export const buildDeploymentPayload = (draft) => {
  const validHierarchyTempIds = new Set(draft.hierarchy.map(n => n.temp_id));
  const payload = {
    // ❌ discovery is completely removed
    hierarchy: draft.hierarchy.map((n) => ({
      temp_id: n.temp_id,
      name: n.name,
      type: n.type,
      parent_temp_id: validHierarchyTempIds.has(n.parent_temp_id) ? n.parent_temp_id : null,
    })),
    washrooms: draft.washrooms.map((w) => {
      let usageCategory = w.usage_category;
      if (!usageCategory && w.rawFixtures) {
        usageCategory = {};
        const categories =
          w.type === "male"
            ? ["men"]
            : w.type === "female"
              ? ["women"]
              : w.type === "handicap"
                ? ["handicap"]
                : ["men", "women"];

        categories.forEach((catKey) => {
          const src = w.rawFixtures[catKey] || {};
          usageCategory[catKey] = {
            wc: Number(src.wc ?? 0),
            indian: Number(src.indian ?? src.ind ?? 0),
            urinals: Number(src.urinals ?? src.uri ?? 0),
            basin: Number(src.basin ?? src.bas ?? 0),
            shower: Number(src.shower ?? src.sho ?? 0),
          };
        });
      }

      return {
        temp_id: w.temp_id,
        name: w.name,
        type: w.type,
        zone_temp_id: validHierarchyTempIds.has(w.zone_temp_id)
          ? w.zone_temp_id
          : null,
        wc_count: w.wc_count,
        basin_count: w.basin_count,
        is_public: !!w.is_public,
        usage_category: usageCategory || null,
      };
    }),
    users: draft.users.map((u) => ({
      name: u.name,
      phone: u.phone,
      role: u.role,
      assigned_locations: u.assigned_washrooms || [],
      assigned_zone_temp_id: u.assigned_zone_temp_id || null,
    })),
  };

  console.log(
    "📦 [Payload Builder] Final Payload Generated:",
    JSON.stringify(payload, null, 2),
  );
  return payload;
};
