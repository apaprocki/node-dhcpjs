var dhcpjs = require('dhcpjs');
var util = require('util');

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

// Configure a DHCPDISCOVER packet:
//   xid 0x01               Transaction ID. This is a counter that the DHCP
//                          client should maintain and increment every time
//                          a packet is broadcast.
//
//   chaddr                 Ethernet address of the interface being configured.
//
//   options                Object containing keys that map to DHCP options.
//
//   dhcpMessageType        Option indicating a DHCP protocol message (as
//                          opposed to a plain BOOTP protocol message).
//
//   clientIdentifier       Option indicating a client-configured unique name
//                          to be used to disambiguate the lease on the server.

var pkt = {
    xid: 0x01,
    chaddr: '00:01:02:03:04:05',
    options: {
        dhcpMessageType: dhcpjs.Protocol.DHCPMessageType.DHCPDISCOVER,
        clientIdentifier: 'MyMachine',
    }
}

var discover = client.createDiscoverPacket(pkt);
client.broadcastPacket(discover, undefined, function() {
    console.log('dhcpDiscover: sent');
});
