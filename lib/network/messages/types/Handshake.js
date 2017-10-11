const rfr = require('rfr');
const Message = rfr('lib/network/messages/Message.js');
const PeerAddress = rfr('lib/network/PeerAddress.js');


class Handshake extends Message {
    constructor(options) {
        super('Handshake');
        
        this._typeId = 0;

        options = options || {};
        this._peerAddress = options.localPeerAddress || null;

        if (this._peerAddress) {
        	this.addVector(this._peerAddress);
        }
    }

    toString() {
        return 'Message[type='+this._type+']';
    }

    decodeVectors() {
    	/// @todo: check for errors
    	this._peerAddress = this._vectors[0];
        return this;
    }
}

module.exports = Handshake;