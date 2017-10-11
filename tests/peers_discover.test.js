const expect = require('unexpected');
const rfr = require('rfr');
const Flow = rfr('lib/Flow.js');


const PeerChannel = rfr('lib/network/PeerChannel.js');

beforeEach(async function() {
    var flow1 = new Flow();
    var network1 = await flow1.getNetwork();

    var flow2 = new Flow();
    var network2 = await flow2.getNetwork();

    var flow3 = new Flow();
    var network3 = await flow3.getNetwork();
});

describe('Flow network 2 peers handshake', function() {

    var flow1 = null;
    var network1 = null;
    var flow2 = null;
    var network2 = null;
    var flow3 = null;
    var network3 = null;

    it('Network initialization is ok', async function() {
        flow1 = new Flow();
        network1 = await flow1.getNetwork();

        flow2 = new Flow();
        network2 = await flow2.getNetwork();

        flow3 = new Flow();
        network3 = await flow3.getNetwork();
    });

    it('Lets connect from network2 to network1', function(done) {
        var promises = [];

        promises.push(  new Promise((resolve, reject) => 
            network2.on('handshake:success',() => resolve()) )  );
        promises.push(  new Promise((resolve, reject) =>   
            network1.on('handshake:success',() => resolve()) )  );

        var peerAddress = network1.getLocalPeerAddress();
        network2.connect(peerAddress.ip, peerAddress.port);

        Promise.all(promises).then( () => done() );
    });

    it('Lets connect from network3 to network1', function(done) {
        var promises = [];

        promises.push(  new Promise((resolve, reject) => 
            network3.on('handshake:success',() => resolve()) )  );
        promises.push(  new Promise((resolve, reject) =>   
            network1.on('handshake:success',() => resolve()) )  );

        var peerAddress = network1.getLocalPeerAddress();
        network3.connect(peerAddress.ip, peerAddress.port);

        Promise.all(promises).then( () => done() );
    });

    //// on this poing, network1 knows about #2 and #3, while #2 knows only about #1, #3 knows only about #1


});