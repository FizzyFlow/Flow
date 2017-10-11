const rfr = require('rfr');
const _ = require('lodash');
const Message = rfr('lib/network/messages/Message.js');
const PeerAddress = rfr('lib/network/PeerAddress.js');

const BinaryVector = rfr('lib/network/vectors/BinaryVector.js');
const Timers = rfr('lib/utils/Timers.js');

class HereArePeers extends Message {
    constructor(options) {
        super('HereArePeers');
        
        this._typeId = 4;

        options = options || {};

        this._discoveredSinceTimestamp = Timers.anythingToTimestamp(options.discoveredSince, true);
        if (!this._discoveredSinceTimestamp) {
            throw new Error('Something is wrong. discoveredSinceTimestamp is required for HereArePeers');
        }
        this.addVector(BinaryVector.factory('TimestampVector', this._discoveredSinceTimestamp));

        if (options.peers) {
            for (let peerAddress of options.peer) {
                this.addVector(peerAddress); // peerAddress is already instance of BinaryVector. @todo: check!
            }
        }
    }

    toString() {
        return 'Message[type='+this._type+']';
    }

    get discoveredSinceTimestamp() {
        return this._discoveredSinceTimestamp;
    }

    get vector() {
        return this._vectors[0];
    }

    decodeVectors() {
        if (this._vectors[0]) {
            this._discoveredSinceTimestamp = this._vectors[0].toValue();            
        }
        return this;
    }
}

module.exports = HereArePeers;