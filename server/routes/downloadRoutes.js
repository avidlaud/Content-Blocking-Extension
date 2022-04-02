const express = require('express');

const router = express.Router();

const downloadController = require('../controllers/downloadController');

router.get('/', downloadController.download);

router.get('/s3', downloadController.downloadS3);

router.get('/listModels', downloadController.listModels);

router.get('/hasModel', downloadController.hasModel);

module.exports = router;
