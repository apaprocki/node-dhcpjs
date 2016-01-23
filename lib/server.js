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
    this.server.on('message', function(msg, rinfo) {
      var pkt = parser.parse(msg);
      switch (pkt.options.dhcpMessageType.value) {
          case protocol.DHCPMessageType.DHCPDISCOVER.value:
              self.emit('dhcpDiscover', pkt);
              break;
          case protocol.DHCPMessageType.DHCPREQUEST.value:
              self.emit('dhcpRequest', pkt);
              break;
          case protocol.DHCPMessageType.DHCPDECLINE.value:
              self.emit('dhcpDecline', pkt);
              break;
          case protocol.DHCPMessageType.DHCPRELEASE.value:
              self.emit('dhcpRelease', pkt);
              break;
      default:
        self.emit('unhandledDHCPMessageType',pkt);
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
