import * as tf from '@tensorflow/tfjs';
import modelStorage from './modelStorage';
import IMAGENET_CLASSES from './imagenet_classes';

// Implement with async later
// const handleDownloadRequest = async(data) => {
//     const file = fetch('http://ec2-3-80-69-220.compute-1.amazonaws.com:10000/download/s3?name=a');
//     console.log(await (await file).text());
// }

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
        // const predictions = await this.model.classify(imageData, 2);
        // console.log(predictions);
        const logits = this.model.predict(this.constructor.normalizeInput(imageData));
        const softmax = tf.softmax(logits);
        const values = await softmax.data();
        // TODO: Below is specific to Mobilenet - change once we switch to a binary classifier
        const valuesAndIndices = [];
        for (let i = 0; i < values.length; i += 1) {
            valuesAndIndices.push({ value: values[i], index: i });
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
        console.log(topClassesAndProbs);
        return topClassesAndProbs;
    }

    static normalizeInput(imageData) {
        const img = tf.browser.fromPixels(imageData);
        const normalized = tf.add(tf.mul(tf.cast(img, 'float32'), (1 / 255.0)), 0);
        return tf.reshape(normalized, [-1, 224, 224, 3]);
    }
}

const imageClassifier = new ImageClassifier();

const handleDownloadRequest = (data) => {
    fetch(`http://ec2-3-80-69-220.compute-1.amazonaws.com:10000/download/s3?name=${data}`).then((resp) => resp.text()).then((fileContents) => console.log(fileContents));
    return 'Done!';
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'downloadRequest') {
        const result = handleDownloadRequest(request.data);
        sendResponse(result);
    }
    return true;
    // return Promise.resolve("Dummy response");
});

// Integrate with config
const shouldBlock = (classification) => (classification.className === 'banana');

// Listen for images from the content script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === 'classify_image') {
        console.log('Got image');
        const imgResponse = await fetch(request.img);
        const imgBlob = await imgResponse.blob();
        // Resize image to 224x224 to fit model spec
        const imgBitmap = await createImageBitmap(imgBlob, { resizeHeight: 224, resizeWidth: 224 });
        const canvas = new OffscreenCanvas(224, 224);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgBitmap, 0, 0);
        const arr = Array.from(ctx.getImageData(0, 0, 224, 224).data);
        const imageData = new ImageData(Uint8ClampedArray.from(arr), 224, 224);
        const predictions = imageClassifier.analyzeImage(imageData);
        console.log(await predictions);
        const classifications = await predictions;
        const classification = classifications[0];
        sendResponse({ classification, block: shouldBlock(classification) });
    }
    return true;
    // return Promise.resolve("Dummy response");
});
