const expect = require('unexpected');
const rfr = require('rfr');
const PeerAddress = rfr('lib/network/PeerAddress.js');

const BinaryVector = rfr('lib/network/vectors/BinaryVector.js');

beforeEach(async function() {
});

describe('PeerAddress class', function() {

	it('is ready to be initialized', async function() {
		expect(PeerAddress, 'to be a', 'function');

		let peerAddress = new PeerAddress({
			ip: '255.11.241.4',
			port: 9020
		});

		expect(peerAddress, 'to be a', 'object');
		expect(peerAddress instanceof PeerAddress, 'to be true');

		let asBinary = peerAddress.toBinary();
		expect(asBinary, 'to be a', 'Buffer');

		let restoredPeerAddress = PeerAddress.fromBinary(asBinary);
		expect(peerAddress, 'to be a', 'object');
		expect(restoredPeerAddress instanceof PeerAddress, 'to be true');

		expect(restoredPeerAddress.equals(peerAddress), 'to be true');
		expect(restoredPeerAddress.ipEquals(peerAddress), 'to be true');

		restoredPeerAddress = BinaryVector.fromBinary(asBinary);
		expect(peerAddress, 'to be a', 'object');
		expect(restoredPeerAddress instanceof PeerAddress, 'to be true');

		expect(restoredPeerAddress.equals(peerAddress), 'to be true');
		expect(restoredPeerAddress.ipEquals(peerAddress), 'to be true');

		peerAddress.port = peerAddress.port + 1;
		expect(restoredPeerAddress.equals(peerAddress), 'to be false');  //// they are different now
		expect(restoredPeerAddress.ipEquals(peerAddress), 'to be true'); //// but still have same IPs

		peerAddress.port = peerAddress.port - 1;
		expect(restoredPeerAddress.equals(peerAddress), 'to be true');   //// same again
		expect(restoredPeerAddress.ipEquals(peerAddress), 'to be true');

		let peerAddress1 = new PeerAddress({
			ip: '127.0.0.1',
			port: 8080
		});
		let peerAddress2 = new PeerAddress({
			ip: '::ffff:7f00:1',
			port: 8080
		});

		expect(peerAddress1.equals(peerAddress2), 'to be true');   //// v6-v4 compare
		expect(peerAddress1.ipEquals(peerAddress2), 'to be true');

		let peerAddress3 = new PeerAddress({
			ip: '::ffff:127.0.0.1',
			port: 8080
		});

		expect(peerAddress1.equals(peerAddress3), 'to be true');   //// v6-v4 compare
		expect(peerAddress1.ipEquals(peerAddress3), 'to be true');

		let peerAddress4 = new PeerAddress({
			ip: '127.0.0.2',
			port: 8080
		});

		expect(peerAddress4.equals(peerAddress3), 'to be false');
		expect(peerAddress4.ipEquals(peerAddress3), 'to be false');

		expect(peerAddress4.isSSL(), 'to be false');

		let sslPeerAddress = new PeerAddress({
			ssl: true,
			port: 31337,
			host: 'fizzy.example.com'
		});

		expect(sslPeerAddress.isSSL(), 'to be true');

		expect(sslPeerAddress, 'to be a', 'object');
		expect(sslPeerAddress instanceof PeerAddress, 'to be true');

		let sslAsBinary = sslPeerAddress.toBinary();
		expect(sslAsBinary, 'to be a', 'Buffer');

		let sslRestored = PeerAddress.fromBinary(sslAsBinary);
		expect(sslRestored, 'to be a', 'object');
		expect(sslRestored instanceof PeerAddress, 'to be true');

		expect(sslRestored.host === sslPeerAddress.host, 'to be true');
		expect(sslRestored.port === sslPeerAddress.port, 'to be true');

		expect(sslRestored.equals(sslPeerAddress), 'to be true');
	});

	it('host has priority over ip', async function() {
		expect(PeerAddress, 'to be a', 'function');

		let sslPeerAddress1 = new PeerAddress({
			ssl: true,
			port: 31337,
			ip: '127.0.0.3',
			host: 'fizzy.example.com'
		});

		let sslPeerAddress2 = new PeerAddress({
			ssl: true,
			port: 31337,
			host: 'fizzy.example.com'
		});

		expect(sslPeerAddress2.equals(sslPeerAddress1), 'to be true');
	});
});