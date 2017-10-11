const rfr = require('rfr');
const _ = require('lodash');

const BinaryVector = rfr('lib/network/vectors/BinaryVector.js');

class StringVector extends BinaryVector {
    constructor(string) {
        super('StringVector');

        this._string = ''+string;
    }

    toString() {
        return this._string;
    }

    toValue() {
        return this._string;
    }

    toBinary() {
        var buffer = new Buffer(this._string, "utf-8");
        return this.decorateBinary(buffer);
    }

    static fromBinary(binary) {
        return new StringVector( binary.toString("utf-8", 2, binary.length) );
    }
}

module.exports = StringVector;