const formDownload = document.getElementById("formDownload");

// const sendDownloadRequest = async(event) => {
//     chrome.runtime.sendMessage({
//         msg: 'downloadRequest',
//         data: 'a'
//     }, (response) => {
//         // Display something probably
//     })
// };

const sendDownloadRequest = (event) => {
    event.preventDefault();
    const filename = document.getElementById('inputFilename').value;
    chrome.runtime.sendMessage({
        message: 'downloadRequest',
        data: filename,
    }, (response) => {
        const pResponse = document.getElementById('pResponse');
        pResponse.innerHTML = response;
    })
};

formDownload.addEventListener('submit', sendDownloadRequest);
