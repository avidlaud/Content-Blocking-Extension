// const port = chrome.runtime.connect({name:"image-channel"});

const findImages = () => {
    let images = document.querySelectorAll('img:not(.image-blocked)');

    for (const image of images) {
        // chrome.runtime.sendMessage({ message: 'store_image', img: image.src }, (resp) => {
        //     console.log(resp);
        // });
        chrome.runtime.sendMessage({ message: 'store_image', img: image.src}, (resp) => {
            console.log(resp);
        });
        // port.postMessage("Found image");
        image.src = chrome.runtime.getURL('assets/block.png');
        // Remove the srcset, which is used for responsive images
        image.srcset = "";
        image.classList.add("image-blocked")
    }
}

const observer = new MutationObserver(() => {
    findImages();
});

observer.observe(document.body, { subtree: true, childList: true });