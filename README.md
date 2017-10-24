# Flow

Installation:
----

```bash
mkdir flow
cd flow
git clone https://github.com/FizzyFlow/Flow.git .
npm install
```
* [Install npm](https://docs.npmjs.com/getting-started/installing-node) if you don't have it. Node version >= 8.1.3 is required.

Run unit tests:
----

```bash
grunt test
```

Watch files and run unit tests on updates
----

```bash
grunt livetests
```

Use network visualisation tool:
----

* [Install Fizzy Network Visualisation Tool](https://github.com/FizzyFlow/FizzyNetworkVisualisation)
* Enable network visualisation broadcast in FizzyFlow (settings/network.js -> testing -> enableNetworkGraphBroadcast)
* Open Fizzy Network Visualisation Tool, listen to broadcast
* Run unit tests
* Check out network visualisation in Fizzy Network Visualisation Tool
