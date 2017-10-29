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

        this._timestamp = Timers.anythingToTimestamp(options.timestamp, true);
        if (!this._timestamp) {
            throw new Error('Something is wrong. timestamp is required for HereArePeers');
        }
        this.addVector(BinaryVector.factory('TimestampVector', this._timestamp));

        if (options.peers) {
            options.peers.forEach((peerAddress) => {
                this.addVector(peerAddress); // peerAddress is already instance of BinaryVector. @todo: check!
            });
        }
    }

    toString() {
        return 'Message[type='+this._type+']';
    }

    get timestamp() {
        return this._timestamp;
    }

    get peerAddresses() {
        if (this._vectors.length > 1) {
            return this._vectors.slice(1, this._vectors.length);
        } else {
            return [];
        }
        return this._vectors[0];
    }

    decodeVectors() {
        if (this._vectors[0]) {
            this._timestamp = this._vectors[0].toValue();            
        }
        return this;
    }
}

module.exports = HereArePeers;