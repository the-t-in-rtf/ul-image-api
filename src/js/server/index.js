"use strict";
var fluid = require("infusion");

fluid.require("%gpii-express");

require("./file");
require("./metadata");

/*

 TODO: Implement each of these

// TODO:  All must strip "type", "_id", and "_rev" from the raw couch records
 # `GET /api/images/gallery/:uid`
// 1. lookup using gallery view: http://localhost:7318/images/_design/gallery/_view/byUid?key=%221421059432806-826608318%22
// 2. resolve individual image metadata records:
 // See: http://ryankirkman.com/2011/03/30/advanced-filtering-with-couchdb-views.html
// http://localhost:7318/images/_design/metadata/_view/combined?startkey=[%221421059432806-826608318%22,%20%22unified%22]&endkey=[%221421059432806-826608318%22,%20%22unified%22,%20{}]

 // TODO:  All must strip "type", "_id", and "_rev" from the raw couch records
 # `GET /api/images/reports`
 # `GET /api/images/reports/contributions`
 // /:uid/:source
 // http://localhost:7318/images/_design/metadata/_view/combined?startkey=[%221421059432806-826608318%22,%20%22unified%22]&endkey=[%221421059432806-826608318%22,%20%22unified%22,%20{}]
 # `GET /api/images/reports/reviewers{?includeReviewed}`
 // /:uid
 // http://localhost:7318/images/_design/metadata/_view/combined?startkey=[%221421059432806-826608318%22,%20%22unified%22]&endkey=[%221421059432806-826608318%22,%20%22unified%22,%20{}]


 # `POST /api/images/file/:uid/:source/:image_id`

 // TODO:  All must add "type: gallery" to the incoming records
 # `PUT /api/images/gallery/:uid`
 # `DELETE /api/images/gallery/:uid`

 # `PUT /api/images/approve`
 # `PUT /api/images/reject`

*/

fluid.defaults("gpii.ul.api.images", {
    gradeNames: ["gpii.express.router", "gpii.hasRequiredOptions"],
    requiredFields: {
        "urls.imageDb": true // The location of the images database
    },
    path: "/api/images",
    method: "use",
    events: {
        onFileEndpointReady: null,
        onMetadataEndpointReady: null,
        // Various child middleware isn't ready until JSON Schemas are resolved, all are rolled up here.
        onReady: {
            onFileEndpointReady:     "onFileEndpointReady",
            onMetadataEndpointReady: "onMetadataEndpointReady"
        }
    },
    components: {
        file: {
            type: "gpii.ul.api.images.file",
            options: {
                listeners: {
                    "onReady.notifyParent": {
                        func: "{gpii.ul.api.images}.events.onFileEndpointReady.fire"
                    }
                }
            }
        },
        metadata: {
            type: "gpii.ul.api.images.metadata",
            options: {
                listeners: {
                    "onReady.notifyParent": {
                        func: "{gpii.ul.api.images}.events.onMetadataEndpointReady.fire"
                    }
                }
            }
        }
    }
});
