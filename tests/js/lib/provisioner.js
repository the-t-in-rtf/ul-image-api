// A script to provision the filesystem used with GET /api/images/file based on our test data
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var mkdirp = require("mkdirp");
var ncp    = require("ncp");

fluid.registerNamespace("gpii.tests.ul.images.api.provisioner");
gpii.tests.ul.images.api.provisioner.provision = function (that) {
    var promises = [];

    fluid.each(that.options.dataToCopy, function (destDir, sourceDir) {
        var sourcePath = fluid.module.resolvePath(that.options[sourceDir]);
        var destPath   = fluid.module.resolvePath(that.options[destDir]);

        var promise = fluid.promise();
        promises.push(promise);
        mkdirp(destDir, function (err) {
            if (err) {
                promise.reject(err);
            }
            else {
                fluid.log("Copying test data from '", sourcePath, "' to '", destPath, "'.")
                // Copy our pregenerated test data in place
                ncp(sourcePath, destPath, function (err) {
                    if (err) {
                        promise.reject(err);
                    }
                    else {
                        promise.resolve();
                    }
                });
            }
        });
    });

    var sequence = fluid.promise.sequence(promises);
    sequence.then(that.events.onProvisioned.fire, fluid.fail);
};

gpii.tests.ul.images.api.provisioner.deprovision = function (that) {
    // TODO: Clear out the cache directory
    // TODO: Clear out the test content
};

fluid.defaults("gpii.tests.ul.images.api.provisioner", {
    gradeNames: ["fluid.component", "gpii.hasRequiredOptions"],
    dataToCopy: {
        // "source.path": "target.path"
        "testDataDir": "originalsDir",
        "testCacheDir": "cacheDir"
    },
    requiredFields: {
        "testDataDir": true,  // Where our test data is located.
        "testCacheDir": true,  // Where our test data is located.
        "originalsDir": true, // Where to store the originals.
        "cacheDir":     true  // Where to store resized images.
    },
    testCacheDir: "%ul-image-api/tests/images/cache",
    testDataDir: "%ul-image-api/tests/images/originals",
    events: {
        onProvisioned: null
    },
    listeners: {
        "onCreate.provision": {
            funcName: "gpii.tests.ul.images.api.provisioner.provision",
            args:     ["{that}"]
        },
        "onDestroy.deprovision": {
            funcName: "gpii.tests.ul.images.api.provisioner.deprovision",
            args:     ["{that}"]
        }
    }
});
