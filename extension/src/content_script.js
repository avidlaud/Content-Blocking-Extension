const findImages = async () => {
    const images = document.querySelectorAll('img:not(.image-classified)');

    /* eslint-disable-next-line */
    for (const image of images) {
        chrome.runtime.sendMessage({ message: 'classify_image', img: image.src }, (resp) => {
            console.log(resp);
        });
        // port.postMessage("Found image");
        // image.src = chrome.runtime.getURL('assets/block.png');
        // Remove the srcset, which is used for responsive images
        // image.srcset = "";
        image.classList.add('image-classified');
    }
};

const observer = new MutationObserver(() => {
    findImages();
});

observer.observe(document.body, { subtree: true, childList: true });
