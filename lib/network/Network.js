const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');

const EventEmitter = rfr('lib/utils/EventEmitter.js');
const HashMap = rfr('lib/utils/HashMap.js');

const LocalSocket = rfr('lib/network/LocalSocket.js');
const KnownPeerAddresses = rfr('lib/network/KnownPeerAddresses.js');

const PeerAddress = rfr('lib/network/PeerAddress.js');
const PeerChannel = rfr('lib/network/PeerChannel.js');

const Timers = rfr('lib/utils/Timers.js');
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

        this._knownPeerAddresses = new KnownPeerAddresses({
            localPeerAddress: this._localPeerAddress
        });

        this._awaitingForHandshakeCount = 0;

        this._timers = new Timers();
        this._timers.setInterval('connectToMorePeers', () => { this._connectToMorePeers() }, 
            Settings.network.discovery.connectMoreInterval);

        // Forward specified events on the _knownPeerAddresses to listeners of Network
        this.bubble(this._knownPeerAddresses, 'peer:status');
    }

    _connectToMorePeers() {
        // 1st step - disconnect from falling peers, 
        // Peers that have active status, but are not active in their connection.
        const minActivityTimestamp = Timers.now() - Settings.network.timeouts.waitingForActivity;
        this._knownPeerAddresses.
            getFallingPeerAddresses(minActivityTimestamp).forEach((peerAddress)=>{
                this._knownPeerAddresses.close(peerAddress);
            });

        /// 2nd step - connect to more peers if they are availiable and we are below limits
        if (this._knownPeerAddresses.activeCount >= Settings.network.limits.peers) {
            //// no need to connect to more peers
            return true;
        }

        this._knownPeerAddresses.
            availablePeerAddresses.forEach((peerAddress)=>{
                this._connect(peerAddress)
            });
    }

    getPeerChannels() {
        return this._knownPeerAddresses.peerChannels;
    }

    get knownPeerAddresses() {
        return this._knownPeerAddresses;
    }

    getLocalSocket() {
        return this._localSocket;
    }

    get localPeerAddress() {
        return this._localPeerAddress;
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
        if (this._knownPeerAddresses.activeOutboundCount >= Settings.network.limits.outboundPeers ||
            this.connectionsCount >= Settings.network.limits.peers) {
            Logger.debug('Can not connect to more peers because of limits');
            return false;
        }
        
        if (this._localSocket.connect(peerAddress)) {
            this._knownPeerAddresses.connectingTo(peerAddress);
        }
    }

    _onError(peerAddress, reason) {
        this._knownPeerAddresses.failedToCommunicateWith(peerAddress);
    }

    get connectionsCount() {
        return this._knownPeerAddresses.activeCount + this._awaitingForHandshakeCount;
    }

    _onConnection(conn) {
        // if (conn.inbound && 
        //         (this.connectionsCount >= Settings.network.limits.peers || 
        //         this._knownPeerAddresses.activeInboundCount >= Settings.network.limits.inboundPeers) 
        //     ) {
        //     /// discard connection if there're too many
        //     conn.close('peers count limit');
        //     this.fire('closed', null, conn.peerAddress);
        //     return true;
        // }

        this._awaitingForHandshakeCount++;

        if (conn.outbound) {
            /// Add to known addresses only if it's outbound (we know the port already)
            /// If we don't know the port - add it only after handshake
            this._knownPeerAddresses.connectedTo(conn.peerAddress);
        }

        const peerChannel = new PeerChannel({
            peerConnection: conn,
            localPeerAddress: this._localPeerAddress,
            knownPeerAddresses: this._knownPeerAddresses,
            awaitingForHandshake: true
        });

        if (conn.inbound && 
                (this.connectionsCount > Settings.network.limits.peers || 
                this._knownPeerAddresses.activeInboundCount > Settings.network.limits.inboundPeers) 
            ) {
            peerChannel.awaitForDiscoveryAndClose();
        }
        
        peerChannel.on('close', (isClosedByUs, peerConnection, reason)=>{
            this._onClose(peerChannel, isClosedByUs, reason);
        });

        peerChannel.on('handshake:success', peerAddress => {
            this._knownPeerAddresses.activeTo(conn.peerAddress, peerChannel);
            this._awaitingForHandshakeCount--;
        });

        peerChannel.on('ban', reason => this._onBan(peerChannel, reason));
        
        peerChannel.on('peersdiscovered', (peerChannel, peerAddresses) => this._knownPeerAddresses.discovered(peerAddresses));

        this.bubble(peerChannel, 'message', 'handshake:success', 'handshake:error', 'askedforpeers', 'peersdiscovered');

        this.fire('newChannel', peerChannel);
    }

    _onClose(peerChannel, isClosedByUs, reason) {
        this._bytesSent += peerChannel.peerConnection.bytesSent;
        this._bytesReceived += peerChannel.peerConnection.bytesReceived;

        if (this._knownPeerAddresses.known(peerChannel.peerAddress)) {
            this._knownPeerAddresses.disconnectedFrom(peerChannel.peerAddress);
        }

        if (peerChannel && peerChannel.awaitingForHandshake) {
            this._awaitingForHandshakeCount--;
        }
        
        this.fire('closed', peerChannel, peerChannel.peerAddress);
    }

    _onBan(channel, reason) {
        this._knownPeerAddresses.ban(channel.peerAddress);
    }
}


module.exports = Network;