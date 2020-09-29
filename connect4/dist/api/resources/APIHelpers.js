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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrapRequest = exports.CopyTo = exports.DefaultProperties = exports.VerifyProperties = void 0;
var statuses = __importStar(require("./APIStatus"));
function VerifyProperties(obj) {
    if (!obj.verify) {
        return console.error("Verify Callsed for Model with no verify attribute", obj);
    }
    else if (!obj.verify()) {
        throw new statuses.FieldsNotValidated();
    }
    return obj;
}
exports.VerifyProperties = VerifyProperties;
function DefaultProperties(obj, properties) {
    var e_1, _a;
    try {
        for (var properties_1 = __values(properties), properties_1_1 = properties_1.next(); !properties_1_1.done; properties_1_1 = properties_1.next()) {
            var prop = properties_1_1.value;
            if (obj[prop[0]] === undefined) {
                obj[prop[0]] = prop[1];
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (properties_1_1 && !properties_1_1.done && (_a = properties_1.return)) _a.call(properties_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return obj;
}
exports.DefaultProperties = DefaultProperties;
function CopyTo(obj, properties) {
    var e_2, _a;
    try {
        for (var properties_2 = __values(properties), properties_2_1 = properties_2.next(); !properties_2_1.done; properties_2_1 = properties_2.next()) {
            var prop = properties_2_1.value;
            if (obj[prop[0]] === undefined) {
                obj[prop[0]] = prop[1];
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (properties_2_1 && !properties_2_1.done && (_a = properties_2.return)) _a.call(properties_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return obj;
}
exports.CopyTo = CopyTo;
function WrapRequest(func) {
    var _this = this;
    return function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        function sendResponse(r) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (r.code) {
                        res.status(r.code).send(r);
                    }
                    else {
                        console.warn("Do not send :any objects with the callback");
                        res.status(200).send(r);
                    }
                    return [2];
                });
            });
        }
        var e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4, func(req, res, sendResponse)];
                case 1:
                    _a.sent();
                    return [3, 6];
                case 2:
                    e_3 = _a.sent();
                    console.log("Thrown from Promise", e_3);
                    if (!(e_3 && e_3.code)) return [3, 4];
                    return [4, sendResponse(e_3)];
                case 3: return [2, _a.sent()];
                case 4: return [4, sendResponse(new statuses.UnknownError())];
                case 5:
                    _a.sent();
                    return [3, 6];
                case 6: return [2];
            }
        });
    }); };
}
exports.WrapRequest = WrapRequest;
