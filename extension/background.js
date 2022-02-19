// const handleBrowserActionClicked = async(tab) => {
//     // const opts = {
//     //     url: chrome.runtime.getURL('test.html')
//     // };
//     // chrome.windows.create(opts, handleWindowCreated);
//     const file = fetch('http://ec2-3-80-69-220.compute-1.amazonaws.com:10000/download/s3?name=a');
//     console.log(await (await file).text());
// }

const handleBrowserActionClicked = (tab) => {
    // const opts = {
    //     url: chrome.runtime.getURL('test.html')
    // };
    // chrome.windows.create(opts, handleWindowCreated);
    const file = fetch('http://ec2-3-80-69-220.compute-1.amazonaws.com:10000/download/s3?name=a').then((file) => file.text()).then((fileContents) => console.log(fileContents));
}

chrome.action.onClicked.addListener(handleBrowserActionClicked);

// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//     if (request.message === 'downloadRequest') {
//         await handleBrowserActionClicked();
//     }
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'downloadRequest') {
        handleBrowserActionClicked();
    }
    return true;
    // return Promise.resolve("Dummy response");
});