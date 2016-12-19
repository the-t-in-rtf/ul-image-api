/*

    Tests for the following API endpoints:

    * `GET /api/images/file/:uid/:source/:image_id`
    * `GET /api/images/file/:uid/:source/:width/:image_id`
    * `HEAD /api/images/file/:uid/:source/:image_id`
    * `HEAD /api/images/file/:uid/:source/:width/:image_id`

*/
"use strict";
var fluid = require("infusion");

require("../../lib/request");
require("../../lib/common-sequences");

fluid.defaults("gpii.tests.ul.api.images.file.elements.loadUnifiedOriginal", {
    gradeNames: ["gpii.tests.ul.api.images.elements.loadAndCheck"],
    endpoint: "/api/images/file/1421059432806-826608318/unified/a.svg",
    expectedResponseStatus: 200,
    expectedResponseBody: {}
});

fluid.defaults("gpii.tests.ul.api.images.file.sequences.anonymous.loadUnifiedOriginal", {
    // TODO:  Talk with Antranig about distributing cookie jar to elements.
    // gradeNames: ["gpii.tests.ul.api.images.sequences.standardStartupAndShutdown", "gpii.tests.ul.api.images.hasCookieJar"],
    gradeNames: ["gpii.tests.ul.api.images.sequences.standardStartupAndShutdown"],
    elements: {
        loadUnifiedOriginal: {
            gradeNames: "gpii.tests.ul.api.images.file.elements.loadUnifiedOriginal",
            priority:   "after:startup"
        }
    }
});

fluid.defaults("gpii.tests.ul.api.images.file.read.caseHolder", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [
        {
            name: "UL Image API 'read' tests for /api/images/file...",
            tests: [{
                name: "Load a unified original file anonymously...",
                sequenceGrade: "gpii.tests.ul.api.images.file.sequences.anonymous.loadUnifiedOriginal",
                sequence: [{
                    func: "fluid.identity"
                }]
            }]
        }
    ]
});

fluid.defaults("gpii.tests.ul.api.images.file.read.environment", {
    gradeNames: ["fluid.test.testEnvironment", "gpii.tests.ul.api.images.harness"],
    components: {
        caseHolder: {
            type: "gpii.tests.ul.api.images.file.read.caseHolder"
        }
    }
});

fluid.test.runTests("gpii.tests.ul.api.images.file.read.environment");
