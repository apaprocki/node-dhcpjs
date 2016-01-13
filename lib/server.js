// Copyright (c) 2011 Andrew Paprocki

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var dgram = require('dgram');
var parser = require('./parser');

function Server(options) {
    if (options) {
        if (typeof(options) !== 'object')
            throw new TypeError('Server options must be an object');
    } else {
        options = {};
    }

    var self = this;
    EventEmitter.call(this, options);

    this.server = dgram.createSocket('udp4');
    this.server.on('message', function(msg, rinfo){
      var data = parser.parse( msg, rinfo );
      self.emit('message',data);
    });
    this.server.on('listening', function() {
        var address = self.server.address();
        self.emit('listening', address.address + ':' + address.port);
    });
}
util.inherits(Server, EventEmitter);
module.exports = Server;

Server.prototype.bind = function(host) {
	var _this = this;
    this.server.bind(67, host, function() {
    	_this.server.setBroadcast(true);
    });
}
