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
        this._peerChannel.on('HereArePeers', msg => this._onPeersReceived(msg));

        this._timers = new Timers();

        this._discoveredSince = 0;
    }

    handle() {      
        this.askForPeers();
        this._timers.setInterval('askForMore', () => { this.askForPeers() }, 
            Settings.network.discovery.askMoreInterval);
    }

    askForPeers() {
        let msg = MessageFactory.factory('GiveMorePeers', {
            discoveredSince: this._discoveredSince
        });

        //// @todo: need to verify response timeouts? 

        this._peerConnection.send(msg.toBinary());
    }

    _onPeersAsked(msg) {
        Logger.debug('PeersDiscoverer | We have been asked for peers');

        const data = this._knownPeerAddresses.getDiscoveryResponse(msg.discoveredSinceTimestamp);
        if (data.addresses.length) {
            let respMsg = MessageFactory.factory('HereArePeers', {
                peers: data.addresses,
                timestamp: data.timestamp
            });

            this._peerConnection.send(respMsg.toBinary());            
        }

        this.fire('askedforpeers', this._peerChannel);
    }

    _onPeersReceived(msg) {
        Logger.debug('PeersDiscoverer | We have received new portion of peerAddresses ('+msg.peerAddresses.length+')');

        this._discoveredSince = msg.timestamp;
        this.fire('peersdiscovered', this._peerChannel, msg.peerAddresses);
    }
}

module.exports = PeersDiscoverer;