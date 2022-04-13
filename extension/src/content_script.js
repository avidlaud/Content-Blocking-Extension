/* eslint-disable no-loop-func */
// ^ Linter is being overly cautious with a read-only variable
const blockImage = chrome.runtime.getURL('block.png');
const blankImage = chrome.runtime.getURL('blank.png');

let useStrictMode = true;
chrome.storage.sync.get('strictModeOn', (storage) => {
    useStrictMode = storage.strictModeOn;
    console.log(`Strict mode is ${useStrictMode ? 'on' : 'off'}`);
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.strictModeOn) {
        chrome.storage.sync.get('strictModeOn', (storage) => {
            useStrictMode = storage.strictModeOn;
            console.log(`Strict mode is ${useStrictMode ? 'on' : 'off'}`);
        });
        console.log('Strict mode changed!');
    }
});

const revealImage = (event) => {
    event.target.linkedImage.src = event.target.linkedImage.originalImage;
    event.target.remove();
};

const wrapWithDiv = (element) => {
    if (element.classList.contains('wrapped')) {
        return;
    }
    const wrapper = document.createElement('div');
    wrapper.classList.add('overlaywrapper');
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    element.classList.add('wrapped');

    const revealButton = document.createElement('button');
    revealButton.linkedImage = element;
    revealButton.innerHTML = 'Reveal Image';
    revealButton.classList.add('overlaybtn');
    revealButton.addEventListener('click', revealImage);
    wrapper.appendChild(revealButton);
};

const observer = new MutationObserver((mutations) => {
    for (let i = 0; i < mutations.length; i += 1) {
        const mutRecord = mutations[i];
        if (mutRecord.type === 'childList') {
            for (let j = 0; j < mutRecord.addedNodes.length; j += 1) {
                if (mutRecord.addedNodes[j].nodeName === 'IMG') {
                    console.log('Image changed!');
                    const image = mutRecord.addedNodes[j];
                    const originalImage = image.src.slice();
                    if (useStrictMode) {
                        image.src = blankImage;
                    }
                    chrome.runtime.sendMessage({ message: 'classify_image', img: originalImage }, (resp) => {
                        if (originalImage !== blockImage) {
                            image.originalImage = originalImage.slice();
                        }
                        console.log(resp);
                        if (resp.block) {
                            image.src = blockImage;
                            image.srcset = '';
                            wrapWithDiv(image);
                        } else if (!resp.isPlaceholder && useStrictMode) {
                            image.src = originalImage;
                        }
                    });
                }
            }
        } else if (mutRecord.type === 'attributes') {
            if (mutRecord.target.nodeName === 'IMG' && mutRecord.target.src !== blockImage && mutRecord.target.src !== blankImage && !mutRecord.target.classList.contains('classified') && !mutRecord.target.classList.contains('wrapped')) {
                console.log('Attributes changed!');
                const image = mutRecord.target;
                const originalImage = image.src.slice();
                if (useStrictMode) {
                    image.src = blankImage;
                }
                chrome.runtime.sendMessage({ message: 'classify_image', img: originalImage }, (resp) => {
                    console.log(resp);
                    image.originalImage = originalImage.slice();
                    if (resp.block) {
                        image.src = blockImage;
                        image.srcset = '';
                        wrapWithDiv(image);
                    } else if (useStrictMode) {
                        image.src = originalImage;
                    }
                    if (!resp.isPlaceholder) {
                        image.classList.add('classified');
                        // mutRecord.target.classList.add('classified');
                    }
                });
            }
        }
    }
});

observer.observe(document.documentElement, { attributes: true, subtree: true, childList: true });
