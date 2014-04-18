dhcpjs provides native DHCP support in Node.js.

## Introduction

Currently, this project just provides simple client and server protocol APIs
which allow an application to consume DHCP messages broadcast to the network
as JS objects.

The module can be used to sniff DHCP traffic, and a skeleton client example
is provided to show how the module can be used to build a full DHCP client.

In the future, a full DHCP client and/or server may be implemented as a
separate module with a dependency on this one.  In addition, I am interested in creating a DHCP fuzzer and mis-behaved clients to help with testing servers and
DoS scenarios.

## Usage

    var util = require('util');
    var dhcpjs = require('dhcpjs');
    var server = dhcpjs.createServer();
    server.on('message', function(m) {
        console.log(util.inspect(m, false, 3));
    });
    server.on('listening', function(address) {
        console.log('listening on ' + address);
    });
    server.bind();

The example must be executed as root because it binds to port 67.  The same
example code also works with the createClient() function which binds to port
68. To run:

    sudo node example.js

When a DHCP message is received, output similar to this will be printed:

    { op: { value: 1, name: 'BOOTPREQUEST' },
      hlen: 6,
      hops: 0,
      xid: 2078975723,
      secs: 0,
      flags: 0,
      ciaddr: '10.0.1.9',
      yiaddr: undefined,
      siaddr: undefined,
      giaddr: undefined,
      chaddr: 
       { type: { value: 1, name: 'HW_ETHERNET' },
         address: '00:23:4e:ff:ff:ff' },
      sname: '',
      file: '',
      magic: 1669485411,
      options: 
       { dhcpMessageType: { value: 3, name: 'DHCPREQUEST' },
         clientIdentifier: 
          { type: { value: 1, name: 'HW_ETHERNET' },
            address: '00:23:4e:ff:ff:ff' },
         hostName: 'IDEAPAD',
         fullyQualifiedDomainName: { flags: 0, name: 'IDEAPAD.' },
         vendorClassIdentifier: 'MSFT 5.0',
         parameterRequestList: [ 1, 15, 3, 6, 44, 46, 47, 31, 33, 249, 43 ],
         vendorOptions: { '220': <Buffer 00> } } }

To see the skeleton DHCP client operate, edit example-client.js and modify the
ethernet address and client identifier to match those on your computer. Run:

    sudo node example-client.js

This will send a DHCPDISCOVER packet to the network and any proper DHCP server
will respond with a DHCPOFFER packet that will be printed to the console.

## Installation

    npm install dhcpjs

## License

This module is released under the MIT license.

## Bugs

See <https://github.com/apaprocki/node-dhcpjs/issues>.
