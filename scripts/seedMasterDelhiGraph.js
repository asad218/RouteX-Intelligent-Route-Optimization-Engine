const db = require('../src/db/db');

// Master detailed road network graph following exact street layout in Delhi
const nodes = [
  // 1. India Gate & Kartavya Path / Rajpath Axis
  { id: 'ig_center', name: 'India Gate C-Hexagon', lat: 28.6129, lon: 77.2295 },
  { id: 'ig_c_hexagon_west', name: 'Kartavya Path Entry', lat: 28.6129, lon: 77.2255 },
  { id: 'kartavya_mansingh', name: 'Kartavya Path & Man Singh Rd', lat: 28.6130, lon: 77.2180 },
  { id: 'kartavya_janpath', name: 'Kartavya Path & Janpath', lat: 28.6132, lon: 77.2115 },
  { id: 'rashtrapati_bhavan', name: 'Rashtrapati Bhavan / Kartavya Path West', lat: 28.6143, lon: 77.1994 },

  // 2. Shahjahan Road & Akbar Road Axis
  { id: 'ig_shahjahan_north', name: 'Shahjahan Road North', lat: 28.6105, lon: 77.2260 },
  { id: 'shahjahan_mid', name: 'Shahjahan Road Mid', lat: 28.6060, lon: 77.2230 },
  { id: 'shahjahan_rotary', name: 'Humayun Road Roundabout', lat: 28.6020, lon: 77.2205 },

  // 3. Pandara Road Corridor
  { id: 'ig_pandara_north', name: 'Pandara Road North', lat: 28.6100, lon: 77.2308 },
  { id: 'pandara_mid', name: 'Pandara Road Market', lat: 28.6045, lon: 77.2295 },
  { id: 'pandara_south', name: 'Pandara Road South', lat: 28.6000, lon: 77.2280 },

  // 4. Khan Market & Lodhi Garden
  { id: 'khan_mkt', name: 'Khan Market', lat: 28.6002, lon: 77.2270 },
  { id: 'prithviraj_mid', name: 'Prithviraj Road', lat: 28.5980, lon: 77.2185 },
  { id: 'lodhi_jnc', name: 'Lodhi Road Junction', lat: 28.5945, lon: 77.2180 },
  { id: 'lodhi_garden', name: 'Lodhi Garden', lat: 28.5933, lon: 77.2179 },

  // 5. Connaught Place & Mandi House
  { id: 'janpath_mid', name: 'Janpath Crossing', lat: 28.6220, lon: 77.2190 },
  { id: 'cp_outer', name: 'Connaught Place Outer', lat: 28.6315, lon: 77.2167 },
  { id: 'mandi_house', name: 'Mandi House', lat: 28.6258, lon: 77.2343 },

  // 6. South Delhi Corridors (Jamia Millia & Jamia Hamdard)
  { id: 'lodhi_rd_cgo', name: 'Lodhi Road & CGO Complex', lat: 28.5900, lon: 77.2320 },
  { id: 'jln_stadium', name: 'JLN Stadium / Oberoi', lat: 28.5850, lon: 77.2350 },
  { id: 'def_colony', name: 'Defence Colony Flyover', lat: 28.5750, lon: 77.2370 },
  { id: 'moolchand', name: 'Moolchand Crossing', lat: 28.5650, lon: 77.2380 },

  // Jamia Millia Branch
  { id: 'lajpat_nagar', name: 'Lajpat Nagar Ring Road', lat: 28.5680, lon: 77.2480 },
  { id: 'ashram_chowk', name: 'Ashram Chowk', lat: 28.5700, lon: 77.2590 },
  { id: 'nfc_jnc', name: 'New Friends Colony', lat: 28.5640, lon: 77.2680 },
  { id: 'jmi_main', name: 'Jamia Millia Islamia', lat: 28.5616, lon: 77.2802 },

  // Jamia Hamdard Branch
  { id: 'gk1_m_block', name: 'Greater Kailash I', lat: 28.5520, lon: 77.2350 },
  { id: 'gk2_m_block', name: 'Greater Kailash II', lat: 28.5380, lon: 77.2420 },
  { id: 'alaknanda_jnc', name: 'Alaknanda Road', lat: 28.5280, lon: 77.2480 },
  { id: 'kalkaji_ext', name: 'Kalkaji Extension', lat: 28.5230, lon: 77.2520 },
  { id: 'ravidas_marg', name: 'Guru Ravidas Marg North', lat: 28.5250, lon: 77.2450 },
  { id: 'tughlakabad_jnc', name: 'Tughlakabad Fort Junction', lat: 28.5180, lon: 77.2480 },
  { id: 'mb_road_jnc', name: 'Mehrauli-Badarpur Road', lat: 28.5145, lon: 77.2505 },
  { id: 'jhu_main', name: 'Jamia Hamdard University', lat: 28.5134, lon: 77.2514 }
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

// Complete physical street network connections
const roadEdges = [
  // Kartavya Path / Rajpath Straight Corridor (India Gate <-> Rashtrapati Bhavan)
  ['ig_center', 'ig_c_hexagon_west'],
  ['ig_c_hexagon_west', 'kartavya_mansingh'],
  ['kartavya_mansingh', 'kartavya_janpath'],
  ['kartavya_janpath', 'rashtrapati_bhavan'],

  // Shahjahan Road Corridor
  ['ig_center', 'ig_shahjahan_north'],
  ['ig_shahjahan_north', 'shahjahan_mid'],
  ['shahjahan_mid', 'shahjahan_rotary'],
  ['shahjahan_rotary', 'prithviraj_mid'],
  ['shahjahan_rotary', 'khan_mkt'],
  ['kartavya_mansingh', 'shahjahan_mid'],

  // Pandara Road Corridor
  ['ig_center', 'ig_pandara_north'],
  ['ig_pandara_north', 'pandara_mid'],
  ['pandara_mid', 'pandara_south'],
  ['pandara_south', 'khan_mkt'],

  // Khan Market to Lodhi Garden
  ['khan_mkt', 'lodhi_jnc'],
  ['prithviraj_mid', 'lodhi_jnc'],
  ['lodhi_jnc', 'lodhi_garden'],
  ['khan_mkt', 'lodhi_rd_cgo'],

  // Connaught Place & Janpath Corridor
  ['kartavya_janpath', 'janpath_mid'],
  ['janpath_mid', 'cp_outer'],
  ['ig_center', 'mandi_house'],
  ['mandi_house', 'cp_outer'],

  // Central to South Delhi Corridor
  ['lodhi_rd_cgo', 'jln_stadium'],
  ['jln_stadium', 'def_colony'],
  ['def_colony', 'moolchand'],

  // Jamia Millia Islamia Branch
  ['moolchand', 'lajpat_nagar'],
  ['lajpat_nagar', 'ashram_chowk'],
  ['ashram_chowk', 'nfc_jnc'],
  ['nfc_jnc', 'jmi_main'],

  // Jamia Hamdard University Branch
  ['moolchand', 'gk1_m_block'],
  ['gk1_m_block', 'gk2_m_block'],
  ['gk2_m_block', 'alaknanda_jnc'],
  ['alaknanda_jnc', 'kalkaji_ext'],
  ['alaknanda_jnc', 'ravidas_marg'],
  ['ravidas_marg', 'tughlakabad_jnc'],
  ['tughlakabad_jnc', 'mb_road_jnc'],
  ['mb_road_jnc', 'jhu_main'],

  // Cross-connections
  ['nfc_jnc', 'kalkaji_ext'],
  ['kalkaji_ext', 'tughlakabad_jnc']
];

async function seed() {
  try {
    console.log("Cleaning old nodes and edges...");
    await db.query("DELETE FROM edges");
    await db.query("DELETE FROM nodes");

    console.log(`Inserting ${nodes.length} master Delhi road nodes...`);
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

    console.log("Master Delhi road network seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
