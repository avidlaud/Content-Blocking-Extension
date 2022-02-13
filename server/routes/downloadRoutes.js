const express = require('express');

const router = express.Router();

const downloadController = require('../controllers/downloadController');

router.get('/', downloadController.download);

router.get('/s3', downloadController.downloadS3);

module.exports = router;
