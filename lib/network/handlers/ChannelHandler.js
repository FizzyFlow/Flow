const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');

const EventEmitter = rfr('lib/utils/EventEmitter.js');

class ChannelHandler extends EventEmitter {
    constructor(channelHandlerType, options) {
    	super();
    	options = options || {};
        this._channelHandlerType = channelHandlerType;
        this._peerChannel = options.peerChannel || null;
        this._peerConnection = options.peerConnection || null;
        this._localPeerAddress = options.localPeerAddress || null;

        if (!this._peerChannel) {
        	throw new Error("peerChannel is required for ChannelHandler");
        }
    }

}

module.exports = ChannelHandler;