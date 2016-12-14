"use strict";

var fluid = require("infusion");

require("./file-read.js");

// TODO: Write these
// # `POST /api/images/file/:uid/:source`
// # `PUT /api/images/file/:uid/:source/:image_id`
// require("./file-update.js");

// TODO: Write these
// # `DELETE /api/images/file/:uid/:source/:image_id`
// require("./file-delete.js");

fluid.defaults("gpii.ul.images.api.file", {
    gradeNames: ["gpii.express.router"],
    path: "/file",
    events: {
        onReadReady: null,
        onReady: {
            onReadReady: "onReadReady"
        }
    },
    components: {
        read: {
            type: "gpii.ul.images.api.file.read",
            options: {
                originalsDir: "{gpii.ul.images.api}.options.originalsDir",
                cacheDir:     "{gpii.ul.images.api}.options.cacheDir",
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.ul.images.api.file}.events.onReadReady.fire"
                    }
                }
            }
        }
    }
});
