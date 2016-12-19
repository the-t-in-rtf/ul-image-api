"use strict";
var fluid = require("infusion");

fluid.require("%kettle");
var kettle = fluid.registerNamespace("kettle");
kettle.loadTestingSupport();

fluid.defaults("gpii.tests.ul.api.images.request", {
    gradeNames: ["kettle.dataSource.URL"],
    path: {
        expander: {
            funcName: "fluid.stringTemplate",
            args:     ["%baseUrl%endpoint", { baseUrl: "{harness}.options.urls.api", endpoint: "{that}.options.endpoint"}]
        }
    },
    port: "{harness}.options.ports.api"
});
