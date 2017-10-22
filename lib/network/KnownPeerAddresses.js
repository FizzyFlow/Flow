const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');
const EventEmitter = rfr('lib/utils/EventEmitter.js');
const HashMap = rfr('lib/utils/HashMap.js');
const Storage = rfr('lib/utils/Storage.js');

const PeerStatus = rfr('lib/network/PeerStatus.js');
const Timers = rfr('lib/utils/Timers.js');

class KnownPeerAddresses extends EventEmitter {
    constructor(options) {
        super();

        options = options || {};

        this._peerCount = 0;

        this._activeCount = 0;
        this._activeInboundCount = 0;
        this._activeOutboundCount = 0;

        this._addresses = new HashMap();
        this._statuses = new HashMap();
        this._timestamps = new HashMap();
        this._peerChannels = new HashMap();

        this._localPeerAddress = null;
        if (options.localPeerAddress) {
            this._localPeerAddress = options.localPeerAddress;
        }
    }

    get knownCount() {
        return this._peerCount;
    }

    get activeCount() {
        return this._activeCount;
    }

    get activeInboundCount() {
        return this._activeInboundCount;
    }

    get activeOutboundCount() {
        return this._activeOutboundCount;
    }

    get peerChannels() {
        return this._peerChannels;
    }

    get peerAddresses() {
        return this._addresses;
    }

    get availablePeerAddresses() {
        return this._addresses.filter((peerAddress)=> this._statuses.get(peerAddress.id).status == PeerStatus.UNDEFINED);
    }

    logDebug() {
        this._addresses.forEach((peerAddress)=>{
            Logger.log(''+peerAddress, this._statuses.get(peerAddress.id) ? this._statuses.get(peerAddress.id).status : 'error');
        });
    }

    discovered(peerAddresses) {
        peerAddresses.forEach((peerAddress) => {
            if (!this.known(peerAddress) && !this.isLocal(peerAddress)) {
                this.add(peerAddress);
            }
        });
    }

    isLocal(peerAddress) {
        if (peerAddress.equals(this._localPeerAddress)) {
            return true;
        } else {
            return false;
        }
    }

    known(peerAddress) {
        return this._addresses.contains(peerAddress.id);
    }

    add(peerAddress) {
        if (!peerAddress.port) {
            throw new Error('peerAddress without port defined should not be added to KnownPeerAddresses');
        }
        this._addresses.put(peerAddress.id, peerAddress);   
        this._timestamps.put(peerAddress.id, Timers.now());
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

        if (this._statuses.get(peerAddress.id).status !== PeerStatus.ACTIVE && newStatus == PeerStatus.ACTIVE) {
            this._activeCount++;
            if (this._peerChannels.get(peerAddress.id).inbound) {
                this._activeInboundCount++;
            } else {
                this._activeOutboundCount++;
            }
        }
        if (this._statuses.get(peerAddress.id).status == PeerStatus.ACTIVE && newStatus != PeerStatus.ACTIVE) {
            this._activeCount--;
            if (this._peerChannels.get(peerAddress.id).inbound) {
                this._activeInboundCount--;
            } else {
                this._activeOutboundCount--;
            }
        }
        
        this._statuses.get(peerAddress.id).status = newStatus;
        return true;
    }

    setStatusLazy(peerAddress, newStatus) {
        if (!this.known(peerAddress)) {
            this.add(peerAddress);
        }
        this.setStatus(peerAddress, newStatus);
        return true;        
    }

    connectingTo(peerAddress) {
        this.setStatusLazy(peerAddress, PeerStatus.CONNECTING);
    }

    connectedTo(peerAddress) {
        this.setStatusLazy(peerAddress, PeerStatus.CONNECTED);
    }

    activeTo(peerAddress, peerChannel) { 
        this._peerChannels.put(peerAddress.id, peerChannel);  
        this.setStatusLazy(peerAddress, PeerStatus.ACTIVE);        
    }

    disconnectedFrom(peerAddress) {
        this.setStatusLazy(peerAddress, PeerStatus.DISCONNECTED);        
    }

    failedToCommunicateWith(peerAddress) {
        this.setStatusLazy(peerAddress, PeerStatus.FAILED);
    }

    ban(peerAddress) {
        this.setStatusLazy(peerAddress, PeerStatus.BANNED);
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