const express = require('express');
const router = express.Router();
const { Dijkstra, reconstructPath } = require('../services/dijkstra');
const AStar = require('../services/astar');
const {
    initializeGraphCache,
    getCachedGraph,
    getCachedNodeMap,
    findNearestNodeCached
} = require('../services/graphCache');

router.get('/', async (req, res) => {
    let { start, end, startLat, startLon, endLat, endLon, algo } = req.query;
    const selectedAlgo = (algo || 'astar').toLowerCase();

    try {
        let graph = getCachedGraph();
        let nodeMap = getCachedNodeMap();

        if (!graph || !nodeMap || nodeMap.size === 0) {
            const cache = await initializeGraphCache();
            graph = cache.graph;
            nodeMap = cache.nodeMap;
        }

        if (startLat && startLon && endLat && endLon) {
            const startNodeObj = findNearestNodeCached(parseFloat(startLat), parseFloat(startLon));
            const endNodeObj = findNearestNodeCached(parseFloat(endLat), parseFloat(endLon));

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

        let routeResult;
        let algorithmName = "A* (A-Star)";

        if (selectedAlgo === 'dijkstra') {
            routeResult = Dijkstra(graph, start, end);
            algorithmName = "Dijkstra";
        } else {
            routeResult = AStar(graph, start, end, nodeMap);
            algorithmName = "A* (A-Star)";
        }

        const { distances, previous, nodesEvaluated } = routeResult;

        if (!distances.has(end) || distances.get(end) === Infinity) {
            return res.status(404).json({
                error: "No route found between these locations"
            });
        }

        const path = reconstructPath(previous, start, end);

        const coordinates = path.map(nodeId => {
            const node = nodeMap.get(String(nodeId));
            if (!node) return null;
            return [Number(node.latitude), Number(node.longitude)];
        }).filter(Boolean);

        // Benchmark comparison against Dijkstra for metrics
        let dijkstraEvaluated = nodesEvaluated;
        if (selectedAlgo === 'astar') {
            const dijBenchmark = Dijkstra(graph, start, end);
            dijkstraEvaluated = dijBenchmark.nodesEvaluated;
        }
        const efficiencyGainPercent = dijkstraEvaluated > 0 
            ? Math.round(((dijkstraEvaluated - nodesEvaluated) / dijkstraEvaluated) * 100)
            : 0;

        // Snap start & end coordinates to OSRM road geometry
        const snapStartLon = startLon ? parseFloat(startLon) : coordinates[0]?.[1];
        const snapStartLat = startLat ? parseFloat(startLat) : coordinates[0]?.[0];
        const snapEndLon = endLon ? parseFloat(endLon) : coordinates[coordinates.length - 1]?.[1];
        const snapEndLat = endLat ? parseFloat(endLat) : coordinates[coordinates.length - 1]?.[0];

        let detailedCoordinates = coordinates;
        const graphDistanceMeters = distances.get(end);
        let distanceMeters = graphDistanceMeters;
        let estimatedMinutes = parseFloat(((distanceMeters / 1000 / 30) * 60).toFixed(1));

        try {
            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${snapStartLon},${snapStartLat};${snapEndLon},${snapEndLat}?overview=full&geometries=geojson`;
            const osrmRes = await fetch(osrmUrl);

            if (osrmRes.ok) {
                const osrmData = await osrmRes.json();
                if (osrmData.routes && osrmData.routes.length > 0) {
                    const osrmRoute = osrmData.routes[0];
                    detailedCoordinates = osrmRoute.geometry.coordinates.map(c => [c[1], c[0]]);
                    distanceMeters = osrmRoute.distance;
                    estimatedMinutes = parseFloat((osrmRoute.duration / 60).toFixed(1));
                }
            }
        } catch (osrmErr) {
            console.warn("OSRM geometry snap failed, using graph fallback:", osrmErr.message);
        }

        const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));

        return res.status(200).json({
            path: path,
            distance: distanceMeters,
            distanceKm: distanceKm,
            estimatedMinutes: estimatedMinutes,
            coordinates: detailedCoordinates,
            algorithmMetrics: {
                algorithm: algorithmName,
                nodesEvaluated,
                dijkstraNodesEvaluated: dijkstraEvaluated,
                efficiencyGainPercent: efficiencyGainPercent > 0 ? `${efficiencyGainPercent}%` : "0%"
            }
        });
    } catch (error) {
        console.error("Error calculating route:", error);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

module.exports = router;
