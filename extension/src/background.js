import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'

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
        this.model = await mobilenet.load({version: 2, alpha: 1.00});
        tf.tidy(() => {
            this.model.classify(tf.zeros([1, 224, 224, 3]));
        })
        console.log("Model loaded");
    }
    async analyzeImage(imageData) {
        if (!this.model) {
            console.log("Waiting for model to load");
            setTimeout(() => {
                this.analyzeImage(imageData);
            }, 5000);
            return
        }
        const predictions = await this.model.classify(imageData, 2);
        // console.log(predictions);
        return predictions;
    }
}

const imageClassifier = new ImageClassifier();

const handleDownloadRequest = (data) => {
    const file = fetch(`http://ec2-3-80-69-220.compute-1.amazonaws.com:10000/download/s3?name=${data}`).then((file) => file.text()).then((fileContents) => console.log(fileContents));
    return "Done!"
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'downloadRequest') {
        const result = handleDownloadRequest(request.data);
        sendResponse(result);
    }
    return true;
    // return Promise.resolve("Dummy response");
});

// Listen for images from the content script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === 'classify_image') {
        console.log("Got image");
        const img_response = await fetch(request.img);
        const img_blob = await img_response.blob();
        // Resize image to 224x224 to fit model spec
        const img_bitmap = await createImageBitmap(img_blob, { resizeHeight: 224, resizeWidth: 224 });
        const canvas = new OffscreenCanvas(224, 224);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img_bitmap, 0, 0);
        const arr = Array.from(ctx.getImageData(0, 0, 224, 224).data);
        const imageData = new ImageData(Uint8ClampedArray.from(arr), 224, 224);
        const predictions = imageClassifier.analyzeImage(imageData);
        console.log(await predictions);
        const classifications = await predictions;
        const classification = classifications[0];
        sendResponse({ classification: classification });
    }
    return true;
    // return Promise.resolve("Dummy response");
});
