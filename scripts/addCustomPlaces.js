const db = require('../src/db/db');

// Coordinates for Jamia Millia Islamia and Jamia Hamdard
const customPlaces = [
  { id: 'jmi_main', name: 'Jamia Millia Islamia', lat: 28.5616, lon: 77.2802 },
  { id: 'jhu_main', name: 'Jamia Hamdard University', lat: 28.5134, lon: 77.2514 }
];

// Haversine formula
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

async function addCustomPlaces() {
    console.log("Adding Jamia Millia Islamia and Jamia Hamdard University to MySQL...");
    
    for (const place of customPlaces) {
        // Insert node
        await db.query(
            "INSERT INTO nodes (id, name, latitude, longitude) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE latitude=?, longitude=?",
            [place.id, place.name, place.lat, place.lon, place.lat, place.lon]
        );
        
        // Find 3 nearest existing road nodes in MySQL to connect them to the network
        const [nodes] = await db.query("SELECT id, latitude, longitude FROM nodes WHERE id NOT IN ('jmi_main', 'jhu_main') AND latitude IS NOT NULL");
        
        const sorted = nodes.map(n => ({
            id: n.id,
            dist: haversine(place.lat, place.lon, Number(n.latitude), Number(n.longitude))
        })).sort((a, b) => a.dist - b.dist).slice(0, 3);
        
        for (const conn of sorted) {
            const dist = Math.round(conn.dist);
            await db.query(
                "INSERT INTO edges (from_node, to_node, weight) VALUES (?, ?, ?), (?, ?, ?)",
                [place.id, conn.id, dist, conn.id, place.id, dist]
            );
            console.log(`Connected ${place.name} to nearest road node ${conn.id} (${dist}m away).`);
        }
    }
    
    console.log("Successfully added Jamia Millia Islamia and Jamia Hamdard University with network edges!");
    process.exit(0);
}

addCustomPlaces();
