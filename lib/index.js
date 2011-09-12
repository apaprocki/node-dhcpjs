// Copyright 2011 Andrew Paprocki. All rights reserved.

var Server = require('./server');
var Client = require('./client');

module.exports = {
    Server: Server,
    createServer: function(options) {
        return new Server(options);
    },
    Client: Client,
    createClient: function(options) {
        return new Client(options);
    }
}
