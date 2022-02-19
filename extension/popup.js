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
    chrome.runtime.sendMessage({
        message: 'downloadRequest',
        data: 'a'
    }, (response) => {
        // Display something probably
    })
};

formDownload.addEventListener('submit', sendDownloadRequest);