const rfr = require('rfr');
const _ = require('lodash');
const bignum = require('bignum');

const BinaryVector = rfr('lib/network/vectors/BinaryVector.js');
const Timers = rfr('lib/utils/Timers.js');

class TimestampVector extends BinaryVector {
    constructor(datetime) {
        super('TimestampVector');

        this._timestamp = Timers.anythingToTimestamp(datetime);

        if (!bignum.isBigNum(this._timestamp)) {
            throw new Error('Invalid datetime parameter');            
        }
    }

    toValue() {
        return this._timestamp.toNumber();
    }

    toBinary() {
        return this.decorateBinary(this._timestamp.toBuffer());
    }

    static fromBinary(binary) {
        return new TimestampVector( bignum.fromBuffer(binary.slice(2)) );
    }
}

module.exports = TimestampVector;