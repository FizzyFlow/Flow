const rfr = require('rfr');

const http = require('http');
const Address6 = require('ip-address').Address6;
const Address4 = require('ip-address').Address4;

const _ = require('lodash');

const BinaryVector = rfr('lib/network/vectors/BinaryVector.js');

const Settings = rfr('lib/utils/Settings.js');

class PeerAddress extends BinaryVector {
    constructor(options) {
        super('PeerAddress');
        options = options || {};

        this._binary = null;
        this._asString = null;

        this._id = PeerAddress._instanceCount++;

        this.ip = options.ip;
        if (options.port) {
            this.port = options.port;
            this.portDefined = true;
        } else {
            this._port = null;
            this.portDefined = false;
        }
    }

    toString() {
        if (this._asString !== null) {
            return this._asString;
        }

        if (this.portDefined) {
            this._asString = 'ws://'+this._ip.correctForm()+':'+this._port;
        } else {
            this._asString = 'ws://'+this._ip.correctForm();
        }

        return this._asString;
    }

    toBinary() {
        if (this._binary !== null) {
            return this._binary;
        }

        /// current version of implementation of PeerAddress binary representation.
        const version = 0x01;  
        ////// Convert ipv6 address to 16 bytes
        const binaryIp = Buffer.from(_.flatMap(this._ip.parsedAddress, (octet => [(parseInt(octet, 16) >> 8) & 0xff, parseInt(octet, 16) & 0xff] )) );
        ////// The port number is an unsigned 16-bit integer. Convert it to 2 bytes
        const binaryPort = Buffer.from([(this._port >> 8) & 0xff, this._port & 0xff]);
        ////// first byte of vector binary is binary representation length, 2nd is binary representation version and data after
        const binaryLength = 1 + binaryIp.length + binaryPort.length;
        return this.decorateBinary(Buffer.concat([Buffer.from([version]), binaryIp, binaryPort], binaryLength));
    }

    static fromBinary(binary) {
        const version = binary.readInt8(2); //// length, binaryTypeId, version, ....ip...., ....port....
        
        if (version == 0x01) {
            let slice = binary.slice(3, 19);
            let ip = Address6.fromByteArray(slice);
            let port = binary.readUInt16BE(19);
            return new PeerAddress({
                ip: ip,
                port: port
            });
        }
    }

    set ip(ip) {
        if (ip instanceof Address6) {
            this._ip = ip;
            this._binary = null; /// flush cached values
            this._asString = null;            
        } else {
            let ipObj = new Address6(ip);
            if (!ipObj.isValid()) {
                ipObj = Address6.fromAddress4(ip);
            }
            if (!ipObj.isValid()) {
                throw new Error('Invalid ip');
            } else {
                this._ip = ipObj;
                this._binary = null; /// flush cached values
                this._asString = null;
            }            
        }
    }

    get ip() {
        return this._ip.correctForm();
    }

    set port(port) {
        if (!_.isInteger(port) || port > 65535 || port < 1) {
            throw new Error('Invalid port');
        }
        this.portDefined = true;
        this._port = port;
        this._binary = null; /// flush cached values
        this._asString = null;
    }

    get port() {
        return this._port;
    }

    get binarySize() {
        return this._url.length;
    }

    get id() {
        return this._id;
    }

    ipEquals(o) {
        return o instanceof PeerAddress
            && (this.toBinary().compare(o.toBinary(), 3, 19, 3, 19) == 0); /// see fromBinary() to get idea of this offsets.       
    }

    equals(o) {
        return o instanceof PeerAddress
            && this.toBinary().equals(o.toBinary());
    }
}
PeerAddress._instanceCount = 0;

module.exports = PeerAddress;