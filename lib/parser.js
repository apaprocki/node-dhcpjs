// Copyright (c) 2011 Andrew Paprocki

var assert = require('assert');
var protocol = require('./protocol');

module.exports.parse = function(msg, rinfo) {
    function trimNulls(str) {
        var idx = str.indexOf('\u0000');
        return (-1 === idx) ? str : str.substr(0, idx);
    }
    function readIpRaw(msg, offset) {
        if (0 === msg.readUInt8(offset))
            return undefined;
        return '' +
            msg.readUInt8(offset++) + '.' +
            msg.readUInt8(offset++) + '.' +
            msg.readUInt8(offset++) + '.' +
            msg.readUInt8(offset++);
    }
    function readIp(msg, offset, obj, name) {
        var len = msg.readUInt8(offset++);
        assert.strictEqual(len, 4);
        obj[name] = readIpRaw(msg, offset);
        return offset + len;
    }
    function readString(msg, offset, obj, name) {
        var len = msg.readUInt8(offset++);
        obj[name] = msg.toString('ascii', offset, offset + len);
        offset += len;
        return offset;
    }
    function readAddressRaw(msg, offset, len) {
        var addr = '';
        while (len-- > 0) {
            var b = msg.readUInt8(offset++);
            addr += (b + 0x100).toString(16).substr(-2);
            if (len > 0) {
                addr += ':';
            }
        }
        return addr;
    }
    function readHex(msg, offset, obj, name) {
        var len = msg.readUInt8(offset++);
        obj[name] = readHexRaw(msg, offset, len);
        offset += len;
        return offset;
    }
    function readHexRaw(msg, offset, len) {
        var data = '';
        while (len-- > 0) {
            var b = msg.readUInt8(offset++);
            data += (b + 0x100).toString(16).substr(-2);
        }
        return data;
    }
    //console.log(rinfo.address + ':' + rinfo.port + '/' + msg.length + 'b');
    var p = {
        op: protocol.BOOTPMessageType.get(msg.readUInt8(0)),
        // htype is combined into chaddr field object
        hlen: msg.readUInt8(2),
        hops: msg.readUInt8(3),
        xid: msg.readUInt32BE(4),
        secs: msg.readUInt16BE(8),
        flags: msg.readUInt16BE(10),
        ciaddr: readIpRaw(msg, 12),
        yiaddr: readIpRaw(msg, 16),
        siaddr: readIpRaw(msg, 20),
        giaddr: readIpRaw(msg, 24),
        chaddr: protocol.createHardwareAddress(
                    protocol.ARPHardwareType.get(msg.readUInt8(1)),
                    readAddressRaw(msg, 28, msg.readUInt8(2))),
        sname: trimNulls(msg.toString('ascii', 44, 108)),
        file: trimNulls(msg.toString('ascii', 108, 236)),
        magic: msg.readUInt32BE(236),
        options: {}
    };
    var offset = 240;
    var code = 0;
    while (code != 255 && offset < msg.length) {
        code = msg.readUInt8(offset++);
        switch (code) {
            case 0: continue;   // pad
            case 255: break;    // end
            case 1: {           // subnetMask
                offset = readIp(msg, offset, p.options, 'subnetMask');
                break;
            }
            case 2: {           // timeOffset
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len, 4);
                p.options.timeOffset = msg.readUInt32BE(offset);
                offset += len;
                break;
            }
            case 3: {           // routerOption
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len % 4, 0);
                p.options.routerOption = [];
                while (len > 0) {
                    p.options.routerOption.push(readIpRaw(msg, offset));
                    offset += 4;
                    len -= 4;
                }
                break;
            }
            case 4: {           // timeServerOption
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len % 4, 0);
                p.options.timeServerOption = [];
                while (len > 0) {
                    p.options.timeServerOption.push(readIpRaw(msg, offset));
                    offset += 4;
                    len -= 4;
                }
                break;
            }
            case 6: {           // domainNameServerOption
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len % 4, 0);
                p.options.domainNameServerOption = [];
                while (len > 0) {
                    p.options.domainNameServerOption.push(
                        readIpRaw(msg, offset));
                    offset += 4;
                    len -= 4;
                }
                break;
            }
            case 12: {          // hostName
                offset = readString(msg, offset, p.options, 'hostName');
                break;
            }
            case 15: {          // domainName
                offset = readString(msg, offset, p.options, 'domainName');
                break;
            }
            case 43: {          // vendorOptions
                var len = msg.readUInt8(offset++);
                p.options.vendorOptions = {};
                while (len > 0) {
                    var vendop = msg.readUInt8(offset++);
                    var vendoplen = msg.readUInt8(offset++);
                    var buf = new Buffer(vendoplen);
                    msg.copy(buf, 0, offset, offset + vendoplen);
                    p.options.vendorOptions[vendop] = buf;
                    len -= 2 + vendoplen;
                    offset += vendoplen;
                }
                break;
            }
            case 50: {          // requestedIpAddress
                offset = readIp(msg, offset, p.options, 'requestedIpAddress');
                break;
            }
            case 51: {          // ipAddressLeaseTime
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len, 4);
                p.options.ipAddressLeaseTime =
                    msg.readUInt32BE(offset);
                offset += 4;
                break;
            }
            case 52: {          // optionOverload
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len, 1);
                p.options.optionOverload = msg.readUInt8(offset++);
                break;
            }
            case 53: {          // dhcpMessageType
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len, 1);
                var mtype = msg.readUInt8(offset++);
                assert.ok(1 <= mtype);
                assert.ok(8 >= mtype);
                p.options.dhcpMessageType = protocol.DHCPMessageType.get(mtype);
                break;
            }
            case 54: {          // serverIdentifier
                offset = readIp(msg, offset, p.options, 'serverIdentifier');
                break;
            }
            case 55: {          // parameterRequestList
                var len = msg.readUInt8(offset++);
                p.options.parameterRequestList = [];
                while (len-- > 0) {
                    var option = msg.readUInt8(offset++);
                    p.options.parameterRequestList.push(option);
                }
                break;
            }
            case 57: {          // maximumMessageSize
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len, 2);
                p.options.maximumMessageSize = msg.readUInt16BE(offset);
                offset += len;
                break;
            }
            case 58: {          // renewalTimeValue
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len, 4);
                p.options.renewalTimeValue = msg.readUInt32BE(offset);
                offset += len;
                break;
            }
            case 59: {          // rebindingTimeValue
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len, 4);
                p.options.rebindingTimeValue = msg.readUInt32BE(offset);
                offset += len;
                break;
            }
            case 60: {          // vendorClassIdentifier
                offset = readString(msg, offset, p.options,
                                    'vendorClassIdentifier');
                break;
            }
            case 61: {          // clientIdentifier
                var len = msg.readUInt8(offset++);
                p.options.clientIdentifier =
                    protocol.createHardwareAddress(
                        protocol.ARPHardwareType.get(msg.readUInt8(offset)),
                        readAddressRaw(msg, offset + 1, len - 1));
                offset += len;
                break;
            }
            case 72: {          // defaultWWWServers
                var len = msg.readUInt8(offset++);
                assert.strictEqual(len % 4, 0);
                p.options.deafultWWWSevers = [];
                while (len > 0) {
                    p.options.deafultWWWSevers.push(readIpRaw(msg, offset));                  
                    offset += 4;
                    len -= 4;
                }
                break;
            }
            case 81: {          // fullyQualifiedDomainName
                var len = msg.readUInt8(offset++);
                p.options.fullyQualifiedDomainName = {
                    flags: msg.readUInt8(offset),
                    name: msg.toString('ascii', offset + 3, offset + len)
                };
                offset += len;
                break;
            }
            case 82: {          // relayAgentInformation           (RFC 3046)
                var len = msg.readUInt8(offset++);
                p.options.relayAgentInformation = {};
                var cur = offset;
                offset += len;
                while (cur < offset) {
                    var subopt = msg.readUInt8(cur++);
                    switch (subopt) {
                        case 1: {   // agentCircuitId              (RFC 3046)
                            cur = readHex(msg, cur,
                                          p.options.relayAgentInformation,
                                          'agentCircuitId');
                            break;
                        }
                        case 2: {   // agentRemoteId               (RFC 3046)
                            cur = readHex(msg, cur,
                                          p.options.relayAgentInformation,
                                          'agentRemoteId');
                            break;
                        }
                        case 4: {   // docsisDeviceClass           (RFC 3256)
                            var sublen = msg.readUInt8(cur++);
                            assert.strictEqual(sublen, 4);
                            p.options.relayAgentInformation.docsisDeviceClass =
                                msg.readUInt32(cur);
                            cur += sublen;
                            break;
                        }
                        case 5: {   // linkSelection               (RFC 3527)
                            assert.strictEqual(sublen, 4);
                            cur = readIp(msg, cur,
                                         p.options.relayAgentInformation,
                                         'linkSelectionSubnet');
                            break;
                        }
                        case 6: {   // subscriberId                (RFC 3993)
                            cur = readString(msg, cur,
                                             p.options.relayAgentInformation,
                                             'subscriberId');
                            break;
                        }
                        default: {
                            console.log('Unhandled DHCP option 82 sub-option ' +
                                        subopt + ", len " + sublen);
                            var sublen = msg.readUInt8(cur++);
                            cur += sublen;
                            break;
                        }
                    }
                }
                break;
            }
            case 118: {		    // subnetSelection
                offset = readIp(msg, offset, p.options, 'subnetAddress');
                break;
            }
            case 252: {        // The Web Proxy Auto Discovery (WPAD)
                offset = readString(msg, offset, p.options, 'wpadUrl');
                break;
            }
            default: {
                var len = msg.readUInt8(offset++);
                console.log('Unhandled DHCP option ' + code + '/' + len + 'b');
                offset += len;
                break;
            }
        }
    }
    return p;
};
