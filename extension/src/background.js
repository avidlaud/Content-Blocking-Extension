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
