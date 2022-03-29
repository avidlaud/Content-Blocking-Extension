import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import { image } from '@tensorflow/tfjs';

// Implement with async later
// const handleDownloadRequest = async(data) => {
//     const file = fetch('http://ec2-3-80-69-220.compute-1.amazonaws.com:10000/download/s3?name=a');
//     console.log(await (await file).text());
// }

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
// const port = chrome.runtime.connect({name:"image-channel"});
// port.onMessage.addListener((msg) => {
//     // msg is image
//     console.log(msg);
// })

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === 'store_image') {
        const img_response = await fetch(request.img);
        const img_blob = await img_response.blob();
        const img_bitmap = await createImageBitmap(img_blob);
        console.log("Height:" + img_bitmap.height);
        console.log("Width:" + img_bitmap.width);
        console.log("Got image");
    }
    return true;
    // return Promise.resolve("Dummy response");
});
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
        console.log(predictions);
    }
}

const imageClassifier = new ImageClassifier();

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === 'modelTest') {
        // Get an image
        const img = await fetch(chrome.runtime.getURL('dog.png'))
            .then(data => data.blob())
            .then(createImageBitmap)
            .then(imgBitMap => {
                console.log(imgBitMap);
                const canvas = new OffscreenCanvas(224, 224);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(imgBitMap, 0, 0);
                const arr = Array.from(ctx.getImageData(0, 0, 224, 224).data);
                const imageData = new ImageData(Uint8ClampedArray.from(arr), 224, 224);
                return imageData;
            });
        const predictions = imageClassifier.analyzeImage(img);
    }
    return true;
    // return Promise.resolve("Dummy response");
});
