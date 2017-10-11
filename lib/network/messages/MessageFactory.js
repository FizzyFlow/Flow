const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');

const MessageTypes = rfr('lib/network/messages/MessageTypes.js');

class MessageFactory {
    constructor() {
    }

    static fromBinary(binary) {
        var typeId = binary.readInt16BE(4);
        var type = MessageTypes.getTypeByTypeId(typeId);
        return (MessageFactory.factory(type).fromBinary(binary));
    }

    static factory(type, options) {
        if (MessageTypes.isTypeAvailable(type)) {
            return new MessageTypes._classes[type](options);
        } else {
            throw "Invalid messageType: "+type;
        }
    }
}

module.exports = MessageFactory;