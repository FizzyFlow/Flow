class Timers {
    constructor() {
        this._timeouts = {};
        this._intervals = {};
    }

    intervalExists(id) {
        return (this._intervals[id] !== undefined);
    }

    timeoutExists(id) {
        return (this._timeouts[id] !== undefined);
    }

    setInterval(id, fn, milliseconds) {
        if (this._timeouts[id]) {
            throw new Error('Interval '+id+' is already set');
        }

        this._intervals[id] = setInterval(fn, milliseconds);
    }

    setTimeout(id, fn, milliseconds) {
        if (this._timeouts[id]) {
            throw new Error('Timeout '+id+' is already set');
        }

        this._timeouts[id] = setTimeout(fn, milliseconds);
    }

    clearInterval(id) {
        delete this._intervals[id];
        clearInterval(this._intervals[id]);
    }

    clearTimeout(id) {
        delete this._timeouts[id];
        clearTimeout(this._timeouts[id]);
    }

    resetInterval(id, fn, milliseconds) {
        clearInterval(this._intervals[id]);
        this._intervals[id] = setInterval(fn, milliseconds);
    }

    resetTimeout(id, fn, milliseconds) {
        clearTimeout(this._timeouts[id]);
        this._timeouts[id] = setTimeout(fn, milliseconds);
    }

    clear() {
        for (let id in this._timeouts) {
            this.clearTimeout(id);
        }
        for (let id in this._intervals) {
            this.clearInterval(id);
        }
    }
}

module.exports = Timers;