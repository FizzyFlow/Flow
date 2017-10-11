const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');
const ChannelHandler = rfr('lib/network/handlers/ChannelHandler.js');
const MessageFactory = rfr('lib/network/messages/MessageFactory.js');

class Handshaker extends ChannelHandler {
    constructor(options) {
        super('Handshaker', options);
        // this._peerChannel
        // this._peerChannel.connection
        // 
        this._handshakeReceived = false;
        this._handshakeSent = false;
        
        this._peerChannel.on('Handshake', msg => this._onHandshakeReceived(msg));
    }

    handle() {
        this.sendHandshake();    	
    }

    sendHandshake() {
    	let msg = MessageFactory.factory('Handshake', {
    		localPeerAddress: this._localPeerAddress
    	});
    	this._peerConnection.send(msg.toBinary());

        this._handshakeSent = true;

        if (this._handshakeReceived) {
            this._handshakeSuccess();
        }
    }

    _handshakeSuccess() {
        Logger.debug('Handshaker | ChannelHandler | Handshake Success');

        this.fire('success', this._peerChannel, this);
    }

    _onHandshakeReceived(msg) {
        Logger.debug('Handshaker | ChannelHandler | Got handshake back');

        // @todo: check that msg is type of Handshake
        // 
        // @todo: check for version and version match in Handshake
        this._handshakeReceived = true;
        this._peerAddress = msg._peerAddress;

        /// @todo: check for ip match in _peerAddress;

        if (this._handshakeSent) {
            this._handshakeSuccess();
        }
    }

    get peerAddress() {
    	return this._peerAddress;
    }
}

module.exports = Handshaker;