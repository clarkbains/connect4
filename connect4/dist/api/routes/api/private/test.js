"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
module.exports = (function () {
    function class_1(opts) {
        this.opts = opts;
        this.app = express_1.default();
        this.setupApplication();
    }
    class_1.prototype.setupApplication = function () {
        this.app.get("/test", function (req, res) {
            res.send("Testme Good!");
        });
    };
    return class_1;
}());
module.exports.route = "/testme";
module.exports.description = "Test Service";
module.exports.parent = require('../private');
module.exports.id = 2;
