// Copyright (c) 2011 Andrew Paprocki

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var dgram = require('dgram');
var parser = require('./parser');

function Server(options, socket_opts) {
    if (options) {
        if (typeof(options) !== 'object')
            throw new TypeError('Server options must be an object');
    } else {
        options = {};
    }
    var self = this;
    EventEmitter.call(this, options);
    var socketOpts = (socket_opts? socket_opts : 'udp4');
    this.server = dgram.createSocket(socketOpts);
    this.server.on('message', function(msg, rinfo) {
      try {
          var data = parser.parse(msg, rinfo);
          self.emit('message', data);
      } catch (e) {
          if (!self.emit('error', e)) {
              throw e;
          }
      }
    });
    this.server.on('listening', function() {
        var address = self.server.address();
        self.emit('listening', address.address + ':' + address.port);
    });
}
util.inherits(Server, EventEmitter);
module.exports = Server;

Server.prototype.bind = function(host,port) {
    var _this = this;
    if (!port) port = 67;
    this.server.bind(port, host, function() {
    	_this.server.setBroadcast(true);
    });
}
