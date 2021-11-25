"use strict";
var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");

var content = require("./fullSizeImagesOnly20161129.json");

var fs = require("fs");
/*
 {
 "uid": "1421059432805-841744836",
 "url": "http://liveimageserver.dlf.org.uk/mee/products/med/0007166.jpg",
 "headers": {
 "date": "Mon, 28 Nov 2016 16:33:50 GMT",
 "server": "Apache/2.4.9 (Win32) OpenSSL/0.9.8y",
 "last-modified": "Fri, 10 Mar 2006 11:10:54 GMT",
 "etag": "\"215b-40ea20be6ab80\"",
 "accept-ranges": "bytes",
 "content-length": "8539",
 "connection": "close",
 "content-type": "image/jpeg"
 }
 }
 */

var rules = {
    "uid":   "uid",
    "url":   "url",
    "bytes": "headers.content-length",
    "type":  "headers.content-type"
};

var transformedData = fluid.transform(content, function (record) {
    return fluid.model.transformWithRules(record, rules);
});

// I was debating concatenation strategies here and ran across a good tool to compare approaches: https://jsperf.com/string-concatenation/14
// basically, initialize a string, then use += in modern browsers.
var output = "uid,url,bytes,type\n";
fluid.each(transformedData, function (record) {
    output += "\"" + fluid.values(record).join("\",\"") + "\"\n";
});

var path = "/tmp/csv.txt";
fs.writeFileSync(path, output, "utf8");

console.log("output saved to " + path);