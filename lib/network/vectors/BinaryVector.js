const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');

/// !important!! keep the order. 
const types = ['PeerAddress', 'StringVector', 'TimestampVector']; 
/// Add new types to the end of this array, to keep it compatible with older protocol versions.
/// 
class BinaryVector {
    constructor(binaryType) {
        this._binary = null;
        this._binaryType = binaryType;

        this._binaryTypeId = BinaryVector.getTypeIdByType(binaryType);

        if (this._binaryTypeId < 0) {
            throw new Error('Invalid binaryType');
        }
    }

    decorateBinary(buffer) {
        let binaryLength = buffer.length;
        binaryLength = binaryLength + 2; //// length + _binaryTypeId + buffer itself
        this._binary = Buffer.concat([Buffer.from([binaryLength, this._binaryTypeId]), buffer], binaryLength);

        return this._binary;
    }

    static fromBinary(binary) {
        BinaryVector.lazyLoadClasses();
        const binaryTypeId = binary.readInt8(1);
        const type = BinaryVector.getTypeByTypeId(binaryTypeId);
        
        return (BinaryVector.__classes[type].fromBinary(binary));
    }

    static factory(type, options) {
        if (BinaryVector.isTypeAvailable(type)) {
            return new BinaryVector.__classes[type](options);
        } else {
            throw "Invalid binaryType: "+type;
        }
    }

    static lazyLoadClasses() {
        if (!BinaryVector.__typesLoaded) {
            BinaryVector.__types.forEach(function(typeName) {
                if (typeName === 'PeerAddress') {
                    BinaryVector.__classes[typeName] = rfr('lib/network/PeerAddress.js');
                    /// special case
                } else {
                    BinaryVector.__classes[typeName] = rfr('lib/network/vectors/types/'+typeName+'.js');        
                }
            });

            BinaryVector.__typesLoaded = true;
        }        
    }

    static isTypeAvailable(type) {
        BinaryVector.lazyLoadClasses();
        return (BinaryVector.__types.indexOf(type) > -1);
    }

    static getTypes() {
        BinaryVector.__types;
    }

    static getTypeIdByType(type) {
        BinaryVector.lazyLoadClasses();
        return (BinaryVector.__types.indexOf(type));
    }

    static getTypeByTypeId(typeId) {
        return BinaryVector.__types[typeId];
    }
}


BinaryVector.__types = types;
BinaryVector.__classes = {};

module.exports = BinaryVector;