const rfr = require('rfr');
const winston = require('winston');

class Logger {
    constructor() {
    	var transports = [];
		transports.push(new(winston.transports.Console)({
			level: 'debug'
		}));

		this._logger = new(winston.Logger)({
			transports: transports
		});
    }

    log() {
    	this._logger.log.apply(this._logger, arguments);
    }

    info() {
    	this._logger.info.apply(this._logger, arguments);
    }

    debug() {
    	this._logger.debug.apply(this._logger, arguments);
    }

    error() {
    	this._logger.error.apply(this._logger, arguments);
    }
}

module.exports = new Logger();