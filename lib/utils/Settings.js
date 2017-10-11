const rfr = require('rfr');
const _ = require('lodash');

var Settings = {};

var batch = rfr('settings/network.js');
_.assign(Settings, {network: batch});

module.exports = Settings;