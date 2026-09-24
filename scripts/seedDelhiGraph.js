const db = require('../src/db/db');

// Real nodes around Delhi area
const delhiNodes = [
  { id: '1', name: 'India Gate', lat: 28.6129, lon: 77.2295 },
  { id: '2', name: 'C-Hexagon North', lat: 28.6160, lon: 77.2295 },
  { id: '3', name: 'Kartavya Path West', lat: 28.6130, lon: 77.2180 },
  { id: '4', name: 'Rashtrapati Bhavan', lat: 28.6143, lon: 77.1994 },
  { id: '5', name: 'Janpath Crossing', lat: 28.6220, lon: 77.2190 },
  { id: '6', name: 'Connaught Place Outer', lat: 28.6315, lon: 77.2167 },
  { id: '7', name: 'Mandi House', lat: 28.6258, lon: 77.2343 },
  { id: '8', name: 'Pragati Maidan', lat: 28.6180, lon: 77.2420 },
  { id: '9', name: 'Khan Market', lat: 28.6002, lon: 77.2270 },
  { id: '10', name: 'Lodhi Garden', lat: 28.5933, lon: 77.2179 }
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

// Connections between nodes (bidirectional road graph)
const connections = [
  ['1', '2'],
  ['1', '3'],
  ['1', '8'],
  ['1', '9'],
  ['2', '7'],
  ['3', '4'],
  ['3', '5'],
  ['5', '6'],
  ['6', '7'],
  ['7', '8'],
  ['9', '10'],
  ['3', '10']
];

async function seed() {
  try {
    console.log("Cleaning old nodes and edges...");
    await db.query("DELETE FROM edges");
    await db.query("DELETE FROM nodes");

    console.log("Inserting Delhi nodes...");
    for (const n of delhiNodes) {
      await db.query(
        "INSERT INTO nodes (id, name, latitude, longitude) VALUES (?, ?, ?, ?)",
        [n.id, n.name, n.lat, n.lon]
      );
    }

    console.log("Inserting Delhi edges...");
    for (const [from, to] of connections) {
      const n1 = delhiNodes.find(n => n.id === from);
      const n2 = delhiNodes.find(n => n.id === to);
      const weight = Math.round(haversine(n1.lat, n1.lon, n2.lat, n2.lon));

      await db.query(
        "INSERT INTO edges (from_node, to_node, weight) VALUES (?, ?, ?), (?, ?, ?)",
        [from, to, weight, to, from, weight]
      );
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
