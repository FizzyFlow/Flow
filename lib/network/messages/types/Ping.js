const rfr = require('rfr');
const Message = rfr('lib/network/messages/Message.js');
const PeerAddress = rfr('lib/network/PeerAddress.js');

const BinaryVector = rfr('lib/network/vectors/BinaryVector.js');

class Ping extends Message {
    constructor(options) {
        super('Ping');
        
        this._typeId = 1;

        options = options || {};

        if (options.nonce) {
            this._nonce = ''+options.nonce;
            this.addVector(BinaryVector.factory('StringVector', this._nonce));
        } else {
            this._nonce = Date.now();
            console.log('Noooooooon created: '+this._nonce);
            this.addVector(BinaryVector.factory('TimestampVector', this._nonce));
        }
    }

    toString() {
        return 'Message[type='+this._type+']';
    }

    get nonce() {
        return this._nonce;
    }

    get vector() {
        return this._vectors[0];
    }

    decodeVectors() {
        this._nonce = this._vectors[0].toValue();
        console.log('Noooooooon decoded: '+this._nonce);
        return this;
    }
}

module.exports = Ping;