"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
module.exports = (function () {
    function class_1(opts) {
        this.opts = opts;
        this.app = express_1.default();
        this.setupApplication();
    }
    class_1.prototype.setupApplication = function () {
        console.log(path_1.default.join(__dirname, "..", "..", "ui"));
        this.app.use(express_1.default.static(path_1.default.join(__dirname, "..", "..", "ui")));
        this.app.get("/test", function (req, res) {
            res.send("UI Good!");
        });
    };
    return class_1;
}());
module.exports.route = "";
module.exports.description = "UI Routes";
module.exports.parent = require('../main');
module.exports.id = 9;
