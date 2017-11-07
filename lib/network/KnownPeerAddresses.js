const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');
const EventEmitter = rfr('lib/utils/EventEmitter.js');
const HashMap = rfr('lib/utils/HashMap.js');
const Storage = rfr('lib/utils/Storage.js');

const KnownPeerAddress = rfr('lib/network/KnownPeerAddress.js');
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

        this._map  = new HashMap();

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
        return this._map.filter((kpAddress)=> {
            return kpAddress.hasPeerChannel();
        }).map((kpAddress)=>{
            return kpAddress.peerChannel;
        });
    }



    bumpActivity(peerAddress) {
        if (!this.known(peerAddress)) {
            return false;
        }

        this._map.get(peerAddress.id).bumpActivityTimestamp();
    }

    getDiscoveryResponse(fromTimestamp) {
        // @todo: cache this
        let resp = {
            addresses: [],
            timestamp: 0
        };

        // kpAddress is short for knownPeerAddress
        resp.addresses = this._map.filter((kpAddress)=> {
            if (resp.timestamp < kpAddress.discoveryTimestamp) {
                resp.timestamp = kpAddress.discoveryTimestamp;
            }
            return (kpAddress.isDiscoveredAfter(fromTimestamp) && !kpAddress.isBanned());
        }).map((kpAddress)=>{
            return kpAddress.peerAddress;
        })

        return resp;
    }

    /**
     * Peers that have active status, but are not active in their connection.
     * @return Array array of peerAddress
     */
    getFallingPeerAddresses(minActivityTimestamp) {
        return this._map.filter((kpAddress)=> {
            return (kpAddress.isActive() && kpAddress.activityTimestamp < minActivityTimestamp);
        }).map((kpAddress)=>{
            return kpAddress.peerAddress;
        });
    }

    get availablePeerAddresses() {
        return this._map.filter((kpAddress)=> {
            return kpAddress.isUndefined();
        }).map((kpAddress)=>{
            return kpAddress.peerAddress;
        });
    }

    logDebug() {
        // this._addresses.forEach((peerAddress)=>{
        //     Logger.log(''+peerAddress, this._statuses.get(peerAddress.id) ? this._statuses.get(peerAddress.id).status : 'error');
        // });
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
        return this._map.contains(peerAddress.id);
    }

    close(peerAddress) {
        if (!this.known(peerAddress)) {
            Logger.error('KnownPeerAddresses | Trying to close unknown peer', peerAddress);
            return false;
        }

        if (!this._map.get(peerAddress.id).hasPeerChannel()) {
            Logger.error('KnownPeerAddresses | Trying to close peer without channel', peerAddress);
            return false;            
        }

        this._map.get(peerAddress.id).peerChannel.close();
        return true;
    }

    getPeerAddressStatus(peerAddress) {
        if (!this.known(peerAddress)) {
            return null;
        }

        return this._map.get(peerAddress.id).status;
    }

    add(peerAddress) {
        if (!peerAddress.port) {
            throw new Error('peerAddress without port defined should not be added to KnownPeerAddresses');
        }

        let kpAddress = new KnownPeerAddress({
            peerAddress: peerAddress
        });


        this._map.put(peerAddress.id, kpAddress);
        this._peerCount++;   
    }

    setStatus(peerAddress, newStatus) {
        if (!this.known(peerAddress)) {
            Logger.error('KnownPeerAddresses | Trying yo set status of unknown peer', peerAddress);
            return false;
        }

        if (this.getPeerAddressStatus(peerAddress) !== PeerStatus.ACTIVE && newStatus == PeerStatus.ACTIVE) {
            this._activeCount++;
            if (this._map.get(peerAddress.id).inbound) {
                this._activeInboundCount++;
            } else {
                this._activeOutboundCount++;
            }
        }
        if (this.getPeerAddressStatus(peerAddress) == PeerStatus.ACTIVE && newStatus != PeerStatus.ACTIVE) {
            this._activeCount--;
            if (this._map.get(peerAddress.id).inbound) {
                this._activeInboundCount--;
            } else {
                this._activeOutboundCount--;
            }
        }
        
        this._map.get(peerAddress.id).setStatus(newStatus);
        this.fire('peer:status', peerAddress, newStatus);
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
        if (!this.known(peerAddress)) {
            this.add(peerAddress);
        }
        this._map.get(peerAddress.id).peerChannel = peerChannel;
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
        return (this.getPeerAddressStatus(peerAddress) == PeerStatus.CONNECTING);
    }

    isConnectedTo(peerAddress) {
        if (!this.known(peerAddress)) {
            return false;
        }
        return (this.getPeerAddressStatus(peerAddress) == PeerStatus.CONNECTED);
    }
}

module.exports = KnownPeerAddresses;