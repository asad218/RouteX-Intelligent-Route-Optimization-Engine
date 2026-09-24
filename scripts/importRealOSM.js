const db = require('../src/db/db');

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

const customPlaces = [
  { id: 'jmi_main', name: 'Jamia Millia Islamia', lat: 28.5616, lon: 77.2802 },
  { id: 'jhu_main', name: 'Jamia Hamdard University', lat: 28.5134, lon: 77.2514 }
];

async function importOSM() {
    console.log("Fetching real OpenStreetMap road data for South & Central Delhi from Overpass API...");
    // Bounding box covering South & Central Delhi (South: 28.50, West: 77.18, North: 28.65, East: 77.30)
    const bbox = "28.50,77.18,28.65,77.30";
    const query = `
        [out:json][timeout:90];
        (
          way["highway"~"primary|secondary|tertiary|residential|trunk|unclassified"](${bbox});
        );
        out body;
        >;
        out skel qt;
    `;
    
    const url = `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(url, {
            headers: { 
                "User-Agent": "RouteXApp/1.0 (contact@example.com)"
            }
        });
        
        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.elements.length} elements from OpenStreetMap.`);
        
        const nodesMap = new Map();
        const ways = [];
        
        for (const el of data.elements) {
            if (el.type === 'node') {
                nodesMap.set(el.id, { id: String(el.id), lat: el.lat, lon: el.lon });
            } else if (el.type === 'way') {
                ways.push(el);
            }
        }
        
        console.log(`Parsed ${nodesMap.size} road nodes and ${ways.length} road ways.`);
        
        const usedNodeIds = new Set();
        const edges = [];
        
        for (const way of ways) {
            const wayNodes = way.nodes;
            const isOneway = way.tags && (way.tags.oneway === 'yes' || way.tags.oneway === '1');
            
            for (let i = 0; i < wayNodes.length - 1; i++) {
                const uId = wayNodes[i];
                const vId = wayNodes[i + 1];
                const u = nodesMap.get(uId);
                const v = nodesMap.get(vId);
                
                if (u && v) {
                    usedNodeIds.add(uId);
                    usedNodeIds.add(vId);
                    
                    const dist = Math.round(haversine(u.lat, u.lon, v.lat, v.lon));
                    
                    edges.push({ from: String(uId), to: String(vId), weight: dist });
                    if (!isOneway) {
                        edges.push({ from: String(vId), to: String(uId), weight: dist });
                    }
                }
            }
        }
        
        console.log(`Filtered graph to ${usedNodeIds.size} active road intersection nodes and ${edges.length} road segments.`);
        
        console.log("Clearing database tables...");
        await db.query("DELETE FROM edges");
        await db.query("DELETE FROM nodes");
        
        console.log("Inserting road nodes into MySQL...");
        const nodeValues = [];
        for (const nodeId of usedNodeIds) {
            const n = nodesMap.get(nodeId);
            nodeValues.push([n.id, n.id, n.lat, n.lon]);
        }
        
        for (let i = 0; i < nodeValues.length; i += 1000) {
            const batch = nodeValues.slice(i, i + 1000);
            await db.query("INSERT INTO nodes (id, name, latitude, longitude) VALUES ?", [batch]);
        }
        
        console.log("Inserting road segments into MySQL...");
        const edgeValues = edges.map(e => [e.from, e.to, e.weight]);
        for (let i = 0; i < edgeValues.length; i += 1000) {
            const batch = edgeValues.slice(i, i + 1000);
            await db.query("INSERT INTO edges (from_node, to_node, weight) VALUES ?", [batch]);
        }
        
        // Add Custom Places (Jamia Millia and Jamia Hamdard) connecting to nearest local road node (< 100m)
        console.log("Connecting Jamia Millia and Jamia Hamdard to immediate local road network...");
        for (const place of customPlaces) {
            await db.query(
                "INSERT INTO nodes (id, name, latitude, longitude) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE latitude=?, longitude=?",
                [place.id, place.name, place.lat, place.lon, place.lat, place.lon]
            );
            
            // Find 3 nearest road nodes
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
                console.log(`Connected ${place.name} to local road node ${conn.id} (${dist}m away).`);
            }
        }
        
        console.log("Real OpenStreetMap South + Central Delhi road network import finished successfully!");
        process.exit(0);
        
    } catch (err) {
        console.error("OSM Import failed:", err);
        process.exit(1);
    }
}

importOSM();
