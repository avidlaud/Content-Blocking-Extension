const fs = require('fs');
const AWS = require('aws-sdk');

if (process.env.NODE_ENV === 'development') {
    AWS.config.update(
        {
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
            region: 'us-east-1',
        },
    );
}

const s3 = new AWS.S3();

exports.download = (req, res) => {
    const CONTENT_PATH = 'static/';
    const file = `${CONTENT_PATH}${req.query.name}.txt`;
    if (fs.existsSync(file)) {
        res.download(file);
    } else {
        res.status(404).send('File not found!');
    }
};

exports.downloadS3 = (req, res) => {
    const file = `${req.query.name}.txt`;
    const bucketParams = {
        Bucket: 'capstonebuckettest1',
        Key: file,
    };
    res.type('application/octet-stream');
    res.attachment(file);
    const fileStream = s3.getObject(bucketParams).createReadStream().on('error', (error) => {
        console.log(error);
        res.status(404).send('File not found!');
    });
    fileStream.pipe(res);
};

exports.listModels = async (req, res) => {
    const files = (await fs.promises.readdir('models', { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((dir) => dir.name);
    res.json(files);
};

exports.hasModel = (req, res) => {
    const { modelName } = req.query;
    // Check if the model exists
    if (fs.existsSync(`models/${modelName}`)) {
        res.sendStatus(200);
    } else {
        res.status(404).send('Model not found!');
    }
};
