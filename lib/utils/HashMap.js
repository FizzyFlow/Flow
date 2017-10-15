const _ = require('lodash');

class HashMap extends Map {
    constructor() {
        super();
    }

    put(key, value) {
        return this.set(key, value);
    }

    add(key, value) {
        return this.set(key, value);
    }

    remove(key) {
        return this.delete(key);
    }

    contains(key) {
        return this.has(key);
    }

    filter(fn) {
        /// @todo: cache ?
        let ret = [];
        this.forEach(function(obj){
            if (fn(obj)) {
                ret.push(obj);
            }
        });
        return ret;
    }

    get length() {
    	return this.size;
    }
}

module.exports = HashMap;