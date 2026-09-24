const db = require('../src/db/db');

// Detailed road network graph following real streets in Central Delhi
const nodes = [
  // India Gate Area
  { id: 'ig_center', name: 'India Gate C-Hexagon', lat: 28.6129, lon: 77.2295 },
  { id: 'ig_shahjahan', name: 'Shahjahan Road North', lat: 28.6105, lon: 77.2260 },
  { id: 'ig_pandara', name: 'Pandara Road North', lat: 28.6100, lon: 77.2308 },
  { id: 'ig_zakir', name: 'Dr Zakir Hussain Marg North', lat: 28.6110, lon: 77.2335 },
  
  // Shahjahan Road Corridor
  { id: 'shahjahan_mid', name: 'Shahjahan Road Mid', lat: 28.6060, lon: 77.2230 },
  { id: 'shahjahan_rotary', name: 'Humayun Road Roundabout', lat: 28.6020, lon: 77.2205 },
  
  // Pandara Road Corridor
  { id: 'pandara_mid', name: 'Pandara Road Market', lat: 28.6045, lon: 77.2295 },
  { id: 'pandara_south', name: 'Pandara Road South', lat: 28.6000, lon: 77.2280 },
  
  // Khan Market & Sub. Bharti Marg
  { id: 'khan_mkt_entry', name: 'Khan Market North', lat: 28.6002, lon: 77.2270 },
  { id: 'khan_mkt_south', name: 'Khan Market South', lat: 28.5978, lon: 77.2255 },
  { id: 'sb_marg_jnc', name: 'Subramaniam Bharti Marg', lat: 28.5970, lon: 77.2240 },

  // Amrita Shergill & Prithviraj Road
  { id: 'prithviraj_mid', name: 'Prithviraj Road Mid', lat: 28.5980, lon: 77.2185 },
  { id: 'lodhi_jnc', name: 'Lodhi Road Junction', lat: 28.5945, lon: 77.2180 },
  { id: 'lodhi_garden_entry', name: 'Lodhi Garden Gate', lat: 28.5933, lon: 77.2179 },

  // Connaught Place & Janpath Corridor
  { id: 'janpath_south', name: 'Janpath & Kartavya Path', lat: 28.6130, lon: 77.2180 },
  { id: 'janpath_mid', name: 'Janpath Crossing', lat: 28.6220, lon: 77.2190 },
  { id: 'cp_outer', name: 'Connaught Place Outer', lat: 28.6315, lon: 77.2167 },
  { id: 'mandi_house', name: 'Mandi House', lat: 28.6258, lon: 77.2343 }
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

// Actual road connections along physical streets
const roadEdges = [
  // India Gate C-Hexagon Ring
  ['ig_center', 'ig_shahjahan'],
  ['ig_center', 'ig_pandara'],
  ['ig_center', 'ig_zakir'],
  
  // Route 1 via Shahjahan Road
  ['ig_shahjahan', 'shahjahan_mid'],
  ['shahjahan_mid', 'shahjahan_rotary'],
  ['shahjahan_rotary', 'prithviraj_mid'],
  ['shahjahan_rotary', 'khan_mkt_entry'],

  // Route 2 via Pandara Road
  ['ig_pandara', 'pandara_mid'],
  ['pandara_mid', 'pandara_south'],
  ['pandara_south', 'khan_mkt_entry'],

  // Khan Market to Lodhi Garden Streets
  ['khan_mkt_entry', 'khan_mkt_south'],
  ['khan_mkt_south', 'sb_marg_jnc'],
  ['sb_marg_jnc', 'lodhi_jnc'],
  ['prithviraj_mid', 'lodhi_jnc'],
  ['lodhi_jnc', 'lodhi_garden_entry'],

  // Janpath & CP Corridor
  ['ig_center', 'janpath_south'],
  ['janpath_south', 'janpath_mid'],
  ['janpath_mid', 'cp_outer'],
  ['ig_zakir', 'mandi_house'],
  ['mandi_house', 'cp_outer']
];

async function seed() {
  try {
    console.log("Cleaning old nodes and edges...");
    await db.query("DELETE FROM edges");
    await db.query("DELETE FROM nodes");

    console.log(`Inserting ${nodes.length} detailed road nodes...`);
    for (const n of nodes) {
      await db.query(
        "INSERT INTO nodes (id, name, latitude, longitude) VALUES (?, ?, ?, ?)",
        [n.id, n.name, n.lat, n.lon]
      );
    }

    console.log(`Inserting ${roadEdges.length * 2} bidirectional road edges...`);
    for (const [from, to] of roadEdges) {
      const n1 = nodes.find(n => n.id === from);
      const n2 = nodes.find(n => n.id === to);
      const weight = Math.round(haversine(n1.lat, n1.lon, n2.lat, n2.lon));

      await db.query(
        "INSERT INTO edges (from_node, to_node, weight) VALUES (?, ?, ?), (?, ?, ?)",
        [from, to, weight, to, from, weight]
      );
    }

    console.log("Detailed road graph seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
