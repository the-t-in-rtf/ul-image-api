// The main file that is included when you run `require("ul-image-api")`.
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.registerNamespace("gpii.ul.api.images");

require("./src/js/index.js");

fluid.module.register("gpii-ul-image-api", __dirname, require);

module.exports = gpii.ul.api.images;
