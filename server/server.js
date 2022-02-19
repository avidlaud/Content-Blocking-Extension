const express = require('express');
const cors = require('cors');

const downloadRoute = require('./routes/downloadRoutes');

const app = express();
app.use(cors());

app.use('/download', downloadRoute);

module.exports = app;
