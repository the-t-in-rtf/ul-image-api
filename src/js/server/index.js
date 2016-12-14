"use strict";
var fluid = require("infusion");

fluid.require("%gpii-express");

require("./file");

/*

 TODO: Implement each of these

 # `GET /api/images/:source`
 # `GET /api/images/:source/:uid`
 # `GET /api/images/metadata/:uid/:source/:image_id`
 # `GET /api/images/gallery/:uid`
 # `GET /api/images/reports`
 # `GET /api/images/reports/contributions`
 # `GET /api/images/reports/reviewers{?includeReviewed}`
 # `POST /api/images/metadata/:uid/:source`
 # `PUT /api/images/metadata/:uid/:source/:image_id`
 # `DELETE /api/images/metadata/:uid/:source/:image_id`
 # `PUT /api/images/gallery/:uid`
 # `DELETE /api/images/gallery/:uid`
 # `PUT /api/images/approve`
 # `PUT /api/images/reject`

*/

fluid.defaults("gpii.ul.images.api", {
    gradeNames: ["gpii.express.router"],
    path: "/api/images",
    method: "use",
    events: {
        onFileReady: null,
        // Various child middleware isn't ready until JSON Schemas are resolved, all are rolled up here.
        onReady: {
            onFileReady: "onFileReady"
        }
    },
    components: {
        file: {
            type: "gpii.ul.images.api.file",
            options: {
                listeners: {
                    "onReady.notifyParent": {
                        func: "{gpii.ul.images.api}.events.onFileReady.fire"
                    }
                }
            }
        }
    }
});
