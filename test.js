const Graph = require('./src/services/routing/graph');
const { Dijkstra, reconstructPath } = require('./src/services/dijkstra');


// // Create a new graph instance
// const graph = new Graph();
// graph.addNode("A");
// graph.addNode("B");
// graph.addNode("C");
// graph.addNode("D");

// // Add edges (matching what you had in graph.js)
// graph.addEdge("A", "B", 4);
// graph.addEdge("A", "C", 2);
// graph.addEdge("B", "D", 3);
// graph.addEdge("C", "A", 2);
// graph.addEdge("C", "D", 5);
// graph.addEdge("D", "B", 3);
// graph.addEdge("D", "C", 5);

// // Run Dijkstra's algorithm starting from node "A"
// const result = Dijkstra(graph, "A");

// console.log("Shortest distances from node A to all other nodes:");
// console.log(result.distances);

// console.log("\nPrevious nodes for path reconstruction:");
// console.log(result.previous);

// console.log("\nPath from A to D:", reconstructPath(result.previous, "A", "D"));
// // ["A", "C", "D"]

// console.log("Path from A to B:", reconstructPath(result.previous, "A", "B"));
// // ["A", "B"]

// console.log("Path from A to A:", reconstructPath(result.previous, "A", "A"));
// // ["A"]

// console.log("Path from A to Z:", reconstructPath(result.previous, "A", "Z"));
// // []



const db = require("./src/db/db");

// async function testConnection() {
//     try {
//         const [rows] = await db.query("SELECT * FROM nodes");
//         console.log("Database connected!");
//         console.log(rows);
//     } catch (error) {
//         console.error("Database connection failed:", error.message);
//     } finally {
//         await db.end();
//     }
// }

// testConnection();


const loadGraph = require("./src/services/routing/loadGraph");

async function test() {
    try {
        const graph = await loadGraph();

        console.log("Graph loaded from MySQL:");
        console.log(graph.adj_list);
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

test();