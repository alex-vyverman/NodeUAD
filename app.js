
//const { is } = require('express/lib/request');
//const { request } = require('http');
var net = require('net');
//var fs = require('fs')
//const { exit } = require('process');

const client = new net.Socket();

var address = '127.0.0.1';
var port = 4710;

var interfaceName = [];
var inputs = [];


client.connect(port, address);

function send(buffer) {
    bufferNull = new Buffer.from([0x00]) //terminate each message with NULL
    buffer = Buffer.concat([buffer, bufferNull]);
    client.write(buffer);
}


async function communicate(method, path, devId) {
    return new Promise((resolve, reject) => {
        req = method + " " + path;
        console.log(`Sending: ${req}!`);
        var buffer = new Buffer.from(req);
        send(buffer);

        client.on('data', async function (resp) {

            var nullAt = resp.indexOf(0x00);
            var cut = resp.length - 1;
            //console.log("Lenght", cut)
            //console.log("nullAt", nullAt)
            if (nullAt != cut) {
                console.log("bad transmission")
                reject
            } else {
                resp = resp.slice(0, nullAt) //delete terminating NULL
                uadResponse = resp.toString()
                uadResponse = JSON.parse(uadResponse);

                if (uadResponse.path == path) {
                    resolve(uadResponse);
                }


            }
        });
    })
}




async function getDevicesNames(devId) {
    try {
        var resp = await communicate("get", `/devices/${devId}`);
        console.log("getDevicesNames: ", resp.data.properties.DeviceName.value)
        interfaceName.push(resp.data.properties.DeviceName.value)
    } catch (error) {
        console.log("getDevicesNames fail", error);
    }
}

async function getInputs(devId) {
    try {
        var resp = await communicate("get", `/devices/${devId}/inputs`);
        inputs = Object.keys(resp.data.children)
        console.log("getInputs: ", inputs)
        inputs.forEach(devId => {
            //getDevicesNames(devId)
            //getInputs(devId)
            //console.log("test", resp)
        })

    } catch (error) {
        console.log("getInputs fail", error);
    }
}




(async function initialize() {
    try {
        var resp = await communicate("get", "/devices");
        id = Object.keys(resp.data.children)
        console.log("Number of Apollo interfaces :", id.length)
        id.forEach(devId => {
            getDevicesNames(devId)
            getInputs(devId)
            //console.log("test", resp)
        })
        console.log("initialize: ", resp);
    } catch (e) {
        console.log("initialize fail");
    }
})();







