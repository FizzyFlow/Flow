const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');

/// !important!! keep the order. 
const types = ['Handshaker', 'PingPonger', 'PeersDiscoverer']; 
/// Add new types to the end of this array, to keep it compatible with older protocol versions.

class ChannelHandlerTypes {
    constructor() {
    }

    static isTypeAvailable(type) {
        return (ChannelHandlerTypes._types.indexOf(type) > -1);
    }

    static getTypes() {
        ChannelHandlerTypes._types;
    }

    static getTypeIdByType(type) {
        return (ChannelHandlerTypes._types.indexOf(type));
    }

    static getTypeByTypeId(typeId) {
        return ChannelHandlerTypes._types[typeId];
    }
}

ChannelHandlerTypes._types = types;
ChannelHandlerTypes._classes = {};
ChannelHandlerTypes._types.forEach(function(typeName) {
    ChannelHandlerTypes._classes[typeName] = rfr('lib/network/handlers/types/'+typeName+'.js');
});

module.exports = ChannelHandlerTypes;