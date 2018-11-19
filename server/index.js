const path = require('path');

global.searchPaths = [path.resolve(__dirname, 'node_modules')];
global.isServer = true;

require('../source/server');