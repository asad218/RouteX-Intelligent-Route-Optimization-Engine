const express = require('express');
const app = express()

const routeRouter = require('./routes/rotue')

app.use(express.json())
app.use('/api/route', routeRouter);



module.exports = app
