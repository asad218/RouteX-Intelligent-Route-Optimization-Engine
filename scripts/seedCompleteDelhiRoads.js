const db = require('../src/db/db');

// Detailed road network graph connecting Central Delhi to South Delhi (Jamia Millia & Jamia Hamdard)
const nodes = [
  // Central Delhi Ring & Landmarks
  { id: 'ig_center', name: 'India Gate C-Hexagon', lat: 28.6129, lon: 77.2295 },
  { id: 'ig_shahjahan', name: 'Shahjahan Road Entry', lat: 28.6105, lon: 77.2260 },
  { id: 'ig_pandara', name: 'Pandara Road Entry', lat: 28.6100, lon: 77.2308 },
  { id: 'cp_outer', name: 'Connaught Place Outer', lat: 28.6315, lon: 77.2167 },
  { id: 'mandi_house', name: 'Mandi House', lat: 28.6258, lon: 77.2343 },
  { id: 'khan_mkt', name: 'Khan Market', lat: 28.6002, lon: 77.2270 },
  { id: 'lodhi_garden', name: 'Lodhi Garden', lat: 28.5933, lon: 77.2179 },
  { id: 'lodhi_rd_jnc', name: 'Lodhi Road & CGO Complex', lat: 28.5900, lon: 77.2320 },

  // Central to South Arterial Roads (Lala Lajpat Rai Marg)
  { id: 'jln_stadium', name: 'JLN Stadium / Oberoi', lat: 28.5850, lon: 77.2350 },
  { id: 'def_colony', name: 'Defence Colony Flyover', lat: 28.5750, lon: 77.2370 },
  { id: 'moolchand', name: 'Moolchand Crossing', lat: 28.5650, lon: 77.2380 },

  // Branch East: Ashram & Jamia Millia Islamia
  { id: 'lajpat_nagar', name: 'Lajpat Nagar Ring Road', lat: 28.5680, lon: 77.2480 },
  { id: 'ashram_chowk', name: 'Ashram Chowk', lat: 28.5700, lon: 77.2590 },
  { id: 'nfc_jnc', name: 'New Friends Colony', lat: 28.5640, lon: 77.2680 },
  { id: 'jmi_main', name: 'Jamia Millia Islamia', lat: 28.5616, lon: 77.2802 },

  // Branch South: Greater Kailash & Alaknanda
  { id: 'gk1_m_block', name: 'Greater Kailash I', lat: 28.5520, lon: 77.2350 },
  { id: 'gk2_m_block', name: 'Greater Kailash II', lat: 28.5380, lon: 77.2420 },
  { id: 'alaknanda_jnc', name: 'Alaknanda Road', lat: 28.5280, lon: 77.2480 },
  { id: 'kalkaji_ext', name: 'Kalkaji Extension', lat: 28.5230, lon: 77.2520 },

  // Branch South-West: Guru Ravidas Marg & Jamia Hamdard
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

// Continuous road connections along major Delhi transport corridors
const roadEdges = [
  // Central Delhi
  ['ig_center', 'ig_shahjahan'],
  ['ig_center', 'ig_pandara'],
  ['ig_center', 'cp_outer'],
  ['ig_center', 'mandi_house'],
  ['mandi_house', 'cp_outer'],
  ['ig_shahjahan', 'khan_mkt'],
  ['ig_pandara', 'khan_mkt'],
  ['khan_mkt', 'lodhi_garden'],
  ['khan_mkt', 'lodhi_rd_jnc'],

  // Central to South Corridor
  ['lodhi_rd_jnc', 'jln_stadium'],
  ['jln_stadium', 'def_colony'],
  ['def_colony', 'moolchand'],

  // Route to Jamia Millia Islamia
  ['moolchand', 'lajpat_nagar'],
  ['lajpat_nagar', 'ashram_chowk'],
  ['ashram_chowk', 'nfc_jnc'],
  ['nfc_jnc', 'jmi_main'],

  // Route to Greater Kailash & Alaknanda
  ['moolchand', 'gk1_m_block'],
  ['gk1_m_block', 'gk2_m_block'],
  ['gk2_m_block', 'alaknanda_jnc'],
  ['alaknanda_jnc', 'kalkaji_ext'],

  // Route to Jamia Hamdard University
  ['alaknanda_jnc', 'ravidas_marg'],
  ['ravidas_marg', 'tughlakabad_jnc'],
  ['tughlakabad_jnc', 'mb_road_jnc'],
  ['mb_road_jnc', 'jhu_main'],

  // Cross-link Jamia Millia to Jamia Hamdard via Okhla / Govindpuri / MB Road
  ['nfc_jnc', 'kalkaji_ext'],
  ['kalkaji_ext', 'tughlakabad_jnc']
];

async function seed() {
  try {
    console.log("Cleaning old nodes and edges...");
    await db.query("DELETE FROM edges");
    await db.query("DELETE FROM nodes");

    console.log(`Inserting ${nodes.length} connected Delhi road nodes...`);
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

    console.log("Complete connected Delhi road network seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
