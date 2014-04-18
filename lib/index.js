// Copyright (c) 2011 Andrew Paprocki

var Server = require('./server');
var Client = require('./client');
var Protocol = require('./protocol');

module.exports = {
    Server: Server,
    createServer: function(options) {
        return new Server(options);
    },
    Client: Client,
    createClient: function(options) {
        return new Client(options);
    },
    Protocol: Protocol
}
