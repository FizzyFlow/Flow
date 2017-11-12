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

        this.ssl = options.ssl || false;

        this.host = options.host || null;
        this.ip = options.ip || null;

        if (!this.host && !this.ip) {
            throw new Error('Either ip or host is required for PeerAddress');
        }
        
        if (options.port) {
            this.port = options.port;
            this.portDefined = true;
        } else {
            this._port = null;
            this.portDefined = false;
        }
    }

    isSSL() {
        return this.ssl;
    }

    toString() {
        if (this._asString !== null) {
            return this._asString;
        }

        if (this.ssl) {
            this._asString = 'wss://';
        } else {
            this._asString = 'ws://';
        }

        if (this.host) {
            this._asString += this.host;
        } else {
            this._asString += this._ip.correctForm();
        }

        if (this.portDefined) {
            this._asString += ':'+this._port;
        }

        return this._asString;
    }

    toBinary() {
        if (this._binary !== null) {
            return this._binary;
        }

        /// current version of implementation of PeerAddress binary representation.
        const version = 0x01;
        /// is ssl
        const ssl = this.ssl ? 0x01 : 0x00;
        /// ip or host
        const hasHost = this.host ? 0x01 : 0x00;

        let binaryRep = null;
        if (this.host) {
            /// host
            binaryRep = new Buffer(this.host, "utf-8");
        } else {
            /// ip
            binaryRep = Buffer.from(_.flatMap(this._ip.parsedAddress, (octet => [(parseInt(octet, 16) >> 8) & 0xff, parseInt(octet, 16) & 0xff] )) );          
        }
        ////// The port number is an unsigned 16-bit integer. Convert it to 2 bytes
        const binaryPort = Buffer.from([(this._port >> 8) & 0xff, this._port & 0xff]);

        ////// 3 - version + ssl + hasHost
        const binaryLength = 3 + binaryRep.length + binaryPort.length;

        return this.decorateBinary(Buffer.concat([Buffer.from([version]), Buffer.from([ssl]), Buffer.from([hasHost]), binaryRep, binaryPort], binaryLength));
    }

    static fromBinary(binary) {
        //// length, binaryTypeId, version, ssl, hasHost, ....ipOrHost...., ....port....
        const version = binary.readInt8(2); 
        const ssl = binary.readInt8(3) ? true : false; 
        const hasHost = binary.readInt8(4) ? true : false;
        
        if (version == 0x01) {
            if (hasHost) {
                let host = binary.toString("utf-8", 5, binary.length - 2);
                let port = binary.readUInt16BE(binary.length - 2);   

                return new PeerAddress({
                    ssl: ssl,
                    host: host,
                    port: port
                });             
            } else {
                let slice = binary.slice(5, 21);
                let ip = Address6.fromByteArray(slice);
                let port = binary.readUInt16BE(21);   

                return new PeerAddress({
                    ssl: ssl,
                    ip: ip,
                    port: port
                });             
            }
        }
    }

    set ip(ip) {
        if (ip instanceof Address6) {
            this._ip = ip;
            this._binary = null; /// flush cached values
            this._asString = null;            
        } else if (ip === null) {
            this._ip = null;
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
        return this.toString();
    }

    ipEquals(o) {
        return o instanceof PeerAddress
            && (this.toBinary().compare(o.toBinary(), 5, 21, 5, 21) == 0); /// see fromBinary() to get idea of this offsets.       
    }

    equals(o) {
        return o instanceof PeerAddress
            && this.toBinary().equals(o.toBinary());
    }
}
PeerAddress._instanceCount = 0;

module.exports = PeerAddress;