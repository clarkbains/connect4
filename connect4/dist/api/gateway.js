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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./models/models");
var sqlite3_1 = __importDefault(require("sqlite3"));
var models = __importStar(require("./models/models"));
var databaseHelpers_1 = require("./resources/databaseHelpers");
module.exports = (function () {
    function Gateway(dbFile, wipe) {
        var _this = this;
        this.db = new sqlite3_1.default.Database(dbFile, this.dbConnect);
        if (wipe) {
            this.dropTables().then(function () { return _this.createTable(); }).then(function () {
                var mock = new models.DatabaseUser({
                    email: "clarkbains@gmail.com",
                    username: "thelostelectron",
                    name: "clark",
                    score: 69
                });
                mock.insert({ db: _this.db }).then(function (e) { return mock.select({ db: _this.db }); }).then(function (r) { console.log(r); });
            });
        }
        else
            this.createTable();
    }
    Gateway.prototype.dbConnect = function (err) {
        if (err)
            console.error("Failed Connecting to db", err);
        else {
            console.log("Connected to db");
        }
    };
    Gateway.prototype.createTable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tables, tables_1, tables_1_1, tablesql, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tables = [
                            "CREATE TABLE IF NOT EXISTS Users (`userid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`name` TEXT(1000) NOT NULL,`username` TEXT(1000) NOT NULL,`email` TEXT(1000) NOT NULL,`score` INTEGER(20)  NOT NULL DEFAULT 0,`private` INTEGER(1) DEFAULT 0,CONSTRAINT `username_uq` UNIQUE (`username`),CONSTRAINT `email_uq` UNIQUE (`email`));",
                            "CREATE TABLE IF NOT EXISTS Credentials (`credentialid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`userid` TEXT(1000),`salt` TEXT(1000),`hash` TEXT(1000),CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));",
                            "CREATE TABLE IF NOT EXISTS Matchs (`matchid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`userid` INTEGER(20)  NOT NULL,`width` INTEGER(20)  NOT NULL,`height` INTEGER(20)  NOT NULL,`participants` INTEGER(20)  NOT NULL,`msg` TEXT(1000),`name` TEXT(1000) NOT NULL DEFAULT (strftime('Game %Y-%m-%d %H-%M','now')),`privacylevel` INTEGER(20)  NOT NULL DEFAULT (0),`status` INTEGER(20)  NOT NULL,CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));",
                            "CREATE TABLE IF NOT EXISTS Games (`gameid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`matchid` INTEGER(20)  NOT NULL,`currentturn` INTEGER(20)  NOT NULL,`gamefinished` INTEGER(1),`score` INTEGER(20) ,CONSTRAINT `matchid_fk` FOREIGN KEY (`matchid`) REFERENCES matchs(`matchid`));",
                            "CREATE TABLE IF NOT EXISTS Moves (`moveid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`gameid` INTEGER(20)  NOT NULL,`x` INTEGER(20)  NOT NULL,`y` INTEGER(20)  NOT NULL,`time` INTEGER(20)  NOT NULL,CONSTRAINT `gameid_fk` FOREIGN KEY (`gameid`) REFERENCES games(`gameid`));",
                            "CREATE TABLE IF NOT EXISTS MatchAcceptances (`matchid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`userid` INTEGER(20)  NOT NULL,`acceptance` INTEGER(20)  NOT NULL,`msg` TEXT(1000),CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));",
                            "CREATE TABLE IF NOT EXISTS PendingFriends (`pendingfriendid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`user1` INTEGER(20)  NOT NULL,`user2` INTEGER(20)  NOT NULL,`msg` TEXT(1000),CONSTRAINT `user1Usersuserid_fkc` FOREIGN KEY (`user1`) REFERENCES Users (`userid`),CONSTRAINT `user2Usersuserid_fkc` FOREIGN KEY (`user2`) REFERENCES Users (`userid`));",
                            "CREATE TABLE IF NOT EXISTS Friends (`friendid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`user1` INTEGER(20)  NOT NULL,`user2` INTEGER(20)  NOT NULL,CONSTRAINT `user1Usersuserid_fkc` FOREIGN KEY (`user1`) REFERENCES Users (`userid`),CONSTRAINT `user2Usersuserid_fkc` FOREIGN KEY (`user2`) REFERENCES Users (`userid`));",
                            "CREATE TABLE IF NOT EXISTS GameMessages (`gamemessageid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`gameid` INTEGER(20)  NOT NULL,`userid` INTEGER(20)  NOT NULL,`msg` TEXT(1000) NOT NULL,`time` INTEGER(20)  NOT NULL DEFAULT (strftime('%s','now')),CONSTRAINT `gameid_fk` FOREIGN KEY (`gameid`) REFERENCES games(`gameid`),CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));"
                        ];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        tables_1 = __values(tables), tables_1_1 = tables_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!tables_1_1.done) return [3, 5];
                        tablesql = tables_1_1.value;
                        return [4, databaseHelpers_1.DatabaseModel.promisifySql(this.db, { sql: tablesql })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        tables_1_1 = tables_1.next();
                        return [3, 2];
                    case 5: return [3, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3, 8];
                    case 7:
                        try {
                            if (tables_1_1 && !tables_1_1.done && (_a = tables_1.return)) _a.call(tables_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7];
                    case 8: return [2];
                }
            });
        });
    };
    Gateway.prototype.dropTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tables, tables_2, tables_2_1, tablesql, e_2_1;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tables = [
                            "DROP TABLE IF EXISTS GameMessages",
                            "DROP TABLE IF EXISTS Friends",
                            "DROP TABLE IF EXISTS PendingFriends",
                            "DROP TABLE IF EXISTS MatchAcceptances",
                            "DROP TABLE IF EXISTS Moves",
                            "DROP TABLE IF EXISTS Games",
                            "DROP TABLE IF EXISTS Matchs",
                            "DROP TABLE IF EXISTS Credentials",
                            "DROP TABLE IF EXISTS Users"
                        ];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        tables_2 = __values(tables), tables_2_1 = tables_2.next();
                        _b.label = 2;
                    case 2:
                        if (!!tables_2_1.done) return [3, 5];
                        tablesql = tables_2_1.value;
                        return [4, databaseHelpers_1.DatabaseModel.promisifySql(this.db, { sql: tablesql })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        tables_2_1 = tables_2.next();
                        return [3, 2];
                    case 5: return [3, 8];
                    case 6:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3, 8];
                    case 7:
                        try {
                            if (tables_2_1 && !tables_2_1.done && (_a = tables_2.return)) _a.call(tables_2);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7];
                    case 8: return [2];
                }
            });
        });
    };
    Gateway.prototype.getUserById = function (id) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(JSON.stringify({ yay: "user" }));
            }, 1000);
        });
    };
    return Gateway;
}());
