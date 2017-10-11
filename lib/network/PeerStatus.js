const rfr = require('rfr');

class PeerStatus {
    constructor(options) {
        options = options || {};

        this._peerAddress = options.peerAddress || null;
        this._status = PeerStatus.UNDEFINED;
    }

    set status(newStatus) {
        // @todo: check if status is valid
        this._status = newStatus;
    }

    get status() {
        return this._status;
    }
}

PeerStatus.UNDEFINED     = 0;
PeerStatus.NEW           = 1;
PeerStatus.CONNECTING    = 2;
PeerStatus.CONNECTED     = 3;
PeerStatus.ACTIVE        = 4;
PeerStatus.FAILED        = 5;
PeerStatus.DISCONNECTED  = 6;
PeerStatus.BANNED        = 7;

module.exports = PeerStatus;