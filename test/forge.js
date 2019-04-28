const cleanup = require("jsdom-global")();
const Vue = require("vue");
const utils = require("@vue/test-utils");
module.exports = { cleanup, Vue, utils };
