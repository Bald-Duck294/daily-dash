export const generateTempId = (prefix = "id") => {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
};

export const buildTreeData = (nodes = [], washrooms = [], users = []) => {
  const nodeMap = {};

  // 1. Map Hierarchy Nodes
  nodes.forEach((n) => {
    nodeMap[n.temp_id] = { ...n, id: n.temp_id, children: [] };
  });

  const rootNodes = [];

  // 2. Connect Hierarchy Nodes
  nodes.forEach((n) => {
    if (n.parent_temp_id && nodeMap[n.parent_temp_id]) {
      nodeMap[n.parent_temp_id].children.push(nodeMap[n.temp_id]);
    } else {
      rootNodes.push(nodeMap[n.temp_id]);
    }
  });

  // 3. Map & Connect Washrooms
  washrooms.forEach((w) => {
    const wNode = {
      id: w.temp_id,
      name: w.name,
      type: "washroom",
      meta: `WC: ${w.wc_count || 0} | Basin: ${w.basin_count || 0}`,
      children: [],
    };
    nodeMap[w.temp_id] = wNode; // Add to map so users can find it

    if (w.zone_temp_id && nodeMap[w.zone_temp_id]) {
      nodeMap[w.zone_temp_id].children.push(wNode);
    }
  });

  // 4. Connect Users
  users.forEach((u) => {
    if (u.role === "cleaner" && u.assigned_washrooms?.length > 0) {
      // Iterate over all assigned washrooms to create duplicated visual nodes
      u.assigned_washrooms.forEach((washroomId) => {
        const targetWashroom = nodeMap[washroomId];
        if (targetWashroom) {
          const userNode = {
            id: `${u.temp_id}_assigned_${washroomId}`,
            name: u.name,
            type: u.role,
            meta: u.role.toUpperCase(),
          };
          targetWashroom.children.push(userNode);
        }
      });
    } else if (u.role === "supervisor" && u.assigned_zone_temp_id) {
      // Attach supervisor to the zone
      const targetZone = nodeMap[u.assigned_zone_temp_id];
      if (targetZone) {
        const userNode = {
          id: `${u.temp_id}_assigned_${u.assigned_zone_temp_id}`,
          name: u.name,
          type: u.role,
          meta: u.role.toUpperCase(),
        };
        targetZone.children.push(userNode);
      }
    }
  });

  return rootNodes;
};
