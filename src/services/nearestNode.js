const db = require('../db/db');
const { haversine } = require('./utils');

async function findNearestNode(lat, lon, maxDistanceMeters = 10000) {
    const [nodes] = await db.query(`SELECT id, latitude, longitude FROM nodes WHERE latitude IS NOT NULL`);
    
    let nearest = null;
    let minDistance = Infinity;
    
    for (const node of nodes) {
        const dist = haversine(lat, lon, Number(node.latitude), Number(node.longitude));
        if (dist < minDistance) {
            minDistance = dist;
            nearest = node;
        }
    }
    
    // If nearest node is further than max threshold (e.g. 2.5km), consider location unroutable in database
    if (minDistance > maxDistanceMeters) {
        return null;
    }
    
    return nearest;
}

module.exports = findNearestNode;
