
class Graph {
    constructor() {
        this.adj_list = {};
    }

    addNode(node) {
        if (!this.adj_list[node]) {
            this.adj_list[node] = [];
        }
    }

    addEdge(source, destination, weight) {
        if (!this.adj_list[source]) {
            throw new Error(`${source} does not exist`);
        }

        if (!this.adj_list[destination]) {
            throw new Error(`${destination} does not exist`);
        }

        this.adj_list[source].push({
            node: destination,
            weight: Number(weight)
        });
    }
}

module.exports = Graph;