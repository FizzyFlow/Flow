const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');
const ChannelHandler = rfr('lib/network/handlers/ChannelHandler.js');
const MessageFactory = rfr('lib/network/messages/MessageFactory.js');

const Timers = rfr('lib/utils/Timers.js');
const HashMap = rfr('lib/utils/HashMap.js');

const Settings = rfr('lib/utils/Settings.js');

class PeersDiscoverer extends ChannelHandler {
    constructor(options) {
        super('PeersDiscoverer', options);
        // this._peerChannel
        // this._peerChannel.connection
        //

        this._peerChannel.on('GiveMorePeers', msg => this._onPeersAsked(msg));
        // this._peerChannel.on('Pong', msg => this._onPongReceived(msg));
    }

    handle() {      
    }

    askForPeers(discoveredSince) {
        let msg = MessageFactory.factory('GiveMorePeers', {
            discoveredSince: discoveredSince
        });

        //// @todo: need to verify response timeouts? 

        this._peerConnection.send(msg.toBinary());
    }

    _onPeersAsked(msg) {
        Logger.debug('PeersDiscoverer | We have been asked for peers');
        

        this.fire('askedforpeers', this._peerChannel);
    }
}

module.exports = PeersDiscoverer;