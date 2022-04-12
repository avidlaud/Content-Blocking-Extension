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
