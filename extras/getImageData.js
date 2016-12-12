"use strict";
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

var fs = require("fs");
var request = require("request");

fluid.registerNamespace("gpii.ul.image");

gpii.ul.image.generateSingleRequestPromise = function (uid, url) {
    return function() {
        var promise = fluid.promise();

        request.head(url, function (error, response) {
            if (error) {
                promise.resolve({ isError: true, code: error.code, message: error.message});
            }
            else {
                promise.resolve({ uid: uid, url: url, headers: response.headers });
            }
        });

        return promise;
    }
};

gpii.ul.image.generateThrottlingPromise = function() {
    return function () {
        var promise = fluid.promise();
        setTimeout(promise.resolve, 250);
        return promise;
    }
};

gpii.ul.image.getImageMetadata = function (onResolve, onReject) {
    var imageData = require("./images.json");

    var promises = [];
    fluid.each(imageData.rows, function (imageDef) {

        var output = [ imageDef.key ];

        fluid.each(["ImageUrl"], function (field) {
        // fluid.each(["ImageUrl", "ThumbnailImageUrl"], function (field) {
            var url = imageDef.value[field];
            if (url && url.length) {
                promises.push(gpii.ul.image.generateSingleRequestPromise(imageDef.key, url));
                promises.push(gpii.ul.image.generateThrottlingPromise());
            }
        });

    });

    var sequence = fluid.promise.sequence(promises);
    sequence.then(onResolve, onReject);
};

gpii.ul.image.saveResults = function (that, results) {
    var filteredResults = results.filter(Boolean);
    fs.writeFileSync(that.options.outputPath, JSON.stringify(filteredResults, null, 2), "utf8");
};

fluid.defaults("gpii.ul.image.headerScanner", {
    gradeNames: ["fluid.component"],
    outputPath: "/tmp/output.json",
    invokers: {
        saveResults: {
            funcName: "gpii.ul.image.saveResults",
            args: ["{that}", "{arguments}.0"]
        }
    },
    listeners: {
        "onCreate.scan": {
            funcName: "gpii.ul.image.getImageMetadata",
            args: ["{that}.saveResults", fluid.fail]
        }
    }
});

gpii.ul.image.headerScanner();