"use strict";
var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");

var content = require("./sai20161130.json");

var fs = require("fs");
/*
 "product_image": {
 "fid": "2085",
 "uid": "115",
 "filename": "crayonccd-l.jpg",
 "uri": "public://uploads/products/images/node/3502/crayonccd-l.jpg",
 "filemime": "image/jpeg",
 "filesize": "8954",
 "status": "1",
 "timestamp": "1478628737",
 "origname": "crayon_ccd-l.jpg",
 "width": "420",
 "height": "257"
 },
 */

var rules = {
    "uid":   "uid",
    "url":   "product_image.uri",
    "bytes": "product_image.filesize",
    "type":  "product_image.filemime"
};

var transformedData = fluid.transform(content, function (record) {
    return fluid.model.transformWithRules(record, rules);
});

// I was debating concatenation strategies here and ran across a good tool to compare approaches: https://jsperf.com/string-concatenation/14
// basically, initialize a string, then use += in modern browsers.
var output = "uid,url,bytes,type\n";
fluid.each(transformedData, function (record) {
    if (record.url) {
        output += "\"" + fluid.values(record).join("\",\"") + "\"\n";
    }
});

var path = "/tmp/sai-csv.txt";
fs.writeFileSync(path, output, "utf8");

console.log("output saved to " + path);