const rfr = require('rfr');
const EventEmitter = rfr('lib/utils/EventEmitter.js');
const HashMap = rfr('lib/utils/HashMap.js');

const MessageFactory = rfr('lib/network/messages/MessageFactory.js');
const ChannelHandlerFactory = rfr('lib/network/handlers/ChannelHandlerFactory.js');

const Logger = rfr('lib/utils/Logger.js');

class PeerChannel extends EventEmitter {
    constructor(options) {
        super();
        options = options || {};

        this._peerConnection = options.peerConnection || null;
        this._localPeerAddress = options.localPeerAddress || null;

        this._peerConnection.on('message', msg => this._onMessage(msg));

        // Forward specified events on the connection to listeners of this EventEmitter
        this.bubble(this._peerConnection, 'close', 'error', 'ban');

        this.handshaker = ChannelHandlerFactory.factory('Handshaker', {
            peerChannel: this,
            peerConnection: this._peerConnection,
            localPeerAddress: this._localPeerAddress
        });
        
        this.handshaker.on('success', msg => this._onHandshakeSuccess(msg));
        this.handshaker.on('error', msg => this._onHandshakeError(msg));
        this.handshaker.handle();
    }

    updateRemotePeerAddress(peerAddress) {
        if (this._peerConnection._peerAddress.ipEquals(peerAddress)) {
            Logger.debug('Updating '+this._peerConnection+' remote port from ',this._peerConnection._peerAddress.port ,'to ', peerAddress.port);
            /// only allow remote connection to update port, not ip
            this._peerConnection._peerAddress.port = peerAddress.port;
        } else {
            Logger.error(''+this._peerConnection+' got different IP as part of handshake proccess. Current: ', this._peerConnection._peerAddress, 'Received: ', peerAddress);
            //// @todo? What to do?
        }
    }

    _onHandshakeSuccess() {
        this.updateRemotePeerAddress(this.handshaker._peerAddress);
        Logger.debug(''+this._peerConnection+' handshaked successfuly. Adding more handlers to channel...');

        this.fire('handshake:success', this._peerConnection._peerAddress);
        
        this.pingponger = ChannelHandlerFactory.factory('PingPonger', {
            peerChannel: this,
            peerConnection: this._peerConnection,
            localPeerAddress: this._localPeerAddress
        });
        this.bubble(this.pingponger, 'ping', 'pong');

        this.peersDiscoverer = ChannelHandlerFactory.factory('PeersDiscoverer', {
            peerChannel: this,
            peerConnection: this._peerConnection,
            localPeerAddress: this._localPeerAddress
        });
        this.bubble(this.peersDiscoverer, 'askedforpeers');

    }

    _onHandshakeError() {
        this.fire('handshake:error', this);
    }

    _onMessage(rawMsg) {
        let msg;
        try {
            msg = MessageFactory.fromBinary(rawMsg);
        } catch(e) {
            Logger.error(''+this, 'Failed to parse', e);
            this.ban();
        }

        Logger.info(''+this, 'message received...', ''+msg);

        if (!msg) return;

        try {
            Logger.info( msg.type);
            Logger.info(''+this, 'firing event', msg.type);
            this.fire(msg.type, msg, this);
        } catch (e) {
            Logger.error(e);
        }
    }

    _send(msg) {
        return this._peerConnection.send(msg.toBinary());
    }

    close(reason) {
        this._peerConnection.close(reason);
    }

    ban(reason) {
        this._peerConnection.ban(reason);
    }

    ping(nonce) {
        return this.pingponger.ping(nonce);
    }

    askForMorePeers() {
        return this.peersDiscoverer.askForPeers();
    }

    toString() {
        return 'PeerChannel{conn=' + this._peerConnection + '}';
    }

    get connection() {
        return this._peerConnection;
    }

    get id() {
        return this._peerConnection.id;
    }

    get peerAddress() {
        return this._peerConnection.peerAddress;
    }

    set peerAddress(value) {
        this._peerConnection.peerAddress = value;
    }

    get closed() {
        return this._peerConnection.closed;
    }
}

module.exports = PeerChannel;