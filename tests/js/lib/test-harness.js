// Launch the UL API and web site.  This script expects to communicate with a properly configured CouchDB instance
// running on port 5984, and with a properly configured couchdb-lucene instance running on port 5985.
//
// See the tests in this package for a harness that loads its own gpii-pouchdb and gpii-pouchdb-lucene instance.
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");
var os    = require("os");

require("../../../");

fluid.require("%gpii-pouchdb");
fluid.require("%gpii-express");

fluid.registerNamespace("gpii.tests.ul.website.harness");
gpii.tests.ul.website.harness.stopServer = function (that) {
    gpii.express.stopServer(that.express);
    gpii.express.stopServer(that.pouch);
};

fluid.require("%gpii-express");
fluid.require("%gpii-express-user");
fluid.require("%gpii-handlebars");
fluid.require("%ul-api");
fluid.require("%ul-image-api");

require("./provisioner");

fluid.registerNamespace("gpii.tests.ul.images.api.harness");

gpii.tests.ul.images.api.harness.getOriginalsPath = function (that) {
    return gpii.tests.ul.images.api.harness.getPath(that, "originals");
};

gpii.tests.ul.images.api.harness.getCachePath = function (that) {
    return gpii.tests.ul.images.api.harness.getPath(that, "cache");
};


gpii.tests.ul.images.api.harness.getPath = function (that, dirName) {
    var uniqueDirName = that.id + "-" + dirName;
    return gpii.ul.images.api.file.resolvePath(os.tmpDir(), uniqueDirName);
};

