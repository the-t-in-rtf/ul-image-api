/*

    The "read" portion of the GET /api/images/metadata endpoint.

 */
"use strict";
var fluid = require("infusion");

var gpii   = fluid.registerNamespace("gpii");


fluid.require("%gpii-express");
fluid.require("%gpii-json-schema");

fluid.registerNamespace("gpii.ul.api.images.metadata.read.handler");

require("../source-permission-middleware");

/*

 */



 // TODO:  All must strip "type", "_id", and "_rev" from the raw couch records

gpii.ul.api.images.metadata.read.handler.handleRequest = function (that) {
/*
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
 */

    that.sendResponse(404, { isError: true, message: that.options.messages.fileNotFound});
};

fluid.defaults("gpii.ul.api.images.metadata.read.handler", {
    gradeNames: ["gpii.express.handler"],
    messages: {
    },
    invokers: {
        handleRequest: {
            funcName: "gpii.ul.api.images.metadata.read.handler.handleRequest",
            args:     ["{that}"]
        }
    },
    components: {
        metadataReader: {
            type: "kettle.dataSource.URL",
            options: {
                url: {
                    expander: {
                        funcName: "fluid.stringTemplate",
                        args: ["%baseUrl/_design/ul/_view/products?key=%key", { baseUrl: "{gpii.ul.api}.options.urls.ulDb" }]
                    }
                },
                termMap: {
                    "key":      "%key"
                },
                listeners: {
                    // Continue processing after an initial successful read.
                    "onRead.processProductResponse": {
                        func: "{gpii.ul.api.product.get.handler.base}.processProductResponse",
                        args: ["{arguments}.0"] // couchResponse
                    },
                    // Report back to the user on failure.
                    "onError.sendResponse": {
                        func: "{gpii.express.handler}.sendResponse",
                        args: [ 500, { message: "{arguments}.0", url: "{that}.options.url" }] // statusCode, body
                        // args: [ 500, "{arguments}.0"] // statusCode, body
                        // TODO:  Discuss with Antranig how to retrieve HTTP status codes from kettle.datasource.URL
                    }
                }
            }
        }
    }
});

fluid.defaults("gpii.ul.api.images.metadata.read", {
    gradeNames: ["gpii.express.router", "gpii.hasRequiredOptions"],
    method: ["get"],
    requiredFields: {
    },
    // Support all variations, including those with missing URL params so that we can return appropriate error feedback.
    path: ["/:uid/:source/:image_id", "/:uid/:source", "/:uid", "/"],
    routerOptions: {
        mergeParams: true
    },
    rules: {
        requestContentToValidate: {
            "": "params"
        }
    },
    events: {
        onSchemasDereferenced: null
    },
    distributeOptions: [
        {
            source: "{that}.options.rules",
            target: "{that gpii.express.handler}.options.rules"
        },
        {
            source: "{that}.options.cacheDir",
            target: "{that gpii.express.handler}.options.cacheDir"
        },
        {
            source: "{that}.options.originalsDir",
            target: "{that gpii.express.handler}.options.originalsDir"
        }
    ],
    components: {
        // Make sure the user has permission to view (non-unified) image sources.
        permissionMiddleware: {
            type: "gpii.ul.images.sourcePermissionMiddleware",
            options: {
                priority: "first"
            }
        },
        // Reject requests that have missing or bad data up front.
        validationMiddleware: {
            type: "gpii.schema.validationMiddleware",
            options: {
                priority: "after:permissionMiddleware",
                schemaDirs: "%ul-image-api/src/schemas",
                schemaKey:  "metadata-read-input.json",
                rules: "{gpii.ul.api.images.metadata.read}.options.rules",
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.ul.api.images.metadata.read}.events.onSchemasDereferenced.fire"
                    }
                }
            }
        },
        // If our request is valid, handle it normally.
        metadataMiddleware: {
            type: "gpii.express.middleware.requestAware",
            options: {
                priority: "after:validationMiddleware",
                handlerGrades: ["gpii.ul.api.images.metadata.read.handler"]
            }
        }
    }
});
