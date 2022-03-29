// const port = chrome.runtime.connect({name:"image-channel"});

const findImages = async () => {
    let images = document.querySelectorAll('img:not(.image-blocked)');

    for (const image of images) {
        // chrome.runtime.sendMessage({ message: 'store_image', img: image.src }, (resp) => {
        //     console.log(resp);
        // });
        // Get the blob
        // const img_response = await fetch(image.src);
        // const img_blob = await img_response.blob();
        // const img_blob_text = await img_blob.text();
        // console.log(img_blob_text);
        // const img_bit_map = await createImageBitmap(image);
        // console.log(img_bit_map);
        // chrome.runtime.sendMessage({ message: 'store_image', img: img_bit_map.height }, (resp) => {
        //     console.log(resp);
        // });
        chrome.runtime.sendMessage({ message: 'store_image', img: image.src }, (resp) => {
            console.log(resp);
        });
        // port.postMessage("Found image");
        // image.src = chrome.runtime.getURL('assets/block.png');
        // Remove the srcset, which is used for responsive images
        // image.srcset = "";
        image.classList.add("image-blocked")
    }
}

const observer = new MutationObserver(() => {
    findImages();
});

observer.observe(document.body, { subtree: true, childList: true });