const blockImage = chrome.runtime.getURL('block.png');

const observer = new MutationObserver((mutations) => {
    for (let i = 0; i < mutations.length; i += 1) {
        const mutRecord = mutations[i];
        if (mutRecord.type === 'childList') {
            for (let j = 0; j < mutRecord.addedNodes.length; j += 1) {
                if (mutRecord.addedNodes[j].nodeName === 'IMG') {
                    const image = mutRecord.addedNodes[j];
                    console.log(image.src);
                    chrome.runtime.sendMessage({ message: 'classify_image', img: image.src }, (resp) => {
                        console.log(resp);
                        if (resp.block) {
                            image.src = blockImage;
                            image.srcset = '';
                        }
                    });
                }
            }
        } else if (mutRecord.type === 'attributes') {
            if (mutRecord.target.nodeName === 'IMG' && mutRecord.target.src !== blockImage) {
                const image = mutRecord.target;
                chrome.runtime.sendMessage({ message: 'classify_image', img: image.src }, (resp) => {
                    console.log(resp);
                    if (resp.block) {
                        image.src = blockImage;
                        image.srcset = '';
                    }
                });
            }
        }
    }
});

observer.observe(document.documentElement, { attributes: true, subtree: true, childList: true });
