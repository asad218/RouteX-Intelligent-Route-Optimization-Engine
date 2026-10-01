const express = require('express');
const router = express.Router();
const Graph = require('../services/routing/graph');
const loadGraph = require('../services/routing/loadGraph');
const db = require('../db/db');
const findNearestNode = require('../services/nearestNode');
const { Dijkstra, reconstructPath } = require('../services/dijkstra');

router.get('/', async (req, res) => {
    let { start, end, startLat, startLon, endLat, endLon } = req.query;

    try {
        if (startLat && startLon && endLat && endLon) {
            const startNodeObj = await findNearestNode(parseFloat(startLat), parseFloat(startLon));
            const endNodeObj = await findNearestNode(parseFloat(endLat), parseFloat(endLon));

            if (!startNodeObj || !endNodeObj) {
                return res.status(404).json({
                    error: "No road network nodes found near the specified locations"
                });
            }

            start = String(startNodeObj.id);
            end = String(endNodeObj.id);
        }

        if (!start || !end) {
            return res.status(400).json({
                error: "Invalid inputs: Start and end locations/coordinates required"
            });
        }

        const graph = await loadGraph();
        const { distances, previous } = Dijkstra(graph, start);

        if (!distances.has(end) || distances.get(end) === Infinity) {
            return res.status(404).json({
                error: "No route found between these locations"
            });
        }

        const path = reconstructPath(previous, start, end);
        const placeholders = path.map(() => "?").join(",");

        const [nodes] = await db.query(
            `SELECT id, latitude, longitude
             FROM nodes
             WHERE id IN (${placeholders})`,
            path
        );

        const nodeMap = new Map(
            nodes.map(node => [String(node.id), node])
        );

        const coordinates = path.map(nodeId => {
            const node = nodeMap.get(String(nodeId));
            if (!node) return null;
            return [Number(node.latitude), Number(node.longitude)];
        }).filter(Boolean);

        // Use actual user-searched lat/lon as start and end for OSRM geometry snap
        const snapStartLon = startLon ? parseFloat(startLon) : coordinates[0]?.[1];
        const snapStartLat = startLat ? parseFloat(startLat) : coordinates[0]?.[0];
        const snapEndLon = endLon ? parseFloat(endLon) : coordinates[coordinates.length - 1]?.[1];
        const snapEndLat = endLat ? parseFloat(endLat) : coordinates[coordinates.length - 1]?.[0];

        let detailedCoordinates = coordinates;

        // Dijkstra distance is the fallback (sparse graph, less accurate)
        const dijkstraDistanceMeters = distances.get(end);
        let distanceMeters = dijkstraDistanceMeters;
        let estimatedMinutes = parseFloat(((distanceMeters / 1000 / 30) * 60).toFixed(1));

        // Only pass start and end to OSRM — let OSRM compute the road-snapped geometry AND accurate distance
        try {
            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${snapStartLon},${snapStartLat};${snapEndLon},${snapEndLat}?overview=full&geometries=geojson`;
            const osrmRes = await fetch(osrmUrl);

            if (osrmRes.ok) {
                const osrmData = await osrmRes.json();
                if (osrmData.routes && osrmData.routes.length > 0) {
                    const osrmRoute = osrmData.routes[0];

                    // OSRM returns [lon, lat], convert to [lat, lon] for Leaflet
                    detailedCoordinates = osrmRoute.geometry.coordinates.map(c => [c[1], c[0]]);

                    // Use OSRM's accurate road distance (meters) and travel time (seconds)
                    distanceMeters = osrmRoute.distance;                          // real road distance
                    estimatedMinutes = parseFloat((osrmRoute.duration / 60).toFixed(1)); // real travel time
                }
            }
        } catch (osrmErr) {
            console.warn("OSRM geometry snap failed, using Dijkstra fallback:", osrmErr.message);
        }

        const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));

        return res.status(200).json({
            path: path,
            distance: distanceMeters,          // raw meters (Dijkstra sum)
            distanceKm: distanceKm,            // human-readable km
            estimatedMinutes: estimatedMinutes, // estimated travel time
            coordinates: detailedCoordinates
        });
    } catch (error) {
        console.error("Error calculating route:", error);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

module.exports = router;
