const server = require('./server');

const PORT = 10000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => console.log(`Server started, running on port ${PORT}`));
