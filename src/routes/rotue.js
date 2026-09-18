const express = require('express');
const router = express.Router();
const Graph = require('../services/routing/graph')
const loadGraph = require('../services/routing/loadGraph')
const db = require('../db/db');


const {Dijkstra, reconstructPath} = require('../services/dijkstra')

router.get('/', async (req, res) =>{
    const {start ,end} = req.query

    if(!start || !end){
        return res.status(400).json({
            error : "Invalid inputs : Start and end locations required"
        });
    }

    try{

        const graph = await loadGraph();
        const { distances, previous } = Dijkstra(graph, start);

        if (!distances.has(end) || distances.get(end) === Infinity) {
            return res.status(404).json({
                error: "No route found"
            });
        }

        const path = reconstructPath(previous, start, end);

        const placeholders = path.map(() => "?").join(",");

        const [nodes] = await db.query(
            `SELECT id, latitude, longitude
             FROM nodes
             WHERE id IN (${placeholders})`,
            path
        );

        const nodeMap = new Map(
            nodes.map(node => [node.id, node])
        );

        const coordinates = path.map(nodeId => {
            const node = nodeMap.get(nodeId);

            return [
                Number(node.latitude),
                Number(node.longitude)
            ];
        });

        return res.status(200).json({
            path : path,
            distance : distances.get(end),
            coordinates : coordinates
        })
    } catch (error) {

        console.error(" Error calculating route : ", error);
        res.status(500).json({
            error : "Internal Server Error"
        });
        
    }

    
})

module.exports = router;
