const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');
const EventEmitter = rfr('lib/utils/EventEmitter.js');
const HashMap = rfr('lib/utils/HashMap.js');
const Storage = rfr('lib/utils/Storage.js');

const PeerStatus = rfr('lib/network/PeerStatus.js');
const Timers = rfr('lib/utils/Timers.js');

class KnownPeerAddress extends EventEmitter {
    constructor(options) {
        super();

        options = options || {};

        this._peerAddress = options.peerAddress || undefined;
        this._peerChannel = options.peerChannel || undefined;
        this._peerStatus = options.peerStatus || (new PeerStatus());
        this._discoveryTimestamp = options.discoveryTimestamp || Timers.now();
        this._activityTimestamp = options.activityTimestamp || Timers.now();
    }

    get peerAddress() {
        return this._peerAddress;
    }

    get peerStatus() {
        return this._peerStatus;
    }

    get peerChannel() {
        return this._peerChannel;
    }

    set peerChannel(peerChannel) {
        this._peerChannel = peerChannel;
    }

    get discoveryTimestamp() {
        return this._discoveryTimestamp;
    }

    setStatus(status) {
        this._peerStatus.status = status;
    }

    set status(status) {
        this.setStatus(status);
    }

    get status() {
        return this._peerStatus.status;
    }

    get inbound() {
        return (this.hasPeerChannel() && this.peerChannel.inbound);
    }

    get outbound() {
        return (this.hasPeerChannel() && this.peerChannel.outbound);
    }

    get activityTimestamp() {
        return this._activityTimestamp;
    }

    set activityTimestamp(value) {
        this._activityTimestamp = value;
    }

    bumpActivityTimestamp() {
        this._activityTimestamp = Timers.now();
    }

    hasPeerChannel() {
        if (this._peerChannel) {
            return true;
        } else {
            return false;
        }
    }

    isDiscoveredAfter(timestamp) {
        return (this._discoveryTimestamp > timestamp);
    }

    isUndefined() {
        return (this._peerStatus.status == PeerStatus.UNDEFINED);
    }

    isConnectingTo() {
        return (this._peerStatus.status == PeerStatus.CONNECTING);
    }

    isConnectedTo() {
        return (this._peerStatus.status == PeerStatus.CONNECTED);
    }

    isActive() {
        return (this._peerStatus.status == PeerStatus.ACTIVE);
    }

    isBanned() {
        return (this._peerStatus.status == PeerStatus.BANNED);        
    }
}

module.exports = KnownPeerAddress;