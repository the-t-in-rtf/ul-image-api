"use strict";
var fluid = require("infusion");

fluid.require("%gpii-express");

require("./file");

/*

 TODO: Implement each of these

// TODO:  All must strip "type", "_id", and "_rev" from the raw couch records
 # `GET /api/images/gallery/:uid`
// 1. lookup using gallery view: http://localhost:7318/images/_design/gallery/_view/byUid?key=%221421059432806-826608318%22
// 2. resolve individual image metadata records:
// http://localhost:7318/images/_design/metadata/_view/combined?startkey=[%221421059432806-826608318%22,%20%22unified%22]&endkey=[%221421059432806-826608318%22,%20%22unified%22,%20{}]

 // TODO:  All must strip "type", "_id", and "_rev" from the raw couch records
// See: http://ryankirkman.com/2011/03/30/advanced-filtering-with-couchdb-views.html
 # `GET /api/images/metadata/:uid`
 // /:uid
 // http://localhost:7318/images/_design/metadata/_view/combined?startkey=[%221421059432806-826608318%22]&endkey=[%221421059432806-826608318%22,{},{}]
 # `GET /api/images/metadata/:uid/:source`
// /:uid/:source
// http://localhost:7318/images/_design/metadata/_view/combined?startkey=[%221421059432806-826608318%22,%20%22unified%22]&endkey=[%221421059432806-826608318%22,%20%22unified%22,%20{}]
 # `GET /api/images/metadata/:uid/:source/:image_id`
// /:uid/:source/:image_id
// http://localhost:7318/images/_design/metadata/_view/combined?key=[%221421059432806-826608318%22,%20%22contributor%22,%20%22e.svg%22]

 // TODO:  All must strip "type", "_id", and "_rev" from the raw couch records
 # `GET /api/images/reports`
 # `GET /api/images/reports/contributions`
 // /:uid/:source
 // http://localhost:7318/images/_design/metadata/_view/combined?startkey=[%221421059432806-826608318%22,%20%22unified%22]&endkey=[%221421059432806-826608318%22,%20%22unified%22,%20{}]
 # `GET /api/images/reports/reviewers{?includeReviewed}`
 // /:uid
 // http://localhost:7318/images/_design/metadata/_view/combined?startkey=[%221421059432806-826608318%22,%20%22unified%22]&endkey=[%221421059432806-826608318%22,%20%22unified%22,%20{}]


 # `POST /api/images/file/:uid/:source/:image_id`

 // TODO:  All must add "type: metadata" to the incoming records
 # `POST /api/images/metadata/:uid/:source`
 # `PUT /api/images/metadata/:uid/:source/:image_id`
 # `DELETE /api/images/metadata/:uid/:source/:image_id`

 // TODO:  All must add "type: gallery" to the incoming records
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
