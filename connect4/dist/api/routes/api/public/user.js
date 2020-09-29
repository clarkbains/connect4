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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var models = __importStar(require("../../../models/models"));
var statuses = __importStar(require("../../../resources/APIStatus"));
var APIHelpers = __importStar(require("../../../resources/APIHelpers"));
module.exports = (function () {
    function class_1(opts) {
        this.opts = opts;
        this.app = express_1.default();
        this.setupApplication();
    }
    class_1.prototype.setupApplication = function () {
        var _this = this;
        this.app.get("/generate/:token", function (req, res) {
            console.log("generate");
            res.send(_this.opts.auth.createToken(req.params.token));
        });
        this.app.post("/", APIHelpers.WrapRequest(function (req, res, success) { return __awaiter(_this, void 0, void 0, function () {
            var dbObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dbObj = new models.DatabaseUser(new models.UserModifyRequest(req.body));
                        APIHelpers.VerifyProperties(dbObj, "this.email && this.username");
                        APIHelpers.DefaultProperties(dbObj, [
                            ["name", "Anonymous Carrot"]
                        ]);
                        return [4, dbObj.insert({ db: this.opts.gateway.db })
                                .catch(function (e) { throw new statuses.DatabaseError(); })];
                    case 1:
                        _a.sent();
                        return [4, success(new statuses.CreateUserSuccess())];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        }); }));
        this.app.post("/login", APIHelpers.WrapRequest(function (req, res, success) { return __awaiter(_this, void 0, void 0, function () {
            var loginRequest, u, creds, jwt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginRequest = new models.LoginRequest(req.body);
                        return [4, new models.DatabaseUser(loginRequest).select({ db: this.opts.gateway.db })];
                    case 1:
                        u = _a.sent();
                        console.log("Found User for Login:", u);
                        if (u.length == 0)
                            throw new statuses.NotFound("User");
                        return [4, new models.DatabaseCredential(u[0]).select({ db: this.opts.gateway.db })];
                    case 2:
                        creds = _a.sent();
                        if (creds.length == 0)
                            throw new statuses.NoPasswordSet();
                        console.log(creds);
                        if (this.opts.auth.verifyPassword(loginRequest.password, creds[0].hash, creds[0].salt)) {
                            jwt = this.opts.auth.createToken(creds[0].userid);
                            res.cookie('jwt', jwt, { maxAge: 3600000, domain: "localhost", path: "/" });
                            return [2, success(new statuses.LoginSuccess(jwt))];
                        }
                        throw new statuses.CredentialError();
                }
            });
        }); }));
        this.app.post("/changepassword", APIHelpers.WrapRequest(function (req, res, success) { return __awaiter(_this, void 0, void 0, function () {
            var myRequest, userid, m, body, e_1, m, u, c, passwordValid, cred, oldCreds, updatedCreds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        myRequest = undefined;
                        userid = undefined;
                        if (!req.body.token) return [3, 5];
                        m = new models.RequestPasswordChangeToken(req.body);
                        body = {};
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, this.opts.auth.verifyToken(m.token)];
                    case 2:
                        body = _a.sent();
                        return [3, 4];
                    case 3:
                        e_1 = _a.sent();
                        throw new statuses.JWTError;
                    case 4:
                        console.log("Decoded JWT for password reset is ", body);
                        if (body.use !== "reset")
                            throw new statuses.JWTError();
                        userid = body.userid;
                        myRequest = m;
                        return [3, 8];
                    case 5:
                        if (!req.body.oldpassword) return [3, 8];
                        m = new models.RequestPasswordChangePassword(req.body);
                        return [4, new models.DatabaseUser({ email: m.email, username: m.username }).select({ db: this.opts.gateway.db })];
                    case 6:
                        u = _a.sent();
                        if (u.length == 0)
                            throw new statuses.CredentialError();
                        console.log("Got User requesting password reset ", u[0]);
                        userid = u[0].userid;
                        return [4, new models.DatabaseCredential({ userid: u[0].userid }).select({ db: this.opts.gateway.db })];
                    case 7:
                        c = _a.sent();
                        if (c.length == 0)
                            throw new statuses.NoPasswordSet();
                        passwordValid = this.opts.auth.verifyPassword(m.oldpassword, c[0].hash, c[0].salt);
                        if (!passwordValid) {
                            throw new statuses.CredentialError();
                        }
                        myRequest = m;
                        _a.label = 8;
                    case 8:
                        if (myRequest == undefined) {
                            throw new statuses.BadPasswordResetRequest();
                        }
                        if (!myRequest.newpassword) {
                            throw new statuses.MissingRequiredField(["newpassword"]);
                        }
                        if (!myRequest.newpassword.match(this.opts.conf.passwordRegex)) {
                            throw new statuses.PasswordValidationError();
                        }
                        cred = this.opts.auth.hashPassword(myRequest.newpassword);
                        return [4, new models.DatabaseCredential({ userid: userid })
                                .select({ db: this.opts.gateway.db })];
                    case 9:
                        oldCreds = _a.sent();
                        console.log("Changing creds from", oldCreds);
                        updatedCreds = new models.DatabaseCredential(oldCreds ? oldCreds[0] : {});
                        updatedCreds.hash = cred.hash;
                        updatedCreds.salt = cred.salt;
                        updatedCreds.userid = userid;
                        console.log(updatedCreds);
                        if (!(oldCreds.length == 0)) return [3, 11];
                        console.log("Inserting new User Creds", updatedCreds);
                        return [4, updatedCreds.insert({ db: this.opts.gateway.db })];
                    case 10:
                        _a.sent();
                        return [3, 13];
                    case 11:
                        console.log("Updating Current Creds", updatedCreds);
                        return [4, updatedCreds.update({ db: this.opts.gateway.db })];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13: return [4, success(new statuses.ChangePasswordSuccess)];
                    case 14:
                        _a.sent();
                        return [2];
                }
            });
        }); }));
        this.app.post("/sendresetemail", APIHelpers.WrapRequest(function (req, res, success) { return __awaiter(_this, void 0, void 0, function () {
            var q, r, user, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        q = new models.RequestPasswordReset(req.body);
                        console.log(q, r, req.body);
                        q.verifyProperties();
                        r = new models.DatabaseUser(q);
                        return [4, r.select({ db: this.opts.gateway.db })];
                    case 1:
                        user = _a.sent();
                        if (user.length == 0)
                            throw new statuses.NotFound("User");
                        token = this.opts.auth.createPasswordResetToken(user[0].userid);
                        success(new statuses.TokenDebugRequest(token));
                        return [2];
                }
            });
        }); }));
    };
    return class_1;
}());
module.exports.route = "/user";
module.exports.description = "CR User Profiles";
module.exports.parent = require('../public');
module.exports.id = 6;
