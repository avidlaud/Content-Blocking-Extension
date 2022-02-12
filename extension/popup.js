const buttonDownload = document.getElementById("buttonDownload");

buttonDownload.addEventListener("click", downloadFile);

const downloadTest = () => downloadFile('a');

const downloadFile = async(fileName) => {
    const SERVER_URL = 'localhost:10000/';
    const fileRequest = fetch(`${SERVER_URL}$download/?name={fileName}`);
    
    const fileBlob = (await fileRequest).blob;
}