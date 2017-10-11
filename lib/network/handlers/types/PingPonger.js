const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');
const ChannelHandler = rfr('lib/network/handlers/ChannelHandler.js');
const MessageFactory = rfr('lib/network/messages/MessageFactory.js');

const Timers = rfr('lib/utils/Timers.js');
const HashMap = rfr('lib/utils/HashMap.js');

const Settings = rfr('lib/utils/Settings.js');

class PingPonger extends ChannelHandler {
    constructor(options) {
        super('PingPonger', options);
        // this._peerChannel
        // this._peerChannel.connection
        //        
        this._timers = new Timers();
        this._sentTimestamps = new HashMap();

        this._peerChannel.on('Ping', msg => this._onPingReceived(msg));
        this._peerChannel.on('Pong', msg => this._onPongReceived(msg));
    }

    handle() {  	
    }

    ping(nonce) {
        let msg = MessageFactory.factory('Ping', {
            nonce: nonce
        });

        if (this._sentTimestamps.contains(msg.nonce)) {
            Logger.warn('PingPonger | Ping nonce is not unique: '+msg.nonce);
            this._timers.clearTimeout(msg.nonce);
            this._sentTimestamps.remove(msg.nonce);            
        }

        this._sentTimestamps.set(msg.nonce, Timers.now());
        this._timers.setTimeout(msg.nonce, ()=>{
            Logger.error('PingPonger | Ping lost');
            this._timers.clearTimeout(msg.nonce);
            this._sentTimestamps.remove(msg.nonce);
            this.fire('lost', this._peerChannel, msg.nonce);
        }, Settings.network.timeouts.ping);

        this._peerConnection.send(msg.toBinary());
    }

    _onPingReceived(msg) {
        Logger.debug('PingPonger | Got ping');
        
        let respMsg = MessageFactory.factory('Pong', {
            vector: msg.vector
        });
        this._peerConnection.send(respMsg.toBinary());

        this.fire('ping', this._peerChannel, msg.nonce);
    }

    _onPongReceived(msg) {
        if (this._sentTimestamps.contains(msg.nonce)) {
            Logger.debug('PingPonger | Got pong');
            let timeDiff = Timers.now() - this._sentTimestamps.get(msg.nonce);
            this._timers.clearTimeout(msg.nonce);
            this._sentTimestamps.remove(msg.nonce);
            this.fire('pong', this._peerChannel, msg.nonce, timeDiff);
        } else {
            Logger.debug('PingPonger | Got pong, but looks that it is too old');
        }
    }
}

module.exports = PingPonger;