// Copyright (c) 2014 Andrew Paprocki

var dhcpjs = require('dhcpjs');
var util = require('util');
var os = require('os');

var client = new dhcpjs.Client();
client.on('message', function(pkt) {
    console.log('message:', util.inspect(pkt, false, 3));
});
client.on('dhcpOffer', function(pkt) {
    console.log('dhcpOffer:', util.inspect(pkt, false, 3));
});
client.on('dhcpAck', function(pkt) {
    console.log('dhcpAck:', util.inspect(pkt, false, 3));
});
client.on('dhcpNak', function(pkt) {
    console.log('dhcpNak:', util.inspect(pkt, false, 3));
});
client.on('listening', function(addr) {
    console.log('listening on', addr);
});
client.bind('0.0.0.0', 68, function() {
    console.log('bound to 0.0.0.0:68');
});

// Configure a DHCPINFORM packet:
//   xid                    Transaction ID. This is a counter that the DHCP
//                          client should maintain and increment every time
//                          a packet is broadcast.
//
//   chaddr                 Ethernet address of the interface.
//
//   ciaddr                 Pre-configured client network address.
//
//   options                Object containing keys that map to DHCP options.
//
//   dhcpMessageType        Option indicating a DHCP protocol message (as
//                          opposed to a plain BOOTP protocol message).
//
//   clientIdentifier       Option indicating a client-configured unique name
//                          to be used to disambiguate the lease on the server.

var xid = 1;
var interfaces = os.getNetworkInterfaces();

for (var interface in interfaces) {
    var addresses = interfaces[interface];
    for (var address in addresses) {
        if (addresses[address].family === 'IPv4' &&
            !addresses[address].internal) {
            console.log(util.inspect(addresses[address], false));
            var pkt = {
                xid: xid++,
                chaddr: addresses[address].mac,
                ciaddr: addresses[address].address,
                options: {
                    dhcpMessageType: dhcpjs.Protocol.DHCPMessageType.DHCPINFORM,
                    clientIdentifier: 'MyMachine',
                }
            }
            var discover = client.createPacket(pkt);
            client.broadcastPacket(discover, undefined, function() {
                console.log('dhcpInform ['+interface+': '+pkt.ciaddr+']: sent');
            });
        }
    }
}
