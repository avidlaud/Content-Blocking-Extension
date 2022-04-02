const fs = require('fs');
const express = require('express');
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // No modelName header provided
        if (!req.header('modelName')) {
            console.log('Model upload attempted without modelName');
            cb(new Error('No model name specified!'));
            return;
        }
        // TODO: Really should sanitize this
        // Also a pretty bad idea to use sync but it's alright for now
        if (!fs.existsSync(`models/${req.header('modelName')}`)) {
            fs.mkdirSync(`models/${req.header('modelName')}`, { recursive: true });
        } else {
            console.log('Model directory already exists!');
        }
        cb(null, `models/${req.header('modelName')}`);
    },
    filename: (req, file, cb) => {
        fs.stat(`models/${req.header('modelName')}/${file.fieldname}`, (err, _) => {
            // File does not exist yet
            if (err) {
                console.log('File does not exist yet');
                cb(null, file.fieldname);
                return;
            }
            cb(new Error(`models/${req.header('modelName')}/${file.fieldname} already exists!`));
        });
    },
});

const upload = multer({ storage });

const uploadController = require('../controllers/uploadController');

const modelFiles = upload.fields([
    { name: 'model.json', maxCount: 1 },
    { name: 'model.weights.bin', maxCount: 1 },
]);
router.post('/', modelFiles, uploadController.upload);

module.exports = router;
