
const db = require("../../db/db");
const Graph = require("./graph");

async function loadGraph() {
    const graph = new Graph();

    // Fetch all nodes
    const [nodes] = await db.query("SELECT id FROM nodes");

    // Add nodes first
    for (const node of nodes) {
        graph.addNode(node.id);
    }

    // Fetch all edges
    const [edges] = await db.query(
        "SELECT from_node, to_node, weight FROM edges"
    );

    // Add edges after nodes exist
    for (const edge of edges) {
        graph.addEdge(
            edge.from_node,
            edge.to_node,
            Number(edge.weight)
        );
    }

    return graph;
}

module.exports = loadGraph;