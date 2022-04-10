// const formDownload = document.getElementById('formDownload');

// const sendDownloadRequest = async(event) => {
//     chrome.runtime.sendMessage({
//         msg: 'downloadRequest',
//         data: 'a'
//     }, (response) => {
//         // Display something probably
//     })
// };

// const sendDownloadRequest = (event) => {
//     event.preventDefault();
//     const filename = document.getElementById('inputFilename').value;
//     chrome.runtime.sendMessage({
//         message: 'modelTest',
//         data: filename,
//     }, (response) => {
//         const pResponse = document.getElementById('pResponse');
//         pResponse.innerHTML = response;
//     });
// };

// formDownload.addEventListener('submit', sendDownloadRequest);

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
