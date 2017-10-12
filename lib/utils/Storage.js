const rfr = require('rfr');
const HashMap = rfr('lib/utils/HashMap.js');

class Storage extends HashMap {
    constructor() {
        super();
    }

    put(value) {
        super.set(value, value);
    }

    add(value) {
        super.set(value, value);
    }

    set(value) {
        super.set(value, value);
    }
}

module.exports = Storage;