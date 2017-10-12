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

    get length() {
    	return this.size;
    }
}

module.exports = HashMap;