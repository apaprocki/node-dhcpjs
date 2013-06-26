// Copyright 2011 Andrew Paprocki. All rights reserved.

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var dgram = require('dgram');
var parser = require('./parser');

function Client(options) {
    if (options) {
        if (typeof(options) !== 'object')
            throw new TypeError('Client options must be an object');
    } else {
        options = {};
    }

    var self = this;
    EventEmitter.call(this, options);

    this.client = dgram.createSocket('udp4');
    this.client.on('message', parser.parse.bind(this));
    this.client.on('listening', function() {
        var address = self.client.address();
        self.emit('listening', address.address + ':' + address.port);
    });
}
util.inherits(Client, EventEmitter);
module.exports = Client;

Client.prototype.bind = function(host) {
	var _this = this;
    this.client.bind(68, host, function() { 
    	_this.client.setBroadcast(true);
    });
}
