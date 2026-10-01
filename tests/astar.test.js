const Graph = require('../src/services/routing/graph');
const AStar = require('../src/services/astar');
const { reconstructPath } = require('../src/services/dijkstra');
const { haversine } = require('../src/services/utils');

describe('A* (A-Star) Pathfinding Algorithm', () => {
    let graph;
    let nodeMap;

    beforeEach(() => {
        graph = new Graph();
        nodeMap = new Map();

        // Node coordinates (India Gate area)
        const nodesData = [
            { id: 'A', latitude: 28.6129, longitude: 77.2295 },
            { id: 'B', latitude: 28.6100, longitude: 77.2300 },
            { id: 'C', latitude: 28.6050, longitude: 77.2350 }
        ];

        for (const n of nodesData) {
            graph.addNode(n.id);
            nodeMap.set(n.id, n);
        }

        const wAB = Math.round(haversine(nodesData[0].latitude, nodesData[0].longitude, nodesData[1].latitude, nodesData[1].longitude));
        const wBC = Math.round(haversine(nodesData[1].latitude, nodesData[1].longitude, nodesData[2].latitude, nodesData[2].longitude));
        const wAC = Math.round(haversine(nodesData[0].latitude, nodesData[0].longitude, nodesData[2].latitude, nodesData[2].longitude)) + 500; // direct edge is longer

        graph.addEdge('A', 'B', wAB);
        graph.addEdge('B', 'C', wBC);
        graph.addEdge('A', 'C', wAC);
    });

    test('should find optimal path using Haversine heuristic', () => {
        const { distances, previous, found } = AStar(graph, 'A', 'C', nodeMap);
        expect(found).toBe(true);

        const path = reconstructPath(previous, 'A', 'C');
        expect(path).toEqual(['A', 'B', 'C']);
    });
});
