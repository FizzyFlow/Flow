const rfr = require('rfr');

const Logger = rfr('lib/utils/Logger.js');
const Network = rfr('lib/network/Network.js');

class Flow {
	constructor(options) {
		Logger.info('Initializing new Flow object...');
	}

	async getNetwork() {
		Logger.info('Gettings new Flow network object...');

		this._network = new Network();
		await this._network.initialize();
		
		return this._network;
	}
}

module.exports = Flow;