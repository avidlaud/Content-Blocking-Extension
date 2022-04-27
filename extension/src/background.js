import * as tf from '@tensorflow/tfjs';
import modelStorage from './modelStorage';

// Integrate with config
const CLASSIFICATION_THRESHOLD = 0.85;

let targetModel = '';

class ImageClassifier {
    constructor() {
        this.loadModel();
    }

    async loadModel() {
        // Get from config
        if (targetModel.length === 0) {
            console.log('Waiting for target object to be selected!');
            setTimeout(() => {
                this.loadModel();
            }, 1000);
            return;
        }
        const modelPromise = modelStorage.get(targetModel);
        this.model = await modelPromise;
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
        const probabilities = tf.tidy(() => {
            const predictions = this.model.predict(this.constructor.normalizeInput(imageData));
            return predictions.dataSync();
        });
        return probabilities;
    }

    static normalizeInput(imageData) {
        const img = tf.browser.fromPixels(imageData);
        const normalized = tf.add(tf.mul(tf.cast(img, 'float32'), (1 / 255.0)), 0);
        return tf.reshape(normalized, [-1, 224, 224, 3]);
    }
}

const imageClassifier = new ImageClassifier();

const shouldBlock = (classification) => (classification[0] > CLASSIFICATION_THRESHOLD);

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
            const predictions = imageClassifier.analyzeImage(imageData);
            sendResponse({ block: shouldBlock(await predictions), isPlaceholder: false });
        } catch (e) {
            console.log(e);
        }
    }
    return true;
});

// Needs this or else the other listener won't work properly
chrome.runtime.onMessage.addListener(() => true);

// Get the target model
chrome.storage.sync.get('targetObject', (storage) => {
    console.log(`Selected model: ${storage.targetObject}`);
    targetModel = storage.targetObject;
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.targetObject) {
        chrome.storage.sync.get('targetObject', (storage) => {
            console.log(`Changing model to: ${storage.targetObject}`);
            targetModel = storage.targetObject;
            // Reload the model
            imageClassifier.loadModel();
        });
    }
});
