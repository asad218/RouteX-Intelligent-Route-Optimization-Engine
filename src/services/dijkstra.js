const Graph = require('./routing/graph');
const MinHeap = require('./routing/Minheap')

function Dijkstra(graph, startNode) {
    const distances = new Map();
    const previous = new Map();
    const pq = new MinHeap((a, b) => a.distance - b.distance);

    if (!graph.adj_list[startNode]) {
        throw new Error("Start node does not exist");
    }

    for (const node of Object.keys(graph.adj_list)) {
        distances.set(node, Infinity);
        previous.set(node, null);
    }

    distances.set(startNode, 0);
    pq.insert({ node: startNode, distance: 0 });

    while (pq.heap.length > 0) {
        const { node: currentNode, distance: currentDistance } = pq.extractMin();

        if (currentDistance > distances.get(currentNode)) {
            continue;
        }

        const neighbors = graph.adj_list[currentNode];
        if (neighbors) {
            for (const neighbor of neighbors) {
                const distance = currentDistance + neighbor.weight;

                if (distance < distances.get(neighbor.node)) {
                    distances.set(neighbor.node, distance);
                    previous.set(neighbor.node, currentNode);
                    pq.insert({ node: neighbor.node, distance: distance });
                }
            }
        }
    }

    return { distances, previous };
}

function reconstructPath(previous, startNode, targetNode) {
    const path = [];
    let currentNode = targetNode;

    if (!previous.has(targetNode) || 
        (previous.get(targetNode) === null && targetNode !== startNode)) {
        return [];
    }

    // Walk backward from target to start
    while (currentNode !== null) {
        path.push(currentNode);

        if (currentNode === startNode) {
            break;
        }

        currentNode = previous.get(currentNode);
    }

    // If we never reached the start, no valid path was found
    if (path[path.length - 1] !== startNode) {
        return [];
    }

    // We collected target → start, so reverse it
    path.reverse();

    return path;
}

module.exports = { Dijkstra, reconstructPath };
