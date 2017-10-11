const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');
const MessageTypes = rfr('lib/network/messages/MessageTypes.js');

const BinaryVector = rfr('lib/network/vectors/BinaryVector.js');

class Message {
    constructor(messageType) {
        this._type = messageType;
        this._vectors = [];
    }

    addVector(obj) {
        this._vectors.push(obj);
    }

    toString() {
        return 'Message[type='+this._type+']';
    }

    toBinary() {  /// @todo: huge work needed to optimize this shit
        var binaryHeader = new Buffer(this.binarySize);
        binaryHeader.writeUInt32BE(0x05060708, 0);
        binaryHeader.writeInt16BE(this.typeId, 4);
        binaryHeader.writeInt16BE(this.binarySize, 6);

        let totalLength = this.headerSize;
        let binaryVectors = [binaryHeader];

        if (this._vectors.length) {
            for (let vector of this._vectors) {
                let data = vector.toBinary();
                binaryVectors.push(data);
                totalLength += data.length;
            }
        }

        binaryHeader.writeInt16BE(totalLength, 6);

        return Buffer.concat(binaryVectors, totalLength);
    }

    fromBinary(binary) {
        //// this is Message method, means typeId already read and defined. 
        //// so we just have to read extra data from packet
        if (binary.length <= this.headerSize) {
            /// there's nothing to read
            return this;
        }

        this._vectors = [];

        var thereIsMore = true;
        var pos = this.headerSize;
        do {
            //// maximum binary vector length is limited to 255(readUInt8). @todo: If it's not enough - read another byte if vectorLength == 255
            let vectorLength = binary.readUInt8(pos);
            this._vectors.push(binary.slice(pos, pos+vectorLength));
            pos = pos+vectorLength;
        } while(pos < binary.length);

        for (var i = 0; i < this._vectors.length; i++) {
            this._vectors[i] = BinaryVector.fromBinary(this._vectors[i]);
        }

        return this.decodeVectors();
    }

    get type() {
        return this._type;
    }

    get typeId() {
        return this._typeId;
    }

    get headerSize() {
                /* padding */  /* type */   /* length */  /* hash */
        return        4 +         2       +      4       +    4;
    }

    get binarySize() {
                /* padding */  /* type */   /* length */  /* hash */
        return        4 +         2       +      4       +    4;
    }

    // static peekType(buf) {
    //     // Store current read position.
    //     const pos = buf.readPos;

    //     // Set read position past the magic to the beginning of the type string.
    //     buf.readPos = 4;

    //     // Read the type string.
    //     const type = buf.readPaddedString(12);

    //     // Reset the read position to original.
    //     buf.readPos = pos;

    //     return type;
    // }

    // static _writeChecksum(buf, value) {
    //     // Store current write position.
    //     const pos = buf.writePos;

    //     // Set write position past the magic, type, and length fields to the
    //     // beginning of the checksum value.
    //     buf.writePos = 4 + 12 + 4;

    //     // Write the checksum value.
    //     buf.writeUint32(value);

    //     // Reset the write position to original.
    //     buf.writePos = pos;
    // }

    // static unserialize(buf) {
    //     // XXX Direct buffer manipulation currently requires this.
    //     if (buf.readPos !== 0) {
    //         throw 'Message.unserialize() requires buf.readPos == 0';
    //     }

    //     const magic = buf.readUint32();
    //     const type = buf.readPaddedString(12);
    //     buf.readUint32(); // length is ignored
    //     const checksum = buf.readUint32();

    //     // Validate magic.
    //     if (magic !== Message.MAGIC) throw 'Malformed magic';

    //     // Validate checksum.
    //     Message._writeChecksum(buf, 0);
    //     const calculatedChecksum = CRC32.compute(buf);
    //     if (checksum !== calculatedChecksum) throw 'Invalid checksum';

    //     return new Message(type);
    // }

    // _setChecksum(buf) {
    //     const checksum = CRC32.compute(buf);
    //     Message._writeChecksum(buf, checksum);
    // }

    // serialize(buf) {
    //     buf = buf || new SerialBuffer(this.serializedSize);
    //     // XXX Direct buffer manipulation currently requires this.
    //     if (buf.writePos !== 0) {
    //         throw 'Message.serialize() requires buf.writePos == 0';
    //     }

    //     buf.writeUint32(Message.MAGIC);
    //     buf.writePaddedString(this._type, 12);
    //     buf.writeUint32(this.serializedSize);
    //     buf.writeUint32(0); // written later by _setChecksum()

    //     return buf;
    // }

    // get serializedSize() {
    //     return /*magic*/ 4
    //         + /*type*/ 12
    //         + /*length*/ 4
    //         + /*checksum*/ 4;
    // }

    // get type() {
    //     return this._type;
    // }
}

module.exports = Message;

// Message.MAGIC = 0x42042042;
// Message.Type = {
//     VERSION: 'version',
//     INV: 'inv',
//     GETDATA: 'getdata',
//     NOTFOUND: 'notfound',
//     GETBLOCKS: 'getblocks',
//     GETHEADERS: 'getheaders',
//     TX: 'tx',
//     BLOCK: 'block',
//     HEADERS: 'headers',
//     MEMPOOL: 'mempool',
//     REJECT: 'reject',

//     ADDR: 'addr',
//     GETADDR: 'getaddr',
//     PING: 'ping',
//     PONG: 'pong',

//     SIGNAL: 'signal',

//     SENDHEADERS: 'sendheaders',

//     // Nimiq
//     GETBALANCES: 'getbalances',
//     BALANCES: 'balances'
// };