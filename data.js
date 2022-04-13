const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

const TRAIN_IMAGES_DIR = './data/train';
const TEST_IMAGES_DIR = './data/test';

function loadImages(dataDir) {
    const images = [];
    const labels = [];

    var files = fs.readdirSync(dataDir);
    for (let i = 0; i < files.length; i++) {

        if (!files[i].toLocaleLowerCase().endsWith(".jpeg") || !files[i].toLocaleLowerCase().endsWith(".jpg")) {
      continue;
        }

        var filePath = path.join(dataDir, files[i]);

        var buffer = fs.readFileSync(filePath);
        var imageTensor = tf.node.decodeImage(buffer)
            .resizeNearestNeighbor([96,96])
            .toFloat()
            .div(tf.scalar(255.0))
            .expandDims();
        images.push(imageTensor);

        var isDog = files[i].toLocaleLowerCase().startsWith("dog");
        labels.push(isDog ? 1 : 0);
    }

    return [images, labels];
}

/** Helper class to handle loading training and test data. */
class petDataset {
    constructor() {
      this.trainData = [];
      this.testData = [];
    }

    /** Loads training and test data. */
    loadData() {
      console.log('Loading images...');
      this.trainData = loadImages(TRAIN_IMAGES_DIR);
      this.testData = loadImages(TEST_IMAGES_DIR);
      console.log('Images loaded successfully.')
    }

    getTrainData() { // learn all about trains
      return {
        images: tf.concat(this.trainData[0]),
        labels: tf.oneHot(tf.tensor1d(this.trainData[1], 'int32'), 2).toFloat()
      }
    }

    getTestData() {
      return {
        images: tf.concat(this.testData[0]),
        labels: tf.oneHot(tf.tensor1d(this.testData[1], 'int32'), 2).toFloat()
      }
    }
  }

  module.exports = new petDataset();
