const expect = require('unexpected');
const rfr = require('rfr');
const Flow = rfr('lib/Flow.js');


const PeerChannel = rfr('lib/network/PeerChannel.js');
const Settings = rfr('lib/utils/Settings.js');


const NetworkGraphExport = rfr('lib/network/helpers/NetworkGraphExport.js');

beforeEach(async function() {
    var flow1 = new Flow();
    var network1 = await flow1.getNetwork();

    var flow2 = new Flow();
    var network2 = await flow2.getNetwork();

    var flow3 = new Flow();
    var network3 = await flow3.getNetwork();
});

describe('Flow network peers discover', function() {

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

    it('Lets network3 ask network1 for more peers and check that it connects to discovered', function(done) {
        var promises = [];

        var peerChannel3 = null;
        var peerChannels = network3.getPeerChannels();
        expect(peerChannels.length, 'to be', 1);

        peerChannels.forEach(function(peerChannel){
            peerChannel3 = peerChannel;
        });

        expect(network1.knownPeerAddresses.knownCount, 'to be', 2);
        expect(network3.knownPeerAddresses.knownCount, 'to be', 1);

        promises.push(  new Promise((resolve, reject) =>   
            network1.on('askedforpeers',() => resolve()) )  );

        promises.push(  new Promise((resolve, reject) => 
            network3.on('peersdiscovered',() => { 
                network3.knownPeerAddresses.logDebug();
                expect(network3.knownPeerAddresses.knownCount, 'to be', 2);
                resolve();
             }) )  );

        promises.push(  new Promise((resolve, reject) => 
            network3.on('newChannel',() => { 
                network3.knownPeerAddresses.logDebug();
                expect(network3.knownPeerAddresses.knownCount, 'to be', 2);
                resolve();
             }) )  );

        promises.push(  new Promise((resolve, reject) => 
            //// note that we didn't ask network3 to connect to network2. It was discovered
            network2.on('newChannel',() => { 
                expect(network1.knownPeerAddresses.knownCount, 'to be', 2);
                resolve();
             }) )  );

        // peerChannel3.askForMorePeers();

        Promise.all(promises).then( () => done() );
    });


    it.only('Check for max connected peers limit', async function() {
        Settings.network.limits.peers = 5;
        let expectedNodesCount = Settings.network.limits.peers + 3;

        let networks = [];
        for (let i = 0; i <= Settings.network.limits.peers+2; i++) { /// create maxPeers + 2 peers
            let flow = new Flow();
            let network = await flow.getNetwork();
            networks.push(network);

            network.on('peer:status', ()=>{ exporter.setTimeframe(); });

            network.on('message', (msg, peerChannel)=>{ 
                exporter.addMessage(peerChannel._peerConnection.peerAddress, peerChannel._localPeerAddress, msg); 
            });
        }

        let exporter = new NetworkGraphExport({networks: networks}); 

        expect(networks.length, 'to be', expectedNodesCount);

        var peerAddress = networks[0].getLocalPeerAddress();
        //// connect all peers to 1st one
        for (let i = 1; i <= Settings.network.limits.peers+2; i++) {
            exporter.setTimeframe();
            networks[i].connect(peerAddress.ip, peerAddress.port);
        }

        //// Settings.network.limits.peers should be connected to network[0]
        var waitForConnectionsPromise = new Promise((res, rej) => {
            var connectedCount = 0;
            networks[0].on('handshake:success', ()=>{
                connectedCount++;
                if (connectedCount == Settings.network.limits.peers) {
                    expect(networks[0].knownPeerAddresses.activeCount, 'to be', Settings.network.limits.peers);
                    expect(networks[0].knownPeerAddresses.activeInboundCount, 'to be', Settings.network.limits.peers);
                    expect(networks[0].knownPeerAddresses.activeOutboundCount, 'to be', 0);
                    res();
                }
            });
        });

        //// But the last one should be discarded
        var waitForDiscardPromise = new Promise((res, rej) => {
            // res();
            var discardedCount = 0;
            networks[0].on('closed', (peerChannel, peerAddress)=>{
                exporter.setTimeframe();
                discardedCount++;
                if (discardedCount == 1) {
                    // networks[0].knownPeerAddresses.activeCount + networks[0]._awaitingForHandshakeCount
                    expect(networks[0].knownPeerAddresses.activeOutboundCount, 'to be', 0);
                    res();
                }
            });
        });

        await Promise.all([waitForDiscardPromise, waitForConnectionsPromise]);


        var waitForTheLastOneToBeDiscovered =  new Promise((res, rej) => {
            // res();
            var count = 0;
            networks[networks.length-1].on('handshake:success', (peerChannel, peerAddress)=>{
                exporter.setTimeframe();
                count++;
                if (count == Settings.network.limits.peers) {
                    res();
                }
            });
        });

        await waitForTheLastOneToBeDiscovered;


        await new Promise((res,rej)=>{ setTimeout(res, 15000); });
        exporter.finishBroadcast();
        exporter.save('tmp/handshake_limits.json');
    });

});