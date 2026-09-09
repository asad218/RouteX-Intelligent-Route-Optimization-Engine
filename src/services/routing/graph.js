const MinHeap = require("./Minheap");



class Graph {
    constructor() {
        this.adj_list = {};
    }

    addNode(node) {
        if (!this.adj_list[node]) {
            this.adj_list[node] = [];
        } else {
            console.log(`${node} already exists here`);
        }
    }

    addEdge(source, destination, weight) {
        if (!this.adj_list[source]) {
            console.log(`${source} does not exist here`);
        } else {
            this.adj_list[source].push({
                node: destination,
                weight: weight
            });
        }
    }
}

const graph = new Graph();
graph.addNode("A");
graph.addNode("B");
graph.addNode("C");

graph.addEdge("A", "B", 4);
graph.addEdge("A", "C", 3);
graph.addEdge("B", "A", 4);
graph.addEdge("B", "C", 2);
graph.addEdge("C", "A", 3);
graph.addEdge("C", "B", 2);

console.log(graph.adj_list);




const heap = new MinHeap((a, b) => a - b);

[8, 7, 5, 1, 3, 2].forEach((value) => heap.insert(value));

console.log(heap.heap);

console.log(heap.extractMin());
console.log(heap.extractMin());
console.log(heap.extractMin());
console.log(heap.extractMin());
console.log(heap.extractMin());
console.log(heap.extractMin());





















module.exports = Graph;