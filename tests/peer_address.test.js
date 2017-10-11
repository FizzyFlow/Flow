const expect = require('unexpected');
const rfr = require('rfr');
const PeerAddress = rfr('lib/network/PeerAddress.js');

const BinaryVector = rfr('lib/network/vectors/BinaryVector.js');

beforeEach(async function() {
});

describe('PeerAddress class', function() {

	it('is ready to be initialized', async function() {
		expect(PeerAddress, 'to be a', 'function');

		var peerAddress = new PeerAddress({
			ip: '255.11.241.4',
			port: 9020
		});

		expect(peerAddress, 'to be a', 'object');
		expect(peerAddress instanceof PeerAddress, 'to be true');

		var asBinary = peerAddress.toBinary();
		expect(asBinary, 'to be a', 'Buffer');

		var restoredPeerAddress = PeerAddress.fromBinary(asBinary);
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

		var peerAddress1 = new PeerAddress({
			ip: '127.0.0.1',
			port: 8080
		});
		var peerAddress2 = new PeerAddress({
			ip: '::ffff:7f00:1',
			port: 8080
		});

		expect(peerAddress1.equals(peerAddress2), 'to be true');   //// v6-v4 compare
		expect(peerAddress1.ipEquals(peerAddress2), 'to be true');

		var peerAddress2 = new PeerAddress({
			ip: '::ffff:127.0.0.1',
			port: 8080
		});

		expect(peerAddress1.equals(peerAddress2), 'to be true');   //// v6-v4 compare
		expect(peerAddress1.ipEquals(peerAddress2), 'to be true');

		var peerAddress1 = new PeerAddress({
			ip: '127.0.0.2',
			port: 8080
		});

		expect(peerAddress1.equals(peerAddress2), 'to be false');
		expect(peerAddress1.ipEquals(peerAddress2), 'to be false');

	});

});