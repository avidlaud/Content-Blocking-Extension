const downloadFile = async(fileName) => {
    const SERVER_URL = 'localhost:10000/';
    const fileRequest = fetch(`${SERVER_URL}${fileName}`);
    
    const fileBlob = (await fileRequest).blob;
}