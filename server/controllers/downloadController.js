const fs = require('fs');

exports.download = (req, res) => {
    const CONTENT_PATH = 'static/';
    const file = `${CONTENT_PATH}${req.query.name}.txt`;
    if (fs.existsSync(file)) {
        res.download(file);
    } else {
        res.status(400).send('File not found!');
    }
};
