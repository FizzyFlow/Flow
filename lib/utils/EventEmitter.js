const NativeEventEmitter = require('events').EventEmitter

class EventEmitter extends NativeEventEmitter {
    constructor() {
    	super();
    }
    
    fire() {
    	this.emit.apply(this, arguments);
    }

    bubble() {
        if (arguments.length < 2) {
            throw new Error('eventEmitter.bubble() needs eventEmitter and at least 1 argument');
        }

        const eventEmitter = arguments[0];
        const types = Array.prototype.slice.call(arguments, 1);
        for (const type of types) {
            let callback = function() {
                this.fire.apply(this, [type, ...arguments]);
            };
            eventEmitter.on(type, callback.bind(this));
        }
    }

    async waitFor(name) {
    	return await new Promise((resolve, reject) => {
    		this.once(name, function(a){
    			resolve(a);
    		});
    	});
    }
}

module.exports = EventEmitter;