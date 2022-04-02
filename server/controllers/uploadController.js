exports.upload = (req, res) => {
    console.log(req.header('modelName'));
    console.log(req.files);
    res.send('Model uploaded!');
};
