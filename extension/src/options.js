function saveOptions() {
    // Set the target object
    const modelSelect = document.querySelector('#selectAvailableModel');
    const selectedModel = modelSelect.value;

    // Get the reveal image option
    const revealImage = document.querySelector('#revealImage');
    const showButton = revealImage.checked;

    chrome.storage.sync.set({
        targetObject: selectedModel,
        revealButton: showButton,
    }, () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 750);
    });
}

document.getElementById('save').addEventListener(
    'click',
    saveOptions,
);

const buttonToggleMode = document.getElementById('buttonToggleMode');

chrome.storage.sync.get('strictModeOn', (storage) => {
    buttonToggleMode.innerText = storage.strictModeOn ? 'Strict Mode' : 'Relaxed Mode';
});

const toggleMode = () => {
    chrome.storage.sync.get('strictModeOn', (storage) => {
        chrome.storage.sync.set({
            strictModeOn: !storage.strictModeOn,
        });
        buttonToggleMode.innerText = !storage.strictModeOn ? 'Strict Mode' : 'Relaxed Mode';
    });
};

chrome.storage.sync.get('revealButton', (storage) => {
    const revealImage = document.querySelector('#revealImage');
    revealImage.checked = storage.revealButton;
});

buttonToggleMode.addEventListener('click', () => {
    toggleMode();
});

const inpFile = document.getElementById('inpFile');
const previewContainer = document.getElementById('imagePreview');
const previewImage = previewContainer.querySelector('.image-preview__image');
const previewDefaultText = previewContainer.querySelector('.image-preview__default-text');

inpFile.addEventListener('change', function () {
    const file = this.files[0];
    // console.log(file);
    if (file) {
        const reader = new FileReader();
        previewDefaultText.style.display = 'none';
        previewImage.style.display = 'block';
        reader.addEventListener('load', function () {
            previewImage.setAttribute('src', this.result);
        });

        reader.readAsDataURL(file);
    } else {
        previewDefaultText.style.display = 'null';
        previewImage.style.display = 'null';
        previewImage.setAttribute('src', '');
    }
});

const capitalizeFirstLetter = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const populateModelList = (availableModels) => {
    const select = document.querySelector('#selectAvailableModel');
    availableModels.forEach((model) => {
        const option = document.createElement('option');
        select.appendChild(option);
        option.textContent = capitalizeFirstLetter(model);
        option.value = model;
    });
    chrome.storage.sync.get('targetObject', (storage) => {
        if (storage.targetObject && storage.targetObject.length > 0) {
            select.value = storage.targetObject;
        }
    });
};

fetch('http://ec2-3-80-69-220.compute-1.amazonaws.com:10000/download/listmodels')
    .then((res) => res.json())
    .then(populateModelList);