fluid.defaults("gpii.ul.images.harness", {
    gradeNames:   ["fluid.component"],
    schemaDirs:   ["%ul-image-api/src/schemas", "%ul-api/src/schemas", "%gpii-express-user/src/schemas"],
    templateDirs: ["%ul-image-api/src/templates", "%ul-api/src/templates", "%gpii-express-user/src/templates", "%gpii-json-schema/src/templates", "%ul-image-api/tests/templates"],
    ports: {
        api:    7317,
        couch:  7318
    },
    sessionKey: "_ul_user",
    originalsDir: "@expand:gpii.tests.ul.images.api.harness.getOriginalsPath({that})",
    cacheDir: "@expand:gpii.tests.ul.images.api.harness.getCachePath({that})",
    rules: {
        contextToExpose: {
            "layout": "layout", // This is required to support custom layouts
            "model": {
                "user":    "req.session._ul_user",
                "product": "product"
            },
            "req":  {
                "query":  "req.query",
                "params": "req.params"
            }
        }
    },
    contextToOptionsRules: {
        req:      "req",
        product:  "product",
        products: "products",
        model: {
            user:     "req.session._ul_user",
            product:  "product",
            products: "products"
        }
    },
    distributeOptions: [
        {
            source: "{that}.options.sessionKey",
            target: "{that gpii.express.handler}.options.sessionKey"
        },
        {
            source: "{that}.options.rules.contextToExpose",
            target: "{that gpii.express.singleTemplateMiddleware}.options.rules.contextToExpose"
        },
        {
            source: "{that}.options.rules.contextToExpose",
            target: "{that gpii.ul.api.htmlMessageHandler}.options.rules.contextToExpose"
        },
        {
            source: "{that}.options.rules.contextToExpose",
            target: "{that gpii.handlebars.dispatcherMiddleware}.options.rules.contextToExpose"
        }
    ],
    urls: {
        api: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     ["http://localhost:%port", { port: "{that}.options.ports.api" }]
            }
        },
        login: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     ["http://localhost:%port/api/user/login", { port: "{that}.options.ports.api" }]
            }
        },
        couch: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     ["http://localhost:%port/", { port: "{that}.options.ports.couch" }]
            }
        },
        lucene: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     ["http://localhost:%port/local/%dbName/_design/lucene/by_content", { port: "{that}.options.ports.lucene", dbName: "{that}.options.dbNames.ul"}]
            }
        },
        ulDb: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     ["http://localhost:%port/%dbName", { port: "{that}.options.ports.couch", dbName: "{that}.options.dbNames.ul"}]
            }
        },
        usersDb: {
            expander: {
                funcName: "fluid.stringTemplate",
                args:     ["http://localhost:%port/%dbName", { port: "{that}.options.ports.couch", dbName: "{that}.options.dbNames.users"}]
            }
        }
    },
    dbNames: {
        ul:    "ul",
        users: "users"
    },
    events: {
        apiReady:           null,
        apiStopped:         null,
        constructFixtures:  null,
        pouchStarted:       null,
        pouchStopped:       null,
        provisionerStarted: null,
        onFixturesConstructed: {
            events: {
                apiReady:           "apiReady",
                pouchStarted:       "pouchStarted",
                provisionerStarted: "provisionerStarted"
            }
        },
        onFixturesStopped: {
            events: {
                apiStopped:    "apiStopped",
                pouchStopped:  "pouchStopped"
            }
        },
        stopFixtures: null
    },
    listeners: {
        stopFixtures: {
            funcName: "gpii.tests.ul.website.harness.stopServer",
            args:     ["{that}"]
        }
    },
    components: {
        express: {
            type: "gpii.express.withJsonQueryParser",
            createOnEvent: "constructFixtures",
            options: {
                port :   "{harness}.options.ports.api",
                templateDirs: "{harness}.options.templateDirs",
                events: {
                    apiReady: null,
                    suggestReady: null,
                    onReady: {
                        events: {
                            apiReady: "apiReady",
                            onStarted: "onStarted",
                            suggestReady: "suggestReady"
                        }
                    }
                },
                listeners: {
                    onReady:   {
                        func: "{harness}.events.apiReady.fire"
                    },
                    onStopped: {
                        func: "{harness}.events.apiStopped.fire"
                    }
                },
                components: {
                    handlebars: {
                        type: "gpii.express.hb",
                        options: {
                            priority: "after:corsHeaders",
                            templateDirs: "{harness}.options.templateDirs"
                        }
                    },
                    cookieparser: {
                        type:     "gpii.express.middleware.cookieparser",
                        options: {
                            priority: "after:handlebars"
                        }
                    },
                    session: {
                        type: "gpii.express.middleware.session",
                        options: {
                            priority: "after:cookieparser",
                            sessionOptions: {
                                secret: "Printer, printer take a hint-ter."
                            }
                        }
                    },
                    // Client-side Handlebars template bundles
                    inline: {
                        type: "gpii.handlebars.inlineTemplateBundlingMiddleware",
                        options: {
                            priority: "after:handlebars",
                            path: "/hbs",
                            templateDirs: "{harness}.options.templateDirs"
                        }
                    },
                    // NPM dependencies
                    nm: {
                        type: "gpii.express.router.static",
                        options: {
                            priority: "after:session",
                            path: "/nm",
                            content: "%ul-image-api/node_modules"
                        }

                    },
                    // Our own source
                    src: {
                        type: "gpii.express.router.static",
                        options: {
                            priority: "after:session",
                            path:    "/src",
                            content: "%ul-image-api/src"
                        }
                    },
                    // JSON Schemas, available individually
                    schemas: {
                        type: "gpii.express.router.static",
                        options: {
                            priority: "after:session",
                            path:    "/schemas",
                            content: "{harness}.options.schemaDirs"
                        }
                    },
                    // Bundled JSON Schemas for client-side validation
                    allSchemas: {
                        type: "gpii.schema.inlineMiddleware",
                        options: {
                            priority: "after:session",
                            path:       "/allSchemas",
                            schemaDirs: "{harness}.options.schemaDirs"
                        }
                    },
                    api: {
                        type: "gpii.ul.api",
                        options: {
                            priority: "after:session",
                            templateDirs: "{harness}.options.templateDirs",
                            urls:     "{harness}.options.urls",
                            listeners: {
                                "onReady.notifyParent": {
                                    func: "{harness}.events.apiReady.fire"
                                }
                            },
                            components: {
                                // Defang the "session" handling middleware included with ul-api in favor of ours.
                                session: { type: "fluid.component" }
                            }
                        }
                    },
                    imageApi: {
                        type: "gpii.ul.images.api",
                        options: {
                            priority:     "after:api",
                            templateDirs: "{harness}.options.templateDirs",
                            urls:         "{harness}.options.urls",
                            originalsDir: "{gpii.ul.images.harness}.options.originalsDir",
                            cacheDir:     "{gpii.ul.images.harness}.options.cacheDir"
                        }
                    },
                    dispatcher: {
                        type: "gpii.handlebars.dispatcherMiddleware",
                        options: {
                            priority: "after:suggest",
                            path: ["/:template", "/"],
                            templateDirs: "{harness}.options.templateDirs",
                            rules: {
                                contextToExpose: {
                                    req:      "req",
                                    user:     "req.session._ul_user",
                                    product:  "product",
                                    products: "products"
                                }
                            }
                        }
                    },
                    tests: {
                        type: "gpii.express.router.static",
                        options: {
                            priority: "before:htmlErrorHandler",
                            path:    "/tests",
                            content: ["%ul-image-api/tests"]
                        }
                    },
                    htmlErrorHandler: {
                        type:     "gpii.handlebars.errorRenderingMiddleware",
                        options: {
                            priority: "after:dispatcher",
                            templateKey: "pages/error"
                        }
                    }
                }
            }
        },
        pouch: {
            type: "gpii.express",
            createOnEvent: "constructFixtures",
            options: {
                port: "{harness}.options.ports.couch",
                listeners: {
                    onStarted: {
                        func: "{harness}.events.pouchStarted.fire"
                    },
                    onStopped: {
                        func: "{harness}.events.pouchStopped.fire"
                    }
                },
                components: {
                    pouch: {
                        type: "gpii.pouch.express",
                        options: {
                            path: "/",
                            databases: {
                                users:  { data: "%ul-image-api/tests/data/users.json" },
                                images: { data: ["%ul-image-api/tests/data/images.json"] },
                                ul:     { data: ["%ul-image-api/tests/data/ul.json"] }
                            }
                        }
                    }
                }
            }
        },
        provisioner: {
            type: "gpii.tests.ul.images.api.provisioner",
            createOnEvent: "constructFixtures",
            options: {
                originalsDir: "{gpii.ul.images.harness}.options.originalsDir",
                cacheDir:     "{gpii.ul.images.harness}.options.cacheDir",
                listeners: {
                    "onProvisioned.notifyParent": {
                        func: "{harness}.events.provisionerStarted.fire"
                    }
                }
            }
        }
    }
});

fluid.defaults("gpii.tests.ul.website.harness.instrumented", {
    gradeNames: ["gpii.tests.ul.website.harness"],
    components: {
        express: {
            options: {
                components: {
                    src: {
                        options: {
                            // Serve up instrumented javascript where possible. CSS files and the like will be inherited from the main source directory.
                            content: ["%ul-image-api/instrumented", "%ul-image-api/src"]
                        }
                    }
                }
            }
        }
    }
});
