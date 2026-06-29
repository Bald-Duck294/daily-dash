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
    const userNode = {
      id: u.temp_id,
      name: u.name,
      type: u.role,
      meta: u.role.toUpperCase(),
    };

    if (u.role === "cleaner" && u.assigned_washrooms?.length > 0) {
      // Find the specific washroom in the map and attach the cleaner to it
      const targetWashroom = nodeMap[u.assigned_washrooms[0]];
      if (targetWashroom) {
        targetWashroom.children.push(userNode);
      }
    } else if (u.role === "supervisor" && u.assigned_zone_temp_id) {
      // Attach supervisor to the zone
      const targetZone = nodeMap[u.assigned_zone_temp_id];
      if (targetZone) {
        targetZone.children.push(userNode);
      }
    }
  });

  return rootNodes;
};
