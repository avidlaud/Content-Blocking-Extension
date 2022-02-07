const express = require('express');

const downloadRoute = require('./routes/downloadRoutes');

const app = express();

app.use('/download', downloadRoute);

module.exports = app;
