import * as tf from '@tensorflow/tfjs';
import modelStorage from './modelStorage';
import IMAGENET_CLASSES from './imagenet_classes';

let imageQueue = [];

// Integrate with config
const shouldBlock = (classification) => (classification.className === 'banana');

class ImageClassifier {
    constructor() {
        this.loadModel();
    }

    async loadModel() {
        const modelPromise = modelStorage.get('mobilenet-model');
        this.model = await modelPromise;
        this.model.summary();
        // Test model
        const result = tf.tidy(() => this.model.predict(tf.zeros([1, 224, 224, 3])));
        console.log(await result.data());
        result.dispose();
        console.log('Model loaded');
    }

    async analyzeImage(imageData) {
        if (!this.model) {
            console.log('Waiting for model to load');
            setTimeout(() => {
                this.analyzeImage(imageData);
            }, 5000);
            return null;
        }
        const softmax = tf.tidy(() => {
            // const logits = this.model.predict(this.constructor.normalizeInput(imageData));
            const logits = this.model.predict(imageData);
            return tf.softmax(logits);
        });
        const values = await softmax.data();
        softmax.dispose();
        // TODO: Below is specific to Mobilenet - change once we switch to a binary classifier
        const output = [];
        for(let j = 0; j < (values.length/1000); j++) {
            const valuesAndIndices = [];
            for (let i = 0; i < 1000; i += 1) {
                valuesAndIndices.push({ value: values[(j * 1000) + i], index: i });
            }
            valuesAndIndices.sort((a, b) => b.value - a.value);
            const topK = 2;
            const topkValues = new Float32Array(topK);
            const topkIndices = new Int32Array(topK);
            for (let i = 0; i < topK; i += 1) {
                topkValues[i] = valuesAndIndices[i].value;
                topkIndices[i] = valuesAndIndices[i].index;
            }
    
            const topClassesAndProbs = [];
            for (let i = 0; i < topkIndices.length; i += 1) {
                topClassesAndProbs.push({
                    className: IMAGENET_CLASSES[topkIndices[i]],
                    probability: topkValues[i],
                });
            }
            output.push(topClassesAndProbs)
        }
        return output;
    }

    async analyzeBatch(batch) {
        const images = batch.map((batchItem) => {
            return ImageClassifier.normalizeInput(batchItem.imageData);
            // ImageClassifier.normalizeInput(imageData);
        });
        const batchTensor = tf.stack(images);
        const predictions = await this.analyzeImage(batchTensor);
        for (let i = 0; i < predictions.length; i++) {
            console.log("This is a result!");
            const classification = predictions[i][0];
            console.log(predictions[i]);
            const sendResponse = batch[i].responseFn;
            sendResponse({ classification, block: shouldBlock(classification), isPlaceholder: false });
        }
        return;
    }

    static normalizeInput(imageData) {
        const img = tf.browser.fromPixels(imageData);
        const normalized = tf.add(tf.mul(tf.cast(img, 'float32'), (1 / 255.0)), 0);
        // return tf.reshape(normalized, [-1, 224, 224, 3]);
        return tf.reshape(normalized, [224, 224, 3]);
    }
}

const imageClassifier = new ImageClassifier();

const queueImage = (imageData, responseFn) => {
    imageQueue.push({ imageData, responseFn });
};

// Listen for images from the content script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === 'classify_image') {
        console.log('Got image');
        const imgResponse = await fetch(request.img);
        const imgBlob = await imgResponse.blob();
        // Do not perform inference on tiny images (often used as placeholders)
        if (imgBlob.size < 100) {
            console.log('Placeholder found!', request.img);
            sendResponse({ classification: 'Likely Placeholder', block: false, isPlaceholder: true });
        }
        // Resize image to 224x224 to fit model spec
        try {
            const imgBitmap = await createImageBitmap(imgBlob, { resizeHeight: 224, resizeWidth: 224 });
            const canvas = new OffscreenCanvas(224, 224);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgBitmap, 0, 0);
            const arr = Array.from(ctx.getImageData(0, 0, 224, 224).data);
            const imageData = new ImageData(Uint8ClampedArray.from(arr), 224, 224);
            queueImage(imageData, sendResponse);
        } catch (e) {
            console.log(e);
        }
    }
    return true;
});

// Needs this or else the other listener won't work properly
chrome.runtime.onMessage.addListener(() => {
    return true;
});

setInterval(async () => {
    // Run the batch
    if (imageQueue.length > 0) {
        // There's images to analyze
        batch = imageQueue;
        imageQueue = [];
        imageClassifier.analyzeBatch(batch);
    }
}, 200);
