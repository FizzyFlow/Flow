const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');
const EventEmitter = rfr('lib/utils/EventEmitter.js');
const HashMap = rfr('lib/utils/HashMap.js');
const Storage = rfr('lib/utils/Storage.js');

const PeerStatus = rfr('lib/network/PeerStatus.js');

class KnownPeerAddresses extends EventEmitter {
    constructor() {
        super();

        this._peerCount = 0;
        this._addresses = new HashMap();
        this._statuses = new HashMap();
        this._peerChannels = new HashMap();
    }

    get peerChannels() {
        return this._peerChannels;
    }

    known(peerAddress) {
        return this._addresses.contains(peerAddress.id);
    }

    add(peerAddress) {
        this._addresses.put(peerAddress.id, peerAddress);   
        this._statuses.put(peerAddress.id, new PeerStatus({
            peerAddress: peerAddress
        }));  
        this._peerCount++;   
    }

    setStatus(peerAddress, newStatus) {
        if (!this.known(peerAddress)) {
            Logger.error('KnownPeerAddresses | Trying yo set status of unknown peer', peerAddress);
            return false;
        }
        this._statuses.get(peerAddress.id).status = newStatus;
        return true;
    }

    setStatusLazy(peerAddress, newStatus) {
        if (!this.known(peerAddress)) {
            this.add(peerAddress);
        }
        this._statuses.get(peerAddress.id).status = newStatus;
        return true;        
    }

    connectedTo(peerAddress) {
        this.setStatusLazy(PeerStatus.CONNECTED);
    }

    activeTo(peerAddress, peerChannel) {
        this.setStatusLazy(PeerStatus.ACTIVE);    
        this._peerChannels.put(peerAddress.id, peerChannel);       
    }

    connectingTo(peerAddress) {
        this.setStatusLazy(PeerStatus.CONNECTING);
    }

    disconnectedFrom(peerAddress) {
        this.setStatusLazy(PeerStatus.DISCONNECTED);        
    }

    failedToCommunicateWith(peerAddress) {
        this.setStatusLazy(PeerStatus.FAILED);
    }

    ban(peerAddress) {
        this.setStatusLazy(PeerStatus.BANNED);
    }

    isConnectingTo(peerAddress) {
        if (!this.known(peerAddress)) {
            return false;
        }
        return (this._statuses.get(peerAddress.id).status == PeerStatus.CONNECTING);
    }

    isConnectedTo(peerAddress) {
        if (!this.known(peerAddress)) {
            return false;
        }
        return (this._statuses.get(peerAddress.id).status == PeerStatus.CONNECTED);
    }
}

module.exports = KnownPeerAddresses;