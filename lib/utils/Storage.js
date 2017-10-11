const rfr = require('rfr');
const HashMap = rfr('lib/utils/HashMap.js');

class Storage extends HashMap {
    constructor() {
        super();
    }

    put(value) {
        super.put(value, value);
    }

    add(value) {
        super.put(value, value);
    }

    set(value) {
        super.put(value, value);
    }
}

module.exports = Storage;