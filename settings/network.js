module.exports = {
    peer: {
        port: 7132,
        ip: '127.0.0.1',
        allowPortIncrementation: true,
        maxPort: 8200
    },
    limits: {
        peers: 25
    },
    timeouts: {
        ping: 5000
    },
    discovery: {
        connectMoreInterval: 2000,
        askMoreInterval: 5000
    },
    version: {
        version: '0.001'
    }
};
