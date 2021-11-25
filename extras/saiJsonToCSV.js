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

fluid.registerNamespace("gpii.ul.api.images");
gpii.ul.api.images.fandr = function (value, transformSpec) {
    if (transformSpec.find && transformSpec.replace) {
        return value.replace(transformSpec.find, transformSpec.replace);
    }
    else {
        return value;
    }
};

var rules = {
    "uid":   "uid",
    "url":   {
        transform: {
            type:      "gpii.ul.api.images.fandr",
            inputPath: "product_image.uri",
            find:      "public://",
            replace:   "http://staging.saa.gpii.net/api/v1/products"
        }
    },
    "fid": "product_image.fid",
    "type":  "product_image.filemime",
    "bytes": "product_image.filesize",
    "filename":   {
        transform: {
            type:      "gpii.ul.api.images.fandr",
            inputPath: "product_image.uri",
            find:      /.+\/([^/]+)/,
            replace:   "$1"
        }
    }
};

var transformedData = fluid.transform(content, function (record) {
    return fluid.model.transformWithRules(record, rules);
});

// I was debating concatenation strategies here and ran across a good tool to compare approaches: https://jsperf.com/string-concatenation/14
// basically, initialize a string, then use += in modern browsers.
var output = Object.keys(rules) + "\n";
fluid.each(transformedData, function (record) {
    if (record.url) {
        output += "\"" + fluid.values(record).join("\",\"") + "\"\n";
    }
});

var path = "/tmp/sai-csv.txt";
fs.writeFileSync(path, output, "utf8");

console.log("output saved to " + path);
