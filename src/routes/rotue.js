const express = require('express');
const router = express.Router();
const Graph = require('../services/routing/graph')

const graph = new Graph();
graph.addNode("A");
graph.addNode("B");
graph.addNode("C");
graph.addNode("D");

graph.addEdge("A", "B", 4);
graph.addEdge("A", "C", 2);
graph.addEdge("B", "D", 3);
graph.addEdge("C", "A", 2);
graph.addEdge("C", "D", 5);
graph.addEdge("D", "B", 3);
graph.addEdge("D", "C", 5);
const {Dijkstra, reconstructPath} = require('../services/dijkstra')

router.get('/', (req, res) =>{
    const {start ,end} = req.query

    if(!start || !end){
        return res.status(400).json({
            error : "Invalid inputs : Start and end locations required"
        });
    }

    try{

        const { distances, previous } = Dijkstra(graph, start);

        if (!distances.has(end) || distances.get(end) === Infinity) {
            return res.status(404).json({
                error: "No route found"
            });
        }

        const path = reconstructPath(previous, start, end);

        return res.status(200).json({
            path : path,
            distance : distances.get(end)
        })

        
    } catch (error) {

        console.error(" Error calculating route : ", error);
        res.status(500).json({
            error : "Internal Server Error"
        });
        
    }

    
})

module.exports = router;
