const Graph = require('../src/services/routing/graph');
const { Dijkstra, reconstructPath } = require('../src/services/dijkstra');

describe('Dijkstra Shortest Path Algorithm', () => {
    let graph;

    beforeEach(() => {
        graph = new Graph();
        // Construct synthetic graph:
        // A --(2)--> B --(3)--> C
        // A --(6)--> C
        graph.addNode('A');
        graph.addNode('B');
        graph.addNode('C');
        graph.addNode('D'); // Disconnected node

        graph.addEdge('A', 'B', 2);
        graph.addEdge('B', 'C', 3);
        graph.addEdge('A', 'C', 6);
    });

    test('should find shortest path cost from A to C', () => {
        const { distances, previous } = Dijkstra(graph, 'A');
        expect(distances.get('C')).toBe(5); // A -> B -> C = 5 (better than A -> C = 6)
        
        const path = reconstructPath(previous, 'A', 'C');
        expect(path).toEqual(['A', 'B', 'C']);
    });

    test('should return Infinity for disconnected destination', () => {
        const { distances } = Dijkstra(graph, 'A');
        expect(distances.get('D')).toBe(Infinity);
    });

    test('should throw error for non-existent start node', () => {
        expect(() => Dijkstra(graph, 'Z')).toThrow("Start node does not exist");
    });
});
