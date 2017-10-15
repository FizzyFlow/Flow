const rfr = require('rfr');
const Logger = rfr('lib/utils/Logger.js');

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

const EventEmitter = rfr('lib/utils/EventEmitter.js');
const Timers = rfr('lib/utils/Timers.js');

const PeerAddress = rfr('lib/network/PeerAddress.js');
const PeerConnection = rfr('lib/network/PeerConnection.js');

const Settings = rfr('lib/utils/Settings.js');

class LocalSocket extends EventEmitter {
    constructor() {
        super();

        Logger.info('Initializing LocalSocket object...');

        this._timers = new Timers();
        this._localPeerAddress = null;
    }

    async startSocket() {
        this._localPeerAddress = await this.getLocalAddress();

        const server = http.createServer((req, res) => {
            res.writeHead(200);
            res.end('NodeJS Client\n');
        }).listen(this._localPeerAddress.port);

        Logger.info('Creating WebSocket server for LocalSocket...');

        this._wss = new WebSocket.Server({server: server});
        this._wss.on('connection', (ws) => { this._onConnection(ws) });

        Logger.info('LocalSocket WebSocket listening on port', this._localPeerAddress.port);
    }

    async getLocalAddress() {
        if (this._localPeerAddress !== null) {
            return this._localPeerAddress;
        } else {
            this._localPeerAddress = await LocalSocket.getLocalAddressAvailable();
            return this._localPeerAddress;
        }
    }

    getSyncLocalAddress() {
        if (!this._localPeerAddress) {
            throw 'getSyncLocalAddress should not be called before server initialization';
        } else {
            return this._localPeerAddress;
        }
    }

    static getLocalAddress() {
        return new PeerAddress({
            ip: Settings.network.peer.ip,
            port: Settings.network.peer.port
        });
    }

    static async getLocalAddressAvailable() {
        let port = Settings.network.peer.port;
        const allowPortIncrementation = Settings.network.peer.allowPortIncrementation || false;
        const maxPort = Settings.network.peer.maxPort || (port + 1000);

        if (allowPortIncrementation) {
            /// thanks to https://github.com/codekirei/first-open-port
            var getPort = new Promise((resolve, reject) =>
                (function test() {
                    const server = http.createServer();
                    server.on('error', () => {
                        if ((port += 1) <= maxPort) {
                            test();
                        } else {
                            reject(new Error(err))
                        }
                    });
                    server.on('listening', server.close);
                    server.on('close', () => resolve(port));
                    server.listen(port);
                })()
            );

            port = await getPort;
            return new PeerAddress({
                ip: Settings.network.peer.ip,
                port: port
            });            
        } else {
            return LocalSocket.getLocalAddress();
        }
    }

    connect(peerAddress) {
        const timeoutKey = 'connect_' + peerAddress;
        if (this._timers.timeoutExists(timeoutKey)) {
            // Log.w(LocalSocket, `Already connecting to ${peerAddress}`);
            return false;
        }

        const url = ''+peerAddress;  // .toString();

        Logger.info('LocalSocket | Connecting to', url);

        const ws = new WebSocket(url);
        ws.onopen = () => {
            Logger.info('LocalSocket | Connected to', url);
        console.log('Timeoutkey: '+timeoutKey);
            this._timers.clearTimeout(timeoutKey);

            // const ip = IP.fromIP(ws._socket.remoteAddress);

            const conn = new PeerConnection({
                ws: ws,
                inbound: false,
                peerAddress: peerAddress
            });

            this.fire('connection', conn);
        };
        ws.onerror = e => {
            Logger.error('LocalSocket | Error while connecting to', url, e);

            this._timers.clearTimeout(timeoutKey);
            this.fire('error', peerAddress, e);
        };

        console.log('Timeoutkey: '+timeoutKey);

        this._timers.setTimeout(timeoutKey, () => {
            Logger.error('LocalSocket | Timeout connecting to', url);

            this._timers.clearTimeout(timeoutKey);

            // We don't want to fire the error event again
            ws.onerror = null;

            // If the connection succeeds after we have fired the error event,
            // close it.
            ws.onopen = () => {
                ws.close();
            };

            this.fire('error', peerAddress);
        }, LocalSocket.CONNECT_TIMEOUT);

        return true;
    }

    _onConnection(ws) {
        const peerAddress = new PeerAddress({
            ip: ws._socket.remoteAddress, /// @todo: x-forwarded-for
            port: null /// we don't need to know port of incoming connections on this step. We'll get their port with handshake message
        });

        const conn = new PeerConnection({
            ws: ws,
            inbound: true,
            peerAddress: peerAddress
        });

        this.fire('connection', conn);
    }

    get localPeerAddress() {
        return this._localPeerAddress;
    }
}
LocalSocket.CONNECT_TIMEOUT = 1000 * 5; // 5 seconds

module.exports = LocalSocket;