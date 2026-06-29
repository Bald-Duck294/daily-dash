export const buildDeploymentPayload = (draft) => {
  const payload = {
    // ❌ discovery is completely removed
    hierarchy: draft.hierarchy.map((n) => ({
      temp_id: n.temp_id,
      name: n.name,
      type: n.type,
      parent_temp_id: n.parent_temp_id,
    })),
    washrooms: draft.washrooms.map((w) => ({
      temp_id: w.temp_id,
      name: w.name,
      type: w.type,
      zone_temp_id: w.zone_temp_id,
      wc_count: w.wc_count,
      basin_count: w.basin_count,
    })),
    users: draft.users.map((u) => ({
      name: u.name,
      phone: u.phone,
      role: u.role,
      assigned_washroom_temp_id:
        u.assigned_washrooms?.length > 0 ? u.assigned_washrooms[0] : null,
      assigned_zone_temp_id: u.assigned_zone_temp_id || null,
    })),
  };

  console.log(
    "📦 [Payload Builder] Final Payload Generated:",
    JSON.stringify(payload, null, 2),
  );
  return payload;
};
