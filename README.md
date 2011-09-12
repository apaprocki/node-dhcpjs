dhcpjs provides native DHCP support in Node.js.

## Introduction

Currently, this project just provides simple client and server protocol APIs
which allow an application to consume DHCP messages broadcast to the network
as JS objects.  There are no external dependencies other than the Buffer API present in Node.js 0.5.5.  At the moment, this allows for DHCP sniffing and
nothing more.  I decided to release this as the initial version because it
may still be useful to anyone wishing to perform network DHCP logging.

In the future, APIs for sending broadcast/unicast DHCP replies will be added.
At that point, a fully functioning DHCP lease server and client can be
implemented as part of the package.  In addition, I am interested in creating
a DHCP fuzzer and mis-behaved clients to help with testing servers and DoS
scenarios.

I plan on adding documentation once it is possible to send replies. Currently
traffic can only be inspected by using the createServer()/createClient()
functions.

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

## Installation

    npm install dhcpjs

## License

This module is released under the MIT license.

## Bugs

See <https://github.com/apaprocki/node-dhcpjs/issues>.
