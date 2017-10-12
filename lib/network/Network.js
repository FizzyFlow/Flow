const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');

const EventEmitter = rfr('lib/utils/EventEmitter.js');
const HashMap = rfr('lib/utils/HashMap.js');

const LocalSocket = rfr('lib/network/LocalSocket.js');
const KnownPeerAddresses = rfr('lib/network/KnownPeerAddresses.js');

const PeerAddress = rfr('lib/network/PeerAddress.js');
const PeerChannel = rfr('lib/network/PeerChannel.js');

const Settings = rfr('lib/utils/Settings.js');

class Network extends EventEmitter {
    constructor(options) {
        super();
    }

    async initialize(options) {
        Logger.info('Initializing Network object...');

        this._peerChannels = new HashMap();

        //// note, this is not real-time values, but historic data for already closed channels.
        this._bytesSent = 0;
        this._bytesReceived = 0;

        this._localSocket = new LocalSocket();
        await this._localSocket.startSocket();

        ///// localPeerAddress may be updated with different port after _localSocket.startSocket()
        this._localPeerAddress = this._localSocket.localPeerAddress;

        this._localSocket.on('connection', conn => this._onConnection(conn));
        this._localSocket.on('error', peerAddr => this._onError(peerAddr));

        this._knownPeerAddresses = new KnownPeerAddresses();
    }

    getPeerChannels() {
        return this._knownPeerAddresses.peerChannels;
    }

    getLocalSocket() {
        return this._localSocket;
    }

    getLocalPeerAddress() {
        return this._localPeerAddress;
    }

    connect(ip, port) {
        var peerAddress = new PeerAddress({
            ip: ip,
            port: port
        });

        this._connect(peerAddress);
    }

    _connect(peerAddress) {
        if (this._localSocket.connect(peerAddress)) {
            this._knownPeerAddresses.connectingTo(peerAddress);
        }
    }

    _onError(peerAddress, reason) {
        this._knownPeerAddresses.failedToCommunicateWith(peerAddress);
    }

    _onConnection(conn) {
        const peerChannel = new PeerChannel({
            peerConnection: conn,
            localPeerAddress: this._localPeerAddress,
            knownPeerAddresses: this._knownPeerAddresses
        });

        this._knownPeerAddresses.connectedTo(conn.peerAddress);

        peerChannel.on('ban', reason => this._onBan(peerChannel, reason));
        peerChannel.on('handshake:success', peerAddress => this._knownPeerAddresses.activeTo(conn.peerAddress, peerChannel));

        this.bubble(peerChannel, 'handshake:success', 'handshake:error', 'askedforpeers');

        this.fire('newChannel', peerChannel);
    }

    _onClose(peer, channel, closedByRemote) {
        this._bytesSent += channel.connection.bytesSent;
        this._bytesReceived += channel.connection.bytesReceived;

        this._knownPeerAddresses.disconnectedFrom(channel.peerAddress);
    }

    _onBan(channel, reason) {
        this._knownPeerAddresses.ban(channel.peerAddress);
    }
}


module.exports = Network;