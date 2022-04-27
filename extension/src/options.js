function save_options() {
    // creating a list of models

    chrome.storage.sync.set({

    }, () => {
        // Update status to let user know options were saved.
        const revealImage = document.querySelector('#revealImage');
        if (revealImage.checked) {

        } else {

        }

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
    save_options,
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
const models = [
    'Blue',
    'Red',
    'White',
    'Green',
    'Black',
    'Orange',
];
const select = document.createElement('select');
document.getElementById('modelList').appendChild(select);

models.forEach((models) => {
    const option = document.createElement('option');
    select.appendChild(option);

    option.innerHTML += models;
});
