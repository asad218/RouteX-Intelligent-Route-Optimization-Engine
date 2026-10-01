const MinHeap = require('./routing/Minheap');
const { haversine } = require('./utils');

/**
 * A* (A-Star) Pathfinding Algorithm
 * Uses Haversine distance as an admissible heuristic h(n) towards target node.
 * Evaluation function: f(n) = g(n) + h(n)
 *   g(n) = exact path distance from start to n
 *   h(n) = straight-line Haversine distance from n to target
 */
function AStar(graph, startNode, targetNode, nodeMap) {
    const gScore = new Map();
    const fScore = new Map();
    const previous = new Map();
    const pq = new MinHeap((a, b) => a.fScore - b.fScore);

    if (!graph.adj_list[startNode]) {
        throw new Error("Start node does not exist in graph");
    }
    if (!graph.adj_list[targetNode]) {
        throw new Error("Target node does not exist in graph");
    }

    const targetObj = nodeMap.get(String(targetNode));

    for (const node of Object.keys(graph.adj_list)) {
        gScore.set(node, Infinity);
        fScore.set(node, Infinity);
        previous.set(node, null);
    }

    const computeHeuristic = (nodeId) => {
        if (!targetObj) return 0;
        const nodeObj = nodeMap.get(String(nodeId));
        if (!nodeObj) return 0;
        return haversine(nodeObj.latitude, nodeObj.longitude, targetObj.latitude, targetObj.longitude);
    };

    const initialH = computeHeuristic(startNode);
    gScore.set(startNode, 0);
    fScore.set(startNode, initialH);
    pq.insert({ node: startNode, fScore: initialH, gScore: 0 });

    let nodesEvaluated = 0;
    let found = false;

    while (pq.heap.length > 0) {
        const { node: currentNode, gScore: currentG } = pq.extractMin();
        nodesEvaluated++;

        // Early termination when target node is reached
        if (currentNode === targetNode) {
            found = true;
            break;
        }

        if (currentG > gScore.get(currentNode)) {
            continue;
        }

        const neighbors = graph.adj_list[currentNode];
        if (neighbors) {
            for (const neighbor of neighbors) {
                const tentativeG = currentG + neighbor.weight;

                if (tentativeG < gScore.get(neighbor.node)) {
                    previous.set(neighbor.node, currentNode);
                    gScore.set(neighbor.node, tentativeG);
                    const h = computeHeuristic(neighbor.node);
                    const f = tentativeG + h;
                    fScore.set(neighbor.node, f);
                    pq.insert({ node: neighbor.node, fScore: f, gScore: tentativeG });
                }
            }
        }
    }

    return {
        distances: gScore,
        previous,
        nodesEvaluated,
        found
    };
}

module.exports = AStar;
