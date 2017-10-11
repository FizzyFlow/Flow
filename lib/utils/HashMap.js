class HashMap {
    constructor() {
        this._map = {};
        this._uid = 0;
        this.size = 0;
        this._hashFunction = HashMap._hash;
    }

    static _hash(anything) {
    	/// @thanks to https://github.com/flesler/hashmap
		var type = Object.prototype.toString.call(anything).slice(8, -1).toLowerCase();
		switch (type) {
			case 'undefined':
			case 'null':
			case 'boolean':
			case 'number':
			case 'regexp':
				return anything + '';
			case 'date':
				return '♣' + anything.getTime();
			case 'string':
				return '♠' + anything;
			case 'array':
				var hashes = [];
				for (var i = 0; i < anything.length; i++) {
					hashes[i] = HashMap._hash(anything[i]);
				}
				return '♥' + hashes.join('⁞');
			default:
				if (!anything.hasOwnProperty('_hmuid_')) {
					anything._hmuid_ = ++HashMap._uid;
					Object.defineProperty(anything, '_hmuid_', {enumerable:false});
				}
				return '♦' + anything._hmuid_;
		}
    }

    get(key) {
        return this._map[this._hashFunction(key)];
    }

    put(key, value) {
		var hash = this._hashFunction(key);
		if ( !(hash in this._map) ) {
			this.size++;
		}

        this._map[hash] = value;
    }

    add(key, value) {
    	return this.put(key, value);
    }

    set(key, value) {
    	return this.put(key, value);
    }

    remove(key) {
		var hash = this._hashFunction(key);
		if ( (hash in this._map) ) {
			this.size--;
			delete this._map[hash];
		}
    }

    delete(key) {
    	return this.remove(key);
    }

    clear() {
        this.size = 0;
        this._map = {};
    }

    contains(key) {
        return this.get(key) !== undefined;
    }

    keys() {
        return Object.keys(this._map);
    }

    values() {
        return Object.values(this._map);
    }

    get length() {
    	return this.size;
    }
}

module.exports = HashMap;