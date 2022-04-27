function saveOptions() {
    // Set the target object
    const modelSelect = document.querySelector('#selectAvailableModel');
    const selectedModel = modelSelect.value;
    chrome.storage.sync.set({
        targetObject: selectedModel,
    }, () => {
        // Update status to let user know options were saved.
        const revealImage = document.querySelector('#revealImage');
        if (revealImage.checked) {

        } else {

        }
        console.log(selectedModel);

        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        // favoriteColor: 'red',
        // likesColor: true
    }, (items) => {
        // document.getElementById('color').value = items.favoriteColor;
        // document.getElementById('like').checked = items.likesColor;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
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
        console.log('aaaa');
        previewDefaultText.style.display = 'none';
        console.log('bbbb');
        previewImage.style.display = 'block';
        console.log('GONNA ERROR');
        reader.addEventListener('load', function () {
            console.log('HELLLLLLLO');
            previewImage.setAttribute('src', this.result);
        });

        reader.readAsDataURL(file);
    } else {
        console.log(file);
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
};

fetch('http://ec2-3-80-69-220.compute-1.amazonaws.com:10000/download/listmodels')
    .then((res) => res.json())
    .then(populateModelList);
