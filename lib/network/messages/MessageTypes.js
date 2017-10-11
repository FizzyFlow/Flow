const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');

/// !important!! keep the order. 
const types = ['Handshake', 'Ping', 'Pong', 'GiveMorePeers', 'HereArePeers']; 
/// Add new types to the end of this array, to keep it compatible with older protocol versions.

class MessageTypes {
    constructor() {
    }

    static isTypeAvailable(type) {
        return (MessageTypes._types.indexOf(type) > -1);
    }

    static getTypes() {
        MessageTypes._types;
    }

    static getTypeIdByType(type) {
        return (MessageTypes._types.indexOf(type));
    }

    static getTypeByTypeId(typeId) {
        return MessageTypes._types[typeId];
    }
}

MessageTypes._types = types;
MessageTypes._classes = {};
MessageTypes._types.forEach(function(typeName) {
    MessageTypes._classes[typeName] = rfr('lib/network/messages/types/'+typeName+'.js');
});


module.exports = MessageTypes;