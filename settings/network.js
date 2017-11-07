module.exports = {
    peer: {
        port: 7132,
        ip: '127.0.0.1',
        allowPortIncrementation: true,
        maxPort: 8200
    },
    limits: {
        peers: 25,
        inboundPeers: 17,
        outboundPeers: 19 /// it's nice to set this values to prime numbers
    },
    timeouts: {
        ping: 5000,
        waitingForActivity: 15000 /// disconnect from peers that are not active in this interval
    },
    testing: {
        enableNetworkGraphBroadcast: true, /// see NetworkGraphExport class
        networkGraphBroadcastDebounceDelay: 200, /// to not overload socket
        networkGraphBroadcastPort: 5588
    },
    discovery: {
        connectMoreInterval: 2000,
        askMoreInterval: 15000
    },
    version: {
        version: '0.001'
    }
};
