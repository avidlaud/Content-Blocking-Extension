const express = require('express')

const app = express();

app.get('/download', (req, res) => {
    const file = 'static/a.txt';
    res.download(file)
});

app.listen(10000, '0.0.0.0');
