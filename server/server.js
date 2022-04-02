const express = require('express');
const cors = require('cors');

const downloadRoute = require('./routes/downloadRoutes');
const uploadRoute = require('./routes/uploadRoutes');

const app = express();
app.use(cors());

app.use('/download', downloadRoute);

app.use('/upload', uploadRoute);

module.exports = app;
