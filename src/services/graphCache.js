const db = require('../db/db');
const Graph = require('./routing/graph');
const { haversine } = require('./utils');

let cachedGraph = null;
let cachedNodes = [];
let nodeMap = new Map();
let isInitializing = false;
let initPromise = null;

async function initializeGraphCache() {
    if (cachedGraph) return { graph: cachedGraph, nodes: cachedNodes, nodeMap };
    if (isInitializing) return initPromise;

    isInitializing = true;
    initPromise = (async () => {
        console.log("⚡ [GraphCache] Loading road network graph & nodes into memory...");
        const startTime = Date.now();

        // 1. Fetch all nodes with coordinates
        const [nodes] = await db.query("SELECT id, name, latitude, longitude FROM nodes WHERE latitude IS NOT NULL");
        cachedNodes = nodes.map(n => ({
            id: String(n.id),
            name: n.name,
            latitude: Number(n.latitude),
            longitude: Number(n.longitude)
        }));

        nodeMap.clear();
        for (const n of cachedNodes) {
            nodeMap.set(n.id, n);
        }

        // 2. Build graph structure
        const graph = new Graph();
        for (const n of cachedNodes) {
            graph.addNode(n.id);
        }

        // 3. Fetch all edges
        const [edges] = await db.query("SELECT from_node, to_node, weight FROM edges");
        for (const edge of edges) {
            const fromId = String(edge.from_node);
            const toId = String(edge.to_node);
            if (graph.adj_list[fromId] && graph.adj_list[toId]) {
                graph.addEdge(fromId, toId, Number(edge.weight));
            }
        }

        cachedGraph = graph;
        isInitializing = false;
        console.log(`✅ [GraphCache] Graph loaded in ${Date.now() - startTime}ms (${cachedNodes.length} nodes, ${edges.length} edges)`);

        return { graph: cachedGraph, nodes: cachedNodes, nodeMap };
    })();

    return initPromise;
}

function getCachedGraph() {
    return cachedGraph;
}

function getCachedNodes() {
    return cachedNodes;
}

function getCachedNodeMap() {
    return nodeMap;
}

function findNearestNodeCached(lat, lon, maxDistanceMeters = 10000) {
    if (!cachedNodes || cachedNodes.length === 0) {
        return null;
    }

    let nearest = null;
    let minDistance = Infinity;

    for (const node of cachedNodes) {
        const dist = haversine(lat, lon, node.latitude, node.longitude);
        if (dist < minDistance) {
            minDistance = dist;
            nearest = node;
        }
    }

    if (minDistance > maxDistanceMeters) {
        return null;
    }

    return nearest;
}

module.exports = {
    initializeGraphCache,
    getCachedGraph,
    getCachedNodes,
    getCachedNodeMap,
    findNearestNodeCached
};
