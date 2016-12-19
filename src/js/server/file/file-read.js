/*

    Provides the REST endpoints to retrieve a specific image file:

    * `GET /api/images/file/:uid/:source/:image_id`
    * `GET /api/images/file/:uid/:source/:width/:image_id`

    Also provides the REST endpoint to retrieve file metadata for a particular file, which allows browsers to check the
    staleness of their cache.  See the API docs for details.

    * `HEAD /api/images/file/:uid/:source/:image_id`
    * `HEAD /api/images/file/:uid/:source/:width/:image_id`

 */
"use strict";
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

var fs = require("fs");

fluid.require("%gpii-express");
fluid.require("%gpii-json-schema");

fluid.registerNamespace("gpii.ul.api.images.file.read.handler");

require("./file-helpers");
require("../source-permission-middleware");

gpii.ul.api.images.file.read.handler.checkQueryParams = function (that) {
    // Use the same rules to extract the user input as we do during validation.
    var userOptions = fluid.model.transformWithRules(that.options.request, that.options.rules.requestContentToValidate);

    if (userOptions.width) {
        // If we have height/width params, check to see if we already have a resized file
        // /api/images/file/:uid/:source/:width/:image_id
        var segments         = [ userOptions.uid, userOptions.source,  userOptions.width, userOptions.image_id ];
        var resizedFilePath  = gpii.ul.api.images.file.resolvePath(that.options.cacheDir, segments);

        // If a resized file exists, defer to the static middleware
        if (fs.existsSync(resizedFilePath)) {
            that.options.next();
        }
        // If we don't have a resized file, create one.
        else {
            that.sendResponse(501, { isError: true, message: "This endpoint has not been implemented yet."});
            // TODO: Implement this
            // Resize the image, save it, then defer to the static middleware.
        }
    }
    // For original unaltered images, defer to the static middleware
    else {
        that.options.next();
    }
};

fluid.defaults("gpii.ul.api.images.file.read.handler", {
    gradeNames: ["gpii.express.handler"],
    invokers: {
        handleRequest: {
            funcName: "gpii.ul.api.images.file.read.handler.checkQueryParams",
            args:     ["{that}"]
        }
    }
});

fluid.defaults("gpii.ul.api.images.file.read", {
    gradeNames: ["gpii.express.router", "gpii.hasRequiredOptions"],
    method: ["get", "head"],
    requiredFields: {
        "originalsDir": true, // Where to store the originals.
        "cacheDir":     true  // Where to store resized images.
    },
    // Support all variations, including those with missing URL params so that we can return appropriate error feedback.
    path: ["/:uid/:source/:width/:image_id", "/:uid/:source/:image_id", "/:uid/:source", "/:uid", "/"],
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
        // JSON Schema validation middleware to check for required parameters.
        validationMiddleware: {
            type: "gpii.schema.validationMiddleware",
            options: {
                priority: "after:permissionMiddleware",
                schemaDirs: "%ul-image-api/src/schemas",
                schemaKey:  "file-read-input.json",
                rules: "{gpii.ul.api.images.file.read}.options.rules",
                listeners: {
                    "onSchemasDereferenced.notifyParent": {
                        func: "{gpii.ul.api.images.file.read}.events.onSchemasDereferenced.fire"
                    }
                }
            }
        },
        // Intermediate middleware to check for custom height/width and existence of original
        resizingMiddleware: {
            type: "gpii.express.middleware.requestAware",
            options: {
                priority: "after:validationMiddleware",
                handlerGrades: ["gpii.ul.api.images.file.read.handler"]
            }
        },
        static: {
            type:     "gpii.express.router.static",
            priority: "last",
            options: {
                content: ["{gpii.ul.api.images.file.read}.options.originalsDir", "{gpii.ul.api.images.file.read}.options.cacheDir"]
            }
        }
    }
});
