const express = require('express');
const app = express()
const cors = require('cors');

const routeRouter = require('./routes/rotue')

app.use(cors())
app.use(express.json())
app.use('/api/route', routeRouter);



module.exports = app
