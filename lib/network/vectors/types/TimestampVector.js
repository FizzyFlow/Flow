const rfr = require('rfr');
const _ = require('lodash');
const bignum = require('bignum');

const BinaryVector = rfr('lib/network/vectors/BinaryVector.js');

class TimestampVector extends BinaryVector {
    constructor(datetime) {
        super('TimestampVector');

        if (datetime === undefined) {
            this._timestamp = bignum(Date.now());
        } else if (_.isDate(datetime)) {
            this._timestamp = bignum(options.date.getTime());            
        } else if (bignum.isBigNum(datetime)) {
            this._timestamp = datetime;
        } else if (_.isNumber(datetime)) {
            this._timestamp = bignum(datetime);
        }

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