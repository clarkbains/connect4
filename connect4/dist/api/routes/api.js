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
        this.instanceId = String(Math.floor(Math.random() * 1000000));
    }
    class_1.prototype.setupApplication = function () {
        var _this = this;
        this.app.get("/test", function (req, res) {
            res.send("auth Good!");
        });
        this.app.post("/test", function (req, res) {
            res.send(JSON.stringify(req.body));
        });
        this.app.get("/node", function (req, res) {
            res.send(_this.instanceId);
        });
        this.app.use(function (req, res, next) {
            next();
        });
    };
    return class_1;
}());
module.exports.route = "/api";
module.exports.description = "API Routes";
module.exports.parent = require('../main');
module.exports.id = 5;
