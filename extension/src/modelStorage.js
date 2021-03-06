import * as tf from '@tensorflow/tfjs';

const modelStorage = (() => {
    let model;

    const extractModel = (modelName, db) => new Promise((resolve, reject) => {
        // This schema is defined by tfjs
        try {
            const modelReq = db
                .transaction(['models_store'], 'readwrite')
                .objectStore('models_store')
                .get(modelName);
            modelReq.onsuccess = async () => {
                // Model found
                if (modelReq.result) {
                    console.log('Model found in IDB');
                    const pulledModel = tf.loadGraphModel(`indexeddb://${modelName}`);
                    model = pulledModel;
                    resolve(model);
                    return;
                }
                // const deleteReq = db
                //     .transaction(['models_store'], 'readwrite')
                //     .objectStore('models_store')
                //     .delete(modelName);
                // Get the model
                // TODO: Add some code to pull from our server
                console.log('Model not found in IDB, pulling from server...');
                const pulledModel = await tf.loadGraphModel(`http://ec2-3-80-69-220.compute-1.amazonaws.com:10000/models/${modelName}/model.json`);
                pulledModel.save(`indexeddb://${modelName}`);
                model = pulledModel;
                resolve(model);
            };
            modelReq.onerror = () => {
                reject(new Error(`Encountered error extracting model: ${modelName} from IDB`));
            };
        } catch (error) {
            console.log('Could not find object store - pulling model!');
            tf.loadGraphModel(`http://ec2-3-80-69-220.compute-1.amazonaws.com:10000/models/${modelName}/model.json`).then((pulledModel) => {
                pulledModel.save(`indexeddb://${modelName}`);
                model = pulledModel;
                resolve(pulledModel);
            });
        }
    });

    const getModel = (modelName) => new Promise((resolve, reject) => {
        // if (model) {
        //     resolve(model);
        // }
        const dbRequest = indexedDB.open('tensorflowjs', 1);
        dbRequest.onupgradeneeded = (event) => {
            console.log('Upgraded IDB!');
            const db = event.target.result;
            try {
                db.createObjectStore('models_store');
            } catch (error) {
                console.log('Object store exists!');
            }
            resolve(extractModel(modelName, db));
        };
        dbRequest.onsuccess = () => {
            console.log('Successfully connected to IDB!');
            const db = dbRequest.result;
            try {
                db.createObjectStore('models_store');
            } catch (error) {
                console.log('Object store exists!');
            }
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
