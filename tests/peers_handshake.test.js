const expect = require('unexpected');
const rfr = require('rfr');
const Flow = rfr('lib/Flow.js');


const PeerChannel = rfr('lib/network/PeerChannel.js');

beforeEach(async function() {
});

describe('Flow network 2 peers handshake', function() {

	var flow1 = null;
	var network1 = null;

	var flow2 = null;
	var network2 = null;

	it('Single network initialization is ok', async function() {
		expect(Flow, 'to be a', 'function');
		flow1 = new Flow();
		expect(flow1, 'to be a', 'object');

		network1 = await flow1.getNetwork();
		expect(network1, 'to be a', 'object');

		var localSocket = network1.getLocalSocket();
		expect(localSocket, 'to be a', 'object');

		// await localSocket.waitFor('connection');
	});

	it('Network copy initialization is ok', async function() {
		flow2 = new Flow();
		network2 = await flow2.getNetwork();

		expect(network2, 'to be a', 'object');
	});

	it('Lets connect from one network instance to another', function(done) {
		var promises = [];
		promises.push(  new Promise((resolve, reject) =>   network2.on('newChannel',() => resolve()) )  );
		promises.push(  new Promise((resolve, reject) =>   network1.on('newChannel',() => resolve()) )  );

		promises.push(  new Promise((resolve, reject) =>   network2.on('handshake:success',() => resolve()) )  );
		promises.push(  new Promise((resolve, reject) =>   network1.on('handshake:success',() => resolve()) )  );

		var peerAddress = network1.getLocalPeerAddress();

		network2.connect(peerAddress.ip, peerAddress.port);

		Promise.all(promises).then( () => done() );
	});

	it('Lets ping from one network to another and get pong back', function(done){
		var nonce = 'testa';

		var peerChannel1 = null;
		var peerChannels = network1.getPeerChannels();
		expect(peerChannels.length, 'to be', 1);

		peerChannels.values().forEach(function(peerChannel){
			peerChannel1 = peerChannel;
		});

		expect(peerChannel1 instanceof PeerChannel, 'to be true');

		var peerChannel2 = null;
		var peerChannels = network2.getPeerChannels();
		expect(peerChannels.length, 'to be', 1);

		peerChannels.values().forEach(function(peerChannel){
			peerChannel2 = peerChannel;
		});

		expect(peerChannel2 instanceof PeerChannel, 'to be true');

		var promises = [];
		//// peerChannel2 should receive ping
		promises.push(  new Promise((resolve, reject) =>   peerChannel2.on('ping',(peerChannel, gotnonce) => 
			{ expect(gotnonce, 'to be', nonce); resolve(); } ) )  );
		//// and send pong back to peerChannel1
		promises.push(  new Promise((resolve, reject) =>   peerChannel1.on('pong',(peerChannel, gotnonce) => 
			{ expect(gotnonce, 'to be', nonce); resolve(); } ) )  );

		peerChannel1.ping('testa');

		Promise.all(promises).then(function(){
			//// sending ping back....

			var promises = [];
			//// peerChannel2 should receive ping
			promises.push(  new Promise((resolve, reject) =>   peerChannel1.on('ping',(peerChannel, gotnonce) => 
				{ resolve(); } ) )  );
			//// and send pong back to peerChannel1
			promises.push(  new Promise((resolve, reject) =>   peerChannel2.on('pong',(peerChannel, gotnonce, timeDiff) => 
				{ 
					// expect(gotnonce, 'to be', nonce);
					console.log('Pinged in: '+timeDiff+' ms');
					expect(timeDiff, 'to be within', 1, 50); /// from 1 to 50 ms ping for local tests is ok
					resolve(); 
				} ) )  );

			peerChannel2.ping();
			Promise.all(promises).then( () => done() );
		});
	});

});