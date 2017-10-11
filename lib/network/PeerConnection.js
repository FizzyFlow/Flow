const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');

const EventEmitter = rfr('lib/utils/EventEmitter.js');
const HashMap = rfr('lib/utils/HashMap.js');

const WebSocket = require('ws');

class PeerConnection extends EventEmitter {
    constructor(options) {
        super();

        options = options || {};

        this._channel = options.ws;
        this._inbound = options.inbound;
        this._peerAddress = options.peerAddress;

        this._bytesSent = 0;
        this._bytesReceived = 0;

        this._closedByUs = false;
        this._closed = false;
        
        // Unique id for this connection.
        this._id = PeerConnection._instanceCount++;

        Logger.info(''+this, 'Initializing PeerConnection object...');

        this._channel.on('close', () => this._onClose());
        this._channel.on('message', msg => this._onMessage(msg));
        this._channel.on('error', e => this.fire('error', e, this));
    }

    _onMessage(msg) {
        if (this._closed) {
            return;
        }

        this._bytesReceived += msg.length;
        Logger.info(''+this, 'got message...');
        this.fire('message', msg, this);
    }

    _onClose() {
        if (this._closed) {
            return;
        }

        this._closed = true;
        this.fire('close', !this._closedByUs, this);
    }

    _close() {
        this._closedByUs = true;
        this._onClose();
        this._channel.close();
    }

    _isReadyToTransmit() {
        return this._channel.readyState === WebSocket.OPEN;
    }

    send(msg) {
        const logAddress = this._peerAddress;
        if (this._closed || !this._isReadyToTransmit()) {
            return false;
        }

        try {
            this._channel.send(msg);
            this._bytesSent += msg.length;
            return true;
        } catch (e) {
            return false;
        }
    }

    close(reason) {
        this._close();
    }

    ban(reason) {
        this._close();
        this.fire('ban', reason, this);
    }

    equals(o) {
        return o instanceof PeerConnection
            && this._id === o.id;
    }

    toString() {
        if (this._inbound) {
            return `PeerConnection[INBOUND]{id=${this._id}, peerAddress=${this._peerAddress}}`;            
        } else {
            return `PeerConnection[OUTBOUND]{id=${this._id}, peerAddress=${this._peerAddress}}`;             
        }
    }

    get id() {
        return this._id;
    }

    get peerAddress() {
        return this._peerAddress;
    }

    set peerAddress(value) {
        this._peerAddress = value;
    }

    get bytesSent() {
        return this._bytesSent;
    }

    get bytesReceived() {
        return this._bytesReceived;
    }

    get inbound() {
        return this._inbound;
    }

    get outbound() {
        return !this._inbound;
    }

    get closed() {
        return this._closed;
    }
}
PeerConnection._instanceCount = 0;

module.exports = PeerConnection;