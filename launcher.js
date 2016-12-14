// A "test harness" that launches the image API for demos and manual testing.
/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

var gpii  = fluid.registerNamespace("gpii");
require("./");

require("gpii-launcher");

fluid.defaults("gpii.ul.website.launcher", {
    gradeNames: ["gpii.launcher"],
    yargsOptions: {
        describe: {
            "ports": "The ports (ports.api, ports.couch) used by this instance."
        },
        help: true,
        defaults: {
            "optionsFile": "%ul-image-api/configs/dev.json"
        }
    }
});

gpii.ul.website.launcher();
