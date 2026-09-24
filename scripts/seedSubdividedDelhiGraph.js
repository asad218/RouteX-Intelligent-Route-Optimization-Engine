const db = require('../src/db/db');

// Core landmark nodes
const baseNodes = [
  { id: 'ig_center', name: 'India Gate C-Hexagon', lat: 28.6129, lon: 77.2295 },
  { id: 'ig_shahjahan', name: 'Shahjahan Road North', lat: 28.6105, lon: 77.2260 },
  { id: 'ig_pandara', name: 'Pandara Road North', lat: 28.6100, lon: 77.2308 },
  { id: 'ig_zakir', name: 'Dr Zakir Hussain Marg North', lat: 28.6110, lon: 77.2335 },
  { id: 'shahjahan_mid', name: 'Shahjahan Road Mid', lat: 28.6060, lon: 77.2230 },
  { id: 'shahjahan_rotary', name: 'Humayun Road Roundabout', lat: 28.6020, lon: 77.2205 },
  { id: 'pandara_mid', name: 'Pandara Road Market', lat: 28.6045, lon: 77.2295 },
  { id: 'pandara_south', name: 'Pandara Road South', lat: 28.6000, lon: 77.2280 },
  { id: 'khan_mkt_entry', name: 'Khan Market North', lat: 28.6002, lon: 77.2270 },
  { id: 'khan_mkt_south', name: 'Khan Market South', lat: 28.5978, lon: 77.2255 },
  { id: 'sb_marg_jnc', name: 'Subramaniam Bharti Marg', lat: 28.5970, lon: 77.2240 },
  { id: 'prithviraj_mid', name: 'Prithviraj Road Mid', lat: 28.5980, lon: 77.2185 },
  { id: 'lodhi_jnc', name: 'Lodhi Road Junction', lat: 28.5945, lon: 77.2180 },
  { id: 'lodhi_garden_entry', name: 'Lodhi Garden Gate', lat: 28.5933, lon: 77.2179 },
  { id: 'janpath_south', name: 'Janpath & Kartavya Path', lat: 28.6130, lon: 77.2180 },
  { id: 'janpath_mid', name: 'Janpath Crossing', lat: 28.6220, lon: 77.2190 },
  { id: 'cp_outer', name: 'Connaught Place Outer', lat: 28.6315, lon: 77.2167 },
  { id: 'mandi_house', name: 'Mandi House', lat: 28.6258, lon: 77.2343 }
];

const roadConnections = [
  ['ig_center', 'ig_shahjahan'],
  ['ig_center', 'ig_pandara'],
  ['ig_center', 'ig_zakir'],
  ['ig_shahjahan', 'shahjahan_mid'],
  ['shahjahan_mid', 'shahjahan_rotary'],
  ['shahjahan_rotary', 'prithviraj_mid'],
  ['shahjahan_rotary', 'khan_mkt_entry'],
  ['ig_pandara', 'pandara_mid'],
  ['pandara_mid', 'pandara_south'],
  ['pandara_south', 'khan_mkt_entry'],
  ['khan_mkt_entry', 'khan_mkt_south'],
  ['khan_mkt_south', 'sb_marg_jnc'],
  ['sb_marg_jnc', 'lodhi_jnc'],
  ['prithviraj_mid', 'lodhi_jnc'],
  ['lodhi_jnc', 'lodhi_garden_entry'],
  ['ig_center', 'janpath_south'],
  ['janpath_south', 'janpath_mid'],
  ['janpath_mid', 'cp_outer'],
  ['ig_zakir', 'mandi_house'],
  ['mandi_house', 'cp_outer']
];

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function seedSubdividedGraph() {
  try {
    console.log("Subdividing road segments into short 150m street waypoints...");
    
    const finalNodes = new Map();
    baseNodes.forEach(n => finalNodes.set(n.id, n));

    const finalEdges = [];
    let subNodeCounter = 1;

    for (const [fromId, toId] of roadConnections) {
      const u = finalNodes.get(fromId);
      const v = finalNodes.get(toId);
      const dist = haversine(u.lat, u.lon, v.lat, v.lon);

      // Number of subdivisions based on segment distance (1 node per 150m)
      const numSegments = Math.max(1, Math.round(dist / 150));

      let prevId = fromId;

      for (let i = 1; i < numSegments; i++) {
        const fraction = i / numSegments;
        const subLat = u.lat + (v.lat - u.lat) * fraction;
        const subLon = u.lon + (v.lon - u.lon) * fraction;
        const subId = `sub_${subNodeCounter++}`;

        finalNodes.set(subId, {
          id: subId,
          name: `Road Waypoint ${subId}`,
          lat: subLat,
          lon: subLon
        });

        const segDist = Math.round(haversine(
          finalNodes.get(prevId).lat, finalNodes.get(prevId).lon,
          subLat, subLon
        ));

        finalEdges.push({ from: prevId, to: subId, weight: segDist });
        finalEdges.push({ from: subId, to: prevId, weight: segDist });

        prevId = subId;
      }

      // Connect last waypoint to destination
      const lastDist = Math.round(haversine(
        finalNodes.get(prevId).lat, finalNodes.get(prevId).lon,
        v.lat, v.lon
      ));
      finalEdges.push({ from: prevId, to: toId, weight: lastDist });
      finalEdges.push({ from: toId, to: prevId, weight: lastDist });
    }

    console.log(`Generated ${finalNodes.size} fine-grained road nodes and ${finalEdges.length} street edges.`);

    console.log("Cleaning old database tables...");
    await db.query("DELETE FROM edges");
    await db.query("DELETE FROM nodes");

    console.log("Inserting subdivided road nodes into MySQL...");
    for (const n of finalNodes.values()) {
      await db.query(
        "INSERT INTO nodes (id, name, latitude, longitude) VALUES (?, ?, ?, ?)",
        [n.id, n.name, n.lat, n.lon]
      );
    }

    console.log("Inserting subdivided road edges into MySQL...");
    for (const e of finalEdges) {
      await db.query(
        "INSERT INTO edges (from_node, to_node, weight) VALUES (?, ?, ?)",
        [e.from, e.to, e.weight]
      );
    }

    console.log("Subdivided fine-grained road graph seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedSubdividedGraph();
