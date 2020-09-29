"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var statuses = __importStar(require("../../../resources/APIStatus"));
module.exports = (function () {
    function class_1(opts) {
        this.opts = opts;
        this.app = express_1.default();
        this.setupApplication();
    }
    class_1.prototype.setupApplication = function () {
        this.app.get("/", function (req, res) {
            var detail = req.query.detail;
            var active = req.query.active;
            var won = req.query.won;
            throw new statuses.ResourcePermissionError();
        });
        this.app.get("/game/:gameid", function (req, res) {
            var gameid = req.params.gameid;
        });
        this.app.get("/game/:gameid/moves", function (req, res) {
            var gameid = req.params.gameid;
            var mode = req.query.mode;
        });
        this.app.post("/game/:gameid/moves", function (req, res) {
            var gameid = req.params.gameid;
        });
        this.app.post("/game", function (req, res) {
            var opponents = req.body.opponents;
            var size = req.body.size;
        });
        this.app.use(function (error, req, res, next) {
            res.status(error.code).send(error);
        });
    };
    return class_1;
}());
module.exports.route = "/games";
module.exports.description = "Game Handler";
module.exports.parent = require('../private');
module.exports.id = 7;
