import * as tf from '@tensorflow/tfjs';

const modelStorage = (() => {
    let model;

    const extractModel = (modelName, db) => new Promise((resolve, reject) => {
        // This schema is defined by tfjs
        const modelReq = db
            .transaction(['models_store'], 'readwrite')
            .objectStore('models_store')
            .get(modelName);
        modelReq.onsuccess = async () => {
            // Model found
            if (modelReq.result) {
                console.log('Model found in IDB');
                // const pulledModel = tf.loadLayersModel(`indexeddb://${modelName}`);
                const pulledModel = tf.loadGraphModel(`indexeddb://${modelName}`);
                model = pulledModel;
                resolve(model);
                return;
            }
            // Get the model
            // TODO: Add some code to pull from our server
            console.log('Model not found in IDB, pulling from server...');
            // const pulledModel = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json');
            const pulledModel = await tf.loadGraphModel(`http://localhost:10000/models/${modelName}/model.json`);
            pulledModel.save(`indexeddb://${modelName}`);
            model = pulledModel;
            resolve(model);
        };
        modelReq.onerror = () => {
            reject(new Error(`Encountered error extracting model: ${modelName} from IDB`));
        };
    });

    const getModel = (modelName) => new Promise((resolve, reject) => {
        if (model) {
            resolve(model);
        }
        const dbRequest = indexedDB.open('tensorflowjs', 1);
        dbRequest.onupgradeneeded = (event) => {
            console.log('Upgraded IDB!');
            const db = event.target.result;
            resolve(extractModel(modelName, db));
        };
        dbRequest.onsuccess = () => {
            console.log('Successfully connected to IDB!');
            const db = dbRequest.result;
            resolve(extractModel(modelName, db));
        };
        dbRequest.onerror = () => reject(new Error('Unable to open IDB'));
    });

    return {
        async get(modelName) {
            return getModel(modelName);
        },
    };
})();

export default modelStorage;
